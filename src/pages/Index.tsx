import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import { applyTheme, getSavedTheme } from "@/lib/themes";
import LandingScreen from "@/components/screens/LandingScreen";
import AuthScreen from "@/components/screens/AuthScreen";
import PaywallScreen from "@/components/screens/PaywallScreen";
import DashboardScreen from "@/components/screens/DashboardScreen";
import PrivacyScreen from "@/components/screens/PrivacyScreen";
import { RateLimiter, sanitize, validateEmail, validatePassword } from "@/lib/auth-helpers";
import { PLANS } from "@/lib/constants";
import { streamChat } from "@/lib/chat-stream";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loadMemory, buildMemoryPrompt } from "@/lib/memory";
import { startNotificationLoop, stopNotificationLoop, notificationsPermission } from "@/lib/notifications";

type Screen = "landing" | "auth" | "paywall" | "dashboard" | "privacy";
type AuthMode = "login" | "register" | "forgot";

const authLimiter = new RateLimiter(5, 15 * 60 * 1000);

interface User {
  name: string;
  email: string;
}

const USER_CACHE_KEY = "zentrix_user";
const PLAN_CACHE_KEY = "zentrix_plan";

const Index = () => {
  // ⚡ Hydrate instantly from localStorage so the dashboard appears with no flash
  const cachedUserRaw = typeof window !== "undefined" ? localStorage.getItem(USER_CACHE_KEY) : null;
  const cachedUser: User | null = cachedUserRaw ? (() => { try { return JSON.parse(cachedUserRaw); } catch { return null; } })() : null;
  const cachedPlan = typeof window !== "undefined" ? localStorage.getItem(PLAN_CACHE_KEY) : null;

  const [screen, setScreen] = useState<Screen>(cachedUser ? "dashboard" : "landing");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<User | null>(cachedUser);
  const [planLabel, setPlanLabel] = useState(cachedPlan || (cachedUser ? "Trial" : ""));
  const [authError, setAuthError] = useState("");
  const [authLocked, setAuthLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [authLoading, setAuthLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hey! 👋 I'm **ZENTRIX** — think of me as your personal Morpheus. I'm part AI assistant, part life coach, part therapist, part best friend.\n\nI'm here to help you **think clearer**, **feel better**, and **move smarter**. Whether you need to vent, strategize, or just have someone to talk to — I'm always here.\n\nWhat's on your mind today?" },
  ]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null!);

  // Theme
  useEffect(() => { applyTheme(getSavedTheme()); }, []);

  // Start notification loop when signed in and permission is granted
  useEffect(() => {
    if (!user) { stopNotificationLoop(); return; }
    if (notificationsPermission() === "granted") startNotificationLoop();
    return () => stopNotificationLoop();
  }, [user]);

  // Background session validation (non-blocking)
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (!session?.user) {
        // No valid session → clear cache and bounce to landing
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(PLAN_CACHE_KEY);
        setUser(null);
        setPlanLabel("");
        setScreen((s) => (s === "dashboard" ? "landing" : s));
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", session.user.id)
        .single();

      // Plan entitlement is server-authoritative — never trust localStorage
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_label")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!mounted) return;
      const next: User = {
        name: profile?.display_name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
      };
      setUser(next);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(next));
      const serverPlan = subscription?.plan_label || "Trial";
      setPlanLabel(serverPlan);
      localStorage.setItem(PLAN_CACHE_KEY, serverPlan);
      setScreen((s) => (s === "landing" || s === "auth" ? "dashboard" : s));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(PLAN_CACHE_KEY);
        setUser(null);
        setPlanLabel("");
        setScreen((s) => (s === "dashboard" ? "landing" : s));
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  // Lock countdown
  useEffect(() => {
    if (!authLocked) return;
    const t = setInterval(() => {
      setLockCountdown((c) => {
        if (c <= 1) { setAuthLocked(false); clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [authLocked]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const handleAuth = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const email = sanitize((form.elements.namedItem("email") as HTMLInputElement)?.value || "");
      const password = sanitize((form.elements.namedItem("password") as HTMLInputElement)?.value || "");
      const name = sanitize((form.elements.namedItem("name") as HTMLInputElement)?.value || "");

      if (!validateEmail(email)) { setAuthError("Enter a valid email address."); return; }

      if (authMode === "forgot") {
        setAuthLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        setAuthLoading(false);
        if (error) setAuthError(error.message);
        else { toast.success("Check your email for a password reset link."); setAuthMode("login"); }
        return;
      }

      if (!validatePassword(password)) { setAuthError("Password must be 8–128 characters."); return; }

      const result = authLimiter.check(email);
      if (result.blocked) {
        const mins = Math.ceil(result.resetInMs / 60000);
        setAuthLocked(true);
        setLockCountdown(Math.ceil(result.resetInMs / 1000));
        setAuthError(`Too many attempts. Try again in ${mins} min.`);
        return;
      }

      setAuthError("");
      setAuthLoading(true);

      if (authMode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        setAuthLoading(false);
        if (error) setAuthError(error.message);
        else { toast.success("Check your email to verify your account, then sign in."); setAuthMode("login"); }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        setAuthLoading(false);
        if (error) {
          setAuthError(error.message);
        } else if (data.user) {
          // ⚡ Optimistic instant transition
          const newUser: User = {
            name: data.user.user_metadata?.full_name || email.split("@")[0],
            email,
          };
          setUser(newUser);
          setPlanLabel("Trial");
          setScreen("dashboard");
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));
          localStorage.setItem(PLAN_CACHE_KEY, "Trial");
        }
      }
    },
    [authMode]
  );

  const handleSubscribe = async (planId: string) => {
    const selected = PLANS.find((p) => p.id === planId);
    if (!selected) { setPayError("Invalid plan selected."); return; }
    setPayError("");
    // Plan entitlements are granted server-side only (after payment).
    // The client can never grant itself a plan — re-read the authoritative value.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setScreen("auth"); return; }
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_label")
      .eq("user_id", session.user.id)
      .maybeSingle();
    const serverPlan = subscription?.plan_label || "Trial";
    setPlanLabel(serverPlan);
    localStorage.setItem(PLAN_CACHE_KEY, serverPlan);
    setScreen("dashboard");
    if (serverPlan !== selected.label) {
      toast.info(`Your ${serverPlan} access stays active until payment for ${selected.label} is confirmed.`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(PLAN_CACHE_KEY);
    setUser(null);
    setPlanLabel("");
    setScreen("landing");
  };

  const handleSendMessage = async () => {
    const clean = sanitize(input);
    if (!clean || aiLoading) return;

    const userMsg = { role: "user" as const, content: clean };
    const updatedMessages = [...aiMessages, userMsg];
    setAiMessages(updatedMessages);
    setInput("");
    setAiLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setAiMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > updatedMessages.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const memoryContext = buildMemoryPrompt(loadMemory());
      await streamChat({
        messages: updatedMessages,
        memoryContext,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setAiLoading(false),
        onError: (err) => { toast.error(err); setAiLoading(false); },
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect to ZENTRIX AI");
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {screen === "landing" && (
        <LandingScreen onAuth={() => setScreen("auth")} onPrivacy={() => setScreen("privacy")} />
      )}
      {screen === "auth" && (
        <AuthScreen
          mode={authMode}
          setMode={setAuthMode}
          onSubmit={handleAuth}
          error={authError}
          locked={authLocked}
          countdown={lockCountdown}
          loading={authLoading}
          onBack={() => setScreen("landing")}
        />
      )}
      {screen === "paywall" && (
        <PaywallScreen
          userName={user?.name || ""}
          onSelect={handleSubscribe}
          error={payError}
        />
      )}
      {screen === "dashboard" && user && (
        <DashboardScreen
          user={user}
          planLabel={planLabel || "Trial"}
          messages={aiMessages}
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          loading={aiLoading}
          chatEndRef={chatEndRef}
          onPrivacy={() => setScreen("privacy")}
          onLogout={handleLogout}
        />
      )}
      {screen === "privacy" && (
        <PrivacyScreen onBack={() => setScreen(user ? "dashboard" : "landing")} />
      )}
    </div>
  );
};

export default Index;
