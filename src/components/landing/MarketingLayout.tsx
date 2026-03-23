import { useEffect, useMemo, useState, type ReactNode } from 'react'
import AuthModal from '@/components/AuthModal'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'
import { isCloudEnabled } from '@/lib/config'
import { useAuthStore } from '@/state/authStore'

type AuthMode = 'login' | 'signup'

interface MarketingLayoutProps {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const { initializeAuth, user } = useAuthStore()
  const cloudEnabled = useMemo(() => isCloudEnabled(), [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f0407] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,21,56,0.18),transparent_28%),linear-gradient(180deg,#160609_0%,#120407_42%,#090204_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px), repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)',
        }}
      />

      <Navbar
        cloudEnabled={cloudEnabled}
        userEmail={user?.email}
        onLogin={() => openAuth('login')}
        onSignUp={() => openAuth('signup')}
      />

      <main className="relative z-10">{children}</main>
      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestMode={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  )
}
