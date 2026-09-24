import { RefObject, memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getAudioSettings, playMessage, stopPlayback, subscribePlayer, type PlayState } from "@/lib/voice";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Copy, Check, Volume2, Pause, Loader2, Square } from "lucide-react";
import ZentrixLogo from "../../ZentrixLogo";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: Message[];
  loading: boolean;
  chatEndRef: RefObject<HTMLDivElement>;
}

function MessageList({ messages, loading, chatEndRef }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [player, setPlayer] = useState<{ id: string | null; state: PlayState }>({ id: null, state: "idle" });
  useEffect(() => subscribePlayer((id, state) => setPlayer({ id, state })), []);

  const listen = (i: number, text: string) => {
    playMessage(`m${i}`, text).catch((e) => toast.error(e?.message ?? "Voice playback failed"));
  };

  // Auto-play the newest reply once streaming finishes
  const wasLoading = useRef(loading);
  useEffect(() => {
    if (wasLoading.current && !loading) {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && last.content.trim() && getAudioSettings().autoPlay) {
        listen(messages.length - 1, last.content);
      }
    }
    wasLoading.current = loading;
  }, [loading, messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {messages.map((msg, i) => {
          const isCopied = copiedIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`group flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ZentrixLogo size={16} />
                </div>
              )}
              <div className="relative max-w-[75%]">
                <div
                  className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary/15 border border-primary/20 rounded-br-sm"
                      : "bg-card/80 border border-border/60 rounded-bl-sm backdrop-blur-sm whitespace-normal"
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
                {msg.role === "assistant" && msg.content.trim() && (() => {
                  const active = player.id === `m${i}`;
                  const st = active ? player.state : "idle";
                  return (
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                      <button
                        onClick={() => listen(i, msg.content)}
                        disabled={st === "loading"}
                        aria-label={st === "playing" ? "Pause" : "Listen"}
                        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-secondary/60 hover:text-foreground transition-colors disabled:opacity-60"
                      >
                        {st === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : st === "playing" ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{st === "loading" ? "Preparing voice…" : st === "playing" ? "Pause" : st === "paused" ? "Resume" : "Listen"}</span>
                      </button>
                      {active && st !== "loading" && (
                        <button onClick={stopPlayback} aria-label="Stop" className="p-1 rounded-md hover:bg-secondary/60 hover:text-foreground">
                          <Square className="w-3 h-3" />
                        </button>
                      )}
                      {st === "playing" && (
                        <span className="flex items-end gap-0.5 h-3 ml-1" aria-hidden>
                          {[0, 0.15, 0.3].map((d) => (
                            <span key={d} className="w-0.5 h-full bg-primary rounded-full animate-pulse" style={{ animationDelay: `${d}s` }} />
                          ))}
                        </span>
                      )}
                    </div>
                  );
                })()}
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(msg.content);
                      setCopiedIndex(i);
                      window.setTimeout(() => {
                        setCopiedIndex((prev) => (prev === i ? null : prev));
                      }, 1500);
                    } catch {
                      // ignore clipboard errors
                    }
                  }}
                  aria-label={isCopied ? "Copied" : "Copy message"}
                  title={isCopied ? "Copied" : "Copy"}
                  className="absolute -top-2 -right-2 p-1.5 rounded-md bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/80 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
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
    </div>
  );
}

export default memo(MessageList, (prev, next) => {
  if (prev.loading !== next.loading) return false;
  if (prev.messages === next.messages) return true;
  if (prev.messages.length !== next.messages.length) return false;
  for (let i = 0; i < prev.messages.length; i++) {
    if (
      prev.messages[i].content !== next.messages[i].content ||
      prev.messages[i].role !== next.messages[i].role
    ) return false;
  }
  return true;
});
