import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import { COMPANY_INFO } from "@/lib/constants";

interface LandingScreenProps {
  onAuth: () => void;
  onPrivacy: () => void;
}

const features = [
  { icon: "🤖", title: "AI Intelligence", desc: "Your personal Morpheus — always learning, always ready" },
  { icon: "🧠", title: "Mental Wellness", desc: "Daily affirmations, mood tracking, therapeutic AI" },
  { icon: "⚡", title: "Smart Automations", desc: "Set it, forget it — ZENTRIX handles the rest" },
  { icon: "🔔", title: "Reminders & Alerts", desc: "Never miss a thing — your AI keeps you on track" },
];

export default function LandingScreen({ onAuth, onPrivacy }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-hero pointer-events-none z-0 animate-glow-pulse" />

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
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
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
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI-Powered Intelligence · {COMPANY_INFO.trialDays}-Day Free Trial
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-extrabold leading-[1.02] mb-7 tracking-tight">
            Meet your
            <br />
            <span className="text-gradient-primary">smarter self.</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-xl max-w-2xl leading-relaxed mb-12">
            ZENTRIX is the AI that knows you. Your therapist, your strategist, your reminder system — 
            all in one. Like having Morpheus guiding you through life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAuth}
              className="bg-primary text-primary-foreground px-10 py-4 rounded-lg text-lg font-bold hover:brightness-110 transition-all glow-primary"
            >
              Start free trial →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPrivacy}
              className="border border-border/60 bg-glass text-foreground px-8 py-4 rounded-lg text-lg hover:border-primary/30 transition-all"
            >
              How it works
            </motion.button>
          </div>
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
              className="bg-card/60 border border-border/50 rounded-xl p-6 text-left hover:border-primary/30 transition-all group cursor-pointer"
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
