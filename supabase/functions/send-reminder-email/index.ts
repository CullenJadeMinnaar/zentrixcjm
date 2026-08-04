import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function nextOccurrence(iso: string, recurrence: string): string | null {
  const d = new Date(iso);
  const now = Date.now();
  if (!recurrence || recurrence === "none") return null;
  let guard = 0;
  while (d.getTime() <= now && guard++ < 1000) {
    switch (recurrence) {
      case "daily": d.setDate(d.getDate() + 1); break;
      case "weekly": d.setDate(d.getDate() + 7); break;
      case "monthly": d.setMonth(d.getMonth() + 1); break;
      case "yearly": d.setFullYear(d.getFullYear() + 1); break;
      default: return null;
    }
  }
  return d.toISOString();
}

function emailHtml(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#14b8a6;margin:0 0 16px;">ZENTRIX Reminder</p>
    <h1 style="font-size:22px;line-height:1.3;color:#0f172a;margin:0 0 12px;">${title}</h1>
    <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 24px;">${body}</p>
    <p style="font-size:12px;color:#94a3b8;margin:0;">You're receiving this because you set a reminder in ZENTRIX.</p>
  </div></body></html>`;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Only the scheduled cron job (which holds the shared secret) may run this.
    const cronSecret = Deno.env.get("REMINDER_CRON_SECRET");
    if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
      return json({ error: "Unauthorized" }, 401);
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY is not configured" }, 500);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY is not configured" }, 500);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const nowIso = new Date().toISOString();
    const { data: due, error } = await admin
      .from("reminders")
      .select("id, user_id, title, body, remind_at, recurrence")
      .eq("active", true)
      .lte("remind_at", nowIso)
      .order("remind_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("reminder query failed:", error);
      return json({ error: "Failed to load reminders" }, 500);
    }
    if (!due || due.length === 0) return json({ sent: 0 });

    let sent = 0;
    for (const r of due) {
      try {
        const { data: userRes } = await admin.auth.admin.getUserById(r.user_id);
        const email = userRes?.user?.email;

        if (email) {
          const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": RESEND_API_KEY,
            },
            body: JSON.stringify({
              from: "ZENTRIX <onboarding@resend.dev>",
              to: [email],
              subject: `Reminder: ${r.title}`,
              html: emailHtml(escapeHtml(r.title), escapeHtml(r.body ?? "This is your scheduled reminder from ZENTRIX.")),
            }),
          });
          if (!res.ok) {
            const errBody = await res.text();
            console.error(`Resend failed [${res.status}] for reminder ${r.id}: ${errBody}`);
          } else {
            sent++;
          }
        } else {
          console.warn(`No email for user of reminder ${r.id}`);
        }

        const next = nextOccurrence(r.remind_at, r.recurrence);
        if (next) {
          await admin.from("reminders").update({ remind_at: next, last_fired_at: nowIso }).eq("id", r.id);
        } else {
          await admin.from("reminders").update({ active: false, last_fired_at: nowIso }).eq("id", r.id);
        }
      } catch (err) {
        console.error(`reminder ${r.id} failed:`, err);
      }
    }

    return json({ sent, processed: due.length });
  } catch (e) {
    console.error("send-reminder-email error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
