# Protocall — Project Instructions for Claude

## What This Project Is
Protocall is an AI-powered mock interview practice platform. React 18 + Vite SPA using Gemini 2.5 Flash Native Audio for live interviews. Solo founder, targeting launch in 2 weeks from 2026-04-29.

## Skills to Always Use
These 4 skills are installed and must be invoked for relevant questions:

- **`protocall:startup-advisor`** — general direction, "what should I do", big picture strategy
- **`protocall:product-strategy`** — feature decisions, roadmap, competitive questions
- **`protocall:technical-architect`** — any coding, deployment, auth, payments, database question
- **`protocall:launch-planner`** — landing page, marketing, getting users, pricing

## Auto-Update Rule for Skills
**Whenever the codebase changes in a meaningful way, update the relevant skill(s) to reflect the new state.**

Specifically:
- New component or feature added → update `protocall:technical-architect` codebase map and `protocall:product-strategy` current state
- Backend added → update `protocall:technical-architect` architecture section
- Auth/payments integrated → update `protocall:startup-advisor` critical path checklist and `protocall:technical-architect`
- New competitor discovered → update `protocall:product-strategy` and `protocall:startup-advisor` competitive tables
- Pricing changed → update `protocall:launch-planner` pricing section and `protocall:product-strategy`
- New env variables → update `protocall:technical-architect` env reference section
- Deploy completed → update `protocall:startup-advisor` current state and critical path

Skill files live at:
- `C:\Users\udbha\.claude\skills\protocall\product-strategy\SKILL.md`
- `C:\Users\udbha\.claude\skills\protocall\technical-architect\SKILL.md`
- `C:\Users\udbha\.claude\skills\protocall\launch-planner\SKILL.md`
- `C:\Users\udbha\.claude\skills\protocall\startup-advisor\SKILL.md`

## Current Tech Stack
- Frontend: React 18.2, Vite 5.1, Tailwind 3.4, Framer Motion 11, Recharts 3.8
- AI: `@google/genai` 1.50.1 — live model: `gemini-2.5-flash-native-audio-preview-09-2025`, analysis: `gemini-2.5-flash`
- Persistence: LocalStorage only (no backend yet)
- Auth: None yet
- Payments: None yet
- Deployment: Local only

## Current Codebase Map
```
src/
  main.jsx                  # React entry
  App.jsx                   # Router (single route /)
  ProtocallApp.jsx          # State machine: IDLE→SETUP→INTERVIEWING→COMPLETED
  InterviewSetup.jsx        # Config UI
  InterviewSession.jsx      # Live AI interview (Gemini Live Audio)
  AnalysisReport.jsx        # Results + Recharts radar/bar
  CourseRecommendations.jsx # Curated courses by role
  ThemeToggle.jsx           # Dark mode (not integrated)
  analysisService.js        # Gemini text API → structured JSON scores
  audioUtils.js             # PCM encode/decode (16kHz in / 24kHz out)
  courseData.js             # Course database by role
  constants.jsx             # Model IDs, SVG icons
  types.js                  # InterviewStatus enum
```

## Critical Security Issue
`VITE_GEMINI_API_KEY` is currently in the frontend `.env`. This MUST be moved to a backend proxy before deployment. Never commit the real API key. Always remind the user of this if they ask about deployment.

## Coding Standards
- No unnecessary comments — only when the WHY is non-obvious
- No new abstractions beyond what the task needs
- No backwards-compatibility shims
- Keep components in `src/` unless there's a clear reason to restructure
- Use Tailwind for all styling — no inline styles, no new CSS files
- Don't add error handling for scenarios that can't happen

## Competitor Quick Reference
| Competitor | What It Actually Is | Fatal Flaw |
|---|---|---|
| Pramp/Exponent | Peer-to-peer mock interviews | 30% flaky sessions |
| Interviewing.io | Expert coach marketplace | $225–300/session |
| Final Round AI | AI mock + live cheating copilot | Billing tricks, ethical concerns |
| Huru AI | AI job-specific interview prep | Technically unreliable |
| Google Interview Warmup | Free AI interview practice | Generic, 5 Qs, no depth |
| DeepLearning.AI SkillBuilder | AI career skills assessment (NOT interview prep) | Different product entirely — assesses AI knowledge gaps, recommends courses, mentorship-style. Not a direct competitor but overlaps in "career development" category. |
