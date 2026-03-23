import { motion } from 'framer-motion'

const features = [
  {
    title: 'Draw a Card',
    description: 'Pick from four seductive decks and let chance decide what kind of spark comes next.',
    icon: (
      <path
        d="M9 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm4 3h6M13 14h6M13 18h4M5 11V7a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Follow the Action',
    description: 'Every prompt keeps the pace flowing so your night feels playful, guided, and easy to enjoy.',
    icon: (
      <path
        d="M7 12h10m0 0-4-4m4 4-4 4M12 21C7.03 21 3 16.97 3 12S7.03 3 12 3s9 4.03 9 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Let Them Guide You',
    description: 'Turns are designed to build anticipation and invite each partner to lead, respond, and tease.',
    icon: (
      <path
        d="M12 21c-4.2-3.1-7-6.1-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 3.9-2.8 6.9-7 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Discover Their True Pleasures',
    description: 'Turn desire into conversation and uncover the touches, fantasies, and rhythms your partner loves.',
    icon: (
      <path
        d="M12 7v10m-5-5h10M5 21h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

export default function Features() {
  return (
    <motion.section
      id="how-it-works"
      className="relative z-10 scroll-mt-28 px-4 py-20 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold/80">How It Works</p>
          <h2 className="font-display text-4xl text-white sm:text-5xl">
            A romantic ritual designed to feel easy, intimate, and unforgettable.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              className="rounded-[28px] border border-gold/12 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="mt-5 font-display text-2xl text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/72">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
