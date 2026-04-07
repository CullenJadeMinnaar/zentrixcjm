import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import { COMPANY_INFO } from "@/lib/constants";

interface LandingScreenProps {
  onAuth: () => void;
  onPrivacy: () => void;
}

const features = [
  { icon: "🤖", title: "AI Intelligence", desc: "Your personal Jarvis — always learning, always ready", gradient: "from-primary/20 to-primary/5" },
  { icon: "🧠", title: "Mental Wellness", desc: "Daily affirmations, mood tracking, therapeutic AI", gradient: "from-accent/20 to-accent/5" },
  { icon: "⚡", title: "Smart Automations", desc: "Set it, forget it — ZENTRIX handles the rest", gradient: "from-[hsl(330_90%_60%)]/20 to-[hsl(330_90%_60%)]/5" },
  { icon: "🔔", title: "Reminders & Alerts", desc: "Never miss a thing — your AI keeps you on track", gradient: "from-[hsl(200_90%_55%)]/20 to-[hsl(200_90%_55%)]/5" },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "2M+", label: "AI Interactions" },
  { value: "98%", label: "Satisfaction" },
  { value: "24/7", label: "Always On" },
];

export default function LandingScreen({ onAuth, onPrivacy }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-hero pointer-events-none z-0 animate-glow-pulse" />
      <div className="fixed top-[300px] right-[-200px] w-[500px] h-[500px] rounded-full opacity-40 pointer-events-none z-0 animate-glow-pulse"
        style={{ background: "radial-gradient(circle, hsl(165 82% 51% / 0.1), transparent 70%)", animationDelay: "1.5s" }} />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none z-0 animate-glow-pulse"
        style={{ background: "radial-gradient(circle, hsl(330 90% 60% / 0.08), transparent 70%)", animationDelay: "3s" }} />

      {/* Header */}
      <header className="flex items-center gap-3 px-6 md:px-10 py-5 relative z-10">
        <ZentrixLogo size={36} />
        <span className="font-display font-extrabold text-lg tracking-[4px] text-gradient-primary">ZENTRIX</span>
        <nav className="ml-auto flex items-center gap-4">
          <button onClick={onPrivacy} className="text-muted-foreground text-sm hover:text-foreground transition-colors hidden sm:block">
            Privacy
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAuth}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all glow-primary"
          >
            Get started
          </motion.button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-glass border border-glass text-foreground px-5 py-2 rounded-full text-xs tracking-widest font-medium mb-10 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            AI-Powered Intelligence · {COMPANY_INFO.trialDays}-Day Free Trial
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-extrabold leading-[1.02] mb-7 tracking-tight">
            Meet your
            <br />
            <span className="text-gradient-primary">smarter self.</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-xl max-w-2xl leading-relaxed mb-12">
            ZENTRIX is the AI that knows you. Your therapist, your strategist, your reminder system — 
            all in one. Like having Jarvis, but for your entire life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 100px -20px hsl(260 100% 65% / 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onAuth}
              className="bg-gradient-to-r from-primary via-[hsl(330_90%_60%)] to-primary bg-[length:200%_auto] animate-gradient-shift text-primary-foreground px-10 py-4 rounded-2xl text-lg font-bold transition-all"
            >
              Start free trial →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPrivacy}
              className="border border-border/60 bg-glass text-foreground px-8 py-4 rounded-2xl text-lg hover:border-primary/30 transition-all"
            >
              How it works
            </motion.button>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-8 md:gap-16 mb-16"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-display font-bold text-gradient-primary">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${f.gradient} border border-glass rounded-2xl p-6 text-left hover:border-primary/30 transition-all group cursor-pointer`}
            >
              <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </span>
              <div className="font-display font-semibold text-base text-foreground mb-2">{f.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-10 py-5 border-t border-border/30 text-xs text-muted-foreground relative z-10 gap-2">
        <span>© {COMPANY_INFO.year} {COMPANY_INFO.legalName} — {COMPANY_INFO.coCeos} · Co-CEOs</span>
        <button onClick={onPrivacy} className="text-primary hover:underline">
          Privacy Policy
        </button>
      </footer>
    </div>
  );
}
