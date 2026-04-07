import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import { COMPANY_INFO } from "@/lib/constants";

interface LandingScreenProps {
  onAuth: () => void;
  onPrivacy: () => void;
}

const features = [
  { icon: "◈", title: "AI Assistant", desc: "24/7 intelligent guidance for every decision" },
  { icon: "⬡", title: "Smart Automation", desc: "Automate repetitive tasks without code" },
  { icon: "◎", title: "Personal Insights", desc: "Weekly intelligence reports tailored to you" },
  { icon: "⬟", title: "Business Intelligence", desc: "SME-grade analytics at a fraction of the cost" },
];

export default function LandingScreen({ onAuth, onPrivacy }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Glow effects */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-hero pointer-events-none z-0" />
      <div className="fixed top-[100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, hsl(40 95% 60% / 0.08), transparent 70%)" }} />

      {/* Header */}
      <header className="flex items-center gap-3 px-6 md:px-10 py-5 border-b border-border/50 relative z-10">
        <ZentrixLogo size={32} />
        <span className="font-display font-extrabold text-lg tracking-[3px] text-foreground">ZENTRIX</span>
        <nav className="ml-auto flex items-center gap-4">
          <button onClick={onPrivacy} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            Privacy
          </button>
          <button
            onClick={onAuth}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
          >
            Get started
          </button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs tracking-widest font-medium mb-8">
            AI-Powered Intelligence Layer · {COMPANY_INFO.trialDays}-Day Free Trial
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
            Your decisions,
            <br />
            <span className="text-gradient-primary">supercharged.</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed mb-10">
            ZENTRIX is the always-on AI system for people and businesses who refuse to fall behind.
            Daily intelligence. Real decisions. Unstoppable execution.
          </p>

          <div className="flex gap-4 mb-16">
            <button
              onClick={onAuth}
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-bold hover:brightness-110 transition-all glow-primary"
            >
              Start free trial
            </button>
            <button
              onClick={onPrivacy}
              className="border border-border text-muted-foreground px-6 py-3.5 rounded-xl text-base hover:text-foreground hover:border-foreground/30 transition-all"
            >
              How it works →
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-card/50 border border-border/60 rounded-2xl p-5 text-left hover:border-primary/30 hover:bg-card transition-all group"
            >
              <span className="text-2xl text-primary block mb-3 group-hover:scale-110 transition-transform inline-block">
                {f.icon}
              </span>
              <div className="font-semibold text-sm text-foreground mb-1.5">{f.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-10 py-4 border-t border-border/50 text-xs text-muted-foreground relative z-10 gap-2">
        <span>© {COMPANY_INFO.year} {COMPANY_INFO.legalName} — {COMPANY_INFO.coCeos} · Co-CEOs</span>
        <button onClick={onPrivacy} className="text-primary hover:underline">
          Privacy Policy
        </button>
      </footer>
    </div>
  );
}
