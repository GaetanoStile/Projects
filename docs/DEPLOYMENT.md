# Deployment & troubleshooting

## Vercel environment variables

### Client (build-time / browser)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_APP_URL` | Canonical site URL (used for Checkout success/cancel) |
| `VITE_ADMIN_EMAILS` | Comma-separated admin emails (optional) |

### Server (`api/*` only)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | Stripe Price ID for premium |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `SUPABASE_URL` | Same project URL (preferred over Vite var on server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (never expose to client) |

Copy from `.env.example`. Never commit real `.env` / `.env.local` files.

## Supabase Auth redirects

In Supabase Dashboard → Authentication → URL configuration:

1. **Site URL:** `https://your-production-domain`
2. **Redirect URLs:** include `https://your-production-domain/auth` and local `http://localhost:5173/auth`

Signup uses `emailRedirectTo: {origin}/auth` so confirmation links return to the app.

## Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → endpoint  
   `https://your-production-domain/api/stripe/webhook`
2. Event: `checkout.session.completed`
3. Paste signing secret into `STRIPE_WEBHOOK_SECRET`
4. After a test payment, confirm `users_profile.plan_tier` becomes `paid`

Fallback: `/success?session_id=...` calls `/api/stripe/verify-session` to set `plan_tier` if the webhook was delayed.

## Schema checklist

Apply SQL from `docs/database-schema.md` if not already applied:

- [ ] `users_profile` (+ `email`, `plan_tier`, `is_admin`)
- [ ] `cards` (+ favorites metadata, `visibility`, tags)
- [ ] `game_sessions` + RLS
- [ ] `user_favorite_cards` + RLS
- [ ] RLS policies for profiles and cards

## Common failures

| Symptom | Likely cause |
|---------|----------------|
| “Account mode is unavailable” | Missing `VITE_SUPABASE_*` on Vercel; redeploy after adding |
| Signup “Failed to fetch” | Wrong URL/key, CORS, or CSP blocking `*.supabase.co` |
| Confirm email opens blank/wrong site | Site URL / Redirect URLs not set to production `/auth` |
| Premium stays Free after Checkout | Webhook env missing, or Checkout created without `userId` metadata (must be logged in) |
| Sounds silent | Files missing under `public/sounds/` (see asset list in README) |
| Library locked after pay | Profile not refreshed — hard refresh, or open `/success` with session id |

## Local

```bash
npm install
cp .env.example .env.local   # fill values
npm run dev
npm run build                # must pass before deploy
```
