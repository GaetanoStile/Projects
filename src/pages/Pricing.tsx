import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/state/authStore'
import { redirectToCheckout } from '@/lib/stripe'
import { isPaidPlan, FEATURE_LABELS, PREMIUM_FEATURES } from '@/lib/features'
import MarketingLayout from '@/components/landing/MarketingLayout'

const premiumFeatures = [
  FEATURE_LABELS[PREMIUM_FEATURES.COMMUNITY_LIBRARY],
  FEATURE_LABELS[PREMIUM_FEATURES.IMPORT_COMMUNITY_CARDS],
  'All base card decks (A, B, C, D, Black)',
  'Custom card creation & management',
  'Game session save & resume',
  'Priority support',
]

const freeFeatures = [
  'All base card decks (A, B, C, D, Black)',
  'Custom card creation & management',
  'Game session save & resume',
]

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5 opacity-40">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function Pricing() {
  const { user, planTier } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const alreadyPaid = isPaidPlan(planTier)

  const handleUpgrade = async () => {
    setError(null)
    setLoading(true)
    const err = await redirectToCheckout(user?.id)
    if (err) {
      setError(err)
      setLoading(false)
    }
    // on success the page navigates away; no need to setLoading(false)
  }

  return (
    <MarketingLayout>
      <div className="relative min-h-screen py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-body mb-4">Plans</p>
            <h1 className="text-5xl md:text-6xl font-display gold-text mb-5">
              Choose Your Plan
            </h1>
            <p className="text-lg text-white/70 font-body max-w-xl mx-auto">
              Start free and upgrade anytime to unlock the full Couples Game experience.
            </p>
          </motion.div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div
              className="rounded-2xl border border-gold/20 bg-black/30 p-8 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40 font-body mb-2">Free</p>
                <p className="font-display text-4xl text-white">$0</p>
                <p className="text-white/50 font-body text-sm mt-1">Forever free</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {freeFeatures.map(f => (
                  <li key={f} className="flex items-start gap-3 text-white/70 font-body text-sm">
                    <span className="text-white/40"><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
              {!user ? (
                <Link
                  to="/auth"
                  className="block text-center px-6 py-3 rounded-lg border border-gold/30 text-gold font-body text-sm hover:border-gold/60 transition"
                >
                  Get Started Free
                </Link>
              ) : (
                <p className="text-center text-white/30 font-body text-sm py-3">
                  {alreadyPaid ? 'Your previous plan' : 'Current plan'}
                </p>
              )}
            </motion.div>

            {/* Premium */}
            <motion.div
              className="parchment-bg rounded-2xl p-8 flex flex-col glow-warm relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-to-r from-gold to-gold/80 text-velvet text-xs font-display uppercase tracking-[0.2em] rounded-full">
                  Premium
                </span>
              </div>

              <div className="mb-6 mt-3">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/60 font-body mb-2">Premium</p>
                <p className="font-display text-4xl gold-text">$9.99</p>
                <p className="text-velvet/50 font-body text-sm mt-1">per month</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {premiumFeatures.map(f => (
                  <li key={f} className="flex items-start gap-3 text-velvet font-body text-sm">
                    <span className="text-gold"><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>

              {alreadyPaid ? (
                <div className="text-center py-3 space-y-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-700 rounded-lg font-body text-sm font-semibold">
                    <CheckIcon /> Active Plan
                  </span>
                  <Link
                    to="/library"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-sm rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                  >
                    Browse Community Library
                  </Link>
                </div>
              ) : (
                <div>
                  <motion.button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? 'Redirecting to Checkout…' : 'Unlock Premium'}
                  </motion.button>
                  <p className="text-velvet/40 font-body text-xs text-center mt-3">
                    Access premium features, shared decks, and advanced content.
                  </p>
                  {error && (
                    <p className="text-red-600 font-body text-xs text-center mt-2">{error}</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Locked features hint for free users */}
          {!alreadyPaid && (
            <div className="max-w-3xl mx-auto mb-12">
              <div className="rounded-xl border border-gold/10 bg-black/20 p-6">
                <p className="text-gold/60 font-body text-sm font-semibold mb-3">Locked on Free</p>
                <ul className="space-y-2">
                  {[
                    FEATURE_LABELS[PREMIUM_FEATURES.COMMUNITY_LIBRARY],
                    FEATURE_LABELS[PREMIUM_FEATURES.IMPORT_COMMUNITY_CARDS],
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3 text-white/40 font-body text-sm">
                      <LockIcon />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link to="/" className="text-gold/40 hover:text-gold font-body text-sm transition">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
