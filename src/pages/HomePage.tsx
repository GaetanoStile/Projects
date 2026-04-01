import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BlogSection from '@/components/landing/BlogSection'
import Features from '@/components/landing/Features'
import LandingHero from '@/components/landing/LandingHero'
import MarketingLayout from '@/components/landing/MarketingLayout'
import NovelSection from '@/components/landing/NovelSection'

function BetaCTA() {
  return (
    <section className="relative z-10 py-20 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="parchment-bg rounded-2xl p-10 md:p-14 glow-warm text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-gold/60 font-body mb-3">
            Now in Beta
          </p>
          <h2 className="text-3xl md:text-4xl font-display gold-text mb-4">
            Help Shape Couples Game
          </h2>
          <p className="text-base md:text-lg text-velvet/80 font-body max-w-xl mx-auto mb-8">
            We&rsquo;re building Couples Game in beta and would love feedback from real couples. Try it and tell us what you think.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/beta"
              className="inline-block px-8 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-base rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
            >
              Try the Beta
            </Link>
            <a
              href="mailto:hello@couplesgameplay.com?subject=Couples%20Game%20Beta%20Feedback"
              className="inline-block px-8 py-3 bg-velvet/80 text-gold font-body text-base rounded-lg hover:bg-velvet transition-colors border border-gold/20"
            >
              Send Feedback
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function CollaborateCTA() {
  return (
    <section className="relative z-10 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="rounded-2xl border border-gold/20 bg-black/30 p-10 md:p-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-display gold-text mb-4">
            Interested in Building With Us?
          </h2>
          <p className="text-base md:text-lg text-white/70 font-body max-w-xl mx-auto mb-8">
            Reach out if you&rsquo;d like to collaborate, contribute, or partner on something meaningful.
          </p>
          <Link
            to="/collaborate"
            className="inline-block px-8 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-base rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
          >
            Reach Out
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <LandingHero onStartPlaying={() => navigate('/auth')} />
      <Features />
      <BlogSection />
      <NovelSection />
      <BetaCTA />
      <CollaborateCTA />
    </MarketingLayout>
  )
}
