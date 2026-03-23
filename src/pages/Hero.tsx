import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthModal from '@/components/AuthModal'
import { useAuthStore } from '@/state/authStore'
import { isCloudEnabled } from '@/lib/config'
import { getStartGamePath } from '@/lib/routes'
import heroBackground from '@/assets/hero-background.png'

export default function Hero() {
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { initializeAuth, user } = useAuthStore()
  const cloudEnabled = isCloudEnabled()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

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
        <p className="text-xl md:text-2xl text-white/90 font-body mb-12 max-w-2xl mx-auto">
          A romantic card game for two
        </p>

        <div className="flex flex-col items-center gap-4">
          <motion.button
            onClick={() => navigate(getStartGamePath())}
            className="px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-xl rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              minWidth: '200px',
              minHeight: '56px',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
            }}
          >
            Start Game
          </motion.button>

          {cloudEnabled && (
            <>
              {user ? (
                <div className="text-sm text-white/90 font-body">
                  Logged in as {user.email}
                  {user.isAdmin && (
                    <span className="ml-2 px-2 py-1 bg-gold/20 text-gold rounded text-xs">
                      Admin
                    </span>
                  )}
                </div>
              ) : (
                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2 text-white/90 hover:text-white font-body text-sm transition-colors underline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log in to sync cards
                </motion.button>
              )}
            </>
          )}
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onGuestMode={() => setShowAuthModal(false)}
        />
      </motion.div>
    </div>
  )
}
