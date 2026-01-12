import type { VercelRequest, VercelResponse } from "vercel";
import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um nutricionista.
1) Determine se a imagem contém um ALIMENTO.
2) Se NÃO for comida, responda exatamente:
{"isFood": false}

3) Se FOR comida, responda APENAS neste formato JSON:
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
    });

    const raw = response.choices[0].message.content || "{}";
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "Erro ao analisar imagem" });
  }
}
