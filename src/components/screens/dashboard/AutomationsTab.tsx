import { motion } from "framer-motion";
import { useState } from "react";

interface Automation {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  frequency: string;
}

const defaultAutomations: Automation[] = [
  { id: "morning", name: "Morning Briefing", description: "Daily summary of news, calendar, and priorities at 7 AM", icon: "🌅", enabled: true, frequency: "Daily" },
  { id: "quotes", name: "Self-Worth Quotes", description: "Daily affirmation delivered to boost your mindset", icon: "✨", enabled: true, frequency: "Daily" },
  { id: "mood", name: "Mood Check-in", description: "Gentle reminder to log your mood and feelings", icon: "🧠", enabled: true, frequency: "2x Daily" },
  { id: "email", name: "Email Digest", description: "AI-summarized email highlights every 4 hours", icon: "📧", enabled: false, frequency: "Every 4h" },
  { id: "market", name: "Market Watch", description: "Alert when stocks or crypto move more than 3%", icon: "📊", enabled: true, frequency: "Real-time" },
  { id: "focus", name: "Focus Mode", description: "Block distractions and suggest deep work windows", icon: "🎯", enabled: false, frequency: "Adaptive" },
  { id: "weekly", name: "Weekly Report", description: "Auto-generated performance and wellness report", icon: "📋", enabled: true, frequency: "Weekly" },
  { id: "hydration", name: "Hydration Reminder", description: "Gentle nudge to drink water throughout the day", icon: "💧", enabled: false, frequency: "Every 2h" },
];

export default function AutomationsTab() {
  const [automations, setAutomations] = useState(defaultAutomations);

  const toggle = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Automations</h2>
          <p className="text-sm text-muted-foreground mt-1">Set it and forget it — ZENTRIX handles the rest</p>
        </div>
        <span className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20">
          {automations.filter((a) => a.enabled).length} active
        </span>
      </div>

      <div className="grid gap-3">
        {automations.map((auto, i) => (
          <motion.div
            key={auto.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`border rounded-xl p-4 flex items-center gap-4 transition-all ${
              auto.enabled
                ? "border-primary/20 bg-primary/5"
                : "border-border bg-card/30"
            }`}
          >
            <span className="text-2xl">{auto.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{auto.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{auto.description}</div>
              <span className="text-[10px] text-muted-foreground/50 mt-1 inline-block bg-secondary/50 px-2 py-0.5 rounded-full">{auto.frequency}</span>
            </div>
            <button
              onClick={() => toggle(auto.id)}
              className={`w-12 h-6 rounded-full relative transition-all ${
                auto.enabled ? "bg-primary" : "bg-secondary border border-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  auto.enabled ? "left-[26px]" : "left-0.5"
                }`}
              />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
