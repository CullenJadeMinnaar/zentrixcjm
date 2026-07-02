import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { journalApi, type JournalEntry, type Mood } from "@/lib/productivity";

const MOODS: { m: Mood; emoji: string; label: string }[] = [
  { m: "great", emoji: "😄", label: "Great" },
  { m: "good", emoji: "🙂", label: "Good" },
  { m: "okay", emoji: "😐", label: "Okay" },
  { m: "low", emoji: "😔", label: "Low" },
  { m: "bad", emoji: "😣", label: "Bad" },
];

export default function JournalTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setEntries(await journalApi.list()); } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!content.trim()) return;
    try {
      const e = await journalApi.create({ content: content.trim(), title: title.trim() || null, mood });
      setEntries([e, ...entries]); setTitle(""); setContent(""); setMood(null);
      toast.success("Entry saved");
    } catch (err: any) { toast.error(err.message); }
  };

  const del = async (id: string) => {
    try { await journalApi.remove(id); setEntries(entries.filter(e => e.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-card/60 border border-border/60 rounded-xl p-5 backdrop-blur-sm space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind today?" rows={5} maxLength={20000} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Mood:</span>
          {MOODS.map(m => (
            <button key={m.m} onClick={() => setMood(mood === m.m ? null : m.m)} className={`text-xl transition-all ${mood === m.m ? "scale-125" : "opacity-40 hover:opacity-100"}`} title={m.label}>{m.emoji}</button>
          ))}
          <motion.button whileTap={{ scale: 0.97 }} onClick={save} className="ml-auto bg-primary text-primary-foreground rounded-lg px-4 py-1.5 text-xs font-semibold">Save entry</motion.button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 text-sm">Your journal is empty. Start writing above ↑</div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => {
            const isOpen = expanded === e.id;
            const moodEmoji = MOODS.find(m => m.m === e.mood)?.emoji;
            return (
              <div key={e.id} className="bg-card/60 border border-border/60 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  {moodEmoji && <span className="text-lg">{moodEmoji}</span>}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{e.title || "Untitled"}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(e.entry_date).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => setExpanded(isOpen ? null : e.id)} className="text-xs text-muted-foreground hover:text-foreground">{isOpen ? "Collapse" : "Read"}</button>
                  <button onClick={() => del(e.id)} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
                </div>
                <div className={`text-sm text-muted-foreground whitespace-pre-wrap ${isOpen ? "" : "line-clamp-2"}`}>{e.content}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
