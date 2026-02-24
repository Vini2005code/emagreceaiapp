 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 const FUNCTION_NAME = "generate-recipes";
 
 interface UserProfile {
   weight: number;
   height: number;
   age: number;
   gender: string;
   activityLevel: string;
   goalWeight: number;
 }
 
 interface RecipeRequest {
   mealType: string;
   profile: UserProfile;
   preferences?: string[];
   restrictions?: string[];
   excludeIngredients?: string[];
   availableIngredients?: string[];
   targetCalories?: number;
   targetProtein?: number;
   targetCarbs?: number;
   targetFat?: number;
   language?: string;
 }
 
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
     const { data: plan } = await adminClient.from("subscription_plans").select("recipes_daily_limit").eq("id", planId).maybeSingle();
     const dailyLimit = plan?.recipes_daily_limit || 3;
 
     const { count } = await adminClient.from("ai_usage_logs").select("id", { count: "exact", head: true })
       .eq("user_id", user.id).eq("function_name", FUNCTION_NAME).gte("created_at", today.toISOString());
 
     if ((count || 0) >= dailyLimit) {
       return new Response(JSON.stringify({ error: "Limite diário atingido. Faça upgrade do seu plano.", limit_reached: true, recipes: [] }), {
         status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const requestData: RecipeRequest = await req.json();
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
 
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
     
     const {
       mealType,
       profile,
       preferences = [],
       restrictions = [],
       excludeIngredients = [],
       availableIngredients = [],
       targetCalories,
       targetProtein,
       targetCarbs,
       targetFat,
       language = "pt"
     } = requestData;
 
     // Calculate BMI and diet recommendation if not provided
     const heightInMeters = profile.height / 100;
     const bmi = profile.weight / (heightInMeters * heightInMeters);
     const weightDiff = profile.weight - profile.goalWeight;
     const goal = weightDiff > 0 ? "perda de peso" : weightDiff < 0 ? "ganho de peso" : "manutenção";
     
 
     const getMealLabel = (type: string, lang: string): string => {
       const labels: Record<string, Record<string, string>> = {
         breakfast: { pt: "Café da manhã", en: "Breakfast" },
         lunch: { pt: "Almoço", en: "Lunch" },
         dinner: { pt: "Jantar", en: "Dinner" },
         snack: { pt: "Lanche", en: "Snack" },
       };
       return labels[type]?.[lang] || type;
     };
 
     const prompt = `Você é um nutricionista especialista em ${language === "pt" ? "português brasileiro" : "English"}.
 
 PERFIL DO USUÁRIO:
 - Peso: ${profile.weight}kg
 - Altura: ${profile.height}cm
 - Idade: ${profile.age} anos
 - Gênero: ${profile.gender === "male" ? "Masculino" : "Feminino"}
 - Nível de atividade: ${profile.activityLevel}
 - Meta de peso: ${profile.goalWeight}kg
 - IMC atual: ${bmi.toFixed(1)}
 - Objetivo: ${goal}
 
 ${targetCalories ? `META CALÓRICA DESTA REFEIÇÃO: ${targetCalories} kcal` : ""}
 ${targetProtein ? `Proteína alvo: ${targetProtein}g` : ""}
 ${targetCarbs ? `Carboidratos alvo: ${targetCarbs}g` : ""}
 ${targetFat ? `Gordura alvo: ${targetFat}g` : ""}
 
 ${preferences.length > 0 ? `PREFERÊNCIAS: ${preferences.join(", ")}` : ""}
 ${restrictions.length > 0 ? `RESTRIÇÕES ALIMENTARES (OBRIGATÓRIO RESPEITAR): ${restrictions.join(", ")}` : ""}
 ${excludeIngredients.length > 0 ? `INGREDIENTES A EXCLUIR (cansado destes): ${excludeIngredients.join(", ")}` : ""}
 ${availableIngredients.length > 0 ? `INGREDIENTES DISPONÍVEIS (usar se possível): ${availableIngredients.join(", ")}` : ""}
 
 TIPO DE REFEIÇÃO: ${getMealLabel(mealType, language)}
 
 GERE EXATAMENTE 4 RECEITAS DIFERENTES E ÚNICAS para esta refeição.
 
 Cada receita DEVE incluir:
 1. Nome criativo e apetitoso
 2. Descrição curta (1 frase)
 3. Lista COMPLETA de ingredientes com QUANTIDADES EXATAS (gramas, ml, unidades)
 4. Modo de preparo DETALHADO passo a passo
 5. Tempo de preparo em minutos
 6. Nível de dificuldade (fácil, médio, difícil)
 7. Informações nutricionais PRECISAS: calorias, proteína, carboidratos, gordura, fibras
 8. Sugestões de substituição para 2 ingredientes principais
 
 REGRAS OBRIGATÓRIAS:
 - NUNCA sugira ingredientes que estão nas restrições
 - As receitas devem ser REALISTAS e PRÁTICAS para o dia a dia
 - Considere o objetivo do usuário (${goal})
 - Varie os sabores e texturas entre as 4 receitas
 - Use medidas caseiras também (colher, xícara, etc)
 - Responda em ${language === "pt" ? "português brasileiro" : "English"}
 
 Responda APENAS com JSON válido no formato:
 {
   "recipes": [
     {
       "id": "uuid",
       "name": "string",
       "description": "string",
       "prepTime": number,
       "difficulty": "easy" | "medium" | "hard",
       "ingredients": [
         { "name": "string", "amount": "string", "unit": "string" }
       ],
       "instructions": ["string"],
       "nutrition": {
         "calories": number,
         "protein": number,
         "carbs": number,
         "fat": number,
         "fiber": number
       },
       "substitutions": [
         { "original": "string", "substitute": "string", "reason": "string" }
       ],
       "tips": "string"
     }
   ]
 }`;
 
     console.log("Generating recipes for:", mealType, "with profile:", profile);
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-2.5-flash",
         messages: [
           { role: "user", content: prompt },
         ],
         temperature: 0.8, // Higher temperature for more variety
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
       
       throw new Error(`AI service error: ${response.status}`);
     }
 
     const aiResponse = await response.json();
     const content = aiResponse.choices?.[0]?.message?.content;
 
     if (!content) {
       throw new Error("No response from AI");
     }
 
     // Parse JSON from response
     let recipes;
     try {
       // Try to extract JSON from markdown code blocks if present
       const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
       const jsonStr = jsonMatch ? jsonMatch[1] : content;
       recipes = JSON.parse(jsonStr.trim());
     } catch (e) {
       console.error("Failed to parse AI response:", content);
       throw new Error("Failed to parse recipe response");
     }
 
     console.log("Generated", recipes.recipes?.length || 0, "recipes successfully");
 
     // Log successful usage
     await adminClient.from("ai_usage_logs").insert({
       user_id: user.id,
       function_name: FUNCTION_NAME,
       success: true,
       response_time_ms: Date.now() - startTime,
     });

     return new Response(JSON.stringify(recipes), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("Generate recipes error:", error);
     return new Response(
       JSON.stringify({ 
         error: error instanceof Error ? error.message : "Unknown error",
         recipes: [] 
       }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });