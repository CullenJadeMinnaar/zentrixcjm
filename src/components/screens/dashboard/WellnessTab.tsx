import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const dailyQuotes = [
  { text: "You are enough. You have always been enough.", author: "Self-Worth" },
  { text: "Your mental health is a priority. Your happiness is essential.", author: "Wellness" },
  { text: "You don't have to be perfect to be amazing.", author: "Growth" },
  { text: "Be gentle with yourself. You're doing the best you can.", author: "Compassion" },
  { text: "Every small step counts. Progress isn't always visible.", author: "Patience" },
  { text: "You are allowed to take up space and have a voice.", author: "Confidence" },
  { text: "Rest is not a reward. It's a necessity.", author: "Balance" },
  { text: "Your feelings are valid, even when they're uncomfortable.", author: "Emotional Intelligence" },
  { text: "You're not falling behind. You're on your own timeline.", author: "Self-Acceptance" },
  { text: "Healing isn't linear, and that's okay.", author: "Recovery" },
];

const moodOptions = [
  { emoji: "😄", label: "Great", value: 5 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😔", label: "Low", value: 2 },
  { emoji: "😢", label: "Rough", value: 1 },
];

const wellnessActivities = [
  { icon: "🧘", name: "5-Min Breathing", desc: "Box breathing for calm", duration: "5 min" },
  { icon: "📝", name: "Gratitude Journal", desc: "Write 3 things you're grateful for", duration: "3 min" },
  { icon: "🚶", name: "Mindful Walk", desc: "Step outside, no phone", duration: "10 min" },
  { icon: "💧", name: "Hydration Check", desc: "Drink a glass of water", duration: "1 min" },
  { icon: "🎵", name: "Music Therapy", desc: "Listen to something that moves you", duration: "5 min" },
  { icon: "🌙", name: "Sleep Prep", desc: "Screen-free wind down ritual", duration: "15 min" },
];

const quickPrompts = [
  "I'm feeling overwhelmed today",
  "Help me process my thoughts",
  "I need motivation right now",
  "Let's do a gratitude exercise",
  "Talk me through anxiety",
];

interface MoodEntry {
  id: string;
  mood: number;
  note: string | null;
  created_at: string;
}

interface WellnessTabProps {
  onQuickPrompt?: (prompt: string) => void;
}

export default function WellnessTab({ onQuickPrompt }: WellnessTabProps) {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrentQuote(Math.floor(Math.random() * dailyQuotes.length));
    void loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("mood_checkins")
      .select("id, mood, note, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return;
    const rows = (data ?? []) as MoodEntry[];
    setMoodHistory(rows);
    const today = new Date().toDateString();
    const latestToday = rows.find((r) => new Date(r.created_at).toDateString() === today);
    if (latestToday) setTodayMood(latestToday.mood);
  };

  const logMood = async (value: number) => {
    if (saving) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save your mood");
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("mood_checkins")
      .insert({ user_id: user.id, mood: value, note: moodNote.trim() || null })
      .select("id, mood, note, created_at")
      .single();
    setSaving(false);
    if (error) {
      toast.error("Couldn't save your check-in");
      return;
    }
    setTodayMood(value);
    setMoodHistory((prev) => [data as MoodEntry, ...prev].slice(0, 10));
    setMoodNote("");
    toast.success("Mood logged");
  };

  const quote = dailyQuotes[currentQuote];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-card/60 border border-border p-8"
      >
        <span className="text-[10px] uppercase tracking-[4px] text-primary font-medium">Daily Affirmation</span>
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={currentQuote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl md:text-2xl font-display font-semibold leading-relaxed mt-4 mb-3"
          >
            "{quote.text}"
          </motion.blockquote>
        </AnimatePresence>
        <span className="text-sm text-muted-foreground">— {quote.author}</span>
        <button
          onClick={() => setCurrentQuote((currentQuote + 1) % dailyQuotes.length)}
          className="block mt-4 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Next quote →
        </button>
      </motion.div>

      {/* Mood Check-in */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card/60 border border-border rounded-xl p-6"
      >
        <h3 className="font-display text-lg font-semibold mb-1">How are you feeling?</h3>
        <p className="text-sm text-muted-foreground mb-5">Check in with yourself — no judgement</p>

        <div className="flex gap-3 justify-center mb-4">
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              disabled={saving}
              onClick={() => logMood(mood.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all disabled:opacity-60 ${
                todayMood === mood.value
                  ? "bg-primary/10 border border-primary/30 ring-2 ring-primary/20"
                  : "hover:bg-secondary border border-transparent"
              }`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-[11px] text-muted-foreground">{mood.label}</span>
            </motion.button>
          ))}
        </div>

        <input
          value={moodNote}
          onChange={(e) => setMoodNote(e.target.value)}
          maxLength={280}
          placeholder="Add a note (optional) — then pick a mood"
          className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/40 transition-colors"
        />

        {todayMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-border"
          >
            <p className="text-sm text-primary mb-2">
              ✓ Mood saved — {moodOptions.find(m => m.value === todayMood)?.label}
            </p>
            <button
              onClick={() => onQuickPrompt?.(`I'm feeling ${moodOptions.find(m => m.value === todayMood)?.label?.toLowerCase()} today`)}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Talk it through with ZENTRIX →
            </button>
          </motion.div>
        )}

        {moodHistory.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-[11px] uppercase tracking-[3px] text-muted-foreground mb-3">Recent check-ins</p>
            <div className="space-y-1.5">
              {moodHistory.map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">{moodOptions.find(o => o.value === m.mood)?.emoji ?? "🙂"}</span>
                  <span className="text-muted-foreground text-xs w-32 shrink-0">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                  {m.note && <span className="text-xs text-muted-foreground/80 truncate">{m.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wellness Activities */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/60 border border-border rounded-xl p-6"
        >
          <h3 className="font-display text-lg font-semibold mb-1">Quick Wellness</h3>
          <p className="text-xs text-muted-foreground mb-4">Small actions, big impact</p>
          <div className="space-y-2">
            {wellnessActivities.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-all cursor-pointer group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{a.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.desc}</div>
                </div>
                <span className="text-[10px] text-muted-foreground/60 bg-secondary px-2 py-0.5 rounded-full">{a.duration}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Talk to ZENTRIX */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/60 border border-border rounded-xl p-6"
        >
          <h3 className="font-display text-lg font-semibold mb-1">Talk to ZENTRIX</h3>
          <p className="text-xs text-muted-foreground mb-4">Your AI friend & wellness companion</p>

          <div className="space-y-3 mb-5">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onQuickPrompt?.(prompt)}
                className="w-full text-left px-4 py-2.5 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 hover:bg-primary/5 text-sm transition-all"
              >
                💬 {prompt}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            ZENTRIX is here as your supportive AI companion. For professional help, please reach out to a licensed therapist.
            In a crisis in South Africa: SADAG 0800 21 21 21, Suicide Crisis Line 0800 567 567, or 112 for emergencies.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
