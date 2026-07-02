import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { remindersApi, type Reminder, type Recurrence } from "@/lib/productivity";

export default function RemindersTab() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setItems(await remindersApi.list()); } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const add = async () => {
    if (!title.trim() || !remindAt) { toast.error("Title and time required"); return; }
    try {
      const r = await remindersApi.create({ title: title.trim(), remind_at: new Date(remindAt).toISOString(), recurrence });
      setItems([...items, r].sort((a, b) => a.remind_at.localeCompare(b.remind_at)));
      setTitle(""); setRemindAt(""); setRecurrence("none");
    } catch (e: any) { toast.error(e.message); }
  };

  const toggle = async (r: Reminder) => {
    try {
      const u = await remindersApi.update(r.id, { active: !r.active });
      setItems(items.map(x => x.id === r.id ? u : x));
    } catch (e: any) { toast.error(e.message); }
  };

  const del = async (id: string) => {
    try { await remindersApi.remove(id); setItems(items.filter(r => r.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Remind me to…" className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="grid grid-cols-2 gap-2">
          <input type="datetime-local" value={remindAt} onChange={e => setRemindAt(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs" />
          <select value={recurrence} onChange={e => setRecurrence(e.target.value as Recurrence)} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs">
            <option value="none">One-time</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
          </select>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={add} className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold">Add reminder</motion.button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 text-sm">No reminders yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map(r => (
            <div key={r.id} className={`bg-card/60 border border-border/60 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm ${!r.active ? "opacity-50" : ""}`}>
              <button onClick={() => toggle(r)} className={`w-10 h-6 rounded-full transition-all relative ${r.active ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${r.active ? "left-4" : "left-0.5"}`} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(r.remind_at).toLocaleString()}
                  {r.recurrence !== "none" && ` · ${r.recurrence}`}
                </div>
              </div>
              <button onClick={() => del(r.id)} className="text-muted-foreground hover:text-destructive text-xs">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
