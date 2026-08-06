# Couples Game — Project Status

**Last updated:** 2026-08-06  
**Goal:** Public beta launch readiness (stability, reliability, polish — no new features)  
**Branch:** `beta-readiness` (not merged to main)

## Final verification (pre-commit)

| Check | Result |
|-------|--------|
| `npm run build` (`tsc && vite build`) | **PASS** (exit 0) |
| `npm run lint` | **PASS** (exit 0) after flat-config + TS lint fixes |
| Secrets / `.env` in commit | **None** — `.env` / `.env.local` gitignored; only `.env.example` tracked |
| Tests | No test script in `package.json` |

### Lint fixes included
- Flat ESLint config for `ts`/`tsx` (removed invalid `--ext`)
- `React` namespace types → type-only imports
- Renamed store action alias in Game to avoid false `rules-of-hooks` hit
- `vite.config.ts` uses `import.meta.url` instead of bare `__dirname`

## Session progress

| Phase | Status | Notes |
|-------|--------|-------|
| Move workspace | Done | Root: `C:\Users\Gaeta\couples-game` |
| Asset verification | Done | All imported PNGs + `public/sounds/*` present |
| TypeScript / build | Done | **BUILD_OK** |
| Gameplay QA | Done (code + data) | Live production smoke still manual |
| Responsive UI audit | Done | |
| Supabase schema / RLS | Documented | Checklist in `docs/DEPLOYMENT.md` |
| Auth flow | Fixed + documented | |
| Stripe verification | Hardened | Login required before Checkout |
| A11y / perf / security | Partial pass | |
| Documentation | Done | |
| Branch + push | Done | See git section below |

## Completed this session

### Assets
- Confirmed card backs, card front, hero/gameplay backgrounds, and sounds.
- CSS-only grain/parchment (removed broken missing-file URLs).

### Build / lint
- Production build passes.
- Lint script + config repaired; clean run.

### Gameplay (static QA)
- Black deck unlock at 2 swaps; 187 cards validated.

### Auth / Stripe / a11y
- Signup `emailRedirectTo` + confirm-email info UX.
- Pricing requires logged-in user before Checkout.
- Deck keyboard a11y; How-to-Play `aria-label`.
- `.gitignore` ignores `.env`.

### Docs
- `README.md`, `docs/DEPLOYMENT.md`, this file.

### Also included (pre-existing uncommitted launch ops)
- `scripts/seed-global-cards.mjs` safer seed/clear partial
- `supabase/migrations/20260729120000_launch_schema.sql` creates `users_profile`

## Outstanding issues (manual)

| Item | Severity |
|------|----------|
| Live guest + auth smoke on production | Medium |
| Confirm Supabase schema/RLS applied | Medium |
| Stripe webhook live test → `plan_tier` | Medium |
| Supabase Auth Site URL + Redirect URLs → `/auth` | Medium |
| Deck C/D fewer swaps than A/B | Low |
| Large JS chunk (~770KB) | Low |
| Phase 2.5 feedback | Deferred |

## Risks

- Checkout without account metadata cannot upgrade plans (UI now blocks logged-out upgrade).
- Rotate any secrets previously shared in chat.
- Cloud favorites/sessions no-op if tables missing.

## Recommendations (next)

1. Review/merge `beta-readiness` when ready (do not auto-merge).
2. Production smoke + schema + Stripe checklist in `docs/DEPLOYMENT.md`.
3. Phase 2.5 only when explicitly requested.
