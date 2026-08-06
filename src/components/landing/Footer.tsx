import { Link } from 'react-router-dom'
import { SUBSTACK_URL } from '@/lib/routes'

const socialLinks = [
  { label: 'SS', href: SUBSTACK_URL, ariaLabel: 'Couples Game on Substack' },
  { label: 'IG', href: null, ariaLabel: 'Instagram coming soon' },
  { label: 'TT', href: null, ariaLabel: 'TikTok coming soon' },
] as const

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-gold/10 bg-black/35">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="space-y-2 lg:max-w-xs">
            <p className="font-display text-2xl gold-text">Couples Game</p>
            <p className="text-sm text-white/65">
              A candlelit card experience for couples who want romance, play, and a little mystery.
            </p>
            <a
              href={SUBSTACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block pt-2 text-sm text-gold/80 transition hover:text-gold"
            >
              Read &amp; subscribe on Substack →
            </a>
          </div>

          <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm text-white/75">
            <Link to="/" className="transition hover:text-gold">Home</Link>
            <Link to="/blog" className="transition hover:text-gold">Blog</Link>
            <a
              href={SUBSTACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-gold"
            >
              Substack
            </a>
            <Link to="/novel" className="transition hover:text-gold">The Novel</Link>
            <Link to="/privacy" className="transition hover:text-gold">Privacy</Link>
            <Link to="/terms" className="transition hover:text-gold">Terms</Link>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-display text-gold text-base mb-3">Get in Touch</p>
            <a
              href="mailto:support@couplesgameplay.com?subject=Couples%20Game%20Support"
              className="block text-white/65 hover:text-gold transition"
            >
              support@couplesgameplay.com
            </a>
            <a
              href="mailto:hello@couplesgameplay.com"
              className="block text-white/65 hover:text-gold transition"
            >
              hello@couplesgameplay.com
            </a>
            <div className="pt-2 flex gap-4">
              <Link to="/beta" className="text-gold/70 hover:text-gold transition">
                Beta
              </Link>
              <Link to="/collaborate" className="text-gold/70 hover:text-gold transition">
                Collaborate
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:self-start">
            {socialLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-white/5 text-xs font-semibold tracking-[0.2em] text-gold transition hover:border-gold/40 hover:bg-gold/10"
                  aria-label={item.ariaLabel}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  disabled
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/10 bg-white/[0.03] text-xs font-semibold tracking-[0.2em] text-gold/40 cursor-not-allowed"
                  aria-label={item.ariaLabel}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-gold/10 pt-6 text-center text-xs text-white/35">
          &copy; {new Date().getFullYear()} Couples Game. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
