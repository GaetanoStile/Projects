import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthForm from '@/components/auth/AuthForm'
import MarketingLayout from '@/components/landing/MarketingLayout'
import { isCloudEnabled } from '@/lib/config'
import { getStartGamePath } from '@/lib/routes'
import { useAuthStore } from '@/state/authStore'

export default function Auth() {
  const { isAuthenticated, profile, user } = useAuthStore()
  const cloudEnabled = isCloudEnabled()

  return (
    <MarketingLayout>
      <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            className="rounded-[34px] border border-gold/10 bg-white/[0.04] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="text-sm uppercase tracking-[0.35em] text-gold/80">Account Access</p>
            <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">
              Save your cards and come back to your game anytime.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
              Create an account or log in to keep your custom cards and future progress tied to your identity.
              If you just want a quick look, you can still continue with the guest try-now flow below.
            </p>

            <div className="mt-8 space-y-4 text-white/72">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                Your custom cards stay attached to your account.
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                Sign in once and return to the game without re-entering everything.
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                Guest mode is still available if you want to explore first.
              </div>
            </div>

            {/* Premium upsell */}
            <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/[0.06] px-6 py-5">
              <p className="font-display text-lg gold-text mb-2">Upgrade to Premium</p>
              <p className="text-sm text-white/60 font-body mb-4">
                Unlock the Community Library, import shared cards, and get access to premium content.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 text-sm font-display text-gold hover:text-gold/80 transition"
              >
                View Plans &rarr;
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="parchment-bg rounded-[34px] p-8 md:p-10 glow-warm shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: 'easeOut' }}
          >
            {cloudEnabled ? (
              <>
                {isAuthenticated ? (
                  <div className="space-y-6 text-center">
                    <h2 className="text-3xl font-display gold-text">
                      Welcome back
                    </h2>
                    <p className="text-gold font-body">
                      Signed in as {profile?.displayName || user?.displayName || user?.email}
                    </p>
                    <Link
                      to={getStartGamePath()}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-gold to-gold/80 px-6 py-3 text-lg font-display text-velvet glow-gold"
                    >
                      Continue to Game Setup
                    </Link>
                  </div>
                ) : (
                  <>
                    <AuthForm redirectTo={getStartGamePath()} />
                    <div className="mt-6 border-t border-gold/30 pt-6">
                      <Link
                        to="/try"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-velvet/80 px-6 py-3 text-gold font-body font-semibold transition-colors hover:bg-velvet"
                      >
                        Try Now Without an Account
                      </Link>
                      <p className="mt-2 text-center text-xs text-gold/70">
                        Guest play is local-only and does not save to your account.
                      </p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-6 text-center">
                <h2 className="text-3xl font-display gold-text">
                  Account mode is unavailable right now
                </h2>
                <p className="text-gold/80 font-body">
                  Supabase is not configured in this environment, so account sign in is unavailable.
                </p>
                <Link
                  to="/try"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-gold to-gold/80 px-6 py-3 text-lg font-display text-velvet glow-gold"
                >
                  Try Now
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  )
}
