// Retrieve top-K semantically relevant memories for a query.
// Body: { query: string, k?: number }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query || query.length > 4000) return json({ error: "Invalid query" }, 400);
    const k = Math.max(1, Math.min(20, Number(body?.k) || 6));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const embedRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "openai/text-embedding-3-small", input: query }),
    });
    if (!embedRes.ok) {
      if (embedRes.status === 429) return json({ error: "Rate limited" }, 429);
      if (embedRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: "Embedding failed" }, 500);
    }
    const embedJson = await embedRes.json();
    const embedding = embedJson?.data?.[0]?.embedding;
    if (!Array.isArray(embedding)) return json({ error: "No embedding" }, 500);

    const { data, error } = await supabase.rpc("match_semantic_memories", {
      query_embedding: `[${embedding.join(",")}]`,
      match_count: k,
    });
    if (error) {
      console.error("rpc error", error);
      return json({ error: error.message }, 500);
    }

    return json({ ok: true, memories: data ?? [] });
  } catch (e) {
    console.error("retrieve-memories error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
