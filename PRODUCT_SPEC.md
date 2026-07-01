# ZENTRIX — Production Product Spec

> North-star document. Every feature ships polished, scalable, secure, responsive, animated, and maintainable. No MVP shortcuts. No placeholder content.

## Vision
**Your AI Companion for Life.** Not another chatbot — a best friend, therapist, mentor, strategist, productivity coach, business consultant, creative partner and life organizer in one. Genuine personality, real memory, real growth over time.

## Company
- **ZENTRIX (Pty) Ltd** — South Africa, founded 2026, POPIA compliant
- **CEO / Founder:** Cullen Jade Minnaar — Head Honcho, Big Boss
- **Co-Founder / 2nd in Command:** Mervin Geswind
- Featured professionally on landing page

## Design Language
Premium · Elegant · Minimal · Futuristic. Never clone ChatGPT / Claude.
- Dark Navy · Teal · Gold · glassmorphism · soft glows · rounded corners · micro-animations · gradients · depth · floating cards
- Fonts: **Outfit** (display) + **Inter** (body)
- 100% semantic design tokens — zero hardcoded colors
- Themes: Zentrix · Matrix · Rockstar · Peaceful · Gothic · Girly (each theme swaps colors, backgrounds, animations, buttons, chat bubbles, cards, icons, wallpapers)

## Landing Page
3D hero · animated bg · floating AI elements · feature cards · interactive demo · testimonials · founder section · pricing · FAQ · blog preview · contact · newsletter · footer.
SEO: meta, OG, Twitter, JSON-LD schema, sitemap, robots, lazy loading, image optimization, Lighthouse >95.

## Auth
Email · Google · password reset · remember me · session persistence · secure JWT.

## Subscriptions
- Weekly R29 · Monthly R99 (popular) · Yearly R799 (best value)
- 14-day free trial
- Real payment provider (Stripe/Paddle), subscription status, upgrade/downgrade/cancel, invoices, payment history
- Server-side plan enforcement in edge functions

## Dashboard (20 tabs)
AI Chat · Creative Studio · Wellness · Journal · Goals · Tasks · Calendar · Reminders · Habits · Automation · Reports · Insights · Analytics · History · Memory · Documents · Voice · Profile · Settings · Notifications · Help Center

## AI — Morpheus
Never Jarvis / GPT / Assistant. Kind, calm, wise, funny, honest, emotionally intelligent, encouraging, strategic, supportive, naturally conversational. Never asks the user to reintroduce themselves.

## Long-Term Memory (ChatGPT-grade)
- Semantic vector memory (pgvector + embeddings) with context-aware retrieval
- Remembers: name, family, partner, friends, job, business, goals, dreams, skills, preferences, writing style, favorite topics, important events, projects, deadlines, health goals, learning progress, personality, communication style, custom instructions, pinned memories
- Auto-categorize · auto-merge duplicates · summarize old memories · rank by importance · confidence scores
- Search · pin · edit · forget · archive · export · import · timeline · analytics · tags · relationships · graph viz
- Only relevant memories injected into each prompt (top-K semantic retrieval, not full dump)

## Conversations
Infinite conversations · folders · search · favorites · pin · rename · archive · delete · restore · summaries · tags · statistics · export (MD/PDF/TXT/JSON).

## AI Features
Text · image · code · file analysis · vision · document summarization · research · brainstorming · business strategy · fitness · meal planning · career coaching · language learning · creative writing · marketing · social media · travel · daily briefing · goal tracking · habit coaching · decision making · emotional support.

## Voice Mode
Voice conversations · STT · TTS · natural interruptions · playback · voice selection · transcripts.

## Creative Studio
Image generation · editing · prompt enhancement · background removal · upscaling · variations · style transfer · history · prompt library.

## Productivity
Calendar · tasks · reminders (recurring) · Pomodoro · notes · checklists · habits · daily/weekly planner · goals · automation workflows.

## Notifications
Browser push · reminder alerts · daily summary · weekly report · streak reminders · achievement notifications.

## Analytics
Usage dashboard · mood trends · goal completion · productivity trends · conversation insights · memory growth · time saved · AI usage stats.

## Security
JWT · RBAC · RLS · input validation · rate limiting · secure headers · encrypted storage · audit logs · CSRF · XSS · SQLi protection. Secrets never exposed to client.

## Performance
Code splitting · lazy loading · caching · streaming · optimistic UI · offline (PWA) · background sync · fast startup · minimal bundle · a11y >95.

## Animation
Framer Motion throughout · smooth transitions · micro-interactions · hover effects · skeletons · streaming cursor · typing indicators · tasteful confetti.

## Stack
React 18 · Vite 5 · TS 5 · Tailwind v3 · shadcn/ui · Framer Motion · R3F · React Markdown · TanStack Query · React Hook Form · Zod · Sonner · Lucide · Lovable Cloud · Lovable AI Gateway · Edge Functions · SSE.

## Standards
Clean Architecture · reusable components · strong typing · SOLID · feature folders · custom hooks · error boundaries · loading + empty states · reusable utils · documented complex logic.

## QA
Zero placeholder pages · zero broken links · zero console/TS/ESLint errors · fully responsive · cross-browser · production-ready.

---

## Build Phases (execution order)

**Phase 1 — Intelligence backbone (in progress)**
- ✅ Semantic long-term memory (pgvector + embeddings + retrieval)
- ✅ Auto-retrieval wired into chat
- Conversation folders / search / pin / rename / archive / export

**Phase 2 — Commerce & compliance**
- Real Stripe/Paddle subscriptions with webhooks, server-side plan enforcement
- Invoices, payment history, upgrade/downgrade/cancel flows

**Phase 3 — Productivity suite**
- Tasks / Reminders / Calendar / Habits / Pomodoro / Journal / Goals (all real, DB-backed)
- Automation workflows

**Phase 4 — Voice & Creative**
- Voice mode (STT + TTS + interruptions)
- Creative Studio (editing, bg removal, upscaling, variations, style transfer, prompt library)

**Phase 5 — Analytics & Notifications**
- Usage dashboards, mood/productivity/memory analytics
- Browser push + scheduled notifications, daily/weekly digests

**Phase 6 — Polish & launch**
- PWA + offline + background sync
- Full a11y >95, Lighthouse tuning
- Landing content: blog, FAQ, testimonials, newsletter, docs
- E2E tests, error boundaries everywhere
