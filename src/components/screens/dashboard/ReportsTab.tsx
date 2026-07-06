import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { loadAnalytics, relativeTime, type AnalyticsSummary, type DailySeriesPoint, type MoodPoint, type RecentActivity } from "@/lib/analytics";
import { toast } from "sonner";

const ACTIVITY_ICON: Record<RecentActivity["type"], string> = {
  task: "✅", habit: "🌱", journal: "📔", goal: "🎯", chat: "💬", memory: "🧠", reminder: "🔔",
};

function fmtDay(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function StatCard({ icon, label, value, delta, hint }: {
  icon: string; label: string; value: string; delta?: string; hint?: string;
}) {
  const positive = delta?.startsWith("+");
  return (
    <div className="bg-card/60 border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {delta && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            positive ? "bg-primary/10 text-primary" : delta === "0" ? "bg-secondary text-muted-foreground" : "bg-destructive/15 text-destructive"
          }`}>{delta}</span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-display font-bold">{value}</div>
        <div className="text-sm font-medium mt-1">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
      </div>
    </div>
  );
}

function fmtDelta(now: number, prev: number, suffix = "") {
  const d = now - prev;
  if (d === 0) return "0";
  const sign = d > 0 ? "+" : "";
  return `${sign}${suffix ? d.toFixed(1) : Math.round(d)}${suffix}`;
}

export default function ReportsTab() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [series, setSeries] = useState<DailySeriesPoint[]>([]);
  const [mood, setMood] = useState<MoodPoint[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await loadAnalytics();
      setSummary(res.summary); setSeries(res.series); setMood(res.mood); setActivity(res.activity);
    } catch (e) {
      console.error(e); toast.error("Could not load analytics");
    } finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Analytics & Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of your ZENTRIX activity</p>
        </div>
        <button
          onClick={refresh}
          className="text-[11px] bg-secondary/60 border border-border px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {!summary && loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[0,1,2,3].map(i => <div key={i} className="h-32 bg-card/40 border border-border rounded-xl animate-pulse" />)}
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="⚡" label="Productivity Score" value={`${summary.productivityScore}%`} hint="Composite of tasks, habits, chats, journals" />
            <StatCard icon="✅" label="Tasks Completed" value={String(summary.tasksCompleted7d)}
              delta={fmtDelta(summary.tasksCompleted7d, summary.tasksCompleted7dPrev)}
              hint="Last 7 days vs previous" />
            <StatCard icon="💬" label="AI Conversations" value={String(summary.aiInteractions7d)}
              delta={fmtDelta(summary.aiInteractions7d, summary.aiInteractions7dPrev)}
              hint="Messages you sent to Morpheus" />
            <StatCard icon="⏱️" label="Time Saved" value={`${summary.timeSavedHours}h`} hint="Estimated across chats & tasks" />
            <StatCard icon="💚" label="Wellness Score" value={summary.wellnessScore ? String(summary.wellnessScore) : "—"}
              delta={summary.wellnessScorePrev ? fmtDelta(summary.wellnessScore, summary.wellnessScorePrev, "") : undefined}
              hint="Average mood from journal (0–10)" />
            <StatCard icon="🌱" label="Habit Consistency" value={`${summary.habitConsistency}%`} hint="Check-ins vs target this week" />
            <StatCard icon="🎯" label="Goals Progress" value={`${summary.goalAvgProgress}%`}
              hint={`${summary.goalsActive} active · ${summary.goalsCompleted} completed`} />
            <StatCard icon="🧠" label="Memories Stored" value={String(summary.memoriesTotal)} hint="Long-term semantic memory" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card/60 border border-border rounded-xl p-5">
              <h3 className="font-display font-semibold text-sm mb-4">Activity — last 7 days</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={fmtDay} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                    />
                    <Bar dataKey="tasks" name="Tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="messages" name="Chats" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="habits" name="Habits" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card/60 border border-border rounded-xl p-5">
              <h3 className="font-display font-semibold text-sm mb-4">Mood trend</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mood}>
                    <defs>
                      <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={fmtDay} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [v ? v.toFixed(1) : "—", "Mood"]}
                      labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString(undefined, { weekday: "long" })}
                    />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#moodFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="bg-card/60 border border-border rounded-xl p-5 mb-8">
            <h3 className="font-display font-semibold text-sm mb-4">Conversations & journaling</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tickFormatter={fmtDay} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="messages" name="Chats" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="journals" name="Journal entries" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm mb-3">Recent Activity</h3>
            {activity.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-card/40 border border-border rounded-xl p-6 text-center">
                Nothing yet — start a chat, complete a task or write a journal entry to see activity here.
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-card/50 border border-border/50"
                  >
                    <span className="text-base w-6 text-center">{ACTIVITY_ICON[a.type]}</span>
                    <span className="text-sm flex-1 truncate">{a.action}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{relativeTime(a.time)}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
