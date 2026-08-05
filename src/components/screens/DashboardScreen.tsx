import { RefObject, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { History, PenSquare } from "lucide-react";
import ZentrixLogo from "../ZentrixLogo";
import SettingsTab from "./dashboard/SettingsTab";
import WellnessTab from "./dashboard/WellnessTab";
import RemindersTab from "./dashboard/RemindersTab";
import MemoriesTab from "./dashboard/MemoriesTab";
import CreativeTab from "./dashboard/CreativeTab";
import ProfileTab from "./dashboard/ProfileTab";
import MemoryPanel from "./dashboard/MemoryPanel";
import TasksTab from "./dashboard/TasksTab";
import HabitsTab from "./dashboard/HabitsTab";
import JournalTab from "./dashboard/JournalTab";
import GoalsTab from "./dashboard/GoalsTab";
import CalendarTab from "./dashboard/CalendarTab";
import ChatComposer from "./dashboard/ChatComposer";
import ChatHistoryDrawer from "./dashboard/ChatHistoryDrawer";
import { remindersApi } from "@/lib/productivity";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface User {
  name: string;
  email: string;
}

interface DashboardScreenProps {
  user: User;
  planLabel: string;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  onSend: (overrideText?: string) => void;
  loading: boolean;
  chatEndRef: RefObject<HTMLDivElement>;
  onPrivacy: () => void;
  onLogout: () => void;
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

type Tab =
  | "ai" | "profile" | "memories" | "creative" | "tasks" | "habits"
  | "journal" | "goals" | "calendar" | "reminders" | "wellness" | "settings";

const navItems: { id: Tab; label: string; icon: string }[] = [
  { id: "ai", label: "Morpheus", icon: "🕶️" },
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "memories", label: "Memory Vault", icon: "🧠" },
  { id: "creative", label: "Creative Studio", icon: "🎨" },
  { id: "tasks", label: "Tasks", icon: "✅" },
  { id: "habits", label: "Habits", icon: "🌱" },
  { id: "journal", label: "Journal", icon: "📔" },
  { id: "goals", label: "Goals", icon: "🎯" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "reminders", label: "Reminders", icon: "🔔" },
  { id: "wellness", label: "Wellness", icon: "💚" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const SUBTITLES: Record<Tab, string> = {
  ai: "Your personal Morpheus — voice, files & memory, all in one place",
  profile: "Teach Morpheus who you are — saved and remembered",
  memories: "People, relationships & emotional context Morpheus remembers",
  creative: "Generate images, memes, stickers & digital art with AI",
  tasks: "Everything on your plate — organized, prioritized, done",
  habits: "Small daily actions that compound into a great life",
  journal: "A private space to think, feel and reflect",
  goals: "The big things you're moving toward — with real progress",
  calendar: "Your schedule at a glance",
  reminders: "Never miss a thing — ZENTRIX keeps you on track",
  wellness: "Daily affirmations, mood tracking & self-care",
  settings: "Customize your ZENTRIX experience",
};

export default function DashboardScreen({
  user, planLabel, messages, input, setInput, onSend, loading, chatEndRef, onPrivacy, onLogout,
  activeSessionId, onSelectSession, onNewChat,
}: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    let alive = true;
    remindersApi.list()
      .then((rs) => {
        if (!alive) return;
        const now = Date.now();
        setDueCount(rs.filter((r) => r.active && new Date(r.remind_at).getTime() <= now).length);
      })
      .catch(() => { /* non-critical */ });
    return () => { alive = false; };
  }, [activeTab]);

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-52 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0
        fixed inset-y-0 left-0 z-40 transition-transform md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-5 pb-0">
          <div className="flex items-center gap-2.5 mb-5">
            <ZentrixLogo size={28} />
            <span className="font-display font-extrabold text-sm tracking-[4px] text-gradient-primary">ZENTRIX</span>
            <button className="ml-auto md:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <div className="bg-primary/10 border border-primary/20 text-primary text-[10px] px-3 py-1.5 rounded-md text-center tracking-wider font-semibold uppercase mb-4">
            {planLabel} plan
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`px-3 py-2 rounded-lg text-sm text-left transition-all flex items-center gap-2.5 ${
                activeTab === item.id
                  ? "bg-primary/10 text-foreground font-medium border border-primary/15"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
              {item.id === "reminders" && dueCount > 0 && (
                <span className="ml-auto bg-accent text-accent-foreground text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {dueCount}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {user.name[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onPrivacy} className="flex-1 bg-secondary/50 border border-border rounded-md text-muted-foreground text-[11px] py-1.5 hover:text-foreground transition-colors">
              Privacy
            </button>
            <button onClick={onLogout} className="flex-1 bg-secondary/50 border border-border rounded-md text-muted-foreground text-[11px] py-1.5 hover:text-foreground transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-mesh">
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3 bg-background/50 backdrop-blur-sm">
          <button className="md:hidden text-foreground text-xl" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="flex-1 min-w-0">
            <div className="text-base font-display font-semibold flex items-center gap-2">
              <span>{navItems.find(n => n.id === activeTab)?.icon}</span>
              {navItems.find(n => n.id === activeTab)?.label}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {activeTab === "ai" ? `${SUBTITLES.ai} · ${planLabel} plan` : SUBTITLES[activeTab]}
            </div>
          </div>
          {activeTab === "ai" && (
            <div className="flex items-center gap-1">
              <button
                onClick={onNewChat}
                title="New chat"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <PenSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setHistoryOpen(true)}
                title="Conversation history"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-medium hidden sm:block">Online</span>
          </div>
        </div>

        <ChatHistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          activeSessionId={activeSessionId}
          onSelect={onSelectSession}
          onNewChat={onNewChat}
        />

        <AnimatePresence mode="wait">
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                <div className="max-w-3xl mx-auto flex flex-col gap-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <ZentrixLogo size={16} />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-primary/15 border border-primary/20 rounded-br-sm"
                            : "bg-card/80 border border-border/60 rounded-bl-sm backdrop-blur-sm whitespace-normal"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <ZentrixLogo size={16} />
                      </div>
                      <div className="bg-card/80 border border-border/60 rounded-xl rounded-bl-sm px-5 py-3 text-sm flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <MemoryPanel onOpenProfile={() => setActiveTab("profile")} />

              <ChatComposer input={input} setInput={setInput} onSend={(text) => onSend(text)} loading={loading} />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <ProfileTab />
            </motion.div>
          )}

          {activeTab === "memories" && (
            <motion.div key="memories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <MemoriesTab />
            </motion.div>
          )}

          {activeTab === "creative" && (
            <motion.div key="creative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <CreativeTab />
            </motion.div>
          )}

          {activeTab === "wellness" && (
            <motion.div key="wellness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <WellnessTab onQuickPrompt={(p) => { setActiveTab("ai"); onSend(p); }} />
            </motion.div>
          )}

          {activeTab === "reminders" && (
            <motion.div key="reminders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <RemindersTab />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <SettingsTab user={user} onLogout={onLogout} />
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto"><TasksTab /></motion.div>
          )}
          {activeTab === "habits" && (
            <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto"><HabitsTab /></motion.div>
          )}
          {activeTab === "journal" && (
            <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto"><JournalTab /></motion.div>
          )}
          {activeTab === "goals" && (
            <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto"><GoalsTab /></motion.div>
          )}
          {activeTab === "calendar" && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto"><CalendarTab /></motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
