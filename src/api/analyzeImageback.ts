import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Erro ao processar imagem" });
    }

    const image = files.image;

    if (!image) {
      return res.json({ isFood: false });
    }

    /**
     * 🔥 SIMULAÇÃO INTELIGENTE (sem mentir)
     * Aqui depois você liga OpenAI / Gemini
     */
    return res.json({
      isFood: true,
      nutrition: {
        calories: 420,
        protein: 25,
        carbs: 38,
        fat: 17,
        fiber: 6,
        sugar: 5,
      },
    });
  });
}
