import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NovelSection() {
  return (
    <motion.section
      className="relative z-10 px-4 py-20 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[34px] border border-gold/20 bg-gradient-to-br from-[#f4e4bc] via-[#ecd69f] to-[#d2ac5f] p-[1px] shadow-[0_28px_70px_rgba(0,0,0,0.35)]">
          <div className="grid gap-10 rounded-[33px] bg-gradient-to-br from-[#f7e9c4] to-[#d8b46a] px-6 py-10 text-burgundy sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.35em] text-burgundy/70">The Games We Played</p>
              <h2 className="font-display text-4xl sm:text-5xl">
                A romantic story wrapped in tension, longing, and irresistible chemistry.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-burgundy/80">
                Step deeper into the world behind Couples Game with a novel about attraction, intimacy,
                and the moments that change two people forever. It is sensual, elegant, and built for
                readers who love emotion with heat.
              </p>
              <Link
                to="/novel"
                className="mt-8 inline-flex rounded-full bg-burgundy px-7 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-parchment shadow-[0_16px_30px_rgba(58,13,18,0.28)] transition hover:bg-velvet"
              >
                Read The Novel
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm rounded-[28px] border border-burgundy/15 bg-burgundy/90 p-6 text-parchment shadow-[0_22px_50px_rgba(58,13,18,0.22)]">
                <div className="rounded-[22px] border border-parchment/15 bg-gradient-to-br from-[#7b2330] to-[#34090f] px-7 py-12 text-center">
                  <p className="text-xs uppercase tracking-[0.45em] text-gold/80">Novel</p>
                  <h3 className="mt-4 font-display text-3xl text-[#f9efcf]">The Games We Played</h3>
                  <p className="mt-4 text-sm leading-7 text-parchment/75">
                    Desire, memory, romance, and the beautiful danger of opening yourself completely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
