import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import redDeckA from '@/assets/card-backs/red-deck-a.png'
import redDeckD from '@/assets/card-backs/red-deck-d.png'
import blueDeckB from '@/assets/card-backs/blue-deck-b.png'
import blackDeckBack from '@/assets/card-backs/black-deck-back.png'

interface LandingHeroProps {
  onStartPlaying: () => void
}

const floatingCards = [
  { src: redDeckA, label: 'Deck A', rotation: -14, yOffset: -28, xOffset: -86, delay: 0 },
  { src: blueDeckB, label: 'Deck B', rotation: 10, yOffset: 22, xOffset: -18, delay: 0.2 },
  { src: blackDeckBack, label: 'Deck C', rotation: -6, yOffset: -14, xOffset: 82, delay: 0.4 },
  { src: redDeckD, label: 'Deck D', rotation: 16, yOffset: 44, xOffset: 126, delay: 0.6 },
] as const

const particles = [
  { left: '6%', top: '18%', size: 8, duration: 8 },
  { left: '18%', top: '72%', size: 6, duration: 9.5 },
  { left: '34%', top: '14%', size: 10, duration: 7.2 },
  { left: '58%', top: '68%', size: 5, duration: 8.8 },
  { left: '72%', top: '18%', size: 7, duration: 9.2 },
  { left: '88%', top: '62%', size: 9, duration: 7.6 },
] as const

export default function LandingHero({ onStartPlaying }: LandingHeroProps) {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,21,56,0.45),transparent_38%),linear-gradient(160deg,#24070c_0%,#430d16_46%,#090204_100%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0, transparent 18%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.06) 0, transparent 22%), repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)',
        }}
      />

      <motion.div
        className="absolute left-[10%] top-[12%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,205,110,0.25),rgba(255,149,0,0.05),transparent_70%)] blur-2xl"
        animate={{ opacity: [0.4, 0.65, 0.45], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[8%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,187,80,0.18),rgba(255,149,0,0.04),transparent_70%)] blur-2xl"
        animate={{ opacity: [0.3, 0.5, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {particles.map((particle) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="absolute rounded-full bg-gold/40 blur-[1px]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.65, 0.2] }}
          transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.38em] text-gold/80">Luxury Intimacy Card Game</p>
          <h1 className="font-display text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
            Rediscover Each Other.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/78 sm:text-xl">
            Discover what your partner really likes — one draw at a time.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <motion.button
              type="button"
              onClick={onStartPlaying}
              className="rounded-full bg-gradient-to-r from-gold via-[#f3d889] to-gold px-8 py-4 text-lg font-semibold text-burgundy shadow-[0_16px_40px_rgba(212,175,55,0.38)]"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Playing
            </motion.button>
            <Link
              to="/how-to-play"
              className="inline-flex items-center justify-center rounded-full border border-gold/25 bg-white/5 px-8 py-4 text-lg text-white/88 transition hover:border-gold/50 hover:bg-white/10"
            >
              How It Works
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm text-white/65 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              Four decks of escalating play
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              Romantic prompts and guided turns
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              Mobile-first for date night anywhere
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto flex h-[420px] w-full max-w-[460px] items-center justify-center sm:h-[520px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="absolute inset-x-10 bottom-10 h-24 rounded-full bg-black/35 blur-2xl" />

          {floatingCards.map((card) => (
            <motion.div
              key={card.label}
              className="absolute w-[160px] sm:w-[190px]"
              style={{
                x: card.xOffset,
                y: card.yOffset,
                rotate: card.rotation,
              }}
              animate={{ y: [card.yOffset, card.yOffset - 12, card.yOffset] }}
              transition={{
                duration: 4.2 + card.delay,
                delay: card.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ y: card.yOffset - 16, rotate: card.rotation + 2, scale: 1.03 }}
            >
              <div className="overflow-hidden rounded-[24px] border border-gold/20 bg-white/10 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                <img
                  src={card.src}
                  alt={card.label}
                  className="aspect-[3/4] w-full rounded-[18px] object-cover"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
