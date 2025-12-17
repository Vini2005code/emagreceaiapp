import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from user profile
    let profileContext = "";
    if (userProfile) {
      const { weight, height, age, bmi, bmiCategory } = userProfile;
      if (bmi) {
        profileContext = `
Informações do usuário:
- Peso: ${weight}kg
- Altura: ${height}cm
- Idade: ${age} anos
- IMC: ${bmi.toFixed(1)} (${bmiCategory})

Adapte suas respostas considerando essas informações do perfil do usuário.`;
      }
    }

    const systemPrompt = `Você é um treinador virtual especializado em emagrecimento e vida saudável. Você ajuda pessoas com dicas de exercícios, nutrição, motivação e hábitos saudáveis.

IMPORTANTE: Você é apenas um assistente virtual informativo. Sempre deixe claro que suas orientações NÃO substituem o acompanhamento de profissionais de saúde qualificados (médicos, nutricionistas, educadores físicos).

Seja amigável, motivador e forneça informações baseadas em ciência. Responda de forma concisa e prática.
${profileContext}

Se o usuário perguntar sobre condições médicas específicas ou tratamentos, recomende que consulte um profissional de saúde.`;

    console.log("Sending request to Lovable AI with messages:", messages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Trainer chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
