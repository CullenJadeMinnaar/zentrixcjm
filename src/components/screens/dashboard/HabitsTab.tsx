import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { habitsApi, type Habit, type HabitCheckin } from "@/lib/productivity";

const today = () => new Date().toISOString().slice(0, 10);
const daysBack = (n: number) => Array.from({ length: n }, (_, i) => new Date(Date.now() - i * 864e5).toISOString().slice(0, 10)).reverse();

export default function HabitsTab() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<HabitCheckin[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const last14 = useMemo(() => daysBack(14), []);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const [h, c] = await Promise.all([habitsApi.list(), habitsApi.listCheckins(30)]); setHabits(h); setCheckins(c); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const add = async () => {
    if (!name.trim()) return;
    try { const h = await habitsApi.create({ name: name.trim() }); setHabits([...habits, h]); setName(""); }
    catch (e: any) { toast.error(e.message); }
  };

  const del = async (id: string) => {
    try { await habitsApi.remove(id); setHabits(habits.filter(h => h.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const isCheckedToday = (h: Habit) => checkins.some(c => c.habit_id === h.id && c.checkin_date === today());
  const streak = (h: Habit) => {
    let n = 0;
    for (let i = 0; ; i++) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      if (checkins.some(c => c.habit_id === h.id && c.checkin_date === d)) n++; else break;
    }
    return n;
  };

  const toggle = async (h: Habit) => {
    try {
      if (isCheckedToday(h)) {
        await habitsApi.uncheck(h.id);
        setCheckins(checkins.filter(c => !(c.habit_id === h.id && c.checkin_date === today())));
      } else {
        const c = await habitsApi.checkin(h.id);
        setCheckins([...checkins.filter(x => x.id !== c.id), c]);
      }
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="New habit (e.g. 'Meditate 10 min')" className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <motion.button whileTap={{ scale: 0.97 }} onClick={add} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold">Add</motion.button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading…</div>
      ) : habits.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 text-sm">No habits yet — start with one small daily action.</div>
      ) : (
        <div className="space-y-3">
          {habits.map(h => (
            <div key={h.id} className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => toggle(h)} className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all ${isCheckedToday(h) ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}>
                  {isCheckedToday(h) ? "✓" : ""}
                </button>
                <div className="flex-1">
                  <div className="text-sm font-medium">{h.name}</div>
                  <div className="text-[10px] text-muted-foreground">🔥 {streak(h)}-day streak</div>
                </div>
                <button onClick={() => del(h.id)} className="text-muted-foreground hover:text-destructive text-xs">Archive</button>
              </div>
              <div className="flex gap-1">
                {last14.map(d => {
                  const done = checkins.some(c => c.habit_id === h.id && c.checkin_date === d);
                  return <div key={d} title={d} className={`flex-1 h-2 rounded-sm ${done ? "bg-primary" : "bg-muted/40"}`} />;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
