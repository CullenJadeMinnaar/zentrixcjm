import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Plus, Trash2, Pin, PinOff, Pencil, Download, Check } from "lucide-react";
import { toast } from "sonner";
import {
  listSessions,
  deleteSession,
  renameSession,
  setSessionPinned,
  searchSessionIdsByContent,
  exportSessionMarkdown,
  downloadTextFile,
  type ChatSessionRow,
} from "@/lib/chat-persistence";

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
  const [contentMatches, setContentMatches] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listSessions()
      .then(setSessions)
      .catch((e) => toast.error(e?.message ?? "Could not load history"))
      .finally(() => setLoading(false));
  }, [open]);

  // Search inside message content (debounced)
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setContentMatches([]); return; }
    const t = window.setTimeout(() => {
      void searchSessionIdsByContent(q).then(setContentMatches);
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const q = search.trim().toLowerCase();
  const filtered = sessions
    .filter((s) => !q || s.title.toLowerCase().includes(q) || contentMatches.includes(s.id))
    .sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return a.updated_at < b.updated_at ? 1 : -1;
    });

  const remove = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (id === activeSessionId) onNewChat();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not delete conversation");
    }
  };

  const togglePin = async (s: ChatSessionRow) => {
    const next = !s.pinned;
    setSessions((prev) => prev.map((x) => (x.id === s.id ? { ...x, pinned: next } : x)));
    try {
      await setSessionPinned(s.id, next);
    } catch {
      setSessions((prev) => prev.map((x) => (x.id === s.id ? { ...x, pinned: !next } : x)));
      toast.error("Could not update pin");
    }
  };

  const commitRename = async (s: ChatSessionRow) => {
    const title = draftTitle.trim();
    setEditingId(null);
    if (!title || title === s.title) return;
    try {
      const saved = await renameSession(s.id, title);
      setSessions((prev) => prev.map((x) => (x.id === s.id ? { ...x, title: saved } : x)));
    } catch {
      toast.error("Could not rename conversation");
    }
  };

  const exportSession = async (s: ChatSessionRow) => {
    try {
      const md = await exportSessionMarkdown(s);
      const safe = s.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "conversation";
      downloadTextFile(`zentrix-${safe}.md`, md);
      toast.success("Conversation downloaded");
    } catch {
      toast.error("Could not export conversation");
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
                placeholder="Search titles & messages…"
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {loading ? (
                <div className="text-center text-muted-foreground text-xs py-8">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-8">
                  {q ? "No matching conversations." : "No conversations yet."}
                </div>
              ) : (
                filtered.map((s) => (
                  <div
                    key={s.id}
                    className={`group rounded-lg px-3 py-2.5 border transition-all cursor-pointer ${
                      s.id === activeSessionId
                        ? "bg-primary/10 border-primary/25"
                        : "bg-secondary/30 border-transparent hover:border-border"
                    }`}
                    onClick={() => { if (editingId !== s.id) { onSelect(s.id); onClose(); } }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        {editingId === s.id ? (
                          <input
                            autoFocus
                            value={draftTitle}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            onBlur={() => void commitRename(s)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); void commitRename(s); }
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        ) : (
                          <div className="text-xs font-medium truncate flex items-center gap-1">
                            {s.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                            {s.title}
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {format(new Date(s.updated_at), "MMM d, yyyy · h:mm a")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); void togglePin(s); }}
                        title={s.pinned ? "Unpin" : "Pin"}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                      >
                        {s.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setDraftTitle(s.title); }}
                        title="Rename"
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                      >
                        {editingId === s.id ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); void exportSession(s); }}
                        title="Export as Markdown"
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); void remove(s.id); }}
                        title="Delete"
                        className="ml-auto p-1 rounded text-muted-foreground hover:text-destructive hover:bg-secondary/70"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
