import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { eventsApi, type CalendarEvent } from "@/lib/productivity";

export default function CalendarTab() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const from = new Date(); from.setDate(from.getDate() - 7);
      const to = new Date(); to.setDate(to.getDate() + 60);
      setEvents(await eventsApi.list(from, to));
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const add = async () => {
    if (!title.trim() || !start || !end) { toast.error("Title, start and end are required"); return; }
    try {
      const ev = await eventsApi.create({ title: title.trim(), starts_at: new Date(start).toISOString(), ends_at: new Date(end).toISOString(), location: location || null });
      setEvents([...events, ev].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
      setTitle(""); setStart(""); setEnd(""); setLocation("");
    } catch (e: any) { toast.error(e.message); }
  };

  const del = async (id: string) => {
    try { await eventsApi.remove(id); setEvents(events.filter(e => e.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const grouped = useMemo(() => {
    const g: Record<string, CalendarEvent[]> = {};
    events.forEach(e => {
      const k = new Date(e.starts_at).toDateString();
      (g[k] ??= []).push(e);
    });
    return g;
  }, [events]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="grid grid-cols-2 gap-2">
          <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs" />
          <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs" />
        </div>
        <div className="flex gap-2">
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (optional)" className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs" />
          <motion.button whileTap={{ scale: 0.97 }} onClick={add} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold">Add event</motion.button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 text-sm">No upcoming events.</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([day, evs]) => (
            <div key={day}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{day}</div>
              <div className="space-y-2">
                {evs.map(e => (
                  <div key={e.id} className="bg-card/60 border border-border/60 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                    <div className="w-1 h-10 rounded bg-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(e.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {new Date(e.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {e.location && ` · ${e.location}`}
                      </div>
                    </div>
                    <button onClick={() => del(e.id)} className="text-muted-foreground hover:text-destructive text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
