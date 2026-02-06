import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build rich context from user profile
    let profileContext = "";
    if (userProfile) {
      const { weight, height, age, bmi, bmiCategory, gender, activityLevel, goalWeight, bodyType, foodPreferences, medicalLimitations, dailyRoutine, tdee, deficit, calories } = userProfile;
      
      const bmiLabels: Record<string, string> = {
        underweight: "Abaixo do peso",
        normal: "Peso normal",
        overweight: "Sobrepeso",
        obese: "Obesidade",
        obese1: "Obesidade grau I",
        obese2: "Obesidade grau II",
        obese3: "Obesidade grau III",
      };

      const activityLabels: Record<string, string> = {
        sedentary: "Sedentário",
        light: "Leve",
        moderate: "Moderado",
        active: "Ativo",
        veryActive: "Muito ativo",
      };

      const bodyTypeLabels: Record<string, string> = {
        ectomorph: "Ectomorfo",
        mesomorph: "Mesomorfo",
        endomorph: "Endomorfo",
      };

      profileContext = `
DADOS REAIS DO USUÁRIO (use em TODAS as respostas):
- Peso atual: ${weight}kg
- Altura: ${height}cm
- Idade: ${age} anos
- Gênero: ${gender === "male" ? "Masculino" : "Feminino"}
- IMC: ${bmi?.toFixed(1)} (${bmiLabels[bmiCategory] || bmiCategory})
- Meta de peso: ${goalWeight}kg (${weight > goalWeight ? `precisa perder ${(weight - goalWeight).toFixed(1)}kg` : weight < goalWeight ? `precisa ganhar ${(goalWeight - weight).toFixed(1)}kg` : "na meta"})
- Nível de atividade: ${activityLabels[activityLevel] || activityLevel}
- Biotipo: ${bodyTypeLabels[bodyType] || bodyType}
${tdee ? `- TDEE: ${tdee} kcal/dia` : ""}
${calories ? `- Meta calórica: ${calories} kcal/dia` : ""}
${deficit ? `- Ajuste calórico: ${deficit > 0 ? "déficit" : "superávit"} de ${Math.abs(deficit)} kcal` : ""}
${foodPreferences?.length > 0 ? `- Preferências alimentares: ${foodPreferences.join(", ")}` : ""}
${medicalLimitations?.length > 0 ? `- Limitações médicas: ${medicalLimitations.join(", ")}` : ""}
${dailyRoutine ? `- Rotina: ${dailyRoutine}` : ""}

IMPORTANTE: Baseie TODA resposta nos dados acima. Não dê conselhos genéricos.`;
    }

    const systemPrompt = `Você é um treinador virtual especializado em emagrecimento, nutrição e saúde. Seu nome é Emagrece AI Trainer.

PERSONALIDADE:
- Direto e objetivo (sem enrolação)
- Motivador mas realista
- Usa linguagem simples e acessível
- Responde de forma concisa (máximo 3-4 parágrafos)
- Usa emojis com moderação para tornar a conversa agradável

REGRAS OBRIGATÓRIAS:
1. SEMPRE use os dados do perfil do usuário nas suas respostas
2. NUNCA dê conselhos genéricos - personalize tudo
3. SEMPRE mencione que não substitui profissionais de saúde quando relevante
4. Se o usuário perguntar sobre medicamentos ou condições médicas específicas, recomende consultar um médico
5. Forneça informações baseadas em ciência e estudos quando possível
6. Calcule e sugira valores específicos baseados nos dados do usuário
7. Se o usuário tem limitações médicas, SEMPRE considere-as

ÁREAS DE COMPETÊNCIA:
- Orientação alimentar personalizada
- Hábitos saudáveis
- Sugestões de ajustes no plano
- Acompanhamento de progresso
- Dúvidas nutricionais
- Motivação e mindset
- Exercícios e atividades físicas
${profileContext}`;

    console.log("Trainer chat - messages:", messages.length, "has profile:", !!userProfile);

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
          ...messages.slice(-20), // Keep last 20 messages for context
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Aguarde alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Erro no serviço de IA. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Trainer chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
