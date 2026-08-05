import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { THEMES, applyTheme, getSavedTheme } from "@/lib/themes";
import {
  notificationsPermission,
  requestNotificationPermission,
  sendTestNotification,
  startNotificationLoop,
  stopNotificationLoop,
} from "@/lib/notifications";
import { toast } from "sonner";

const DIGEST_PREF_KEY = "zentrix_daily_digest_enabled";

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
  const [selectedPersonality, setSelectedPersonality] = useState("morpheus");
  const [selectedTheme, setSelectedTheme] = useState(getSavedTheme());
  const [permission, setPermission] = useState(notificationsPermission());
  const [dailyDigest, setDailyDigest] = useState(
    () => localStorage.getItem(DIGEST_PREF_KEY) !== "false"
  );
  const [darkMode, setDarkMode] = useState(true);
  const [dailyQuotes, setDailyQuotes] = useState(true);
  const [moodReminders, setMoodReminders] = useState(true);

  useEffect(() => {
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  const toggleItems = [
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

      {/* Themes */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold mb-3 text-muted-foreground uppercase tracking-[3px]">Theme</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose your visual vibe</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map((theme) => (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTheme(theme.id)}
              className={`border rounded-xl p-4 text-left transition-all ${
                selectedTheme === theme.id
                  ? "border-primary/40 bg-primary/10 ring-1 ring-primary/20"
                  : "border-border bg-card/40 hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{theme.icon}</span>
                <span className="font-display font-semibold text-sm">{theme.label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{theme.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-8">
        <h3 className="text-[11px] font-semibold mb-3 text-muted-foreground uppercase tracking-[3px]">Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-card/60 border border-border rounded-xl p-4 gap-4">
            <div>
              <div className="text-sm font-medium">Browser alerts</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {permission === "granted"
                  ? "Enabled — reminders pop up while ZENTRIX is open. Emails still reach you when it's closed."
                  : permission === "denied"
                  ? "Blocked in your browser settings — reminder emails still work."
                  : permission === "unsupported"
                  ? "Not supported in this browser — reminder emails still work."
                  : "Allow notifications so reminders reach you while ZENTRIX is open."}
              </div>
            </div>
            {permission === "granted" ? (
              <button
                onClick={() => sendTestNotification()}
                className="shrink-0 text-xs bg-secondary/60 border border-border rounded-lg px-3 py-2 hover:text-foreground text-muted-foreground transition-colors"
              >
                Send test
              </button>
            ) : (
              <button
                disabled={permission === "denied" || permission === "unsupported"}
                onClick={async () => {
                  const p = await requestNotificationPermission();
                  setPermission(p);
                  if (p === "granted") { startNotificationLoop(); toast.success("Notifications enabled"); }
                  else toast.error("Notifications were not enabled");
                }}
                className="shrink-0 text-xs bg-primary text-primary-foreground rounded-lg px-3 py-2 font-semibold hover:brightness-110 transition-all disabled:opacity-40"
              >
                Enable
              </button>
            )}
          </div>

          <div className="flex items-center justify-between bg-card/60 border border-border rounded-xl p-4">
            <div>
              <div className="text-sm font-medium">Daily digest</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">A morning summary of tasks, habits & reminders</div>
            </div>
            <button
              onClick={() => {
                const next = !dailyDigest;
                setDailyDigest(next);
                localStorage.setItem(DIGEST_PREF_KEY, String(next));
                if (next && permission === "granted") startNotificationLoop(); else if (!next) stopNotificationLoop();
              }}
              className={`w-12 h-6 rounded-full relative transition-all ${dailyDigest ? "bg-primary" : "bg-secondary border border-border"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dailyDigest ? "left-[26px]" : "left-0.5"}`} />
            </button>
          </div>
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
