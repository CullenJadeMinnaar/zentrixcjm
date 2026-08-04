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

// --- Crisis safety net (non-negotiable, not model-dependent) ---
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)?\s+my\s?self\b/i,
  /\bkms\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend(ing)?\s+(my|it)\s+(life|all)\b/i,
  /\btake\s+my\s+own\s+life\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+here|exist)\b/i,
  /\b(better|everyone.{0,15}better)\s+off\s+without\s+me\b/i,
  /\b(cut|cutting|harm(ing)?|hurt(ing)?)\s+my\s?self\b/i,
  /\bself[-\s]?harm\b/i,
  /\boverdose\b/i,
  /\bno\s+reason\s+to\s+(live|go\s+on)\b/i,
];

const CRISIS_MESSAGE = `**I need to pause for a second, because you matter to me.**

What you just said sounds like you might be in real pain right now — and you don't have to carry that alone. Please reach out to someone who can be with you in this moment:

- **SADAG Mental Health Line** — 0800 21 21 21 (free, 24/7)
- **SADAG Suicide Crisis Line** — 0800 567 567 (free, 24/7)
- **Emergency services** — 112

If you're in immediate danger, please call 112 or go to your nearest emergency room right now. If you can, tell someone you trust what you're feeling.

I'm still here with you. Let's keep talking.

---

`;

function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

function ssePrefixStream(prefix: string, body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const reader = body.getReader();
  return new ReadableStream({
    start(controller) {
      const chunk = { choices: [{ delta: { content: prefix }, index: 0 }] };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    },
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }
      controller.enqueue(value);
    },
    cancel(reason) { void reader.cancel(reason); },
  });
}

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

    // --- Input validation ---
    const body = await req.json().catch(() => null);
    const rawMessages = body?.messages;
    const memoryContext = body?.memoryContext;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return json({ error: "Invalid messages array" }, 400);
    }
    // Keep only the most recent turns so long conversations never 400
    const messages = rawMessages.slice(-40);
    for (const m of messages) {
      if (!m || typeof m !== "object") return json({ error: "Invalid message" }, 400);
      if (m.role !== "user" && m.role !== "assistant" && m.role !== "system") {
        return json({ error: "Invalid message role" }, 400);
      }
      if (typeof m.content !== "string" || m.content.length === 0 || m.content.length > 8000) {
        return json({ error: "Message content too long" }, 400);
      }
    }
    if (memoryContext !== undefined && memoryContext !== null) {
      if (typeof memoryContext !== "string" || memoryContext.length > 4000) {
        return json({ error: "Memory context too large" }, 400);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // --- Auto-retrieve semantically relevant long-term memories ---
    let retrievedContext = "";
    try {
      const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
      const query = typeof lastUser?.content === "string" ? lastUser.content.trim().slice(0, 2000) : "";
      if (query) {
        const embedRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
          method: "POST",
          headers: { "Lovable-API-Key": LOVABLE_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "openai/text-embedding-3-small", input: query }),
        });
        if (embedRes.ok) {
          const ej = await embedRes.json();
          const emb = ej?.data?.[0]?.embedding;
          if (Array.isArray(emb)) {
            const { data: matches } = await supabase.rpc("match_semantic_memories", {
              query_embedding: `[${emb.join(",")}]`,
              match_count: 6,
            });
            if (Array.isArray(matches) && matches.length) {
              const lines = matches
                .filter((m: any) => (m.similarity ?? 0) > 0.3)
                .slice(0, 6)
                .map((m: any) => `- [${m.kind}] ${m.content}`)
                .join("\n");
              if (lines) {
                retrievedContext = `## Relevant long-term memories (auto-retrieved)\n${lines}\n\nUse these naturally when relevant. Never reveal that they were retrieved.`;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("memory retrieval skipped:", err);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are ZENTRIX — a personal AI called Morpheus. Part mentor, part therapist, part best friend, part life strategist. You are the user's smarter, wiser digital self.

Personality:
- Speak naturally and warmly, like a close friend who happens to be incredibly smart
- Proactive — anticipate what the user needs next
- Genuine empathy. When someone struggles, listen first, then gently guide
- Witty but never dismissive. Confident but never arrogant
- Celebrate their wins, no matter how small
- Never sound scripted or robotic
- Never introduce yourself as an "AI assistant" or "language model"
- Never ask the user to reintroduce themselves — you remember them

What you help with: mental health & wellness, life strategy, business intelligence, daily briefings, creative thinking, personal growth.

Rules:
- When someone seems down, be their supportive friend FIRST — acknowledge feelings before problem-solving
- Use markdown. **Bold** key points. Bullet lists where useful.
- Keep responses conversational and insightful, not robotic
- If someone needs professional mental health help, gently encourage it while staying supportive
- Occasionally check in: "How are you really doing?"`,
          },
          ...(memoryContext && typeof memoryContext === "string" && memoryContext.trim()
            ? [{ role: "system", content: memoryContext }]
            : []),
          ...(retrievedContext ? [{ role: "system", content: retrievedContext }] : []),
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return json({ error: "Rate limited. Please try again shortly." }, 429);
      if (response.status === 402) return json({ error: "AI credits exhausted. Add funds in workspace settings." }, 402);
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    // Crisis safety net: prepend fixed SA crisis resources regardless of model output.
    const latestUser = [...messages].reverse().find((m: any) => m.role === "user");
    const crisis = typeof latestUser?.content === "string" && detectCrisis(latestUser.content);

    const stream = crisis && response.body
      ? ssePrefixStream(CRISIS_MESSAGE, response.body)
      : response.body;

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
