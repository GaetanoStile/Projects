import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/state/authStore'
import { getStartGamePath } from '@/lib/routes'

const AuthSchema = z.object({
  displayName: z.string().trim().max(40).optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AuthFormData = z.infer<typeof AuthSchema>
type AuthMode = 'login' | 'signup'

interface AuthFormProps {
  initialMode?: AuthMode
  redirectTo?: string
  onSuccess?: () => void
}

export default function AuthForm({
  initialMode = 'login',
  redirectTo = getStartGamePath(),
  onSuccess,
}: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signUp, signIn } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(AuthSchema),
  })

  useEffect(() => {
    setIsSignUp(initialMode === 'signup')
    setError(null)
    reset()
  }, [initialMode, reset])

  const onSubmit = async (data: AuthFormData) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const result = isSignUp
        ? await signUp(data.email, data.password, data.displayName)
        : await signIn(data.email, data.password)

      if (result.error) {
        setError(result.error)
        return
      }

      reset()
      onSuccess?.()
      navigate(redirectTo)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <h2 className="text-3xl md:text-4xl font-display gold-text mb-6 text-center">
        {isSignUp ? 'Sign Up' : 'Log In'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="auth-display-name" className="block text-gold font-body font-semibold mb-2 text-left">
              Display Name
            </label>
            <input
              id="auth-display-name"
              type="text"
              {...register('displayName')}
              className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-velvet/50"
              placeholder="What should we call you?"
            />
            {errors.displayName && (
              <p className="text-crimson text-sm mt-1 text-left">{errors.displayName.message}</p>
            )}
          </div>
        )}

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
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
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
    </>
  )
}
