import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/state/authStore'
import { useNavigate } from 'react-router-dom'
import { isCloudEnabled } from '@/lib/config'

const AuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AuthFormData = z.infer<typeof AuthSchema>

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onGuestMode: () => void
}

export default function AuthModal({ isOpen, onClose, onGuestMode }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, signIn, setMode } = useAuthStore()
  const navigate = useNavigate()
  const cloudEnabled = isCloudEnabled()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(AuthSchema),
  })

  const onSubmit = async (data: AuthFormData) => {
    setError(null)
    setIsLoading(true)

    try {
      const result = isSignUp
        ? await signUp(data.email, data.password)
        : await signIn(data.email, data.password)

      if (result.error) {
        setError(result.error)
      } else {
        reset()
        onClose()
        navigate('/settings')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestMode = () => {
    setMode('guest')
    onGuestMode()
    navigate('/settings')
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

              <h2 className="text-3xl md:text-4xl font-display gold-text mb-6 text-center">
                {isSignUp ? 'Sign Up' : 'Log In'}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="auth-email" className="block text-gold font-body font-semibold mb-2 text-left">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-velvet/50"
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-crimson text-sm mt-1 text-left">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="auth-password" className="block text-gold font-body font-semibold mb-2 text-left">
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    {...register('password')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-velvet/50"
                    placeholder="••••••"
                  />
                  {errors.password && (
                    <p className="text-crimson text-sm mt-1 text-left">{errors.password.message}</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-crimson/20 border border-crimson/50 rounded-lg">
                    <p className="text-crimson text-sm text-center">{error}</p>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
                </motion.button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-gold/80 hover:text-gold font-body text-sm transition-colors"
                >
                  {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gold/30">
                <motion.button
                  type="button"
                  onClick={handleGuestMode}
                  className="w-full px-6 py-3 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue as Guest
                </motion.button>
                <p className="text-xs text-gold/70 text-center mt-2">
                  Play locally without an account
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

