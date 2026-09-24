import { supabase } from "@/integrations/supabase/client";

export const VOICES = [
  { id: "onwK4e9ZLuTAKqWW03F9", label: "Daniel — calm, deep" },
  { id: "JBFqnCBsd6RMkjVDRZzb", label: "George — warm narrator" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Sarah — soft, gentle" },
  { id: "XrExE9yKIg1WjnnlVkGX", label: "Matilda — friendly" },
  { id: "nPczCjzI2devNBz1zQrb", label: "Brian — steady" },
  { id: "pFZP5JQG7iQjIQuC4Bku", label: "Lily — soothing" },
];

export interface AudioSettings { autoPlay: boolean; voiceId: string; speed: number }
const KEY = "zentrix_audio_settings";
const DEFAULTS: AudioSettings = { autoPlay: false, voiceId: VOICES[0].id, speed: 1 };

export function getAudioSettings(): AudioSettings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return DEFAULTS; }
}
export function saveAudioSettings(s: AudioSettings) { localStorage.setItem(KEY, JSON.stringify(s)); }

// ---- Single shared player ----
export type PlayState = "idle" | "loading" | "playing" | "paused";
type Listener = (id: string | null, state: PlayState) => void;
let audio: HTMLAudioElement | null = null;
let currentId: string | null = null;
let state: PlayState = "idle";
const listeners = new Set<Listener>();
const cache = new Map<string, string>();

const emit = () => listeners.forEach((l) => l(currentId, state));
export function subscribePlayer(l: Listener) { listeners.add(l); l(currentId, state); return () => { listeners.delete(l); }; }

function stripMarkdown(t: string) {
  return t.replace(/```[\s\S]*?```/g, " ").replace(/[*_#>`~\[\]]/g, "").replace(/\((https?:[^)]+)\)/g, "").slice(0, 4800);
}

export function stopPlayback() {
  audio?.pause(); audio = null; currentId = null; state = "idle"; emit();
}

export async function playMessage(id: string, text: string) {
  if (currentId === id && audio) {
    if (state === "playing") { audio.pause(); state = "paused"; emit(); return; }
    if (state === "paused") { await audio.play(); state = "playing"; emit(); return; }
  }
  stopPlayback();
  currentId = id; state = "loading"; emit();
  const s = getAudioSettings();
  const cacheKey = `${id}|${s.voiceId}|${s.speed}`;
  try {
    let url = cache.get(cacheKey);
    if (!url) {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ text: stripMarkdown(text), voiceId: s.voiceId, speed: s.speed }),
      });
      if (!res.ok) {
        let msg = `Voice playback failed (${res.status})`;
        try { const j = await res.json(); msg = j.error || msg; } catch { /* */ }
        throw new Error(msg);
      }
      url = URL.createObjectURL(await res.blob());
      cache.set(cacheKey, url);
    }
    if (currentId !== id) return;
    const a = new Audio(url);
    audio = a;
    a.onended = () => { if (audio === a) stopPlayback(); };
    await a.play();
    state = "playing"; emit();
  } catch (e) {
    if (currentId === id) stopPlayback();
    throw e;
  }
}
