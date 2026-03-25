import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import heroBackground from '@/assets/hero-background.png'
import { useAuthStore } from '@/state/authStore'
import { useSessionStore } from '@/state/sessionStore'
import { getStartGamePath } from '@/lib/routes'

export default function Hero() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { activeSession, checkForActiveSession, loadSession, clearSession } = useSessionStore()

  useEffect(() => {
    if (isAuthenticated) {
      void checkForActiveSession()
    }
  }, [isAuthenticated, checkForActiveSession])

  const handleContinue = () => {
    if (activeSession) {
      loadSession(activeSession)
      navigate('/game')
    }
  }

  const handleStartNew = () => {
    clearSession()
    navigate(getStartGamePath())
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Candle flicker overlay - left candle */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          bottom: '8%',
          left: '12%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,200,50,0.4) 0%, rgba(255,165,0,0.55) 30%, transparent 70%)',
        }}
        animate={{
          opacity: [0.6, 1, 0.7, 1, 0.6],
          scale: [1, 1.05, 0.97, 1.03, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Candle flicker overlay - right candle */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          bottom: '8%',
          right: '12%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,200,50,0.4) 0%, rgba(255,165,0,0.55) 30%, transparent 70%)',
        }}
        animate={{
          opacity: [0.7, 1, 0.6, 1, 0.7],
          scale: [1, 1.03, 0.98, 1.05, 1],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <motion.div
        className="text-center z-10 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl md:text-8xl font-display gold-text mb-6">
          Couples Game
        </h1>

        {isAuthenticated && activeSession ? (
          <>
            <p className="text-xl md:text-2xl text-white/90 font-body mb-3 max-w-2xl mx-auto">
              Welcome back. You have an unfinished game.
            </p>
            <p className="text-sm text-white/60 font-body mb-10">
              {activeSession.player_red_name} &amp; {activeSession.player_blue_name} &mdash; {activeSession.used_card_ids.length} cards drawn
            </p>

            <div className="flex flex-col items-center gap-4">
              <motion.button
                onClick={handleContinue}
                className="px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-xl rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  minWidth: '240px',
                  minHeight: '56px',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                }}
              >
                Continue Last Game
              </motion.button>
              <motion.button
                onClick={handleStartNew}
                className="px-8 py-4 bg-white/10 text-gold font-display text-xl rounded-lg border border-gold/30 hover:bg-white/15 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  minWidth: '240px',
                  minHeight: '56px',
                }}
              >
                Start New Game
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xl md:text-2xl text-white/90 font-body mb-12 max-w-2xl mx-auto">
              Choose your path. Sign in or sign up to save your cards, or continue to the separate try-now flow.
            </p>

            <div className="flex flex-col items-center gap-4">
              <motion.button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-xl rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  minWidth: '240px',
                  minHeight: '56px',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                }}
              >
                Log In or Sign Up
              </motion.button>
              <motion.button
                onClick={() => navigate('/try')}
                className="px-8 py-4 bg-white/10 text-gold font-display text-xl rounded-lg border border-gold/30 hover:bg-white/15 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  minWidth: '240px',
                  minHeight: '56px',
                }}
              >
                Try Now
              </motion.button>
              <p className="max-w-md text-sm text-white/70 font-body">
                Account mode saves your cards and identity. Try Now keeps things local-only for a quick preview.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
