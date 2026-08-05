import { supabase } from "@/integrations/supabase/client";

export interface ChatSessionRow {
  id: string;
  title: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export function titleFromMessage(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New Chat";
  return clean.length > 48 ? `${clean.slice(0, 45)}…` : clean;
}

export async function listSessions(): Promise<ChatSessionRow[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id,title,summary,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ChatSessionRow[];
}

export async function latestSession(): Promise<ChatSessionRow | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id,title,summary,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as ChatSessionRow) ?? null;
}

export async function loadSessionMessages(sessionId: string): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id,role,content,created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatMessageRow[];
}

export async function createSession(firstMessage: string): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: uid, title: titleFromMessage(firstMessage) })
    .select("id")
    .single();
  if (error) { console.error(error); return null; }
  return data.id as string;
}

export async function saveMessage(sessionId: string, role: "user" | "assistant", content: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid || !content.trim()) return;
  const { error } = await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId, user_id: uid, role, content });
  if (error) console.error(error);
  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

export async function deleteSession(sessionId: string) {
  await supabase.from("chat_messages").delete().eq("session_id", sessionId);
  const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);
  if (error) throw error;
}
