import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------
export type TaskStatus = "todo" | "doing" | "done" | "archived";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type GoalStatus = "active" | "completed" | "paused" | "archived";
export type Mood = "great" | "good" | "okay" | "low" | "bad";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  completed_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  remind_at: string;
  recurrence: Recurrence;
  active: boolean;
  last_fired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  cadence: "daily" | "weekly";
  target_per_period: number;
  color: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCheckin {
  id: string;
  habit_id: string;
  user_id: string;
  checkin_date: string;
  note: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: Mood | null;
  tags: string[];
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_date: string | null;
  progress: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Tasks ----------
export const tasksApi = {
  async list(): Promise<Task[]> {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Task[]) ?? [];
  },
  async create(input: Partial<Task> & { title: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from("tasks").insert({ ...input, user_id: user.id }).select().single();
    if (error) throw error;
    return data as Task;
  },
  async update(id: string, patch: Partial<Task>) {
    const { data, error } = await supabase.from("tasks").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as Task;
  },
  async remove(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- Reminders ----------
export const remindersApi = {
  async list(): Promise<Reminder[]> {
    const { data, error } = await supabase.from("reminders").select("*").order("remind_at", { ascending: true });
    if (error) throw error;
    return (data as Reminder[]) ?? [];
  },
  async create(input: Partial<Reminder> & { title: string; remind_at: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from("reminders").insert({ ...input, user_id: user.id }).select().single();
    if (error) throw error;
    return data as Reminder;
  },
  async update(id: string, patch: Partial<Reminder>) {
    const { data, error } = await supabase.from("reminders").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as Reminder;
  },
  async remove(id: string) {
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- Habits ----------
export const habitsApi = {
  async list(): Promise<Habit[]> {
    const { data, error } = await supabase.from("habits").select("*").eq("archived", false).order("created_at");
    if (error) throw error;
    return (data as Habit[]) ?? [];
  },
  async create(input: Partial<Habit> & { name: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from("habits").insert({ ...input, user_id: user.id }).select().single();
    if (error) throw error;
    return data as Habit;
  },
  async remove(id: string) {
    const { error } = await supabase.from("habits").update({ archived: true }).eq("id", id);
    if (error) throw error;
  },
  async listCheckins(sinceDays = 30): Promise<HabitCheckin[]> {
    const since = new Date(Date.now() - sinceDays * 864e5).toISOString().slice(0, 10);
    const { data, error } = await supabase.from("habit_checkins").select("*").gte("checkin_date", since);
    if (error) throw error;
    return (data as HabitCheckin[]) ?? [];
  },
  async checkin(habit_id: string, date?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const checkin_date = date ?? new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("habit_checkins")
      .upsert({ habit_id, user_id: user.id, checkin_date }, { onConflict: "habit_id,checkin_date" })
      .select()
      .single();
    if (error) throw error;
    return data as HabitCheckin;
  },
  async uncheck(habit_id: string, date?: string) {
    const checkin_date = date ?? new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("habit_checkins").delete().eq("habit_id", habit_id).eq("checkin_date", checkin_date);
    if (error) throw error;
  },
};

// ---------- Journal ----------
export const journalApi = {
  async list(): Promise<JournalEntry[]> {
    const { data, error } = await supabase.from("journal_entries").select("*").order("entry_date", { ascending: false });
    if (error) throw error;
    return (data as JournalEntry[]) ?? [];
  },
  async create(input: Partial<JournalEntry> & { content: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from("journal_entries").insert({ ...input, user_id: user.id }).select().single();
    if (error) throw error;
    return data as JournalEntry;
  },
  async remove(id: string) {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- Goals ----------
export const goalsApi = {
  async list(): Promise<Goal[]> {
    const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Goal[]) ?? [];
  },
  async create(input: Partial<Goal> & { title: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from("goals").insert({ ...input, user_id: user.id }).select().single();
    if (error) throw error;
    return data as Goal;
  },
  async update(id: string, patch: Partial<Goal>) {
    const { data, error } = await supabase.from("goals").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as Goal;
  },
  async remove(id: string) {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- Calendar ----------
export const eventsApi = {
  async list(from?: Date, to?: Date): Promise<CalendarEvent[]> {
    let q = supabase.from("calendar_events").select("*").order("starts_at", { ascending: true });
    if (from) q = q.gte("starts_at", from.toISOString());
    if (to) q = q.lte("starts_at", to.toISOString());
    const { data, error } = await q;
    if (error) throw error;
    return (data as CalendarEvent[]) ?? [];
  },
  async create(input: Partial<CalendarEvent> & { title: string; starts_at: string; ends_at: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from("calendar_events").insert({ ...input, user_id: user.id }).select().single();
    if (error) throw error;
    return data as CalendarEvent;
  },
  async remove(id: string) {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) throw error;
  },
};
