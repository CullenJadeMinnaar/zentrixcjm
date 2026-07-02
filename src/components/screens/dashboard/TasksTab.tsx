import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { tasksApi, type Task, type TaskPriority, type TaskStatus } from "@/lib/productivity";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/15 text-primary",
  high: "bg-accent/20 text-accent",
  urgent: "bg-destructive/20 text-destructive",
};

const STATUS_LABEL: Record<TaskStatus, string> = { todo: "To do", doing: "In progress", done: "Done", archived: "Archived" };

export default function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueAt, setDueAt] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setTasks(await tasksApi.list()); } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const add = async () => {
    if (!title.trim()) return;
    try {
      const t = await tasksApi.create({ title: title.trim(), priority, due_at: dueAt || null });
      setTasks([t, ...tasks]);
      setTitle(""); setDueAt(""); setPriority("medium");
    } catch (e: any) { toast.error(e.message); }
  };

  const toggle = async (t: Task) => {
    const next: TaskStatus = t.status === "done" ? "todo" : "done";
    try {
      const updated = await tasksApi.update(t.id, { status: next, completed_at: next === "done" ? new Date().toISOString() : null });
      setTasks(tasks.map(x => x.id === t.id ? updated : x));
    } catch (e: any) { toast.error(e.message); }
  };

  const del = async (id: string) => {
    try { await tasksApi.remove(id); setTasks(tasks.filter(t => t.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const stats = { total: tasks.length, done: tasks.filter(t => t.status === "done").length, urgent: tasks.filter(t => t.priority === "urgent" && t.status !== "done").length };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
          <div className="text-2xl font-display font-bold text-foreground mt-1">{stats.total}</div>
        </div>
        <div className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-display font-bold text-primary mt-1">{stats.done}</div>
        </div>
        <div className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Urgent</div>
          <div className="text-2xl font-display font-bold text-destructive mt-1">{stats.urgent}</div>
        </div>
      </div>

      <div className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Add a task..." className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="flex gap-2 flex-wrap">
          <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
          <input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs" />
          <motion.button whileTap={{ scale: 0.97 }} onClick={add} className="ml-auto bg-primary text-primary-foreground rounded-lg px-4 py-1.5 text-xs font-semibold">Add task</motion.button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "todo", "doing", "done"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs border transition-all ${filter === f ? "bg-primary/20 border-primary/30 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 text-sm">No tasks yet — add one above ↑</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`bg-card/60 border border-border/60 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm ${t.status === "done" ? "opacity-60" : ""}`}>
              <button onClick={() => toggle(t)} className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${t.status === "done" ? "bg-primary border-primary" : "border-border"}`}>
                {t.status === "done" && <span className="text-primary-foreground text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${t.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</div>
                <div className="flex gap-2 mt-1 flex-wrap items-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                  {t.due_at && <span className="text-[10px] text-muted-foreground">Due {new Date(t.due_at).toLocaleString()}</span>}
                </div>
              </div>
              <button onClick={() => del(t.id)} className="text-muted-foreground hover:text-destructive text-xs">✕</button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
