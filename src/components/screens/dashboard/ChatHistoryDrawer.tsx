import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listSessions, deleteSession, type ChatSessionRow } from "@/lib/chat-persistence";

interface Props {
  open: boolean;
  onClose: () => void;
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export default function ChatHistoryDrawer({ open, onClose, activeSessionId, onSelect, onNewChat }: Props) {
  const [sessions, setSessions] = useState<ChatSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listSessions()
      .then(setSessions)
      .catch((e) => toast.error(e?.message ?? "Could not load history"))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = sessions.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  const remove = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (id === activeSessionId) onNewChat();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not delete conversation");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="fixed inset-y-0 right-0 w-full sm:w-80 bg-card border-l border-border z-50 flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center gap-2">
              <h3 className="font-display font-semibold text-sm flex-1">Conversations</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-2 border-b border-border/60">
              <button
                onClick={() => { onNewChat(); onClose(); }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold hover:brightness-110 transition-all"
              >
                <Plus className="w-4 h-4" /> New chat
              </button>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {loading ? (
                <div className="text-center text-muted-foreground text-xs py-8">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-8">No conversations yet.</div>
              ) : (
                filtered.map((s) => (
                  <div
                    key={s.id}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 border transition-all cursor-pointer ${
                      s.id === activeSessionId
                        ? "bg-primary/10 border-primary/25"
                        : "bg-secondary/30 border-transparent hover:border-border"
                    }`}
                    onClick={() => { onSelect(s.id); onClose(); }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{s.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {format(new Date(s.updated_at), "MMM d, yyyy · h:mm a")}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); void remove(s.id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
