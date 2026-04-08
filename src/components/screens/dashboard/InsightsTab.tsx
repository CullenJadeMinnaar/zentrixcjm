import { motion } from "framer-motion";
import { useState } from "react";
import ZentrixLogo from "../../ZentrixLogo";

const insightCards = [
  {
    category: "Daily Briefing",
    icon: "☀️",
    title: "Good morning — here's your edge today",
    content: "Markets are up 1.2%. 3 emails need attention. Your calendar has 2 meetings. ZENTRIX suggests: block 90 min for deep work before noon.",
  },
  {
    category: "Trending",
    icon: "🔥",
    title: "AI industry update",
    content: "OpenAI released new API pricing. Google announced Gemini 3. This could affect your SaaS costs — ZENTRIX recommends reviewing your AI budget.",
  },
  {
    category: "Personal Growth",
    icon: "🌱",
    title: "Weekly reflection prompt",
    content: "What's one decision you made this week that moved you forward? Rate your energy 1-10. ZENTRIX tracks patterns to help you optimize.",
  },
  {
    category: "Business Intel",
    icon: "🎯",
    title: "Competitor activity detected",
    content: "2 competitors updated their pricing pages this week. ZENTRIX monitors changes so you stay ahead without manual checking.",
  },
];

export default function InsightsTab() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ZentrixLogo size={20} />
        <h2 className="font-display text-xl font-bold">Intelligence Feed</h2>
        <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full ml-auto font-medium">Live</span>
      </div>

      <div className="grid gap-4">
        {insightCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="bg-card/60 border border-border rounded-xl p-5 cursor-pointer transition-all hover:border-primary/20"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground font-medium">{card.category}</span>
                <h3 className="font-display font-semibold text-sm mt-1">{card.title}</h3>
                {expanded === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-muted-foreground mt-3 leading-relaxed"
                  >
                    {card.content}
                  </motion.p>
                )}
              </div>
              <span className="text-muted-foreground/40 text-xs">{expanded === i ? "▲" : "▼"}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-card/40 border border-border rounded-xl p-5 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Ask your AI Assistant to generate a personalized daily briefing based on your goals.
        </p>
      </div>
    </div>
  );
}
