import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

export default function CreativeTab() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [style, setStyle] = useState("photo");

  const styles = [
    { id: "photo", label: "Photo", icon: "📸" },
    { id: "meme", label: "Meme", icon: "😂" },
    { id: "sticker", label: "Sticker", icon: "🎨" },
    { id: "art", label: "Digital Art", icon: "🖼️" },
    { id: "logo", label: "Logo", icon: "✨" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Enter a prompt first"); return; }
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to generate images");
        setLoading(false);
        return;
      }
      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt, style }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        toast.error(err.error || "Generation failed");
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (data.image) {
        setImages(prev => [data.image, ...prev]);
        toast.success("Image generated!");
      }
    } catch {
      toast.error("Failed to generate image");
    }
    setLoading(false);
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `zentrix-creation-${index + 1}.png`;
    a.click();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="font-display text-xl font-bold mb-1">Creative Studio</h2>
      <p className="text-sm text-muted-foreground mb-6">Generate images, memes, stickers & art with AI</p>

      {/* Style selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {styles.map(s => (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStyle(s.id)}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border transition-all ${
              style === s.id
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-card/40 text-muted-foreground hover:border-primary/20"
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </motion.button>
        ))}
      </div>

      {/* Prompt input */}
      <div className="flex gap-3 mb-6">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe what you want to create..."
          rows={3}
          className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="bg-primary text-primary-foreground px-6 rounded-lg text-sm font-semibold disabled:opacity-40 self-end py-3"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : "Generate"}
        </motion.button>
      </div>

      {/* Generated images */}
      {images.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🎨</div>
          <p className="text-muted-foreground text-sm">Your AI creations will appear here</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Try: "A futuristic city at sunset in neon colors"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <img src={img} alt={`Creation ${i + 1}`} className="w-full rounded-xl border border-border" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <button onClick={() => handleDownload(img, i)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
                  Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
