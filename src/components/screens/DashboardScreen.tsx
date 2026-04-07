import { RefObject, KeyboardEvent } from "react";
import ZentrixLogo from "../ZentrixLogo";
import { MAX_INPUT_LENGTH } from "@/lib/auth-helpers";

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

const navItems = ["AI Assistant", "Insights", "Automations", "Reports", "Settings"];

export default function DashboardScreen({
  user, planLabel, messages, input, setInput, onSend, loading, chatEndRef, onPrivacy, onLogout,
}: DashboardScreenProps) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col p-5 shrink-0 hidden md:flex">
        <div className="flex items-center gap-2 mb-7">
          <ZentrixLogo size={22} />
          <span className="font-display font-extrabold text-sm tracking-[3px] text-foreground">ZENTRIX</span>
        </div>

        <div className="bg-primary/15 text-primary text-[11px] px-3 py-1 rounded-md self-start mb-6 tracking-wider font-medium">
          {planLabel} plan
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map((item) => (
            <div
              key={item}
              className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
                item === "AI Assistant"
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border pt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
              {user.name[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={onPrivacy} className="flex-1 bg-secondary border border-border rounded-md text-muted-foreground text-xs py-1.5 hover:text-foreground transition-colors">
              Privacy
            </button>
            <button onClick={onLogout} className="flex-1 bg-secondary border border-border rounded-md text-muted-foreground text-xs py-1.5 hover:text-foreground transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-base font-semibold">AI Assistant</div>
            <div className="text-xs text-muted-foreground mt-0.5">Your ZENTRIX intelligence layer · {planLabel} plan</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <ZentrixLogo size={14} />
                </div>
              )}
              <div
                className={`max-w-[72%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/20 border border-primary/30 rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <ZentrixLogo size={14} />
              </div>
              <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm">
                <span className="inline-block animate-pulse">●</span>
                <span className="inline-block animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                <span className="inline-block animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-6 pt-4 pb-2 border-t border-border flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your intelligence layer anything..."
            maxLength={MAX_INPUT_LENGTH}
            rows={2}
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <div className="px-6 pb-3 text-[11px] text-muted-foreground/40">
          {input.length}/{MAX_INPUT_LENGTH} chars · Press Enter to send
        </div>
      </main>
    </div>
  );
}
