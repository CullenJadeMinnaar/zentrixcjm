import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import { PLANS, COMPANY_INFO } from "@/lib/constants";

interface PaywallScreenProps {
  userName: string;
  onSelect: (planId: string) => void;
  error: string;
}

export default function PaywallScreen({ userName, onSelect, error }: PaywallScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <ZentrixLogo size={30} />
          <span className="font-display font-extrabold text-lg tracking-[4px] text-gradient-primary">ZENTRIX</span>
        </div>

        <h2 className="text-4xl font-extrabold mb-3 font-display">Choose your plan</h2>
        <p className="text-muted-foreground text-base mb-2">
          Welcome, <span className="text-foreground font-medium">{userName}</span>. Activate your intelligence layer.
        </p>
        <p className="text-sm font-medium mb-10">
          <span className="text-accent">
            🎉 {COMPANY_INFO.trialDays}-day free trial on all plans — no card required
          </span>
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm mb-6 inline-block">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`relative bg-card/80 border rounded-xl p-7 text-left transition-all backdrop-blur-sm ${
                plan.popular
                  ? "border-primary/50 glow-primary"
                  : "border-border hover:border-primary/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] px-4 py-1 rounded-full font-semibold whitespace-nowrap">
                  Most popular
                </div>
              )}
              {"badge" in plan && plan.badge && !plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[11px] px-4 py-1 rounded-full font-semibold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="text-xs text-muted-foreground tracking-widest uppercase mb-3 font-medium">{plan.label}</div>
              <div className="text-4xl font-extrabold mb-0.5 font-display">
                {plan.price}
                <span className="text-base font-normal text-muted-foreground">{plan.period}</span>
              </div>
              <div className="text-xs text-muted-foreground/50 mb-6">{plan.usd} USD</div>

              <ul className="flex flex-col gap-3 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-secondary-foreground/80 flex items-start gap-2.5">
                    <span className="text-primary mt-0.5 text-xs">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(plan.id)}
                className={`w-full py-3.5 rounded-lg text-sm font-bold transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:brightness-110"
                    : "bg-transparent border border-primary/40 text-primary hover:bg-primary/10"
                }`}
              >
                {plan.popular ? "Start free trial →" : "Choose plan"}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/40">
          Secure payments via Stripe / PayFast. Cancel anytime. No hidden fees.
        </p>
      </motion.div>
    </div>
  );
}
