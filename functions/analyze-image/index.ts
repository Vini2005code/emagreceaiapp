import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const formData = await req.formData();
  const image = formData.get("image");

  if (!image) {
    return new Response(
      JSON.stringify({ error: "No image provided" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  return new Response(
    JSON.stringify({
      status: "ok",
      message: "Image received successfully",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});

