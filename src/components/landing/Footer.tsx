import { Link } from 'react-router-dom'

const socialLinks = ['IG', 'TT', 'YT']

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-gold/10 bg-black/35">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="space-y-2">
          <p className="font-display text-2xl gold-text">Couples Game</p>
          <p className="max-w-md text-sm text-white/65">
            A candlelit card experience for couples who want romance, play, and a little mystery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm text-white/75">
          <Link to="/" className="transition hover:text-gold">
            Home
          </Link>
          <Link to="/blog" className="transition hover:text-gold">
            Blog
          </Link>
          <Link to="/novel" className="transition hover:text-gold">
            The Novel
          </Link>
          <Link to="/privacy" className="transition hover:text-gold">
            Privacy
          </Link>
          <Link to="/terms" className="transition hover:text-gold">
            Terms
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {socialLinks.map((label) => (
            <button
              key={label}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-white/5 text-xs font-semibold tracking-[0.2em] text-gold transition hover:border-gold/40 hover:bg-gold/10"
              aria-label={`${label} social placeholder`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
