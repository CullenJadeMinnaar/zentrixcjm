import { motion } from "framer-motion";

interface FounderCardProps {
  name: string;
  title: string;
  subtitle: string;
  initials: string;
  delay?: number;
  accentColor?: string;
  bio: string;
}

export default function FounderCard({ name, title, subtitle, initials, delay = 0, accentColor = "primary", bio }: FounderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/30 via-transparent to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-500">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accentColor === "accent" ? "from-accent/20 to-accent/5" : "from-primary/20 to-primary/5"} border ${accentColor === "accent" ? "border-accent/30" : "border-primary/30"} flex items-center justify-center`}>
            <span className={`font-display text-2xl font-bold ${accentColor === "accent" ? "text-accent" : "text-primary"}`}>
              {initials}
            </span>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">{name}</h3>
            <p className={`text-sm font-semibold ${accentColor === "accent" ? "text-accent" : "text-primary"} tracking-wide`}>{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>

        {/* Decorative line */}
        <div className={`mt-6 h-[2px] w-16 bg-gradient-to-r ${accentColor === "accent" ? "from-accent/60 to-transparent" : "from-primary/60 to-transparent"} rounded-full`} />
      </div>
    </motion.div>
  );
}
