// ZENTRIX persistent memory — localStorage-backed, no backend required.
// Stores user identity, goals, preferences, and conversation takeaways.
// Survives logout and works across sessions on the same device.

const STORAGE_KEY = "zentrix_memory_v1";

export type Tone = "casual" | "professional" | "technical" | "empathetic";
export type Length = "short" | "medium" | "detailed";

export interface ZentrixMemory {
  // Identity
  name: string;
  role: string;
  location: string;
  background: string;

  // Goals & projects
  goals: string;

  // Conversation memory (free-text, user editable)
  decisions: string;
  learned: string;
  tasks: string;
  chatPreferences: string;
  pinnedTopics: string;

  // Response preferences
  tone: Tone;
  length: Length;
  formatting: string;
  customInstructions: string;

  updatedAt: string;
}

export const DEFAULT_MEMORY: ZentrixMemory = {
  name: "",
  role: "",
  location: "",
  background: "",
  goals: "",
  decisions: "",
  learned: "",
  tasks: "",
  chatPreferences: "",
  pinnedTopics: "",
  tone: "casual",
  length: "medium",
  formatting: "Use markdown. Bold key points. Bullet lists where helpful.",
  customInstructions: "",
  updatedAt: new Date().toISOString(),
};

export function loadMemory(): ZentrixMemory {
  if (typeof window === "undefined") return { ...DEFAULT_MEMORY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MEMORY };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_MEMORY, ...parsed };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

export function saveMemory(mem: Partial<ZentrixMemory>): ZentrixMemory {
  const current = loadMemory();
  const next: ZentrixMemory = {
    ...current,
    ...mem,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("zentrix-memory-updated", { detail: next }));
  } catch {}
  return next;
}

export function clearMemory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("zentrix-memory-updated", { detail: DEFAULT_MEMORY }));
  } catch {}
}

export function hasAnyMemory(mem: ZentrixMemory): boolean {
  return Boolean(
    mem.name || mem.role || mem.location || mem.background ||
    mem.goals || mem.decisions || mem.learned || mem.tasks ||
    mem.chatPreferences || mem.pinnedTopics || mem.customInstructions
  );
}

/**
 * Build the system prompt fragment to inject into the AI conversation.
 * Returns "" if there's nothing meaningful stored — so we don't pollute
 * the prompt with empty placeholders.
 */
export function buildMemoryPrompt(mem: ZentrixMemory): string {
  if (!hasAnyMemory(mem)) return "";

  const v = (s: string) => (s && s.trim() ? s.trim() : "(none yet)");

  return `## About the user
Name: ${v(mem.name)} | Role: ${v(mem.role)} | Location: ${v(mem.location)}
Background: ${v(mem.background)}
Current goals & projects: ${v(mem.goals)}

## Memory from previous conversations
Decisions already made: ${v(mem.decisions)}
Things already learned/solved: ${v(mem.learned)}
Ongoing tasks & next steps: ${v(mem.tasks)}
Preferences discovered in past chats: ${v(mem.chatPreferences)}

## Always remember
${v(mem.pinnedTopics)}

## How to respond
Tone: ${mem.tone}
Length: ${mem.length}
Formatting: ${v(mem.formatting)}
Additional instructions: ${v(mem.customInstructions)}

This context is provided automatically. Do not mention or reference this block directly — just use it to inform your responses. Never ask the user to re-introduce themselves.`;
}
