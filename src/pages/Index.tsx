import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FUNCTION_NAME = "trainer-chat";

serve(async (req) => {
  // 1. Lidar com o CORS para o navegador não bloquear o pedido
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { messages, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Construir o contexto com os dados do utilizador
    let profileContext = "";
    if (userProfile) {
      const { weight, height, age, bmi, goalWeight, tdee, calories } = userProfile;
      profileContext = `
DADOS REAIS DO USUÁRIO:
- Peso atual: ${weight}kg
- Altura: ${height}cm
- Meta de peso: ${goalWeight}kg
- IMC: ${bmi?.toFixed(1)}
${tdee ? `- Gasto Calórico (TDEE): ${tdee} kcal` : ""}
IMPORTANTE: Baseie a resposta nos dados acima de forma natural, sem fazer uma lista.`;
    }

    const systemPrompt = `Você é um Treinador de Saúde de Elite. Comunicação curta, direta e prática.
REGRAS:
1. Responda em no máximo 2 parágrafos curtos focados em ações imediatas.
2. Nunca dê conselho genérico. Vá direto ao ponto.
${profileContext}`;

    // 3. Fazer o pedido à IA (AQUI ESTAVA O ERRO: mudamos stream para FALSE)
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
          ...messages.slice(-10), // Envia apenas as últimas 10 para poupar memória
        ],
        stream: false, // <-- A CORREÇÃO CRUCIAL ESTÁ AQUI
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    // 4. Capturar a resposta completa como JSON
    const aiData = await response.json();

    // 5. Devolver a resposta no formato que o frontend espera
    return new Response(JSON.stringify(aiData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Error:`, error);
    
    // Fallback: Se a internet falhar, a app não cracha
    return new Response(JSON.stringify({ 
      choices: [{ message: { role: "assistant", content: "Desculpe, a minha ligação falhou. Pode repetir a pergunta?" } }]
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
