# Protocall

AI-powered mock interview practice with live interview sessions, structured feedback, and improvement guidance.

## What It Does

Protocall lets candidates run realistic mock interviews, then receive a score breakdown across clarity, confidence, communication, and technical knowledge.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Express backend proxy
- Gemini API

## Local Setup

Install dependencies:

```bash
npm install
npm --prefix server install
```

Create environment files from the examples:

```bash
copy .env.example .env
copy .env.example .env.local
copy server\.env.example server\.env
```

Fill in `server/.env` with your real `GEMINI_API_KEY`.

Run the frontend and backend together:

```bash
npm run dev:all
```

Or run them separately:

```bash
npm run dev
npm run dev:server
```

Frontend runs on `http://localhost:5173` by default.

Backend runs on `http://localhost:3001` by default.

## Startup Roadmap

See [STARTUP_PLAN.md](STARTUP_PLAN.md) for the product, technical, and launch plan.

See [API_REQUIREMENTS.md](API_REQUIREMENTS.md) for the APIs and accounts needed.

See [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) for the private beta checklist.

## Important Security Note

Do not commit real API keys. Keep production AI API keys server-side only. The frontend must not expose secret keys before launch.

Stripe secret keys must also stay server-side. Only the publishable `pk_...` key belongs in frontend env.

## Deployment

Frontend:

```bash
npm run build
```

Deploy the frontend to Vercel with `VITE_API_URL` pointing at the deployed Render backend URL.

Backend:

Use `render.yaml` to create the Render service. Add all `sync: false` values through Render's environment variable UI. Never commit `.env` or `server/.env`.

After both are deployed:

- Set Render `ALLOWED_ORIGINS` to the Vercel URL.
- Set Render `APP_URL` to the Vercel URL.
- Set Vercel `VITE_API_URL` to the Render backend URL.
- Create the Stripe webhook endpoint at `https://your-render-service.onrender.com/api/stripe/webhook`.
- Select Stripe events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.

Current production URLs:

- Frontend: `https://protocall-inky.vercel.app`
- Backend: `https://protocall-api.onrender.com`

## Near-Term Engineering Tasks

- Connect all sensitive Gemini calls through the backend.
- Add persistent interview history.
- Add auth.
- Save reports per user.
- Add deployment configuration.
- Add analytics and feedback collection.
