import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Session {
  id: string;
  title: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function HistoryTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("updated_at", { ascending: false });
      setSessions((data as Session[]) || []);
      setLoading(false);
    };
    fetchSessions();
  }, []);

  const loadMessages = async (sessionId: string) => {
    setSelectedSession(sessionId);
    setMsgLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    setMessages((data as ChatMessage[]) || []);
    setMsgLoading(false);
  };

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.summary || "").toLowerCase().includes(search.toLowerCase())
  );

  if (selectedSession) {
    const session = sessions.find(s => s.id === selectedSession);
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => setSelectedSession(null)} className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          ← Back to history
        </button>
        <h2 className="font-display text-lg font-bold mb-4">{session?.title || "Chat"}</h2>
        {msgLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No messages in this session</div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary/15 border border-primary/20"
                    : "bg-card/80 border border-border/60"
                }`}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(msg.created_at), "h:mm a")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="font-display text-xl font-bold mb-1">History</h2>
      <p className="text-sm text-muted-foreground mb-6">Your conversation timeline</p>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search conversations..."
        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all mb-6"
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading history...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-muted-foreground text-sm">No conversations yet. Start chatting with Morpheus!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => loadMessages(s.id)}
              className="w-full text-left bg-card/60 border border-border rounded-xl p-4 hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-display font-semibold text-sm truncate">{s.title}</h4>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-3">
                  {format(new Date(s.updated_at), "MMM d, yyyy")}
                </span>
              </div>
              {s.summary && <p className="text-xs text-muted-foreground truncate">{s.summary}</p>}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
