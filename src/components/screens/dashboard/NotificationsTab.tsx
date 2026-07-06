import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  notificationsPermission,
  requestNotificationPermission,
  sendTestNotification,
  startNotificationLoop,
} from "@/lib/notifications";
import { remindersApi, type Reminder } from "@/lib/productivity";

type PermState = NotificationPermission | "unsupported";

const STATE_COPY: Record<PermState, { label: string; tone: string; hint: string }> = {
  granted: { label: "Enabled", tone: "bg-primary/10 text-primary border-primary/20", hint: "You'll receive reminders and daily briefings." },
  denied:  { label: "Blocked", tone: "bg-destructive/10 text-destructive border-destructive/20", hint: "Notifications are blocked. Update your browser site settings to re-enable." },
  default: { label: "Not enabled", tone: "bg-secondary text-muted-foreground border-border", hint: "Enable browser notifications to get reminders even when this tab is in the background." },
  unsupported: { label: "Unsupported", tone: "bg-secondary text-muted-foreground border-border", hint: "This browser doesn't support notifications." },
};

function fmtWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const same = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return same ? `Today ${time}` : `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`;
}

export default function NotificationsTab() {
  const [perm, setPerm] = useState<PermState>("default");
  const [upcoming, setUpcoming] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setPerm(notificationsPermission());
    try {
      const all = await remindersApi.list();
      setUpcoming(all.filter(r => r.active).slice(0, 20));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);

  const enable = async () => {
    const p = await requestNotificationPermission();
    setPerm(p);
    if (p === "granted") {
      startNotificationLoop();
      const ok = await sendTestNotification();
      if (ok) toast.success("Notifications enabled");
    } else if (p === "denied") {
      toast.error("Notifications blocked in browser settings");
    }
  };

  const test = async () => {
    const ok = await sendTestNotification();
    if (!ok) toast.error("Could not send a test notification");
  };

  const state = STATE_COPY[perm];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">Reminders, briefings and smart nudges from Morpheus</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card/60 border border-border rounded-xl p-5 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <div className="font-display font-semibold text-sm">Browser notifications</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{state.hint}</div>
          </div>
          <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border font-semibold ${state.tone}`}>
            {state.label}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {perm !== "granted" && perm !== "unsupported" && (
            <button onClick={enable} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
              Enable notifications
            </button>
          )}
          {perm === "granted" && (
            <button onClick={test} className="bg-secondary/60 border border-border px-4 py-2 rounded-lg text-sm hover:text-foreground text-muted-foreground transition-colors">
              Send test notification
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card/50 border border-border/60 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Daily briefing</div>
          <div className="text-sm mt-2">A morning summary of your open tasks and today's events, delivered around 7 AM.</div>
        </div>
        <div className="bg-card/50 border border-border/60 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Reminders</div>
          <div className="text-sm mt-2">Anything you schedule in the Reminders tab fires here — daily, weekly, monthly or one-off.</div>
        </div>
        <div className="bg-card/50 border border-border/60 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Smart nudges</div>
          <div className="text-sm mt-2">Morpheus can nudge you when a habit streak is at risk or a goal deadline nears.</div>
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Upcoming</h3>
        {loading ? (
          <div className="h-24 bg-card/40 border border-border rounded-xl animate-pulse" />
        ) : upcoming.length === 0 ? (
          <div className="text-sm text-muted-foreground bg-card/40 border border-border rounded-xl p-6 text-center">
            No active reminders. Add one in the Reminders tab.
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-card/50 border border-border/50">
                <span className="text-base">🔔</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  {r.body && <div className="text-[11px] text-muted-foreground truncate">{r.body}</div>}
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-foreground/80">{fmtWhen(r.remind_at)}</div>
                  {r.recurrence !== "none" && (
                    <div className="text-[10px] text-muted-foreground capitalize">{r.recurrence}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
