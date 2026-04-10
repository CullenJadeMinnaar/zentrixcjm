import { RefObject, KeyboardEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import { MAX_INPUT_LENGTH } from "@/lib/auth-helpers";
import InsightsTab from "./dashboard/InsightsTab";
import AutomationsTab from "./dashboard/AutomationsTab";
import ReportsTab from "./dashboard/ReportsTab";
import SettingsTab from "./dashboard/SettingsTab";
import WellnessTab from "./dashboard/WellnessTab";
import RemindersTab from "./dashboard/RemindersTab";
import MemoriesTab from "./dashboard/MemoriesTab";
import HistoryTab from "./dashboard/HistoryTab";
import CreativeTab from "./dashboard/CreativeTab";

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
  onSend: () => void;
  loading: boolean;
  chatEndRef: RefObject<HTMLDivElement>;
  onPrivacy: () => void;
  onLogout: () => void;
}

type Tab = "ai" | "memories" | "wellness" | "history" | "creative" | "insights" | "reminders" | "automations" | "reports" | "settings";

const navItems: { id: Tab; label: string; icon: string }[] = [
  { id: "ai", label: "Morpheus", icon: "🕶️" },
  { id: "memories", label: "Memory Vault", icon: "🧠" },
  { id: "creative", label: "Creative Studio", icon: "🎨" },
  { id: "history", label: "History", icon: "📜" },
  { id: "wellness", label: "Wellness", icon: "💚" },
  { id: "insights", label: "Insights", icon: "📊" },
  { id: "reminders", label: "Reminders", icon: "🔔" },
  { id: "automations", label: "Automations", icon: "⚡" },
  { id: "reports", label: "Reports", icon: "📈" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardScreen({
  user, planLabel, messages, input, setInput, onSend, loading, chatEndRef, onPrivacy, onLogout,
}: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
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
        w-60 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0
        fixed inset-y-0 left-0 z-40 transition-transform md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-5 pb-0">
          <div className="flex items-center gap-2.5 mb-6">
            <ZentrixLogo size={28} />
            <span className="font-display font-extrabold text-sm tracking-[4px] text-gradient-primary">ZENTRIX</span>
            <button className="ml-auto md:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <div className="bg-primary/10 border border-primary/20 text-primary text-[10px] px-3 py-1.5 rounded-md text-center tracking-wider font-semibold uppercase mb-5">
            {planLabel} plan
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`px-3.5 py-2.5 rounded-lg text-sm text-left transition-all flex items-center gap-3 ${
                activeTab === item.id
                  ? "bg-primary/10 text-foreground font-medium border border-primary/15"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
              }`}
            >
              <span className="text-base w-6 text-center">{item.icon}</span>
              {item.label}
              {item.id === "reminders" && (
                <span className="ml-auto bg-accent text-accent-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
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
          <div className="flex-1">
            <div className="text-base font-display font-semibold flex items-center gap-2">
              <span>{navItems.find(n => n.id === activeTab)?.icon}</span>
              {navItems.find(n => n.id === activeTab)?.label}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {activeTab === "ai" && `Your personal Morpheus · ${planLabel} plan`}
              {activeTab === "memories" && "People, relationships & emotional context Morpheus remembers"}
              {activeTab === "creative" && "Generate images, memes, stickers & digital art with AI"}
              {activeTab === "history" && "Browse your past conversations & interactions"}
              {activeTab === "wellness" && "Daily affirmations, mood tracking & self-care"}
              {activeTab === "insights" && "Curated intelligence, updated in real-time"}
              {activeTab === "reminders" && "Never miss a thing — ZENTRIX keeps you on track"}
              {activeTab === "automations" && "Automated workflows running in the background"}
              {activeTab === "reports" && "Performance metrics and activity logs"}
              {activeTab === "settings" && "Customize your ZENTRIX experience"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-medium hidden sm:block">Online</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
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
                      className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary/15 border border-primary/20 rounded-br-sm"
                          : "bg-card/80 border border-border/60 rounded-bl-sm backdrop-blur-sm"
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

              <div className="px-6 pt-4 pb-2 border-t border-border/30 flex gap-3 items-end bg-background/30 backdrop-blur-sm">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Talk to ZENTRIX — your AI friend, therapist & strategist..."
                  maxLength={MAX_INPUT_LENGTH}
                  rows={2}
                  className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSend}
                  disabled={loading || !input.trim()}
                  className="bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40"
                >
                  {loading ? "···" : "Send"}
                </motion.button>
              </div>
              <div className="px-6 pb-3 text-[10px] text-muted-foreground/30">
                {input.length}/{MAX_INPUT_LENGTH} · Enter to send · Shift+Enter for new line
              </div>
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

          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <HistoryTab />
            </motion.div>
          )}

          {activeTab === "wellness" && (
            <motion.div key="wellness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <WellnessTab />
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <InsightsTab />
            </motion.div>
          )}

          {activeTab === "reminders" && (
            <motion.div key="reminders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <RemindersTab />
            </motion.div>
          )}

          {activeTab === "automations" && (
            <motion.div key="automations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <AutomationsTab />
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <ReportsTab />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
              <SettingsTab user={user} onLogout={onLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
