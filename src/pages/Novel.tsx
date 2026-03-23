import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'

export default function Novel() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            className="rounded-[34px] border border-gold/18 bg-gradient-to-br from-[#f5e7c3] to-[#d2ac5f] p-[1px] shadow-[0_28px_70px_rgba(0,0,0,0.28)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="flex h-full flex-col justify-between rounded-[33px] bg-gradient-to-br from-[#f8ebcb] to-[#d8b46a] p-8 text-burgundy">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-burgundy/70">The Games We Played</p>
                <h1 className="mt-4 font-display text-5xl">A love story with appetite, tension, and heat.</h1>
                <p className="mt-5 text-base leading-8 text-burgundy/80">
                  This companion novel deepens the world of Couples Game through romance, vulnerability,
                  and the magnetic push-and-pull of two people discovering what they awaken in each other.
                </p>
              </div>
              <Link
                to="/disclaimer"
                className="mt-10 inline-flex w-fit rounded-full bg-burgundy px-7 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-parchment shadow-[0_14px_28px_rgba(58,13,18,0.28)] transition hover:bg-velvet"
              >
                Start Playing
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="rounded-[34px] border border-gold/10 bg-white/[0.04] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          >
            <p className="text-sm uppercase tracking-[0.35em] text-gold/80">What to Expect</p>
            <div className="mt-6 space-y-6 text-white/76">
              <div>
                <h2 className="font-display text-3xl text-white">Romantic atmosphere</h2>
                <p className="mt-2 leading-8">
                  Think velvet rooms, lingering eye contact, and the kind of chemistry that builds slowly before it takes over the room.
                </p>
              </div>
              <div>
                <h2 className="font-display text-3xl text-white">Emotional intimacy</h2>
                <p className="mt-2 leading-8">
                  The story leans into honesty, longing, and the electric moment when playful curiosity becomes something deeper.
                </p>
              </div>
              <div>
                <h2 className="font-display text-3xl text-white">A seamless brand world</h2>
                <p className="mt-2 leading-8">
                  The same luxurious tone that shapes the game carries into the novel, turning the product into a romantic universe.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  )
}
