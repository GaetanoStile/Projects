import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'

const cards = [
  {
    title: 'Support',
    description: 'Questions, issues, or general feedback? We read everything.',
    action: 'Contact Support',
    href: 'mailto:support@couplesgameplay.com?subject=Couples%20Game%20Support',
  },
  {
    title: 'Join the Beta',
    description: 'Want early access and a chance to shape the game before launch?',
    action: 'Express Interest',
    href: 'mailto:hello@couplesgameplay.com?subject=I%20want%20to%20try%20the%20Couples%20Game%20beta',
  },
  {
    title: 'Give Feedback',
    description: 'Already played it? Tell us what moved you — and what didn\'t.',
    action: 'Share Feedback',
    href: 'mailto:hello@couplesgameplay.com?subject=Couples%20Game%20Beta%20Feedback',
  },
]

export default function Beta() {
  return (
    <MarketingLayout>
      <div className="relative min-h-screen py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-body mb-4">
              Beta Access
            </p>
            <h1 className="text-5xl md:text-6xl font-display gold-text mb-6">
              Try Couples Game
            </h1>
            <p className="text-lg md:text-xl text-white/75 font-body max-w-2xl mx-auto">
              We&rsquo;re building Couples Game in beta and would love feedback from real couples. Your experience shapes what this becomes.
            </p>
          </motion.div>

          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                className="parchment-bg rounded-2xl p-8 glow-warm flex flex-col items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <h2 className="text-xl font-display gold-text mb-3">{card.title}</h2>
                <p className="text-velvet/75 font-body text-sm flex-1 mb-6">
                  {card.description}
                </p>
                <a
                  href={card.href}
                  className="inline-block w-full text-center px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-sm rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                >
                  {card.action}
                </a>
              </motion.div>
            ))}
          </div>

          {/* Primary CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Link
              to="/auth"
              className="inline-block px-10 py-4 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all mb-6"
            >
              Start Playing Now
            </Link>
            <div className="mt-4">
              <Link to="/" className="text-gold/50 hover:text-gold font-body text-sm transition">
                &larr; Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </MarketingLayout>
  )
}
