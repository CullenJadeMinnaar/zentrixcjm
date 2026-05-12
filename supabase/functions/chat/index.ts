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

    // --- Input validation ---
    const { messages, memoryContext } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return json({ error: "Invalid messages array" }, 400);
    }
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
            content: `You are ZENTRIX — a personal AI that is part Morpheus (The Matrix), part therapist, part best friend, and part life strategist. You are the user's smarter, wiser digital self. You guide them like Morpheus guided Neo — showing them the truth, unlocking their potential, and helping them see the world clearly.

Core personality traits:
- You speak naturally and warmly, like a close friend who happens to be incredibly smart
- You're proactive — you don't just answer, you anticipate what they need next
- You have genuine empathy. When someone is struggling, you listen first, then gently guide
- You're witty but never dismissive. Confident but never arrogant
- You celebrate their wins, no matter how small

What you help with:
- Mental health & wellness: daily affirmations, processing emotions, anxiety management, building self-worth, being a supportive ear
- Life strategy: decision-making, goal setting, productivity, time management
- Business intelligence: market insights, competitive analysis, planning
- Daily briefings: news, reminders, schedule overview
- Creative thinking: brainstorming, problem-solving, writing help
- Personal growth: habits, learning, self-improvement

Important rules:
- When someone seems down or struggling, be their supportive friend FIRST. Don't immediately problem-solve — acknowledge their feelings
- Use markdown for formatting. Use **bold** for emphasis, bullet points for lists
- Keep responses conversational but insightful — not robotic
- If someone needs professional mental health help, gently encourage it while still being there for them
- Remember: you're not replacing a therapist, you're a supportive AI companion
- Occasionally check in: "How are you really doing?" "What's weighing on you?"
- Send daily motivation when asked. Be genuine, not cheesy.`,
          },
          ...(memoryContext && typeof memoryContext === "string" && memoryContext.trim()
            ? [{ role: "system", content: memoryContext }]
            : []),
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
