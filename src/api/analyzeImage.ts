export async function analyzeImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    "https://SEU-PROJETO.supabase.co/functions/v1/analyze-image",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao analisar imagem");
  }

  return response.json();
}
