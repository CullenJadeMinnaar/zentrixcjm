import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export default function VoiceTab() {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ttsText, setTtsText] = useState("Hello — I'm Morpheus. How can I help you today?");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (blob.size < 2048) { toast.error("Recording too short — try again"); return; }
        await transcribe(blob);
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
    } catch { toast.error("Microphone access denied"); }
  };

  const stopRec = () => { recorderRef.current?.stop(); setRecording(false); };

  const transcribe = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fd = new FormData();
      const ext = (blob.type.split(";")[0].split("/")[1] || "webm").replace("mpeg", "mp3");
      fd.append("file", blob, `recording.${ext}`);
      const res = await fetch(`${FN_URL}/voice-stt`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error(`Transcription failed (${res.status})`);
      const { text } = await res.json();
      setTranscript(text || "(no speech detected)");
    } catch (e: any) { toast.error(e.message); }
    finally { setTranscribing(false); }
  };

  const speak = async () => {
    if (!ttsText.trim()) return;
    setSpeaking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${FN_URL}/voice-tts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText }),
      });
      if (!res.ok) throw new Error(`Speech failed (${res.status})`);
      const buf = await res.arrayBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
      if (audioRef.current) { audioRef.current.src = url; audioRef.current.play(); }
    } catch (e: any) { toast.error(e.message); }
    finally { setSpeaking(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-card/60 border border-border/60 rounded-xl p-6 backdrop-blur-sm text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Voice input</div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={recording ? stopRec : startRec}
          disabled={transcribing}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl mx-auto transition-all ${recording ? "bg-destructive animate-pulse" : "bg-primary hover:brightness-110"} text-primary-foreground`}
        >
          {recording ? "■" : "🎙"}
        </motion.button>
        <div className="text-xs text-muted-foreground mt-3">
          {transcribing ? "Transcribing…" : recording ? "Recording — tap to stop" : "Tap to record"}
        </div>
        {transcript && (
          <div className="mt-4 bg-secondary/40 border border-border rounded-lg p-3 text-sm text-left">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Transcript</div>
            {transcript}
          </div>
        )}
      </div>

      <div className="bg-card/60 border border-border/60 rounded-xl p-6 backdrop-blur-sm space-y-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Voice output</div>
        <textarea value={ttsText} onChange={e => setTtsText(e.target.value)} rows={3} maxLength={2000} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <motion.button whileTap={{ scale: 0.97 }} onClick={speak} disabled={speaking} className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {speaking ? "Generating…" : "▶ Speak"}
        </motion.button>
        <audio ref={audioRef} controls className="w-full" />
      </div>
    </div>
  );
}
