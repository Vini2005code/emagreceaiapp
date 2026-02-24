import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FUNCTION_NAME = "generate-meal-plan";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Rate Limiting ---
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sub } = await adminClient.from("user_subscriptions").select("plan_id").eq("user_id", user.id).maybeSingle();
    const planId = sub?.plan_id || "free";
    const { data: plan } = await adminClient.from("subscription_plans").select("meal_plan_daily_limit").eq("id", planId).maybeSingle();
    const dailyLimit = plan?.meal_plan_daily_limit || 1;

    const { count } = await adminClient.from("ai_usage_logs").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).eq("function_name", FUNCTION_NAME).gte("created_at", today.toISOString());

    if ((count || 0) >= dailyLimit) {
      return new Response(JSON.stringify({ error: "Limite diário atingido. Faça upgrade do seu plano.", limit_reached: true }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestData = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const {
      profile,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      targetFiber,
      date,
      language = "pt",
    } = requestData;

    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);
    const weightDiff = profile.weight - profile.goalWeight;
    const goal = weightDiff > 0 ? "perda de peso" : weightDiff < 0 ? "ganho de massa" : "manutenção";

    const routineLabels: Record<string, string> = {
      regular: "horário comercial (8h-18h)",
      shift: "trabalho por turnos",
      nocturnal: "rotina noturna",
      irregular: "horários irregulares",
    };

    const prompt = `Você é um nutricionista clínico especialista. Gere um cardápio COMPLETO para o dia ${date}.

PERFIL DO PACIENTE:
- Peso: ${profile.weight}kg | Altura: ${profile.height}cm | Idade: ${profile.age} anos
- Gênero: ${profile.gender === "male" ? "Masculino" : "Feminino"}
- IMC: ${bmi.toFixed(1)} | Objetivo: ${goal}
- Meta de peso: ${profile.goalWeight}kg
- Atividade: ${profile.activityLevel}
- Biotipo: ${profile.bodyType}
- Rotina: ${routineLabels[profile.dailyRoutine] || "regular"}
${profile.foodPreferences?.length > 0 ? `- Preferências alimentares: ${profile.foodPreferences.join(", ")}` : ""}
${profile.medicalLimitations?.length > 0 ? `- Limitações médicas (OBRIGATÓRIO RESPEITAR): ${profile.medicalLimitations.join(", ")}` : ""}

METAS NUTRICIONAIS DO DIA:
- Calorias totais: ${targetCalories} kcal
- Proteína: ${targetProtein}g
- Carboidratos: ${targetCarbs}g
- Gordura: ${targetFat}g
- Fibras: ${targetFiber}g

DISTRIBUIÇÃO POR REFEIÇÃO:
- Café da manhã: ~25% das calorias
- Lanche da manhã: ~10% das calorias
- Almoço: ~30% das calorias
- Lanche da tarde: ~10% das calorias
- Jantar: ~25% das calorias

REGRAS:
1. Use alimentos ACESSÍVEIS e fáceis de encontrar no Brasil
2. Varie texturas, sabores e cores
3. Respeite TODAS as limitações médicas
4. Ingredientes com quantidades EXATAS (gramas, ml, unidades)
5. Modo de preparo resumido mas claro
6. A soma calórica deve ser PRÓXIMA da meta (±50 kcal)
7. Não repita proteínas entre refeições
8. Use a data como semente de variação (receitas diferentes a cada dia)
9. Responda em ${language === "pt" ? "português brasileiro" : "English"}

Responda APENAS com JSON válido:
{
  "mealPlan": {
    "breakfast": {
      "name": "string",
      "description": "string (1 frase)",
      "prepTime": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "ingredients": [{"name": "string", "amount": "string", "unit": "string"}],
      "instructions": ["string"]
    },
    "morningSnack": { ... mesmo formato },
    "lunch": { ... mesmo formato },
    "afternoonSnack": { ... mesmo formato },
    "dinner": { ... mesmo formato }
  }
}`;

    console.log("Generating meal plan for date:", date, "calories:", targetCalories);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI service error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) throw new Error("No response from AI");

    let result;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse meal plan response");
    }

    console.log("Meal plan generated successfully");

    // Log successful usage
    await adminClient.from("ai_usage_logs").insert({
      user_id: user.id,
      function_name: FUNCTION_NAME,
      success: true,
      response_time_ms: Date.now() - startTime,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate meal plan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
