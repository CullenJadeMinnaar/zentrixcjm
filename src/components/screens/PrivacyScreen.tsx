import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import { COMPANY_INFO } from "@/lib/constants";

interface PrivacyScreenProps {
  onBack: () => void;
}

const sections = [
  { title: "1. Who we are", body: `${COMPANY_INFO.legalName} is a private company registered in ${COMPANY_INFO.country}. Co-CEOs: ${COMPANY_INFO.coCeos}. Contact: ${COMPANY_INFO.privacyEmail}. We operate an AI-powered SaaS platform for personal and SME intelligence.` },
  { title: "2. What data we collect", body: "We collect: your email address, name, and usage data (chat logs, feature usage). We do not collect biometric data, government IDs, or financial details beyond what Stripe processes." },
  { title: "3. How we use your data", body: "To provide and improve our services, personalise your AI experience, send essential service communications, process payments, and comply with legal obligations." },
  { title: "4. Data sharing", body: "We share data with: Anthropic (AI processing, under DPA), Stripe/PayFast (payments), hosting providers (encrypted at rest). We never sell your data to advertisers or data brokers." },
  { title: "5. Data retention", body: "Chat logs: 90 days. Account data: duration of account + 30 days. Payment records: as required by law. You can request deletion at any time." },
  { title: "6. Your rights (POPIA)", body: "You have the right to: access your data, correct inaccurate data, request deletion, object to processing, data portability, withdraw consent, and lodge a complaint with the Information Regulator." },
  { title: "7. Security", body: "We use TLS 1.3 encryption in transit, AES-256 at rest, bcrypt password hashing, rate limiting, input sanitization, and regular security audits. We will notify you within 72 hours of any confirmed breach." },
  { title: "8. Cookies", body: "We use only essential cookies for authentication and session management. No advertising or tracking cookies. No third-party analytics that identify you." },
  { title: "9. Children", body: "ZENTRIX is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has registered, contact us immediately." },
  { title: "10. Changes to this policy", body: "We will notify you of material changes via email or in-app notification at least 14 days before they take effect. Continued use after that date constitutes acceptance." },
  { title: "11. Contact", body: `${COMPANY_INFO.legalName} · ${COMPANY_INFO.privacyEmail} · For urgent security issues: ${COMPANY_INFO.securityEmail}` },
];

export default function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  return (
    <div className="min-h-screen flex justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl p-8 md:p-11"
      >
        <button onClick={onBack} className="text-muted-foreground text-sm hover:text-foreground mb-5 block">
          ← Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <ZentrixLogo size={26} />
          <span className="font-display font-extrabold text-base tracking-[3px] text-foreground">ZENTRIX</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: 1 January {COMPANY_INFO.year} · {COMPANY_INFO.legalName}, {COMPANY_INFO.country}
        </p>

        {sections.map((s) => (
          <section key={s.title} className="mb-6">
            <h3 className="text-sm font-semibold mb-1.5 text-primary">{s.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </motion.div>
    </div>
  );
}
