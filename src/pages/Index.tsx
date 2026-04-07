import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import LandingScreen from "@/components/screens/LandingScreen";
import AuthScreen from "@/components/screens/AuthScreen";
import PaywallScreen from "@/components/screens/PaywallScreen";
import DashboardScreen from "@/components/screens/DashboardScreen";
import PrivacyScreen from "@/components/screens/PrivacyScreen";
import { RateLimiter, sanitize, validateEmail, validatePassword } from "@/lib/auth-helpers";
import { PLANS } from "@/lib/constants";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";

type Screen = "landing" | "auth" | "paywall" | "dashboard" | "privacy";
type AuthMode = "login" | "register" | "forgot";

const authLimiter = new RateLimiter(5, 15 * 60 * 1000);

interface User {
  name: string;
  email: string;
}

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [planLabel, setPlanLabel] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLocked, setAuthLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [payError, setPayError] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hey there! I'm **ZENTRIX** — your personal intelligence layer. Think of me as your Jarvis. I'm here to help you think smarter, move faster, and stay ahead. What's on your mind?" },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null!);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const handleAuth = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const email = sanitize((form.elements.namedItem("email") as HTMLInputElement)?.value || "");
      const password = sanitize((form.elements.namedItem("password") as HTMLInputElement)?.value || "");
      const name = sanitize((form.elements.namedItem("name") as HTMLInputElement)?.value || "");

      if (!validateEmail(email)) { setAuthError("Enter a valid email address."); return; }
      if (authMode !== "forgot" && !validatePassword(password)) {
        setAuthError("Password must be 8–128 characters."); return;
      }

      const result = authLimiter.check(email);
      if (result.blocked) {
        const mins = Math.ceil(result.resetInMs / 60000);
        setAuthLocked(true);
        setLockCountdown(Math.ceil(result.resetInMs / 1000));
        setAuthError(`Too many attempts. Try again in ${mins} min.`);
        return;
      }

      setAuthError("");
      setUser({ email, name: name || email.split("@")[0] });
      setScreen("paywall");
    },
    [authMode]
  );

  const handleSubscribe = (planId: string) => {
    const selected = PLANS.find((p) => p.id === planId);
    if (!selected) { setPayError("Invalid plan selected."); return; }
    setPlanLabel(selected.label);
    setScreen("dashboard");
  };

  const handleSendMessage = async () => {
    const clean = sanitize(input);
    if (!clean || aiLoading) return;

    const newMessages: { role: "user" | "assistant"; content: string }[] = [...aiMessages, { role: "user", content: clean }];
    setAiMessages(newMessages);
    setInput("");
    setAiLoading(true);

    // Mock AI response
    setTimeout(() => {
      setAiMessages((msgs) => [
        ...msgs,
        {
          role: "assistant" as const,
          content:
            "I'm here to help — your ZENTRIX AI is ready. Connect your API key via backend to activate live responses.",
        },
      ]);
      setAiLoading(false);
    }, 1200);
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
          planLabel={planLabel}
          messages={aiMessages}
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          loading={aiLoading}
          chatEndRef={chatEndRef}
          onPrivacy={() => setScreen("privacy")}
          onLogout={() => {
            setUser(null);
            setPlanLabel("");
            setScreen("landing");
          }}
        />
      )}
      {screen === "privacy" && (
        <PrivacyScreen onBack={() => setScreen(user ? "dashboard" : "landing")} />
      )}
    </div>
  );
};

export default Index;
