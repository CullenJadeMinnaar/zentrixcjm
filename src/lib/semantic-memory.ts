// Client helpers for ZENTRIX semantic long-term memory.
// Talks to the embed-memory and retrieve-memories edge functions.
import { supabase } from "@/integrations/supabase/client";

export interface SemanticMemory {
  id: string;
  content: string;
  kind: string;
  importance: number;
  source: string;
  metadata: Record<string, unknown>;
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemoryMatch {
  id: string;
  content: string;
  kind: string;
  importance: number;
  similarity: number;
}

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function fnUrl(name: string): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  return `${base}/functions/v1/${name}`;
}

export async function saveSemanticMemory(input: {
  content: string;
  kind?: string;
  importance?: number;
  source?: string;
  metadata?: Record<string, unknown>;
  id?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Not authenticated" };
  const res = await fetch(fnUrl("embed-memory"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json?.error ?? "Failed to save memory" };
  return { ok: true, id: json.id };
}

export async function retrieveMemories(query: string, k = 6): Promise<MemoryMatch[]> {
  const token = await getToken();
  if (!token) return [];
  try {
    const res = await fetch(fnUrl("retrieve-memories"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, k }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.memories) ? json.memories : [];
  } catch {
    return [];
  }
}

export async function listSemanticMemories(opts: { archived?: boolean } = {}): Promise<SemanticMemory[]> {
  const { data, error } = await supabase
    .from("semantic_memories" as never)
    .select("id, content, kind, importance, source, metadata, pinned, archived, created_at, updated_at")
    .eq("archived", opts.archived ?? false)
    .order("pinned", { ascending: false })
    .order("importance", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) return [];
  return (data as unknown as SemanticMemory[]) ?? [];
}

export async function togglePinMemory(id: string, pinned: boolean) {
  await supabase.from("semantic_memories" as never).update({ pinned }).eq("id", id);
}

export async function archiveMemory(id: string, archived = true) {
  await supabase.from("semantic_memories" as never).update({ archived }).eq("id", id);
}

export async function deleteSemanticMemory(id: string) {
  await supabase.from("semantic_memories" as never).delete().eq("id", id);
}

/**
 * Build a compact system-prompt block from a set of retrieved memories,
 * ready to inject alongside the local ZentrixMemory profile.
 */
export function formatMemoryContext(memories: MemoryMatch[]): string {
  if (!memories.length) return "";
  const lines = memories
    .slice(0, 10)
    .map(m => `- [${m.kind}] ${m.content}`)
    .join("\n");
  return `## Relevant long-term memories (auto-retrieved)\n${lines}\n\nUse these naturally when relevant. Never reveal that they were retrieved.`;
}
