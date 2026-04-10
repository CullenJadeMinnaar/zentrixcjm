import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import ZentrixLogo from "../ZentrixLogo";
import { lovable } from "@/integrations/lovable/index";

type AuthMode = "login" | "register" | "forgot";

interface AuthScreenProps {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  error: string;
  locked: boolean;
  countdown: number;
  loading?: boolean;
  onBack: () => void;
}

export default function AuthScreen({ mode, setMode, onSubmit, error, locked, countdown, loading, onBack }: AuthScreenProps) {
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setGoogleLoading(false);
    }
    if (result.redirected) return;
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card/80 border border-border rounded-xl p-8 md:p-10 w-full max-w-md relative z-10 backdrop-blur-sm"
      >
        <button onClick={onBack} className="text-muted-foreground text-sm hover:text-foreground mb-5 block transition-colors">
          ← Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <ZentrixLogo size={32} />
          <span className="font-display font-extrabold text-lg tracking-[4px] text-gradient-primary">ZENTRIX</span>
        </div>

        <h2 className="text-3xl font-display font-bold mb-1">
          {mode === "login" ? "Welcome back" : mode === "register" ? "Join ZENTRIX" : "Reset password"}
        </h2>
        <p className="text-sm text-muted-foreground mb-7">
          {mode === "login"
            ? "Your intelligence layer is waiting"
            : mode === "register"
            ? "Start your 14-day free trial — no card needed"
            : "We'll send a reset link to your email"}
        </p>

        {locked && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm mb-4"
          >
            🔒 Locked — try again in {mins}:{String(secs).padStart(2, "0")}
          </motion.div>
        )}
        {error && !locked && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm mb-4"
          >
            {error}
          </motion.div>
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
                disabled={locked || loading}
                className="bg-secondary/50 border border-border rounded-lg px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all disabled:opacity-50"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium tracking-wide">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@email.com"
              maxLength={254}
              autoComplete="email"
              required
              disabled={locked || loading}
              className="bg-secondary/50 border border-border rounded-lg px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all disabled:opacity-50"
            />
          </div>
          {mode !== "forgot" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium tracking-wide">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  maxLength={128}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  disabled={locked || loading}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={locked || loading}
            className="bg-primary text-primary-foreground w-full py-3.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />}
            {loading
              ? "Please wait..."
              : mode === "login" ? "Sign in" : mode === "register" ? "Create account →" : "Send reset link"}
          </motion.button>
        </form>

        <div className="flex gap-3 justify-center mt-6 text-sm text-muted-foreground">
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

        <p className="text-[11px] text-muted-foreground/40 text-center mt-5 leading-relaxed">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
