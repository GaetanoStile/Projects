import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '@/state/store'
import HowToPlayContent from '@/components/HowToPlayContent'
import Candle from '@/components/Candle'

export default function HowToPlay() {
  const navigate = useNavigate()
  const { setHasSeenHowToPlay } = useGameStore()
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleContinue = () => {
    if (dontShowAgain) {
      setHasSeenHowToPlay(true)
    }
    navigate('/dice')
  }

  return (
    <div className="min-h-screen candlelit-bg relative overflow-hidden">
      <Candle className="absolute top-20 left-8 opacity-30 hidden md:block" />
      <Candle className="absolute top-20 right-8 opacity-30 hidden md:block" />

      <motion.div
        className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <div className="parchment-bg rounded-2xl p-6 md:p-10 shadow-2xl">
          <HowToPlayContent />

          <div className="mt-8 pt-6 border-t border-gold/20">
            <label className="flex items-center gap-3 justify-center mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-gold/70 font-body text-sm">
                Don't show this again
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/settings')}
                className="px-6 py-3 border-2 border-gold/40 text-gold font-body rounded-lg hover:bg-gold/10 transition-colors"
                style={{ minHeight: '48px' }}
              >
                Back to Settings
              </button>
              <motion.button
                onClick={handleContinue}
                className="px-8 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  minHeight: '48px',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                }}
              >
                Got it — Roll the Dice
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
