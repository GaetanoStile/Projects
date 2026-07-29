import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'

export default function Terms() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl space-y-8 rounded-[32px] border border-gold/10 bg-white/[0.04] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gold/80">Terms</p>
            <h1 className="mt-4 font-display text-5xl text-white">Terms of Use</h1>
            <p className="mt-3 text-sm text-white/50">Last updated: July 29, 2026</p>
          </div>

          <div className="space-y-6 leading-8 text-white/72 font-body">
            <p>
              Welcome to Couples Game. By accessing or using the website, apps, or related services
              (the &ldquo;Service&rdquo;), you agree to these Terms of Use.
            </p>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Eligibility</h2>
              <p>
                You must be at least 18 years old (or the age of majority where you live) to use Couples
                Game. The Service includes intimate adult content intended for consenting partners.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Accounts</h2>
              <p>
                You are responsible for keeping your login credentials secure and for activity under your
                account. Provide accurate information and notify us if you suspect unauthorized access.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Acceptable use</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Use the Service only for lawful, consensual adult play between partners</li>
                <li>Do not upload illegal, abusive, or non-consensual content</li>
                <li>Do not attempt to disrupt, scrape, or reverse engineer the Service</li>
                <li>Do not share another person&rsquo;s private information without permission</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Subscriptions and payments</h2>
              <p>
                Paid features (such as Community Library access) are billed through Stripe. Prices, billing
                intervals, and taxes are shown at checkout. Unless required by law, fees are non-refundable
                once a billing period begins. You can manage or cancel a subscription through the payment
                provider tools we provide or by contacting support.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Content and ownership</h2>
              <p>
                We own Couples Game branding, software, and official card content. You retain rights to
                custom cards you create; by publishing a card as public, you grant us a license to display
                it in the Community Library. You are responsible for the content you create.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Disclaimer</h2>
              <p>
                The Service is provided &ldquo;as is&rdquo; for entertainment. Partners should communicate
                boundaries and stop any activity that feels unsafe. We are not liable for relationship
                outcomes or injuries arising from use of suggested activities.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Termination</h2>
              <p>
                We may suspend or terminate access if you violate these terms or abuse the Service. You may
                stop using the Service at any time and request account deletion.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Contact</h2>
              <p>
                Questions about these terms:{' '}
                <a className="text-gold underline" href="mailto:support@couplesgameplay.com">
                  support@couplesgameplay.com
                </a>
                .
              </p>
            </section>
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
