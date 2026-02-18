import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Candle from '@/components/Candle'

export default function Disclaimer() {
  const navigate = useNavigate()
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const canProceed = ageConfirmed && termsAccepted

  const handleAccept = () => {
    if (!canProceed) return
    localStorage.setItem('cg.disclaimerAccepted', 'true')
    navigate('/settings')
  }

  return (
    <div className="candlelit-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-8 px-4">
      <Candle className="absolute top-20 left-8 opacity-30 hidden md:block" />
      <Candle className="absolute top-20 right-8 opacity-30 hidden md:block" />

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <div className="parchment-bg rounded-2xl p-6 md:p-10 shadow-2xl">
          <h1 className="text-2xl md:text-3xl font-display gold-text text-center mb-6">
            Important Notice &amp; User Agreement
          </h1>

          <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-5 text-sm md:text-base font-body text-stone-800 leading-relaxed">
            <p className="font-semibold text-stone-900">
              This game is intended strictly for adults aged 18 years or older.
            </p>

            <div>
              <p className="mb-2">By continuing, you confirm that:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You are at least 18 years of age.</li>
                <li>You are voluntarily participating in this game.</li>
                <li>You understand that this game contains adult themes and intimate activities.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg text-stone-900 mb-2">Health &amp; Safety Notice</h2>
              <p>
                Players should consult with a licensed medical professional before engaging in any
                sexual or physical activity, especially if they have any medical conditions, injuries,
                cardiovascular concerns, pregnancy, chronic illness, or other health-related issues.
              </p>
              <p className="mt-2">
                The creators of this game are not medical professionals and do not provide medical advice.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-stone-900 mb-2">Assumption of Risk</h2>
              <p>
                By proceeding, you acknowledge that you assume full responsibility for your actions
                and any outcomes resulting from participating in this game.
              </p>
              <p className="mt-2">
                The creators, developers, and distributors of this game shall not be held liable for
                any injury, harm, damages, or loss arising from the use of this game.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-stone-900 mb-2">Consent &amp; Communication</h2>
              <p>
                All activities performed while playing this game must be fully consensual between
                participating adults. Communication, safety, and mutual respect are required at all times.
              </p>
            </div>

            <p className="font-semibold text-stone-900">
              If you do not agree to these terms, you must exit the game.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-400/30 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-amber-700 flex-shrink-0"
                id="age-confirm"
              />
              <span className="text-sm md:text-base font-body text-stone-800">
                I confirm that I am 18 years of age or older.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-amber-700 flex-shrink-0"
                id="terms-accept"
              />
              <span className="text-sm md:text-base font-body text-stone-800">
                I have read and agree to the terms above.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 border-2 border-gold/40 text-gold font-body rounded-lg hover:bg-gold/10 transition-colors"
                style={{ minHeight: '48px' }}
              >
                Exit
              </button>
              <motion.button
                onClick={handleAccept}
                disabled={!canProceed}
                className={`px-8 py-3 font-display text-lg rounded-lg transition-all ${
                  canProceed
                    ? 'bg-gradient-to-r from-gold to-gold/80 text-velvet glow-gold hover:from-gold/90 hover:to-gold/70'
                    : 'bg-stone-400/50 text-stone-500 cursor-not-allowed'
                }`}
                whileHover={canProceed ? { scale: 1.03 } : {}}
                whileTap={canProceed ? { scale: 0.97 } : {}}
                style={{
                  minHeight: '48px',
                  ...(canProceed ? { boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)' } : {}),
                }}
              >
                Accept &amp; Continue
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
