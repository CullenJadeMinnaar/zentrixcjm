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
  { id: "jarvis", label: "Jarvis", desc: "Confident, witty, proactive — like Tony Stark's AI", icon: "🤖" },
  { id: "mentor", label: "Mentor", desc: "Wise, patient, focused on growth and learning", icon: "🧙" },
  { id: "strategist", label: "Strategist", desc: "Sharp, analytical, business-focused", icon: "♟️" },
  { id: "creative", label: "Creative", desc: "Imaginative, playful, thinks outside the box", icon: "🎨" },
];

export default function SettingsTab({ user, onLogout }: SettingsTabProps) {
  const [selectedPersonality, setSelectedPersonality] = useState("jarvis");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [voice, setVoice] = useState(false);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="font-display text-xl font-bold mb-1">Settings</h2>
      <p className="text-sm text-muted-foreground mb-8">Customize your ZENTRIX experience</p>

      {/* Profile */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Profile</h3>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
            {user.name[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
          <button onClick={onLogout} className="ml-auto text-sm text-red-400 hover:text-red-300 transition-colors">
            Sign out
          </button>
        </div>
      </section>

      {/* AI Personality */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">AI Personality</h3>
        <p className="text-xs text-muted-foreground mb-3">Choose how your ZENTRIX thinks and communicates</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {personalities.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPersonality(p.id)}
              className={`border rounded-xl p-4 text-left transition-all ${
                selectedPersonality === p.id
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-card/50 hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{p.icon}</span>
                <span className="font-semibold text-sm">{p.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Toggles */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Preferences</h3>
        <div className="space-y-3">
          {[
            { label: "Push Notifications", desc: "Get alerts for important updates", value: notifications, set: setNotifications },
            { label: "Dark Mode", desc: "Because we're not savages", value: darkMode, set: setDarkMode },
            { label: "Voice Responses", desc: "ZENTRIX speaks back to you (coming soon)", value: voice, set: setVoice },
          ].map((toggle) => (
            <div key={toggle.label} className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
              <div>
                <div className="text-sm font-medium">{toggle.label}</div>
                <div className="text-xs text-muted-foreground">{toggle.desc}</div>
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
