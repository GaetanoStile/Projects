# Couples Game

Romantic card game for couples — React + TypeScript + Vite, Tailwind, Framer Motion, Zustand, Supabase, Stripe. Deployed on Vercel.

## Quick start

```bash
npm install
cp .env.example .env.local   # add Supabase / Stripe keys as needed
npm run dev
```

Guest mode works without Supabase. Account features need `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Core flow

Marketing home → Auth / Try Now → Disclaimer → Settings → How to Play → Dice → Game

- Decks **A–D** plus **Black** (unlocks with **2+ swap cards** in hand)
- Swap cards go to inventory; using one ends the turn and switches roles
- Card Manager (`/create`), presets, favorites, optional cloud sync
- Premium: Community Library (`/library`) via Stripe subscription

## Project status

See **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** for beta readiness, known issues, and risks.

## Deployment

See **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** for Vercel env vars, Supabase redirects, Stripe webhooks, and troubleshooting.

Database details: **[docs/database-schema.md](./docs/database-schema.md)**.

## Tech stack

React 18, TypeScript, Vite 5, Tailwind, Framer Motion, Zustand, React Router, Supabase Auth + Postgres, Stripe Checkout (Vercel serverless `api/`).
