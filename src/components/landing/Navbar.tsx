import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface NavbarProps {
  cloudEnabled: boolean
  userLabel?: string
  planTier?: string
  onLogin: () => void
  onSignUp: () => void
  onLogout: () => void
}

const navLinks = [
  { label: 'Home', href: '/', isRouterLink: true },
  { label: 'How It Works', href: '/#how-it-works', isRouterLink: false },
  { label: 'Blog', href: '/blog', isRouterLink: true },
  { label: 'The Novel', href: '/novel', isRouterLink: true, emphasized: true },
] as const

function NavLink({
  label,
  href,
  emphasized,
  isRouterLink,
  onClick,
}: {
  label: string
  href: string
  emphasized?: boolean
  isRouterLink: boolean
  onClick?: () => void
}) {
  const className = `group relative inline-flex items-center justify-center text-sm font-body transition-colors ${
    emphasized ? 'text-gold' : 'text-white/80 hover:text-white'
  }`

  const underline = (
    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-gold/0 via-gold to-gold/0 transition-transform duration-300 group-hover:scale-x-100" />
  )

  if (isRouterLink) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {label}
        {underline}
      </Link>
    )
  }

  return (
    <a href={href} className={className} onClick={onClick}>
      {label}
      {underline}
    </a>
  )
}

export default function Navbar({
  cloudEnabled,
  userLabel,
  planTier,
  onLogin,
  onSignUp,
  onLogout,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gold/10 bg-burgundy/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-display font-semibold tracking-[0.14em] gold-text sm:text-2xl">
          Couples Game
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.label} {...link} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {cloudEnabled ? (
            userLabel ? (
              <>
                <div className="rounded-full border border-gold/20 bg-white/5 px-4 py-2 text-sm text-white/85">
                  {userLabel}
                  {planTier && (
                    <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-gold">
                      {planTier}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full px-4 py-2 text-sm font-body text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onLogin}
                  className="rounded-full px-4 py-2 text-sm font-body text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  Login
                </button>
                <motion.button
                  type="button"
                  onClick={onSignUp}
                  className="rounded-full bg-gradient-to-r from-gold via-[#f1d27b] to-gold px-5 py-2.5 text-sm font-semibold text-burgundy shadow-glow-gold"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign Up
                </motion.button>
              </>
            )
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-gradient-to-r from-gold via-[#f1d27b] to-gold px-5 py-2.5 text-sm font-semibold text-burgundy shadow-glow-gold"
            >
              Start Playing
            </Link>
          )}
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/15 bg-white/5 text-white lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-gold/10 bg-burgundy/95 lg:hidden"
          >
            <div className="space-y-4 px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.label}
                    {...link}
                    onClick={() => setMenuOpen(false)}
                  />
                ))}
              </div>

              {cloudEnabled && !userLabel && (
                <div className="flex flex-col gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onLogin()
                    }}
                    className="rounded-full border border-gold/15 px-4 py-2.5 text-white/85"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onSignUp()
                    }}
                    className="rounded-full bg-gradient-to-r from-gold via-[#f1d27b] to-gold px-4 py-2.5 font-semibold text-burgundy shadow-glow-gold"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {userLabel && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-gold/15 bg-white/5 px-4 py-3 text-sm text-white/80">
                    Logged in as {userLabel}
                    {planTier && (
                      <span className="ml-2 rounded-full bg-gold/15 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-gold">
                        {planTier}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full rounded-full border border-gold/15 px-4 py-2.5 text-white/85"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
