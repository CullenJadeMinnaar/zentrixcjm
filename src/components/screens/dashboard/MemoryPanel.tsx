import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZentrixMemory, loadMemory, hasAnyMemory } from "@/lib/memory";

interface MemoryPanelProps {
  onOpenProfile: () => void;
}

export default function MemoryPanel({ onOpenProfile }: MemoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [mem, setMem] = useState<ZentrixMemory>(loadMemory());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ZentrixMemory>).detail;
      if (detail) setMem(detail);
      else setMem(loadMemory());
    };
    window.addEventListener("zentrix-memory-updated", handler);
    return () => window.removeEventListener("zentrix-memory-updated", handler);
  }, []);

  const items: { label: string; value: string }[] = [
    { label: "Name", value: mem.name },
    { label: "Role", value: mem.role },
    { label: "Location", value: mem.location },
    { label: "Goals", value: mem.goals },
    { label: "Decisions", value: mem.decisions },
    { label: "Tasks", value: mem.tasks },
    { label: "Pinned", value: mem.pinnedTopics },
  ].filter(i => i.value && i.value.trim());

  const hasMem = hasAnyMemory(mem);

  return (
    <div className="border-t border-border/30 bg-background/50 backdrop-blur-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-2.5 flex items-center justify-between text-xs hover:bg-secondary/30 transition-colors"
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <span>🧠</span>
          <span className="font-medium">
            {hasMem ? `Morpheus remembers ${items.length} thing${items.length === 1 ? "" : "s"}` : "No memory yet — set up your profile"}
          </span>
        </span>
        <span className="text-muted-foreground">{open ? "▾" : "▸"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 pt-1">
              {hasMem ? (
                <div className="grid sm:grid-cols-2 gap-2 mb-3">
                  {items.map(i => (
                    <div key={i.label} className="bg-card/40 border border-border/50 rounded-md px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{i.label}</div>
                      <div className="text-xs text-foreground line-clamp-2">{i.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mb-3">
                  Open your profile to teach Morpheus who you are. He'll remember on every future chat.
                </p>
              )}
              <button
                onClick={onOpenProfile}
                className="text-xs text-primary hover:brightness-110 transition-colors font-medium"
              >
                {hasMem ? "Edit memory →" : "Set up profile →"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
