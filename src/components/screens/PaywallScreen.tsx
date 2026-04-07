import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import { PLANS, type Plan, COMPANY_INFO } from "@/lib/constants";

interface PaywallScreenProps {
  userName: string;
  onSelect: (planId: string) => void;
  error: string;
}

export default function PaywallScreen({ userName, onSelect, error }: PaywallScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <ZentrixLogo size={26} />
          <span className="font-display font-extrabold text-base tracking-[3px] text-foreground">ZENTRIX</span>
        </div>

        <h2 className="text-3xl font-extrabold mb-2 font-display">Choose your plan</h2>
        <p className="text-muted-foreground text-sm mb-2">
          Welcome, {userName}. Activate your intelligence layer.
        </p>
        <p className="text-primary text-sm font-medium mb-8">
          🎉 {COMPANY_INFO.trialDays}-day free trial on all plans — no card required
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm mb-6 inline-block">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card border rounded-2xl p-7 text-left transition-all hover:scale-[1.02] ${
                plan.popular
                  ? "border-primary glow-primary"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                  Most popular
                </div>
              )}
              {"badge" in plan && plan.badge && !plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[11px] px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="text-xs text-muted-foreground tracking-widest uppercase mb-2">{plan.label}</div>
              <div className="text-4xl font-extrabold mb-0.5 font-display">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
              </div>
              <div className="text-xs text-muted-foreground/60 mb-5">{plan.usd} USD</div>

              <ul className="flex flex-col gap-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-secondary-foreground/80 flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelect(plan.id)}
                className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:brightness-110"
                    : "bg-transparent border border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {plan.popular ? "Start free trial" : "Choose plan"}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/50">
          Secure payments via Stripe / PayFast. Cancel anytime. No hidden fees.
        </p>
      </motion.div>
    </div>
  );
}
