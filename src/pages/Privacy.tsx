import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'

export default function Privacy() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl rounded-[32px] border border-gold/10 bg-white/[0.04] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="text-sm uppercase tracking-[0.35em] text-gold/80">Privacy</p>
          <h1 className="mt-4 font-display text-5xl text-white">Privacy Policy</h1>
          <p className="mt-6 leading-8 text-white/72">
            Couples Game is designed to be intimate and respectful. This placeholder privacy page can be
            replaced with production policy copy covering account data, analytics, payment handling, and support contact details.
          </p>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
