import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, memoryContext } = await req.json();
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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
