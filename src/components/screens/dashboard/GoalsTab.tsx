import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { goalsApi, type Goal, type GoalStatus } from "@/lib/productivity";

const STATUS_COLORS: Record<GoalStatus, string> = {
  active: "text-primary bg-primary/15",
  completed: "text-primary bg-primary/25",
  paused: "text-muted-foreground bg-muted/40",
  archived: "text-muted-foreground bg-muted/20",
};

export default function GoalsTab() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("personal");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setGoals(await goalsApi.list()); } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const add = async () => {
    if (!title.trim()) return;
    try {
      const g = await goalsApi.create({ title: title.trim(), category, target_date: targetDate || null });
      setGoals([g, ...goals]); setTitle(""); setTargetDate("");
    } catch (e: any) { toast.error(e.message); }
  };

  const updateProgress = async (g: Goal, progress: number) => {
    try {
      const patch: Partial<Goal> = { progress, status: progress >= 100 ? "completed" : "active" };
      const updated = await goalsApi.update(g.id, patch);
      setGoals(goals.map(x => x.id === g.id ? updated : x));
    } catch (e: any) { toast.error(e.message); }
  };

  const del = async (id: string) => {
    try { await goalsApi.remove(id); setGoals(goals.filter(g => g.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title (e.g. 'Launch ZENTRIX v1')" className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="flex gap-2 flex-wrap">
          <select value={category} onChange={e => setCategory(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs">
            <option value="personal">Personal</option><option value="career">Career</option><option value="health">Health</option><option value="finance">Finance</option><option value="learning">Learning</option><option value="relationships">Relationships</option>
          </select>
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs" />
          <motion.button whileTap={{ scale: 0.97 }} onClick={add} className="ml-auto bg-primary text-primary-foreground rounded-lg px-4 py-1.5 text-xs font-semibold">Add goal</motion.button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading…</div>
      ) : goals.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 text-sm">Set a goal to track progress toward what matters most.</div>
      ) : (
        <div className="space-y-3">
          {goals.map(g => (
            <div key={g.id} className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">{g.title}</div>
                  <div className="flex gap-2 mt-1 items-center flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[g.status]}`}>{g.status}</span>
                    {g.category && <span className="text-[10px] text-muted-foreground">· {g.category}</span>}
                    {g.target_date && <span className="text-[10px] text-muted-foreground">· by {new Date(g.target_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button onClick={() => del(g.id)} className="text-muted-foreground hover:text-destructive text-xs">✕</button>
              </div>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={100} value={g.progress} onChange={e => updateProgress(g, Number(e.target.value))} className="flex-1 accent-primary" />
                <span className="text-xs font-mono w-12 text-right">{g.progress}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${g.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
