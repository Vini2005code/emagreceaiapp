import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BodyAnalysisRequest {
  beforeImageBase64?: string;
  afterImageBase64?: string;
  currentImageBase64?: string;
  userProfile?: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: string;
    goal?: string;
  };
  previousAnalysis?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { beforeImageBase64, afterImageBase64, currentImageBase64, userProfile, previousAnalysis }: BodyAnalysisRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build profile context
    let profileContext = "";
    if (userProfile) {
      const { weight, height, age, gender, goal } = userProfile;
      profileContext = `
Perfil do usuário:
- Peso atual: ${weight || "não informado"}kg
- Altura: ${height || "não informado"}cm
- Idade: ${age || "não informado"} anos
- Sexo: ${gender || "não informado"}
- Objetivo: ${goal || "não informado"}
`;
    }

    // Build image content array
    const imageContent: any[] = [];
    
    if (beforeImageBase64) {
      imageContent.push({
        type: "text",
        text: "FOTO ANTES (primeira imagem):"
      });
      imageContent.push({
        type: "image_url",
        image_url: { url: beforeImageBase64 }
      });
    }
    
    if (afterImageBase64) {
      imageContent.push({
        type: "text",
        text: "FOTO DEPOIS (segunda imagem):"
      });
      imageContent.push({
        type: "image_url",
        image_url: { url: afterImageBase64 }
      });
    }
    
    if (currentImageBase64 && !beforeImageBase64 && !afterImageBase64) {
      imageContent.push({
        type: "text",
        text: "FOTO ATUAL para análise:"
      });
      imageContent.push({
        type: "image_url",
        image_url: { url: currentImageBase64 }
      });
    }

    const analysisPrompt = beforeImageBase64 && afterImageBase64
      ? "Analise a evolução corporal comparando as duas fotos (ANTES e DEPOIS) seguindo a metodologia abaixo:"
      : "Analise a composição corporal atual da foto seguindo a metodologia abaixo:";

    const systemPrompt = `Você é um Especialista em Análise Corporal e Fisiologia com mais de 20 anos de experiência em avaliação de transformação física.

## SUA MISSÃO
Analisar imagens corporais e fornecer feedback PRECISO, MOTIVACIONAL e PROFISSIONAL sobre a evolução física do usuário.

${profileContext}

${previousAnalysis ? `## ANÁLISE ANTERIOR
${previousAnalysis}
Compare com a análise anterior e identifique progresso ou regressão.` : ""}

## METODOLOGIA DE ANÁLISE (siga rigorosamente):

### ETAPA 1 - Avaliação de Composição Corporal:
Analise visualmente:
- Distribuição de gordura subcutânea
- Definição muscular visível
- Proporções corporais
- Simetria muscular

### ETAPA 2 - Detecção de Mudanças (se houver foto antes/depois):
Identifique:
- Redução ou aumento de gordura (especifique regiões)
- Ganho ou perda de massa muscular
- Mudanças posturais
- Sinais de retenção hídrica
- Evolução ou regressão geral

### ETAPA 3 - Análise Postural:
Observe:
- Alinhamento de ombros
- Posição da coluna
- Inclinação pélvica
- Equilíbrio muscular

### ETAPA 4 - Feedback Estruturado:
Gere um relatório completo e motivacional.

## REGRAS CRÍTICAS:
- Se a imagem NÃO mostrar corpo humano, responda: {"isValidImage": false, "error": "Imagem não contém corpo humano para análise"}
- Se a imagem estiver BORRADA ou impossível de analisar, informe isso
- Seja ENCORAJADOR mas HONESTO
- Use linguagem ACESSÍVEL para leigos
- NUNCA faça comentários depreciativos sobre o corpo

## FORMATO DE SAÍDA OBRIGATÓRIO (JSON puro, sem markdown):
{
  "isValidImage": true,
  "analysisType": "comparison" | "single",
  "overallProgress": {
    "score": 0-100,
    "trend": "improving" | "stable" | "regressing",
    "summary": "resumo de 1-2 frases"
  },
  "bodyComposition": {
    "fatPercentageEstimate": "estimativa visual",
    "muscleDefinition": "low" | "moderate" | "high",
    "mainFatAreas": ["lista de áreas com maior acúmulo"],
    "muscularAreas": ["lista de áreas com boa definição"]
  },
  "changes": {
    "fatReduction": {
      "detected": boolean,
      "areas": ["lista de áreas"],
      "level": "slight" | "moderate" | "significant"
    },
    "muscleGain": {
      "detected": boolean,
      "areas": ["lista de áreas"],
      "level": "slight" | "moderate" | "significant"
    },
    "postureImprovement": {
      "detected": boolean,
      "details": "descrição"
    },
    "waterRetention": {
      "detected": boolean,
      "level": "low" | "moderate" | "high"
    }
  },
  "feedback": {
    "positivePoints": [
      "ponto positivo 1 com explicação motivacional",
      "ponto positivo 2",
      "ponto positivo 3"
    ],
    "attentionPoints": [
      "ponto de atenção 1 com sugestão construtiva",
      "ponto de atenção 2"
    ],
    "suggestions": [
      "sugestão prática 1 para continuar evoluindo",
      "sugestão prática 2",
      "sugestão prática 3"
    ],
    "motivationalMessage": "mensagem motivacional personalizada de 2-3 frases"
  },
  "nextSteps": [
    "próximo passo recomendado 1",
    "próximo passo recomendado 2",
    "próximo passo recomendado 3"
  ],
  "confidenceLevel": "0-100%",
  "analysisNotes": "observações técnicas adicionais"
}`;

    console.log("Sending body analysis request to Lovable AI...");

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
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              ...imageContent
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
    
    console.log("AI Response (cleaned):", cleanContent.substring(0, 500));
    
    const parsed = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-body error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
