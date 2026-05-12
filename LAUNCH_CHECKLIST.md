# Launch Checklist

Use this as the working checklist before inviting real users.

## Development Foundation

- [x] Frontend build passes.
- [x] Backend proxy exists for analysis.
- [x] Root command can run frontend and backend together.
- [x] Safe env examples exist.
- [x] Supabase/PostHog/Resend integration placeholders exist.
- [x] PostHog MCP configured globally in Codex.
- [ ] Initialize Git.
- [ ] Commit a clean baseline.
- [ ] Add basic linting or formatting.
- [ ] Add a smoke test for the analysis endpoint.

## Security

- [x] Real API keys removed from frontend env files in this workspace.
- [x] `.env` files are ignored.
- [ ] Move live audio Gemini usage behind a safe backend/session-token architecture.
- [ ] Add stricter production CORS origins.
- [ ] Add server request size limits.
- [ ] Add privacy policy.
- [ ] Add terms of service.

## Product MVP

- [x] Candidate can configure interview.
- [x] Candidate can complete mock interview.
- [x] Candidate can receive analysis report.
- [x] Supabase client scaffold exists.
- [x] Resend email helper exists.
- [ ] Save interview history to database.
- [ ] Add auth.
- [ ] Add dashboard with previous attempts.
- [ ] Add user feedback prompt after report.
- [ ] Add landing page with clear CTA.

## Business Readiness

- [ ] Define first target segment.
- [ ] Recruit 10 private beta users.
- [ ] Track activation and completion metrics.
- [ ] Interview users after their first session.
- [x] Decide first pricing test.
- [x] Add initial Stripe Checkout flow.
- [x] Add Stripe product IDs to `server/.env`.
- [x] Add Stripe price IDs to `server/.env`.
- [x] Add initial Stripe webhook endpoint.
- [x] Configure Stripe webhook secret locally.
- [ ] Store Stripe subscription state in Supabase before granting paid access automatically.

## Deployment

- [x] Add Vercel frontend config.
- [x] Add Render backend blueprint.
- [x] Deploy frontend.
- [x] Deploy backend.
- [x] Add production environment variables.
- [x] Confirm health check works.
- [ ] Confirm analysis endpoint works from deployed frontend.
- [ ] Confirm microphone/camera permissions work on deployed HTTPS URL.

Production URLs:

- Frontend: `https://protocall-inky.vercel.app`
- Backend: `https://protocall-api.onrender.com`
