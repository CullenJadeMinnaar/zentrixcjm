import { useRef, useState, useLayoutEffect, KeyboardEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Paperclip, Mic, Send, Square, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MAX_INPUT_LENGTH } from "@/lib/auth-helpers";
import { uploadAttachment, removeAttachment, attachmentsToPrompt, type Attachment } from "@/lib/chat-attachments";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

interface Props {
  input: string;
  setInput: (v: string) => void;
  onSend: (text: string) => void;
  loading: boolean;
}

export default function ChatComposer({ input, setInput, onSend, loading }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand the textarea with content (Claude-style composer)
  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const busy = loading || uploading || transcribing;

  const submit = () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || busy) return;
    const composed = `${text}${attachmentsToPrompt(attachments)}`.trim();
    onSend(composed);
    setAttachments([]);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const pickFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    for (const f of files) {
      try {
        const a = await uploadAttachment(f);
        setAttachments((prev) => [...prev, a]);
      } catch (err: any) {
        toast.error(err?.message ?? `Could not upload ${f.name}`);
      }
    }
    setUploading(false);
  };

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    for (const f of files) {
      try {
        const a = await uploadAttachment(f);
        setAttachments((prev) => [...prev, a]);
      } catch (err: any) {
        toast.error(err?.message ?? `Could not upload ${f.name}`);
      }
    }
    setUploading(false);
  };

  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const cd = e.clipboardData;
    if (!cd) return;
    const images: File[] = Array.from(cd.files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      for (const item of Array.from(cd.items ?? [])) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) images.push(f);
        }
      }
    }
    if (!images.length) return;
    e.preventDefault();
    const stamped = images.map((f, i) =>
      f.name && f.name !== "image.png"
        ? f
        : new File([f], `pasted-${Date.now()}-${i}.${(f.type.split("/")[1] || "png")}`, { type: f.type })
    );
    await uploadFiles(stamped);
  };

  const dropAttachment = async (a: Attachment) => {
    setAttachments((prev) => prev.filter((x) => x.id !== a.id));
    try { await removeAttachment(a); } catch { /* ignore */ }
  };

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
      if (!text?.trim()) { toast.error("No speech detected"); return; }
      setInput(input ? `${input} ${text}` : text);
    } catch (e: any) {
      toast.error(e?.message ?? "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (blob.size < 2048) { toast.error("Recording too short — try again"); return; }
        await transcribe(blob);
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRec = () => { recorderRef.current?.stop(); setRecording(false); };

  return (
    <div className="px-4 sm:px-6 pb-4 pt-3 bg-background/40 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
          <AnimatePresence initial={false}>
            {attachments.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-wrap gap-2 px-3 pt-3"
              >
                {attachments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 bg-secondary/60 border border-border rounded-lg pl-2.5 pr-1.5 py-1.5 max-w-[220px]">
                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate">{a.name}</span>
                    <button onClick={() => dropAttachment(a)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message Morpheus…"
            maxLength={MAX_INPUT_LENGTH}
            rows={1}
            className="w-full bg-transparent px-4 pt-3.5 pb-1 text-sm leading-6 text-foreground placeholder:text-muted-foreground/70 resize-none focus:outline-none max-h-[200px] overflow-y-auto"
          />

          <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
            <input ref={fileRef} type="file" multiple hidden onChange={pickFiles}
              accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="Attach images or documents"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-40"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
            </button>
            <button
              onClick={recording ? stopRec : startRec}
              disabled={transcribing}
              title={recording ? "Stop recording" : "Record voice"}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 ${
                recording ? "bg-destructive/15 text-destructive animate-pulse" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {transcribing ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <span className="ml-auto text-[10px] text-muted-foreground/50 mr-1 hidden sm:block">
              {recording ? "Recording…" : transcribing ? "Transcribing…" : `${input.length}/${MAX_INPUT_LENGTH}`}
            </span>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={submit}
              disabled={busy || (!input.trim() && attachments.length === 0)}
              className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground/40 mt-1.5 text-center">
          Enter to send · Shift+Enter for a new line
        </div>
      </div>
    </div>
  );
}
