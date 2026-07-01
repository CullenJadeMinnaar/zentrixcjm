// Embed a piece of text and upsert it into semantic_memories for the current user.
// Body: { content: string, kind?: string, importance?: number, source?: string, metadata?: object, id?: string }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const body = await req.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (!content || content.length > 8000) return json({ error: "Invalid content" }, 400);

    const kind = typeof body?.kind === "string" && body.kind.length <= 40 ? body.kind : "general";
    const importance = typeof body?.importance === "number" ? Math.max(0, Math.min(1, body.importance)) : 0.5;
    const source = typeof body?.source === "string" && body.source.length <= 40 ? body.source : "manual";
    const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const id = typeof body?.id === "string" ? body.id : null;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const embedRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: content,
      }),
    });

    if (!embedRes.ok) {
      if (embedRes.status === 429) return json({ error: "Rate limited" }, 429);
      if (embedRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
      const t = await embedRes.text();
      console.error("embed error", embedRes.status, t);
      return json({ error: "Embedding failed" }, 500);
    }
    const embedJson = await embedRes.json();
    const embedding = embedJson?.data?.[0]?.embedding;
    if (!Array.isArray(embedding)) return json({ error: "No embedding returned" }, 500);

    const row = {
      user_id: user.id,
      content,
      kind,
      importance,
      source,
      metadata,
      embedding: `[${embedding.join(",")}]`,
    };

    if (id) {
      const { error } = await supabase.from("semantic_memories").update(row).eq("id", id).eq("user_id", user.id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, id });
    } else {
      const { data, error } = await supabase.from("semantic_memories").insert(row).select("id").single();
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, id: data.id });
    }
  } catch (e) {
    console.error("embed-memory error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
