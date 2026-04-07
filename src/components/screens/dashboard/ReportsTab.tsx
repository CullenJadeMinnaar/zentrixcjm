import { motion } from "framer-motion";

const reports = [
  {
    title: "Weekly Productivity Score",
    value: "87%",
    change: "+12%",
    positive: true,
    description: "Based on tasks completed, focus time, and goal progress",
    icon: "⚡",
  },
  {
    title: "AI Interactions",
    value: "142",
    change: "+23",
    positive: true,
    description: "Questions asked and insights received this week",
    icon: "💬",
  },
  {
    title: "Automations Triggered",
    value: "38",
    change: "+5",
    positive: true,
    description: "Automated actions that saved you time",
    icon: "🤖",
  },
  {
    title: "Time Saved",
    value: "6.2h",
    change: "+1.4h",
    positive: true,
    description: "Estimated hours saved through ZENTRIX this week",
    icon: "⏱️",
  },
];

const recentActivity = [
  { time: "2 min ago", action: "Morning briefing delivered", type: "automation" },
  { time: "1 hour ago", action: "Market alert: BTC up 4.2%", type: "alert" },
  { time: "3 hours ago", action: "Email digest processed (12 emails)", type: "automation" },
  { time: "Yesterday", action: "Weekly report generated", type: "report" },
  { time: "Yesterday", action: "New learning suggestion: Advanced React Patterns", type: "insight" },
];

export default function ReportsTab() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Your ZENTRIX performance overview</p>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">This week</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {reports.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{r.icon}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                r.positive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
              }`}>
                {r.change}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-display font-bold">{r.value}</div>
              <div className="text-sm font-medium mt-1">{r.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-card/50 border border-border/50"
            >
              <div className={`w-2 h-2 rounded-full ${
                a.type === "automation" ? "bg-primary" : a.type === "alert" ? "bg-accent" : "bg-green-400"
              }`} />
              <span className="text-sm flex-1">{a.action}</span>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
