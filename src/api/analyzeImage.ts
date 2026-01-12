import type { IncomingMessage, ServerResponse } from "http";
import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

/**
 * IMPORTANTE:
 * - Esse arquivo roda em Node
 * - NÃO é frontend
 * - NÃO usa import.meta.env
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const form = formidable({ multiples: false });

    const [_, files] = await form.parse(req);

    const imageFile = files.image?.[0];

    if (!imageFile) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Imagem não enviada" }));
      return;
    }

    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um nutricionista profissional.

REGRAS:
1) Determine se a imagem contém um ALIMENTO.
2) Se NÃO for comida, responda EXATAMENTE:
{"isFood": false}

3) Se FOR comida, responda APENAS neste JSON:
{
  "isFood": true,
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number
  }
}
          `,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise este item:" },
            {
              type: "image_url",
              image_url: { url: base64Image },
            },
          ],
        },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);

    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify(parsed));
  } catch (error) {
    console.error("API ERROR:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Erro ao analisar imagem" }));
  }
}
