import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuthForm from '@/components/auth/AuthForm'
import { useAuthStore } from '@/state/authStore'
import { isCloudEnabled } from '@/lib/config'
import { getStartGamePath } from '@/lib/routes'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onGuestMode: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthModal({
  isOpen,
  onClose,
  onGuestMode,
  initialMode = 'login',
}: AuthModalProps) {
  const { setMode } = useAuthStore()
  const navigate = useNavigate()
  const cloudEnabled = isCloudEnabled()

  const handleGuestMode = () => {
    setMode('guest')
    onGuestMode()
    navigate(getStartGamePath())
  }

  if (!cloudEnabled) {
    return null // Don't show auth modal if Supabase not configured
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm max-w-md w-full relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gold hover:text-gold transition-colors text-2xl"
                aria-label="Close"
              >
                ×
              </button>

              <AuthForm
                initialMode={initialMode}
                onSuccess={() => {
                  onClose()
                }}
              />

              <div className="mt-6 pt-6 border-t border-gold/30">
                <motion.button
                  type="button"
                  onClick={handleGuestMode}
                  className="w-full px-6 py-3 bg-velvet/70 text-gold font-body rounded-lg hover:bg-velvet transition-colors font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue as Guest
                </motion.button>
                <p className="text-xs text-gold/70 text-center mt-2">
                  Local-only play without saved account identity
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

