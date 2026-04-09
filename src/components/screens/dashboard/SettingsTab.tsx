import { useState } from "react";
import { motion } from "framer-motion";

interface User {
  name: string;
  email: string;
}

interface SettingsTabProps {
  user: User;
  onLogout: () => void;
}

const personalities = [
  { id: "morpheus", label: "Morpheus", desc: "Wise, guiding, truth-revealing — your Matrix mentor", icon: "🕶️" },
  { id: "therapist", label: "Therapist", desc: "Empathetic, gentle, focused on your wellbeing", icon: "💚" },
  { id: "mentor", label: "Mentor", desc: "Wise, patient, growth-focused guidance", icon: "🧙" },
  { id: "strategist", label: "Strategist", desc: "Sharp, analytical, business-first thinking", icon: "♟️" },
];

export default function SettingsTab({ user, onLogout }: SettingsTabProps) {
  const [selectedPersonality, setSelectedPersonality] = useState("jarvis");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [dailyQuotes, setDailyQuotes] = useState(true);
  const [moodReminders, setMoodReminders] = useState(true);

  const toggleItems = [
    { label: "Push Notifications", desc: "Alerts for reminders, insights & updates", value: notifications, set: setNotifications },
    { label: "Daily Self-Worth Quotes", desc: "Morning affirmations to start your day right", value: dailyQuotes, set: setDailyQuotes },
    { label: "Mood Check-in Reminders", desc: "Gentle nudges to check in with yourself", value: moodReminders, set: setMoodReminders },
    { label: "Dark Mode", desc: "The only way to use ZENTRIX", value: darkMode, set: setDarkMode },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="font-display text-xl font-bold mb-1">Settings</h2>
      <p className="text-sm text-muted-foreground mb-8">Make ZENTRIX truly yours</p>

      {/* Profile */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold mb-3 text-muted-foreground uppercase tracking-[3px]">Profile</h3>
        <div className="bg-card/60 border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold">
            {user.name[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-display font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
          <button onClick={onLogout} className="ml-auto text-sm text-destructive/70 hover:text-destructive transition-colors">
            Sign out
          </button>
        </div>
      </section>

      {/* AI Personality */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold mb-3 text-muted-foreground uppercase tracking-[3px]">AI Personality</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose how ZENTRIX thinks and communicates with you</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {personalities.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPersonality(p.id)}
              className={`border rounded-xl p-4 text-left transition-all ${
                selectedPersonality === p.id
                  ? "border-primary/40 bg-primary/10 ring-1 ring-primary/20"
                  : "border-border bg-card/40 hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{p.icon}</span>
                <span className="font-display font-semibold text-sm">{p.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Toggles */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold mb-3 text-muted-foreground uppercase tracking-[3px]">Preferences</h3>
        <div className="space-y-3">
          {toggleItems.map((toggle) => (
            <div key={toggle.label} className="flex items-center justify-between bg-card/60 border border-border rounded-xl p-4">
              <div>
                <div className="text-sm font-medium">{toggle.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{toggle.desc}</div>
              </div>
              <button
                onClick={() => toggle.set(!toggle.value)}
                className={`w-12 h-6 rounded-full relative transition-all ${
                  toggle.value ? "bg-primary" : "bg-secondary border border-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    toggle.value ? "left-[26px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
