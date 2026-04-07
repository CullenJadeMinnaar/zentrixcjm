import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  { emoji: "😄", label: "Great", value: 5, color: "from-green-400 to-emerald-500" },
  { emoji: "🙂", label: "Good", value: 4, color: "from-blue-400 to-cyan-500" },
  { emoji: "😐", label: "Okay", value: 3, color: "from-yellow-400 to-amber-500" },
  { emoji: "😔", label: "Low", value: 2, color: "from-orange-400 to-red-400" },
  { emoji: "😢", label: "Rough", value: 1, color: "from-red-400 to-rose-500" },
];

const wellnessActivities = [
  { icon: "🧘", name: "5-Min Breathing", desc: "Box breathing for calm", duration: "5 min" },
  { icon: "📝", name: "Gratitude Journal", desc: "Write 3 things you're grateful for", duration: "3 min" },
  { icon: "🚶", name: "Mindful Walk", desc: "Step outside, no phone", duration: "10 min" },
  { icon: "💧", name: "Hydration Check", desc: "Drink a glass of water", duration: "1 min" },
  { icon: "🎵", name: "Music Therapy", desc: "Listen to something that moves you", duration: "5 min" },
  { icon: "🌙", name: "Sleep Prep", desc: "Screen-free wind down ritual", duration: "15 min" },
];

interface MoodEntry {
  mood: number;
  time: string;
  note: string;
}

export default function WellnessTab() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    setCurrentQuote(Math.floor(Math.random() * dailyQuotes.length));
  }, []);

  const logMood = (value: number) => {
    setTodayMood(value);
    setMoodHistory(prev => [
      { mood: value, time: new Date().toLocaleTimeString(), note: moodNote },
      ...prev,
    ]);
    setMoodNote("");
  };

  const quote = dailyQuotes[currentQuote];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Daily Quote Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 p-8"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
        <div className="relative">
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
        </div>
      </motion.div>

      {/* Mood Check-in */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-display text-lg font-semibold mb-1">How are you feeling?</h3>
        <p className="text-sm text-muted-foreground mb-5">Check in with yourself — no judgement</p>

        <div className="flex gap-3 justify-center mb-4">
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => logMood(mood.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                todayMood === mood.value
                  ? "bg-primary/15 border border-primary/30 ring-2 ring-primary/20"
                  : "hover:bg-secondary border border-transparent"
              }`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-[11px] text-muted-foreground">{mood.label}</span>
            </motion.button>
          ))}
        </div>

        {todayMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-border"
          >
            <p className="text-sm text-accent mb-2">
              ✓ Mood logged — {moodOptions.find(m => m.value === todayMood)?.label}
            </p>
            <p className="text-xs text-muted-foreground">
              Tip: Go to your AI Assistant and say "I'm feeling {moodOptions.find(m => m.value === todayMood)?.label?.toLowerCase()}" — ZENTRIX will talk it through with you like a friend.
            </p>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wellness Activities */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6"
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
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all cursor-pointer group"
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
          className="bg-gradient-to-br from-accent/10 via-card to-card border border-accent/20 rounded-2xl p-6"
        >
          <h3 className="font-display text-lg font-semibold mb-1">Talk to ZENTRIX</h3>
          <p className="text-xs text-muted-foreground mb-4">Your AI friend & wellness companion</p>
          
          <div className="space-y-3 mb-5">
            {[
              "I'm feeling overwhelmed today",
              "Help me process my thoughts",
              "I need motivation right now",
              "Let's do a gratitude exercise",
              "Talk me through anxiety",
            ].map((prompt) => (
              <button
                key={prompt}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-secondary/50 border border-border hover:border-accent/30 hover:bg-accent/5 text-sm transition-all"
              >
                💬 {prompt}
              </button>
            ))}
          </div>
          
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            ZENTRIX is here as your supportive AI companion. For professional help, please reach out to a licensed therapist.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
