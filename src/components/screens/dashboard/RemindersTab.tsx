import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Reminder {
  id: string;
  title: string;
  time: string;
  recurring: boolean;
  category: string;
  active: boolean;
  triggered: boolean;
}

const defaultReminders: Reminder[] = [
  { id: "1", title: "Morning meditation", time: "07:00", recurring: true, category: "wellness", active: true, triggered: false },
  { id: "2", title: "Drink water", time: "Every 2 hours", recurring: true, category: "health", active: true, triggered: false },
  { id: "3", title: "Team standup", time: "09:30", recurring: true, category: "work", active: true, triggered: false },
  { id: "4", title: "Lunch break — step outside", time: "12:30", recurring: true, category: "wellness", active: false, triggered: false },
  { id: "5", title: "Review daily goals", time: "17:00", recurring: true, category: "productivity", active: true, triggered: false },
];

const categories = [
  { id: "all", label: "All", icon: "📋" },
  { id: "wellness", label: "Wellness", icon: "🧘" },
  { id: "health", label: "Health", icon: "💚" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "productivity", label: "Productivity", icon: "🎯" },
];

const alerts = [
  { id: "a1", message: "🧘 Time for your morning meditation", time: "2 min ago", read: false },
  { id: "a2", message: "💧 Hydration check — drink some water!", time: "1 hour ago", read: false },
  { id: "a3", message: "📊 Your weekly productivity report is ready", time: "3 hours ago", read: true },
  { id: "a4", message: "💬 Daily self-worth quote is waiting for you", time: "5 hours ago", read: true },
];

export default function RemindersTab() {
  const [reminders, setReminders] = useState(defaultReminders);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newCategory, setNewCategory] = useState("wellness");
  const [notifAlerts, setNotifAlerts] = useState(alerts);

  const filtered = activeCategory === "all" ? reminders : reminders.filter(r => r.category === activeCategory);

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const addReminder = () => {
    if (!newTitle.trim()) return;
    setReminders(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newTitle,
        time: newTime || "Custom",
        recurring: false,
        category: newCategory,
        active: true,
        triggered: false,
      },
    ]);
    setNewTitle("");
    setNewTime("");
    setShowNewForm(false);
  };

  const markRead = (id: string) => {
    setNotifAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const unreadCount = notifAlerts.filter(a => !a.read).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setNotifAlerts(prev => prev.map(a => ({ ...a, read: true })))}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Mark all read
          </button>
        </div>
        <div className="space-y-2">
          {notifAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => markRead(alert.id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                alert.read ? "opacity-50" : "bg-primary/5 border border-primary/10"
              }`}
            >
              {!alert.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />}
              <span className="text-sm flex-1">{alert.message}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{alert.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Reminders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Reminders</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            + New Reminder
          </motion.button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* New Reminder Form */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-primary/20 rounded-2xl p-5 mb-4"
            >
              <div className="flex flex-col gap-3">
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="What should ZENTRIX remind you about?"
                  className="bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex gap-3">
                  <input
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    placeholder="Time (e.g., 09:00)"
                    className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {categories.filter(c => c.id !== "all").map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={addReminder} className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold">
                    Add Reminder
                  </button>
                  <button onClick={() => setShowNewForm(false)} className="text-muted-foreground text-sm px-4 py-2">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminder List */}
        <div className="space-y-2">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                r.active ? "bg-card border-border" : "bg-card/50 border-border/50 opacity-60"
              }`}
            >
              <span className="text-lg">{categories.find(c => c.id === r.category)?.icon || "📋"}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${!r.active ? "line-through text-muted-foreground" : ""}`}>{r.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {r.time} {r.recurring && "· Recurring"}
                </div>
              </div>
              <button
                onClick={() => toggleReminder(r.id)}
                className={`w-11 h-6 rounded-full relative transition-all ${
                  r.active ? "bg-primary" : "bg-secondary border border-border"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  r.active ? "left-[22px]" : "left-0.5"
                }`} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
