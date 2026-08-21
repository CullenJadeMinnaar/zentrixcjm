import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import FounderCard from "../3d/FounderCard";
import { COMPANY_INFO } from "@/lib/constants";

const HeroScene = lazy(() => import("../3d/HeroScene"));

interface LandingScreenProps {
  onAuth: (mode?: "login" | "register") => void;
  onPrivacy: () => void;
}

const features = [
  { icon: "🤖", title: "AI Intelligence", desc: "Your personal Morpheus — always learning, always ready" },
  { icon: "🧠", title: "Mental Wellness", desc: "Daily affirmations, mood tracking, therapeutic AI" },
  { icon: "⚡", title: "Smart Automations", desc: "Set it, forget it — ZENTRIX handles the rest" },
  { icon: "🔔", title: "Reminders & Alerts", desc: "Never miss a thing — your AI keeps you on track" },
];

const stats = [
  { value: "24/7", label: "AI Availability" },
  { value: "∞", label: "Memory Capacity" },
  { value: "<1s", label: "Response Time" },
  { value: "6", label: "Custom Themes" },
];

export default function LandingScreen({ onAuth, onPrivacy }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      {/* Ambient glow fallback */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-hero pointer-events-none z-[1] animate-glow-pulse" />

      {/* Header */}
      <header className="flex items-center gap-3 px-6 md:px-10 py-5 relative z-10">
        <ZentrixLogo size={36} />
        <span className="font-display font-extrabold text-lg tracking-[4px] text-gradient-primary">ZENTRIX</span>
        <nav className="ml-auto flex items-center gap-4">
          <button onClick={onPrivacy} className="text-muted-foreground text-sm hover:text-foreground transition-colors hidden sm:block">
            Privacy
          </button>
          <button
            onClick={() => onAuth("login")}
            className="text-foreground text-sm font-semibold hover:text-primary transition-colors"
          >
            Log in
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAuth("register")}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
          >
            Get started
          </motion.button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center relative z-10">
        <section className="flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 min-h-[80vh]">
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

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAuth("register")}
                className="bg-primary text-primary-foreground px-10 py-4 rounded-lg text-lg font-bold hover:brightness-110 transition-all glow-primary"
              >
                Start free trial →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById("founders")?.scrollIntoView({ behavior: "smooth" })}
                className="border border-border/60 bg-glass text-foreground px-8 py-4 rounded-lg text-lg hover:border-primary/30 transition-all"
              >
                Meet the team
              </motion.button>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Already with us?{" "}
              <button onClick={() => onAuth("login")} className="text-primary font-semibold hover:underline">
                Log in
              </button>
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-8"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Features */}
        <section className="w-full max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Everything you need,{" "}
              <span className="text-gradient-accent">one AI.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Morpheus adapts to you — your emotions, your goals, your rhythm.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card/60 backdrop-blur-md border border-border/50 rounded-xl p-6 text-left hover:border-primary/30 transition-all group cursor-pointer"
              >
                <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </span>
                <div className="font-display font-semibold text-base text-foreground mb-2">{f.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Founders Section */}
        <section id="founders" className="w-full max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest mb-6">
              THE VISIONARIES
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Built by{" "}
              <span className="text-gradient-warm">leaders.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              ZENTRIX was forged by two minds determined to change how humans interact with AI.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FounderCard
              name="Cullen Jade Minnaar"
              title="CEO · THE HEAD HONCHO"
              subtitle="The Big Boss · Chief Executive Officer"
              initials="CJM"
              accentColor="primary"
              delay={0.2}
              bio="The visionary architect behind ZENTRIX. Cullen doesn't just lead — he commands the future. As CEO and Head Honcho, he drives every bold decision, every breakthrough feature, and every pixel of this platform. When Cullen speaks, the industry listens. The big boss energy is real."
            />
            <FounderCard
              name="Mervin Geswind"
              title="CO-FOUNDER · 2ND IN COMMAND"
              subtitle="The Powerhouse · Co-Founder"
              initials="MG"
              accentColor="accent"
              delay={0.4}
              bio="The strategic force that turns vision into reality. Mervin is the engine room of ZENTRIX — relentless, sharp, and always two steps ahead. As Co-Founder and 2nd in Command, he ensures every system runs flawlessly and every user experience hits perfection. The right hand that moves mountains."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Ready to meet{" "}
                <span className="text-gradient-primary">Morpheus?</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Start your {COMPANY_INFO.trialDays}-day free trial. No credit card required. Your AI companion awaits.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAuth("register")}
                className="bg-primary text-primary-foreground px-12 py-4 rounded-lg text-lg font-bold hover:brightness-110 transition-all glow-primary"
              >
                Begin your journey →
              </motion.button>
              <p className="text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <button onClick={() => onAuth("login")} className="text-primary font-semibold hover:underline">
                  Log in
                </button>
              </p>
            </div>
          </motion.div>
        </section>
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
