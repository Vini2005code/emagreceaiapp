import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FUNCTION_NAME = "trainer-chat";

serve(async (req) => {
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

    // --- Rate Limiting ---
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;

      if (userId) {
        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const adminClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Get user plan limits
        const { data: sub } = await adminClient
          .from("user_subscriptions")
          .select("plan_id")
          .eq("user_id", userId)
          .maybeSingle();

        const planId = sub?.plan_id || "free";
        const { data: plan } = await adminClient
          .from("subscription_plans")
          .select("ai_daily_limit")
          .eq("id", planId)
          .maybeSingle();

        const dailyLimit = plan?.ai_daily_limit || 5;

        const { count } = await adminClient
          .from("ai_usage_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("function_name", FUNCTION_NAME)
          .gte("created_at", today.toISOString());

        if ((count || 0) >= dailyLimit) {
          return new Response(JSON.stringify({ 
            error: "Limite diário de uso atingido. Faça upgrade do seu plano para mais acesso.",
            limit_reached: true
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Build rich context from user profile
    let profileContext = "";
    if (userProfile) {
      const { weight, height, age, bmi, bmiCategory, gender, activityLevel, goalWeight, bodyType, foodPreferences, medicalLimitations, dailyRoutine, tdee, deficit, calories } = userProfile;
      
      const bmiLabels: Record<string, string> = {
        underweight: "Abaixo do peso", normal: "Peso normal", overweight: "Sobrepeso",
        obese: "Obesidade", obese1: "Obesidade grau I", obese2: "Obesidade grau II", obese3: "Obesidade grau III",
      };

      const activityLabels: Record<string, string> = {
        sedentary: "Sedentário", light: "Leve", moderate: "Moderado", active: "Ativo", veryActive: "Muito ativo",
      };

      const bodyTypeLabels: Record<string, string> = {
        ectomorph: "Ectomorfo", mesomorph: "Mesomorfo", endomorph: "Endomorfo",
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

    const systemPrompt = `Você é um Treinador de Saúde de Elite. Comunicação curta, direta e prática.

REGRAS ABSOLUTAS:
1. Use os dados biométricos do userProfile para personalizar a estratégia, mas é ESTRITAMENTE PROIBIDO repetir, listar ou recitar esses dados na resposta.
2. Responda em no máximo 2 parágrafos curtos focados em AÇÕES IMEDIATAS.
3. Nunca dê conselho genérico. Nunca enrole. Vá direto ao ponto.
4. Se a pergunta envolver medicamentos ou condições médicas graves: "⚠️ Consulte um profissional de saúde."
5. Nunca use termos como "prescrição", "tratamento" ou "cura".
6. Use emojis com moderação (máximo 2 por resposta).
7. Considere limitações médicas e preferências alimentares do usuário silenciosamente (sem listá-las).
${profileContext}`;

    console.log(`[${FUNCTION_NAME}] messages: ${messages.length}, has profile: ${!!userProfile}, user: ${userId?.slice(0, 8)}`);

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
          ...messages.slice(-20),
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${FUNCTION_NAME}] AI gateway error:`, response.status, errorText);

      // Log failure
      if (userId) {
        const adminClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
        await adminClient.from("ai_usage_logs").insert({
          user_id: userId,
          function_name: FUNCTION_NAME,
          model: "google/gemini-2.5-flash",
          success: false,
          error_message: `HTTP ${response.status}`,
          response_time_ms: Date.now() - startTime,
        });
      }

      // Fallback response
      if (response.status === 429 || response.status === 402 || response.status >= 500) {
        const fallbackMsg = "Desculpe, estou com dificuldade para responder agora. Tente novamente em alguns segundos. 🙏";
        return new Response(JSON.stringify({ 
          choices: [{ message: { role: "assistant", content: fallbackMsg } }],
          fallback: true 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Erro no serviço de IA. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log success
    if (userId) {
      const adminClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
      await adminClient.from("ai_usage_logs").insert({
        user_id: userId,
        function_name: FUNCTION_NAME,
        model: "google/gemini-2.5-flash",
        success: true,
        response_time_ms: Date.now() - startTime,
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Error:`, error);
    
    // Fallback: never crash the app
    const fallbackMsg = "Desculpe, ocorreu um erro inesperado. Tente novamente em instantes.";
    return new Response(JSON.stringify({ 
      choices: [{ message: { role: "assistant", content: fallbackMsg } }],
      fallback: true 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
