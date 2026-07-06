import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsSummary {
  productivityScore: number;      // 0–100
  tasksCompleted7d: number;
  tasksCompleted7dPrev: number;
  aiInteractions7d: number;
  aiInteractions7dPrev: number;
  wellnessScore: number;          // 0–10
  wellnessScorePrev: number;
  timeSavedHours: number;
  journalEntries7d: number;
  goalsActive: number;
  goalsCompleted: number;
  goalAvgProgress: number;
  habitConsistency: number;       // 0–100
  memoriesTotal: number;
}

export interface DailySeriesPoint {
  date: string;      // yyyy-mm-dd
  tasks: number;
  messages: number;
  journals: number;
  habits: number;
}

export interface MoodPoint {
  date: string;
  score: number;     // 1..5
  label: string;
}

export interface RecentActivity {
  time: string;
  action: string;
  type: "task" | "habit" | "journal" | "goal" | "chat" | "memory" | "reminder";
}

const MOOD_SCORE: Record<string, number> = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };
const MOOD_LABEL: Record<number, string> = { 5: "great", 4: "good", 3: "okay", 2: "low", 1: "bad" };

function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}
function dayKey(iso: string): string {
  return iso.slice(0, 10);
}
function last7DayKeys(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) out.push(dayKey(new Date(Date.now() - i * 86400000).toISOString()));
  return out;
}

export async function loadAnalytics(): Promise<{
  summary: AnalyticsSummary;
  series: DailySeriesPoint[];
  mood: MoodPoint[];
  activity: RecentActivity[];
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const since14 = daysAgoISO(14);
  const since7 = daysAgoISO(7);

  const [tasksRes, msgsRes, journalRes, habitsRes, checkinsRes, goalsRes, memoriesRes] = await Promise.all([
    supabase.from("tasks").select("id,status,completed_at,created_at,title,updated_at").gte("updated_at", since14),
    supabase.from("chat_messages").select("id,role,created_at,content").gte("created_at", since14).order("created_at", { ascending: false }).limit(500),
    supabase.from("journal_entries").select("id,mood,entry_date,created_at,title,content").gte("created_at", since14),
    supabase.from("habits").select("id,name,archived").eq("archived", false),
    supabase.from("habit_checkins").select("id,habit_id,checkin_date,created_at").gte("checkin_date", dayKey(since14)),
    supabase.from("goals").select("id,title,status,progress,updated_at,created_at"),
    supabase.from("semantic_memories").select("id", { count: "exact", head: true }),
  ]);

  const tasks = tasksRes.data ?? [];
  const msgs = msgsRes.data ?? [];
  const journals = journalRes.data ?? [];
  const habits = habitsRes.data ?? [];
  const checkins = checkinsRes.data ?? [];
  const goals = goalsRes.data ?? [];
  const memoriesTotal = memoriesRes.count ?? 0;

  const inLast7 = (iso?: string | null) => !!iso && iso >= since7;
  const inPrev7 = (iso?: string | null) => !!iso && iso >= daysAgoISO(14) && iso < since7;

  const tasksCompleted7d = tasks.filter(t => t.status === "done" && inLast7(t.completed_at ?? t.updated_at)).length;
  const tasksCompleted7dPrev = tasks.filter(t => t.status === "done" && inPrev7(t.completed_at ?? t.updated_at)).length;

  const userMsgs = msgs.filter(m => m.role === "user");
  const aiInteractions7d = userMsgs.filter(m => inLast7(m.created_at)).length;
  const aiInteractions7dPrev = userMsgs.filter(m => inPrev7(m.created_at)).length;

  const j7 = journals.filter(j => inLast7(j.created_at));
  const jPrev = journals.filter(j => inPrev7(j.created_at));
  const avg = (arr: typeof journals) => {
    const scored = arr.map(j => MOOD_SCORE[j.mood ?? ""] ?? 0).filter(n => n > 0);
    if (scored.length === 0) return 0;
    return scored.reduce((a, b) => a + b, 0) / scored.length;
  };
  const wellnessScore = +(avg(j7) * 2).toFixed(1);
  const wellnessScorePrev = +(avg(jPrev) * 2).toFixed(1);

  const activeGoals = goals.filter(g => g.status === "active");
  const goalsCompleted = goals.filter(g => g.status === "completed").length;
  const goalAvgProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((a, g) => a + (g.progress ?? 0), 0) / activeGoals.length)
    : 0;

  // Habit consistency: (checkins in last 7d) / (habits * 7)
  const checkins7 = checkins.filter(c => c.checkin_date >= dayKey(since7));
  const habitConsistency = habits.length
    ? Math.min(100, Math.round((checkins7.length / (habits.length * 7)) * 100))
    : 0;

  // Composite productivity score
  const productivityScore = Math.min(100, Math.round(
    Math.min(tasksCompleted7d, 20) * 2.5      // up to 50
    + Math.min(aiInteractions7d, 30) * 0.5    // up to 15
    + habitConsistency * 0.2                  // up to 20
    + Math.min(j7.length, 7) * 2              // up to 14
  ));

  // Rough estimate: 3 minutes per AI turn, 4 min per completed task
  const timeSavedHours = +(((aiInteractions7d * 3) + (tasksCompleted7d * 4)) / 60).toFixed(1);

  // Daily series (last 7 days)
  const keys = last7DayKeys();
  const series: DailySeriesPoint[] = keys.map(k => ({
    date: k,
    tasks: tasks.filter(t => t.status === "done" && (t.completed_at ?? t.updated_at)?.slice(0, 10) === k).length,
    messages: userMsgs.filter(m => m.created_at.slice(0, 10) === k).length,
    journals: journals.filter(j => j.created_at.slice(0, 10) === k).length,
    habits: checkins.filter(c => c.checkin_date === k).length,
  }));

  // Mood series
  const moodByDay = new Map<string, number[]>();
  for (const j of journals) {
    const s = MOOD_SCORE[j.mood ?? ""] ?? 0;
    if (!s) continue;
    const key = j.entry_date ?? dayKey(j.created_at);
    const arr = moodByDay.get(key) ?? [];
    arr.push(s);
    moodByDay.set(key, arr);
  }
  const mood: MoodPoint[] = keys.map(k => {
    const arr = moodByDay.get(k) ?? [];
    const score = arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
    return { date: k, score, label: score ? MOOD_LABEL[Math.round(score)] ?? "" : "—" };
  });

  // Recent activity
  const activity: RecentActivity[] = [];
  for (const t of tasks.filter(t => t.status === "done").slice(0, 5)) {
    activity.push({ time: t.completed_at ?? t.updated_at, action: `Completed task: ${t.title}`, type: "task" });
  }
  for (const j of journals.slice(0, 3)) {
    activity.push({ time: j.created_at, action: `Journal: ${j.title ?? j.content.slice(0, 48)}`, type: "journal" });
  }
  for (const g of goals.filter(g => g.status === "completed").slice(0, 2)) {
    activity.push({ time: g.updated_at, action: `Goal completed: ${g.title}`, type: "goal" });
  }
  for (const m of userMsgs.slice(0, 4)) {
    activity.push({ time: m.created_at, action: `Chat: ${m.content.slice(0, 60)}`, type: "chat" });
  }
  activity.sort((a, b) => (a.time < b.time ? 1 : -1));

  return {
    summary: {
      productivityScore,
      tasksCompleted7d, tasksCompleted7dPrev,
      aiInteractions7d, aiInteractions7dPrev,
      wellnessScore, wellnessScorePrev,
      timeSavedHours,
      journalEntries7d: j7.length,
      goalsActive: activeGoals.length,
      goalsCompleted,
      goalAvgProgress,
      habitConsistency,
      memoriesTotal,
    },
    series,
    mood,
    activity: activity.slice(0, 10),
  };
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
