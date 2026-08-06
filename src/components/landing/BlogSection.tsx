import { motion } from 'framer-motion'
import { SUBSTACK_URL } from '@/lib/routes'

const journalEntries = [
  {
    title: 'How to Keep the Spark Alive',
    description: 'Practical rituals, flirtation cues, and tiny changes that make long-term desire feel new again.',
    accent: 'from-[#54121c] via-[#7c1731] to-[#bc7d33]',
  },
  {
    title: 'Date Night - How the Game Came Alive',
    description: 'The story behind the mood, mechanics, and velvet-draped atmosphere that shaped Couples Game.',
    accent: 'from-[#2b0b10] via-[#6a1120] to-[#9d4151]',
  },
  {
    title: 'Exploring Intimacy Through Play',
    description: 'Why guided play helps couples communicate desire with more trust, curiosity, and confidence.',
    accent: 'from-[#422531] via-[#7e2734] to-[#d4af37]',
  },
]

export default function BlogSection() {
  return (
    <motion.section
      className="relative z-10 px-4 py-20 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold/80">From The Journal</p>
            <h2 className="font-display text-4xl text-white sm:text-5xl">Stories, mood, and intimate inspiration.</h2>
            <p className="mt-4 text-base leading-7 text-white/70 font-body max-w-xl">
              Follow Couples Game on Substack for essays, behind-the-scenes notes, and beta updates.
            </p>
          </div>
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-velvet transition hover:from-gold/90 hover:to-gold/70"
          >
            Read on Substack
          </a>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {journalEntries.map((entry, index) => (
            <motion.article
              key={entry.title}
              className="overflow-hidden rounded-[28px] border border-gold/10 bg-white/[0.04] shadow-[0_24px_60px_rgba(0,0,0,0.24)]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <div className={`aspect-[16/10] bg-gradient-to-br ${entry.accent} p-6`}>
                <div className="flex h-full items-end rounded-[22px] border border-white/10 bg-black/10 p-5">
                  <p className="font-display text-2xl text-white">Couples Game Journal</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl text-white">{entry.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/72">{entry.description}</p>
                <a
                  href={SUBSTACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold transition hover:text-[#f1d27b]"
                >
                  Read on Substack
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
