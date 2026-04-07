import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'

export default function CheckoutSuccess() {
  return (
    <MarketingLayout>
      <div className="relative min-h-screen flex items-center justify-center py-24 px-4">
        <motion.div
          className="parchment-bg rounded-2xl p-12 md:p-16 glow-warm text-center max-w-lg w-full mx-auto"
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-5xl mb-6">🕯️</div>

          <h1 className="text-3xl md:text-4xl font-display gold-text mb-4">
            Welcome to Premium
          </h1>

          <p className="text-velvet/75 font-body mb-3">
            Your premium subscription is now active. Thank you for supporting Couples Game.
          </p>

          <p className="text-velvet/50 font-body text-sm mb-10">
            Your plan will be reflected in your account shortly. If it doesn&rsquo;t update immediately, try signing out and back in.
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
        </motion.div>
      </div>
    </MarketingLayout>
  )
}
