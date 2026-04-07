import { FormEvent } from "react";
import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";

type AuthMode = "login" | "register" | "forgot";

interface AuthScreenProps {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  error: string;
  locked: boolean;
  countdown: number;
  onBack: () => void;
}

export default function AuthScreen({ mode, setMode, onSubmit, error, locked, countdown, onBack }: AuthScreenProps) {
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 md:p-10 w-full max-w-md"
      >
        <button onClick={onBack} className="text-muted-foreground text-sm hover:text-foreground mb-5 block">
          ← Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <ZentrixLogo size={28} />
          <span className="font-display font-extrabold text-base tracking-[3px] text-foreground">ZENTRIX</span>
        </div>

        <h2 className="text-2xl font-bold mb-1">
          {mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Reset password"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "login"
            ? "Sign in to your intelligence layer"
            : mode === "register"
            ? "Start your 14-day free trial"
            : "We'll send a reset link"}
        </p>

        {locked && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm mb-4">
            🔒 Locked — try again in {mins}:{String(secs).padStart(2, "0")}
          </div>
        )}
        {error && !locked && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium tracking-wide">Full name</label>
              <input
                name="name"
                type="text"
                placeholder="Your name"
                maxLength={100}
                autoComplete="name"
                required={mode === "register"}
                disabled={locked}
                className="bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium tracking-wide">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@zentrix.ai"
              maxLength={254}
              autoComplete="email"
              required
              disabled={locked}
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
            />
          </div>
          {mode !== "forgot" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium tracking-wide">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                maxLength={128}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                disabled={locked}
                className="bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={locked}
            className="bg-primary text-primary-foreground w-full py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 mt-2"
          >
            {mode === "login" ? "Sign in" : mode === "register" ? "Start free trial" : "Send reset link"}
          </button>
        </form>

        <div className="flex gap-3 justify-center mt-5 text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              <button onClick={() => setMode("register")} className="text-primary hover:underline">Create account</button>
              <span>·</span>
              <button onClick={() => setMode("forgot")} className="text-primary hover:underline">Forgot password?</button>
            </>
          ) : (
            <button onClick={() => setMode("login")} className="text-primary hover:underline">← Back to sign in</button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground/60 text-center mt-4 leading-relaxed">
          By continuing you agree to our Terms and Privacy Policy. Max 5 attempts per 15 minutes.
        </p>
      </motion.div>
    </div>
  );
}
