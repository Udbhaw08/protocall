# Protocall Startup Plan

## Product Thesis

Protocall helps job seekers practice realistic AI-led mock interviews, get structured feedback, and know exactly what to improve next.

The first wedge should be narrow: interview prep for early-career tech candidates who need repeated practice but cannot afford expensive coaches.

## MVP Positioning

Build Protocall as:

- A realistic mock interview room.
- A feedback report that feels specific, not generic.
- A progress tracker that shows improvement over multiple sessions.
- A guided prep loop that recommends the next practice session or learning resource.

Avoid building a broad hiring platform at first. The startup starts with candidate practice, not recruiter tooling.

## Current State

- Frontend: React, Vite, Tailwind, Framer Motion, Recharts.
- AI: Gemini live audio for interviews and Gemini text analysis for reports.
- Backend: Express proxy exists for analysis.
- Auth: Not implemented.
- Payments: Not implemented.
- Persistence: Mostly local/client-side.
- Deployment: Not production-ready yet.
- Critical risk: API keys must stay server-side before launch.

## Build Priorities

### Phase 1: Make It Safe And Runnable

- Move all Gemini usage that needs secrets behind the backend.
- Add a single root dev command that runs frontend and backend together.
- Add README setup instructions.
- Initialize Git and make a clean first commit.
- Confirm `.env` files are ignored and only examples are committed.

### Phase 2: Make The MVP Useful

- Add interview history persistence.
- Add user accounts.
- Save reports per user.
- Add a dashboard with past scores and improvement trends.
- Improve the analysis prompt so feedback is role-specific and actionable.
- Add clear error states for failed microphone/API/model calls.

### Phase 3: Make It Launchable

- Deploy frontend and backend.
- Add landing page with waitlist or signup CTA.
- Add basic analytics.
- Add privacy policy and terms.
- Add simple pricing experiment.
- Add feedback collection after each interview.

### Phase 4: Make It A Business

- Add paid plans or credits.
- Add interview packs by role.
- Add personalized improvement plans.
- Add referral loop.
- Add founder-led onboarding calls for first users.

## Suggested Technical Architecture

Short term:

- Vite frontend.
- Express backend API.
- Hosted PostgreSQL or Supabase for users, sessions, reports.
- Auth through Clerk, Supabase Auth, or Auth.js.
- Payments through Stripe.

Recommended MVP stack:

- Supabase for auth and database if speed matters most.
- Stripe for payments.
- Vercel for frontend.
- Render, Railway, or Fly.io for backend.

## Data Model Draft

Users:

- `id`
- `email`
- `created_at`
- `plan`

Interview sessions:

- `id`
- `user_id`
- `role`
- `difficulty`
- `focus_areas`
- `status`
- `created_at`
- `completed_at`

Interview messages:

- `id`
- `session_id`
- `role`
- `text`
- `created_at`

Reports:

- `id`
- `session_id`
- `overall_score`
- `clarity`
- `confidence`
- `communication`
- `technical_knowledge`
- `strengths`
- `weaknesses`
- `recommendations`
- `created_at`

## Launch Strategy

Start with a focused promise:

> Practice a realistic AI interview and get a detailed improvement report in minutes.

First user channels:

- College placement groups.
- LinkedIn posts showing before/after feedback examples.
- Reddit communities for resumes and interview prep, if allowed by community rules.
- Friends preparing for placements or internships.
- Small cohorts: 10 users per week, personally interviewed after use.

## Pricing Experiments

Start simple:

- Free: 1 interview report.
- Starter: 5 interviews per month.
- Pro: unlimited practice plus progress tracking.

Do not over-optimize pricing before 20-30 real user conversations.

## Weekly Operating Rhythm

Every week:

- Ship one visible product improvement.
- Talk to at least 5 target users.
- Watch at least 2 users try the product live.
- Write down objections, confusion, and repeated feature requests.
- Cut features that do not improve activation, retention, or willingness to pay.

## Immediate Next Steps

1. Make the repo production-safe.
2. Add a proper README and developer setup.
3. Connect frontend analysis calls to the backend proxy.
4. Add database-backed interview history.
5. Deploy a private beta.
6. Recruit 10 initial users.

## API Accounts Needed

See [API_REQUIREMENTS.md](API_REQUIREMENTS.md) for exact environment variable names.

Minimum to keep building locally:

- Gemini API key.

Minimum for private beta:

- Gemini API.
- Supabase or equivalent database/auth provider.
- Basic analytics provider.

Minimum for public paid launch:

- Gemini API.
- Database/auth.
- Stripe.
- Analytics.
- Email provider.
- Error monitoring.

Current pricing test:

- Plus: $14.99/month.
- Pro: $9.99/month.
- Checkout is wired through Stripe Checkout, with price IDs configured server-side.

Current integration status:

- Supabase client scaffold exists, but project URL and keys are still needed.
- Resend backend helper exists and local API key is configured.
- PostHog frontend analytics scaffold exists, but project key is still needed.
- PostHog MCP is configured in Codex.

## Current Startup-Phase Setup

- `npm run dev:all` runs frontend and backend together.
- Root `.env.example` documents frontend variables.
- `server/.env.example` documents backend variables.
- `server/index.js` loads local env values through `dotenv`.
- `API_REQUIREMENTS.md` lists required APIs.
- `LAUNCH_CHECKLIST.md` tracks the private beta path.
