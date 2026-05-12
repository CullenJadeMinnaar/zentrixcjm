import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- Auth check ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "").trim();
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${jwt}` } } },
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const { prompt, style } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0 || prompt.length > 1000) {
      return json({ error: "Prompt is required and must be 1-1000 characters" }, 400);
    }
    if (style !== undefined && (typeof style !== "string" || style.length > 32)) {
      return json({ error: "Invalid style" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const stylePrompts: Record<string, string> = {
      photo: "realistic photograph, high quality, detailed",
      meme: "internet meme style, funny, bold text overlay",
      sticker: "cute sticker design, simple clean lines, transparent background style",
      art: "digital art, vibrant colors, detailed illustration",
      logo: "minimal logo design, clean vector style, professional",
    };

    const enhancedPrompt = `${prompt}. Style: ${stylePrompts[style as string] || stylePrompts.photo}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: `Generate this image: ${enhancedPrompt}` }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return json({ error: "Rate limited. Please try again shortly." }, 429);
      if (response.status === 402) return json({ error: "AI credits exhausted." }, 402);
      const t = await response.text();
      console.error("Image generation error:", response.status, t);
      return json({ error: "Image generation failed" }, 500);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) return json({ error: "No image generated" }, 500);

    return json({ image: imageUrl });
  } catch (e) {
    console.error("generate-image error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
