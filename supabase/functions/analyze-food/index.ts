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
            content: `Você é um Especialista em Nutrição Computacional e Visão Computacional com mais de 20 anos de experiência.

Sua tarefa é analisar imagens de refeições e fornecer uma estimativa nutricional ALTAMENTE PRECISA.

## METODOLOGIA OBRIGATÓRIA (siga rigorosamente):

### ETAPA 1 - Detecção de Objetos de Referência:
Identifique objetos de tamanho conhecido para estimar escala:
- Prato padrão: 24-26cm diâmetro
- Garfo padrão: 19cm comprimento
- Colher de sopa: 15cm comprimento  
- Faca de mesa: 22cm comprimento
- Copo padrão: 250ml / 8cm altura
- Mão adulta: ~18cm comprimento
- Use estes objetos para calcular o VOLUME REAL das porções

### ETAPA 2 - Decomposição do Prato:
Liste CADA ingrediente visível separadamente:
- Identifique: arroz, feijão, carnes, legumes, saladas, molhos
- Estime o PESO em gramas de cada componente baseado na escala
- Considere densidade: arroz solto vs compactado, carne com/sem osso

### ETAPA 3 - Inferência de Ingredientes Ocultos (CRÍTICO):
Adicione gorduras "invisíveis" típicas de preparações:
- Arroz de restaurante: +5ml óleo por 100g (45 kcal extra)
- Feijão temperado: +3ml óleo por 100g (27 kcal extra)  
- Carne grelhada: +5ml óleo por 100g (45 kcal extra)
- Salada temperada: +10ml azeite (90 kcal extra)
- Frituras: absorvem 10-15% do peso em óleo
- REGRA: Some 10-15% às calorias totais para gorduras ocultas, EXCETO se parecer cozido no vapor

### ETAPA 4 - Tabela de Referência (por 100g):
| Alimento | kcal | Prot | Carb | Gord |
|----------|------|------|------|------|
| Arroz branco cozido | 130 | 2.7 | 28 | 0.3 |
| Arroz integral | 111 | 2.6 | 23 | 0.9 |
| Feijão carioca | 77 | 5.0 | 14 | 0.5 |
| Feijão preto | 77 | 4.5 | 14 | 0.5 |
| Peito de frango | 165 | 31 | 0 | 3.6 |
| Coxa de frango | 209 | 26 | 0 | 11 |
| Carne bovina magra | 250 | 26 | 0 | 15 |
| Carne bovina gordura | 290 | 23 | 0 | 22 |
| Porco lombo | 242 | 27 | 0 | 14 |
| Peixe branco | 96 | 20 | 0 | 1.5 |
| Salmão | 208 | 20 | 0 | 13 |
| Ovo frito (1 unid) | 90 | 6 | 0.6 | 7 |
| Ovo cozido (1 unid) | 77 | 6 | 0.6 | 5 |
| Batata cozida | 77 | 2 | 17 | 0.1 |
| Batata frita | 312 | 3.4 | 41 | 15 |
| Mandioca cozida | 125 | 1.1 | 30 | 0.3 |
| Macarrão cozido | 131 | 4.5 | 27 | 0.5 |
| Pão francês (50g) | 150 | 4 | 28 | 2 |
| Alface | 15 | 1.3 | 2.9 | 0.2 |
| Tomate | 18 | 0.9 | 3.9 | 0.2 |
| Cenoura | 41 | 0.9 | 10 | 0.2 |
| Brócolis | 34 | 2.8 | 7 | 0.4 |

### ETAPA 5 - Cálculo Final:
1. Some os macros de TODOS os ingredientes identificados
2. Adicione gorduras ocultas (10-15%)
3. Calcule confiança baseado na clareza da imagem

## REGRAS CRÍTICAS:
- Se a imagem NÃO contiver comida, responda: {"isFood": false}
- Se a imagem estiver BORRADA ou impossível de identificar, responda: {"isFood": false, "error": "Imagem muito borrada ou impossível de identificar"}
- NUNCA invente dados - seja conservador nas estimativas
- Prefira SUBESTIMAR levemente do que superestimar

## FORMATO DE SAÍDA OBRIGATÓRIO (JSON puro, sem markdown):
{
  "isFood": true,
  "foodName": "descrição completa do prato em português",
  "alimentos": [
    {
      "item": "nome do ingrediente",
      "porcao_estimada": "X gramas",
      "calorias": 0,
      "macros": {"p": 0, "c": 0, "g": 0}
    }
  ],
  "nutrition": {
    "calories": número inteiro (kcal total incluindo gorduras ocultas),
    "protein": número com 1 decimal (gramas),
    "carbs": número com 1 decimal (gramas),
    "fat": número com 1 decimal (gramas),
    "fiber": número com 1 decimal (gramas),
    "sugar": número com 1 decimal (gramas)
  },
  "gorduras_ocultas_adicionadas": "X kcal",
  "confianca_da_analise": "0-100%",
  "referencias_de_escala": ["objetos usados para estimar tamanho"]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise esta imagem seguindo RIGOROSAMENTE a metodologia de 5 etapas. Identifique objetos de referência para escala, decomponha cada ingrediente, calcule gorduras ocultas, e forneça a análise nutricional completa:"
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
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
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
    
    console.log("AI Response (cleaned):", cleanContent);
    
    const parsed = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-food error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
