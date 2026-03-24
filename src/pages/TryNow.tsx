import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'
import { getStartGamePath } from '@/lib/routes'
import { useAuthStore } from '@/state/authStore'

export default function TryNow() {
  const navigate = useNavigate()
  const { setMode } = useAuthStore()

  const handleTryNow = () => {
    setMode('guest')
    navigate(getStartGamePath())
  }

  return (
    <MarketingLayout>
      <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            className="parchment-bg rounded-[34px] p-8 md:p-12 glow-warm text-center shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="text-sm uppercase tracking-[0.35em] text-gold/80">Try Now</p>
            <h1 className="mt-4 font-display text-5xl gold-text">
              Explore the game without creating an account.
            </h1>
            <p className="mt-5 text-base leading-8 text-gold/80">
              Guest mode lets you start immediately. Your play will stay local to this device and won&apos;t
              be attached to an account.
            </p>

            <motion.button
              type="button"
              onClick={handleTryNow}
              className="mt-10 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-gold to-gold/80 px-8 py-4 text-xl font-display text-velvet glow-gold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Try Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  )
}
