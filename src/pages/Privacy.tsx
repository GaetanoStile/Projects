import { motion } from 'framer-motion'
import MarketingLayout from '@/components/landing/MarketingLayout'

export default function Privacy() {
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
            <p className="text-sm uppercase tracking-[0.35em] text-gold/80">Privacy</p>
            <h1 className="mt-4 font-display text-5xl text-white">Privacy Policy</h1>
            <p className="mt-3 text-sm text-white/50">Last updated: July 29, 2026</p>
          </div>

          <div className="space-y-6 leading-8 text-white/72 font-body">
            <p>
              Couples Game (&ldquo;we,&rdquo; &ldquo;us&rdquo;) respects your privacy. This policy explains what
              information we collect when you use couplesgameplay.com and related apps, how we use it,
              and the choices you have.
            </p>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Information we collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-white/85">Account data:</strong> email address, optional display
                  name, and authentication details when you sign up.
                </li>
                <li>
                  <strong className="text-white/85">Gameplay data:</strong> custom cards, favorites, presets
                  (local or cloud), and saved game sessions if you use a signed-in account.
                </li>
                <li>
                  <strong className="text-white/85">Billing data:</strong> payment is processed by Stripe. We
                  receive subscription status and related identifiers; we do not store full card numbers.
                </li>
                <li>
                  <strong className="text-white/85">Technical data:</strong> basic logs such as device/browser
                  type and error events needed to keep the service reliable.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">How we use information</h2>
              <p>We use your information to provide and improve Couples Game, including to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Authenticate you and sync cloud cards, favorites, and sessions</li>
                <li>Unlock paid features such as the Community Library</li>
                <li>Respond to support requests and send important service notices</li>
                <li>Protect against abuse and debug product issues</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Sharing</h2>
              <p>
                We do not sell your personal information. We share data only with processors that help us
                run the product (for example Supabase for auth/database and Stripe for payments), and when
                required by law.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Guest mode</h2>
              <p>
                Guest play stores settings and progress on your device (local storage). Clearing browser
                data removes that information. Guest mode does not create a cloud account.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Your choices</h2>
              <p>
                You may update profile details in-app, request deletion of your account and associated cloud
                data, or contact us with privacy questions at{' '}
                <a className="text-gold underline" href="mailto:support@couplesgameplay.com">
                  support@couplesgameplay.com
                </a>
                .
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Children</h2>
              <p>
                Couples Game is intended for adults. We do not knowingly collect information from anyone
                under 18.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-2xl text-gold">Changes</h2>
              <p>
                We may update this policy as the product evolves. Continued use after changes means you
                accept the updated policy.
              </p>
            </section>
          </div>
        </motion.div>
      </section>
    </MarketingLayout>
  )
}
