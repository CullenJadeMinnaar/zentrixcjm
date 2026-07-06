import { supabase } from "@/integrations/supabase/client";
import type { Reminder } from "./productivity";

const FIRED_KEY = "zentrix_fired_reminders_v1";
const DIGEST_KEY = "zentrix_last_daily_digest";
let pollHandle: number | null = null;

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}
export function notificationsPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

function loadFired(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(FIRED_KEY) || "{}"); } catch { return {}; }
}
function saveFired(map: Record<string, string>) {
  // Keep only last 200 entries to prevent unbounded growth
  const entries = Object.entries(map);
  const trimmed = entries.length > 200 ? Object.fromEntries(entries.slice(-200)) : map;
  localStorage.setItem(FIRED_KEY, JSON.stringify(trimmed));
}

function nextOccurrence(iso: string, recurrence: string): string | null {
  const d = new Date(iso);
  const now = Date.now();
  if (recurrence === "none") return null;
  while (d.getTime() <= now) {
    switch (recurrence) {
      case "daily":   d.setDate(d.getDate() + 1); break;
      case "weekly":  d.setDate(d.getDate() + 7); break;
      case "monthly": d.setMonth(d.getMonth() + 1); break;
      case "yearly":  d.setFullYear(d.getFullYear() + 1); break;
      default: return null;
    }
  }
  return d.toISOString();
}

async function checkAndFire() {
  if (notificationsPermission() !== "granted") return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const nowIso = new Date().toISOString();
  const soonIso = new Date(Date.now() + 60_000).toISOString();

  const { data } = await supabase
    .from("reminders")
    .select("*")
    .eq("active", true)
    .lte("remind_at", soonIso);
  const due = (data as Reminder[]) ?? [];
  if (due.length === 0) return;

  const fired = loadFired();
  for (const r of due) {
    const key = `${r.id}:${r.remind_at}`;
    if (fired[key]) continue;
    if (r.remind_at > nowIso) continue;
    try {
      new Notification(r.title, {
        body: r.body ?? "Reminder from ZENTRIX",
        icon: "/favicon.ico",
        tag: `zentrix-reminder-${r.id}`,
      });
    } catch { /* ignore */ }
    fired[key] = nowIso;

    // Reschedule recurring, or deactivate one-off
    const next = nextOccurrence(r.remind_at, r.recurrence);
    if (next) {
      await supabase.from("reminders").update({ remind_at: next, last_fired_at: nowIso }).eq("id", r.id);
    } else {
      await supabase.from("reminders").update({ active: false, last_fired_at: nowIso }).eq("id", r.id);
    }
  }
  saveFired(fired);

  // Daily digest at first check after 07:00 local
  const now = new Date();
  const digestDay = now.toISOString().slice(0, 10);
  if (now.getHours() >= 7 && localStorage.getItem(DIGEST_KEY) !== digestDay) {
    await fireDailyDigest();
    localStorage.setItem(DIGEST_KEY, digestDay);
  }
}

async function fireDailyDigest() {
  if (notificationsPermission() !== "granted") return;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart); tomorrow.setDate(tomorrow.getDate() + 1);

  const [tasksRes, eventsRes] = await Promise.all([
    supabase.from("tasks").select("id").in("status", ["todo", "doing"]),
    supabase.from("calendar_events").select("id").gte("starts_at", todayStart.toISOString()).lt("starts_at", tomorrow.toISOString()),
  ]);
  const openTasks = tasksRes.data?.length ?? 0;
  const events = eventsRes.data?.length ?? 0;
  const body = `${openTasks} open task${openTasks === 1 ? "" : "s"} · ${events} event${events === 1 ? "" : "s"} today. Let's have a great day.`;
  try {
    new Notification("Good morning from ZENTRIX ☀️", { body, icon: "/favicon.ico", tag: "zentrix-digest" });
  } catch { /* ignore */ }
}

export function startNotificationLoop() {
  if (pollHandle !== null) return;
  // Fire immediately, then every 30s
  void checkAndFire();
  pollHandle = window.setInterval(() => { void checkAndFire(); }, 30_000);
}

export function stopNotificationLoop() {
  if (pollHandle !== null) { clearInterval(pollHandle); pollHandle = null; }
}

export async function sendTestNotification() {
  const perm = await requestNotificationPermission();
  if (perm !== "granted") return false;
  try {
    new Notification("ZENTRIX is connected 🎉", {
      body: "You'll get reminders and daily briefings right here.",
      icon: "/favicon.ico",
    });
    return true;
  } catch {
    return false;
  }
}
