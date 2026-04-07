export const PLANS = [
  {
    id: "weekly",
    label: "Weekly",
    price: "R29",
    period: "/week",
    usd: "$1.59",
    features: ["AI assistant", "5 tasks/day", "Basic insights"],
    popular: false,
  },
  {
    id: "monthly",
    label: "Monthly",
    price: "R99",
    period: "/month",
    usd: "$5.49",
    features: ["Everything in Weekly", "Unlimited tasks", "Smart automations", "Priority support"],
    popular: true,
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "R799",
    period: "/year",
    usd: "$43.99",
    features: ["Everything in Monthly", "Team features", "API access", "Custom AI persona", "2 months free"],
    popular: false,
    badge: "Best value",
  },
] as const;

export type Plan = (typeof PLANS)[number];

export const MAX_INPUT_LENGTH = 4096;

export const COMPANY_INFO = {
  name: "ZENTRIX",
  legalName: "ZENTRIX (Pty) Ltd",
  country: "South Africa",
  coCeos: "Cullen Minnaar & Mervin Geswind",
  privacyEmail: "privacy@zentrix.ai",
  securityEmail: "security@zentrix.ai",
  year: 2026,
  trialDays: 14,
};
