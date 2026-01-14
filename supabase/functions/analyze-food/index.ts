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
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um nutricionista especializado com mais de 20 anos de experiência em análise nutricional de alimentos.

REGRAS CRÍTICAS:
1. Analise a imagem CUIDADOSAMENTE e determine se contém um ALIMENTO real.
2. Se NÃO for comida (objeto, pessoa, paisagem, texto, etc), responda EXATAMENTE: {"isFood": false}

3. Se FOR comida, faça uma análise PRECISA e REALISTA:
   - Identifique TODOS os componentes do prato (arroz, feijão, carne, salada, etc.)
   - Estime o PESO/VOLUME de cada componente baseado no tamanho do prato/recipiente
   - Use um prato padrão (24-26cm) como referência se não houver outra escala
   - Calcule as calorias de CADA ingrediente separadamente e some
   - Seja CONSERVADOR nas estimativas - prefira subestimar levemente

TABELA DE REFERÊNCIA (por 100g):
- Arroz branco cozido: 130 kcal, 2.7g prot, 28g carb, 0.3g gord
- Feijão cozido: 77 kcal, 5g prot, 14g carb, 0.5g gord  
- Frango grelhado: 165 kcal, 31g prot, 0g carb, 3.6g gord
- Carne bovina magra: 250 kcal, 26g prot, 0g carb, 15g gord
- Salada de alface/tomate: 15-20 kcal
- Ovo frito: 90 kcal por unidade
- Pão francês: 150 kcal por unidade (50g)

Responda APENAS com JSON válido, sem markdown, sem explicações.

Formato EXATO:
{
  "isFood": true,
  "foodName": "descrição completa do prato em português",
  "nutrition": {
    "calories": número inteiro (kcal total),
    "protein": número com 1 decimal (gramas),
    "carbs": número com 1 decimal (gramas),
    "fat": número com 1 decimal (gramas),
    "fiber": número com 1 decimal (gramas),
    "sugar": número com 1 decimal (gramas)
  }
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise esta imagem e forneça informações nutricionais se for um alimento:"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    
    const parsed = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-food error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
