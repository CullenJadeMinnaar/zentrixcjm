import { RefObject, memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
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
