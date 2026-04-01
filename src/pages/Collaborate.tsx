import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'

const cards = [
  {
    title: 'Development',
    description: 'Interested in contributing to the game\'s development — features, mechanics, or code?',
    action: 'Get Involved',
    href: 'mailto:hello@couplesgameplay.com?subject=Interested%20in%20helping%20build%20Couples%20Game',
  },
  {
    title: 'Creative Collaboration',
    description: 'Writers, designers, or game creators — bring your vision and let\'s build something beautiful.',
    action: 'Start a Conversation',
    href: 'mailto:hello@couplesgameplay.com?subject=Creative%20Collaboration%20-%20Couples%20Game',
  },
  {
    title: 'Partnerships',
    description: 'Brands, platforms, or organisations interested in aligning with what we\'re creating.',
    action: 'Explore a Partnership',
    href: 'mailto:hello@couplesgameplay.com?subject=Partnership%20Inquiry%20-%20Couples%20Game',
  },
]

export default function Collaborate() {
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
              Build With Us
            </p>
            <h1 className="text-5xl md:text-6xl font-display gold-text mb-6">
              Build Couples Game With Us
            </h1>
            <p className="text-lg md:text-xl text-white/75 font-body max-w-2xl mx-auto">
              We&rsquo;re looking for collaborators, contributors, and creative partners who believe in what this experience can become.
            </p>
          </motion.div>

          {/* Interest cards */}
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

          {/* Closing note */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <p className="text-white/50 font-body text-sm mb-4 max-w-md mx-auto">
              All enquiries are handled personally. We respond to every message.
            </p>
            <a
              href="mailto:hello@couplesgameplay.com"
              className="text-gold/60 hover:text-gold font-body text-sm transition"
            >
              hello@couplesgameplay.com
            </a>
            <div className="mt-6">
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
