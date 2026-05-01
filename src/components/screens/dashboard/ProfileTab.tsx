import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ZentrixMemory,
  loadMemory,
  saveMemory,
  clearMemory,
  DEFAULT_MEMORY,
  Tone,
  Length,
} from "@/lib/memory";

const inputClass =
  "w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";

export default function ProfileTab() {
  const [mem, setMem] = useState<ZentrixMemory>(DEFAULT_MEMORY);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setMem(loadMemory());
  }, []);

  // Auto-save on every change (debounced lightly via blur/change is fine for localStorage)
  const update = <K extends keyof ZentrixMemory>(key: K, value: ZentrixMemory[K]) => {
    const next = { ...mem, [key]: value };
    setMem(next);
    saveMemory({ [key]: value } as Partial<ZentrixMemory>);
  };

  const handleClear = () => {
    clearMemory();
    setMem({ ...DEFAULT_MEMORY });
    setConfirmClear(false);
    toast.success("Memory cleared");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold mb-1">Your Memory Profile</h2>
        <p className="text-sm text-muted-foreground">
          Stored locally on this device. Survives logout. Morpheus uses this on every chat so you never have to re-introduce yourself.
        </p>
      </div>

      {/* Identity */}
      <section className="bg-card/60 border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Identity</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Name" value={mem.name} onChange={e => update("name", e.target.value)} />
          <input className={inputClass} placeholder="Role (e.g. founder, designer)" value={mem.role} onChange={e => update("role", e.target.value)} />
          <input className={inputClass} placeholder="Location" value={mem.location} onChange={e => update("location", e.target.value)} />
        </div>
        <textarea
          className={inputClass + " resize-none"}
          rows={3}
          placeholder="Background — who you are, what you do, what shaped you..."
          value={mem.background}
          onChange={e => update("background", e.target.value)}
        />
      </section>

      {/* Goals */}
      <section className="bg-card/60 border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Current goals & projects</h3>
        <textarea
          className={inputClass + " resize-none"}
          rows={4}
          placeholder="What you're building, working on, or moving toward right now..."
          value={mem.goals}
          onChange={e => update("goals", e.target.value)}
        />
      </section>

      {/* Conversation memory */}
      <section className="bg-card/60 border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Conversation memory</h3>
        <p className="text-xs text-muted-foreground -mt-2">Key takeaways from past sessions — paste or type freely.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Decisions already made</label>
            <textarea className={inputClass + " resize-none"} rows={2} value={mem.decisions} onChange={e => update("decisions", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Things already learned / solved</label>
            <textarea className={inputClass + " resize-none"} rows={2} value={mem.learned} onChange={e => update("learned", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Ongoing tasks & next steps</label>
            <textarea className={inputClass + " resize-none"} rows={2} value={mem.tasks} onChange={e => update("tasks", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Preferences discovered in past chats</label>
            <textarea className={inputClass + " resize-none"} rows={2} value={mem.chatPreferences} onChange={e => update("chatPreferences", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Pinned topics — always remember</label>
            <textarea className={inputClass + " resize-none"} rows={2} value={mem.pinnedTopics} onChange={e => update("pinnedTopics", e.target.value)} />
          </div>
        </div>
      </section>

      {/* Response preferences */}
      <section className="bg-card/60 border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Response preferences</h3>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Tone</label>
            <select className={inputClass} value={mem.tone} onChange={e => update("tone", e.target.value as Tone)}>
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="technical">Technical</option>
              <option value="empathetic">Empathetic</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Length</label>
            <select className={inputClass} value={mem.length} onChange={e => update("length", e.target.value as Length)}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Formatting preferences</label>
          <textarea className={inputClass + " resize-none"} rows={2} value={mem.formatting} onChange={e => update("formatting", e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">Custom instructions</label>
          <textarea className={inputClass + " resize-none"} rows={3} placeholder="Anything else Morpheus should know about how to respond..." value={mem.customInstructions} onChange={e => update("customInstructions", e.target.value)} />
        </div>
      </section>

      {/* Footer / clear */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-muted-foreground">
          Auto-saved · Last updated {new Date(mem.updatedAt).toLocaleString()}
        </p>
        {confirmClear ? (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">Erase all memory?</span>
            <button onClick={handleClear} className="text-xs bg-destructive/15 text-destructive border border-destructive/30 px-3 py-1.5 rounded-md hover:bg-destructive/25 transition-colors">
              Yes, clear
            </button>
            <button onClick={() => setConfirmClear(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setConfirmClear(true)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear memory
          </motion.button>
        )}
      </div>
    </div>
  );
}
