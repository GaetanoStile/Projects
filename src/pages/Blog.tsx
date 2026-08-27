import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'
import { SUBSTACK_URL } from '@/lib/routes'

const posts = [
  {
    title: 'How to Keep the Spark Alive',
    description:
      'Romance is rarely about one grand gesture. It lives in rituals, private language, and making desire feel intentional again.',
  },
  {
    title: 'Date Night - How the Game Came Alive',
    description:
      'Behind the deep reds, the gold trim, and the teasing card prompts is a simple idea: date night should feel immersive and playful.',
  },
  {
    title: 'Exploring Intimacy Through Play',
    description:
      'When couples play together, it becomes easier to ask for what feels good, reveal what you want more of, and stay curious with each other.',
  },
]

export default function Blog() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-gold/80">From The Journal</p>
            <h1 className="font-display text-5xl text-white sm:text-6xl">Stories that keep the mood alive.</h1>
            <p className="mt-5 text-lg leading-8 text-white/72">
              Thoughts on romance, design, desire, and the playful rituals that inspired Couples Game.
              New essays and beta notes live on our Substack.
            </p>
            <a
              href={SUBSTACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold/80 px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-velvet transition hover:from-gold/90 hover:to-gold/70"
            >
              Visit our Substack
            </a>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.article
                key={post.title}
                className="rounded-[30px] border border-gold/10 bg-white/[0.04] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className="mb-6 rounded-[22px] bg-gradient-to-br from-[#5c1120] via-[#862242] to-[#d4af37] p-[1px]">
                  <div className="rounded-[21px] bg-black/20 px-5 py-14 text-center font-display text-2xl text-white">
                    Couples Game Journal
                  </div>
                </div>
                <h2 className="font-display text-3xl text-white">{post.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/72">{post.description}</p>
                <a
                  href={SUBSTACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-gold transition hover:text-[#f1d27b]"
                >
                  Read on Substack →
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
