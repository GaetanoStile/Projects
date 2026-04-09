import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'
import { useAuthStore } from '@/state/authStore'

type VerifyStatus = 'verifying' | 'success' | 'error'

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { restoreSession } = useAuthStore()
  const [status, setStatus] = useState<VerifyStatus>(sessionId ? 'verifying' : 'success')

  useEffect(() => {
    if (!sessionId) return

    const verify = async () => {
      try {
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (res.ok) {
          await restoreSession()
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }

    void verify()
  }, [sessionId, restoreSession])

  return (
    <MarketingLayout>
      <div className="relative min-h-screen flex items-center justify-center py-24 px-4">
        <motion.div
          className="parchment-bg rounded-2xl p-12 md:p-16 glow-warm text-center max-w-lg w-full mx-auto"
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {status === 'verifying' && (
            <>
              <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-6" />
              <h1 className="text-3xl md:text-4xl font-display gold-text mb-4">
                Activating Premium…
              </h1>
              <p className="text-velvet/75 font-body">
                Verifying your subscription with Stripe.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl mb-6">&#x1F56F;&#xFE0F;</div>

              <h1 className="text-3xl md:text-4xl font-display gold-text mb-4">
                Welcome to Premium
              </h1>

              <p className="text-velvet/75 font-body mb-3">
                Your premium subscription is now active. Thank you for supporting Couples Game.
              </p>

              <p className="text-velvet/50 font-body text-sm mb-10">
                All premium features are unlocked. Explore the Community Library or jump into a game.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/library"
                  className="px-8 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                >
                  Community Library
                </Link>
                <Link
                  to="/welcome"
                  className="px-8 py-3 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors border border-gold/20"
                >
                  Start Playing
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl mb-6">&#x1F56F;&#xFE0F;</div>

              <h1 className="text-3xl md:text-4xl font-display gold-text mb-4">
                Welcome to Premium
              </h1>

              <p className="text-velvet/75 font-body mb-3">
                Your payment was successful. Your plan may take a moment to reflect.
              </p>

              <p className="text-velvet/50 font-body text-sm mb-10">
                If your premium status doesn&rsquo;t appear immediately, try signing out and back in.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/welcome"
                  className="px-8 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                >
                  Start Playing
                </Link>
                <Link
                  to="/settings"
                  className="px-8 py-3 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors border border-gold/20"
                >
                  View Account
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </MarketingLayout>
  )
}
