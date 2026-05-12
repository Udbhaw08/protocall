# API Requirements

This is the minimum API/account checklist for turning Protocall from prototype into startup MVP.

## Required Now

### Gemini API

Purpose:

- Live mock interview conversation.
- Post-interview analysis report.

Needed values:

- `GEMINI_API_KEY`
- `ANALYSIS_MODEL`

Current setup:

- Analysis uses `server/api/analyze`, which keeps the key server-side.
- Live audio currently uses `VITE_GEMINI_API_KEY` in the browser for local prototype use.

Startup warning:

- Do not launch publicly with a browser-visible Gemini key.
- Before public launch, build a backend live-audio proxy or switch to a provider flow that supports short-lived client tokens.

## Needed Before Private Beta

### Database

Recommended: Supabase Postgres.

Purpose:

- User profiles.
- Interview sessions.
- Transcripts.
- Reports.
- Progress history.

Needed values:

- `DATABASE_URL` or Supabase project URL/key values.

### Auth

Recommended: Supabase Auth or Clerk.

Purpose:

- Accounts.
- Saved interview history.
- Usage limits.
- Paid plan ownership later.

Needed values depend on provider.

For Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Where they go:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` go in frontend env files.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` go only in backend/server env settings.
- Never expose the service role key in the frontend.

For Clerk:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Needed Before Public Launch

### Payments

Recommended: Stripe.

Purpose:

- Paid plans.
- Interview credits.
- Subscription management.

Needed values:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PLUS_PRODUCT_ID`
- `STRIPE_PRO_PRODUCT_ID`
- `STRIPE_PLUS_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `APP_URL`

Where they go:

- `VITE_STRIPE_PUBLISHABLE_KEY` goes in frontend env files and hosting env settings.
- `STRIPE_SECRET_KEY` goes only in backend/server env settings.
- `STRIPE_WEBHOOK_SECRET` is created after adding a Stripe webhook endpoint.
- `STRIPE_PLUS_PRODUCT_ID` and `STRIPE_PRO_PRODUCT_ID` identify products in Stripe.
- `STRIPE_PLUS_PRICE_ID` and `STRIPE_PRO_PRICE_ID` come from each product's pricing section in Stripe.
- Checkout uses `price_...` IDs, not `prod_...` IDs.
- `APP_URL` controls where Stripe redirects after success or cancellation.

Security note:

- If a `sk_test_...` or `sk_live_...` key is shared in chat, screenshots, Git, or logs, rotate it in Stripe.
- Never put `STRIPE_SECRET_KEY` in `.env.example`, `.env.local`, or any `VITE_*` variable.

### Analytics

Recommended: PostHog or Plausible.

Purpose:

- Track activation.
- See where users drop.
- Measure interviews started/completed/reports viewed.

Suggested events:

- `signup_completed`
- `interview_started`
- `interview_completed`
- `analysis_generated`
- `report_viewed`
- `pricing_clicked`
- `checkout_started`
- `checkout_completed`

PostHog values:

- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST`

MCP status:

- PostHog MCP is configured globally in Codex through `codex mcp add posthog --url https://mcp.posthog.com/mcp`.
- The PostHog wizard failed in this terminal because raw interactive input is unsupported, so the Codex MCP command was used instead.

### Email

Recommended: Resend.

Purpose:

- Waitlist.
- Welcome emails.
- Interview report follow-ups.

Needed values:

- `RESEND_API_KEY`
- `FROM_EMAIL`

Where they go:

- `RESEND_API_KEY` goes only in backend/server env settings.
- `FROM_EMAIL` must use a verified Resend sender domain for production.
- `onboarding@resend.dev` is acceptable for local/testing but not ideal for launch.

## Optional Later

### Error Monitoring

Recommended: Sentry.

Purpose:

- Frontend crash reporting.
- Backend API error visibility.

### File Storage

Recommended: Supabase Storage or S3-compatible storage.

Purpose:

- Optional session recordings.
- Exported reports.

Avoid storing recordings until privacy policy, consent UX, and deletion flows are ready.
