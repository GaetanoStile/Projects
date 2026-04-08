import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
  const priceId = process.env.STRIPE_PRICE_PREMIUM_MONTHLY?.trim()

  if (!secretKey || !priceId) {
    console.error('Missing Stripe environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const stripe = new Stripe(secretKey)

  const appUrl =
    process.env.VITE_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')

  try {
    const { userId } = (req.body ?? {}) as { userId?: string }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: userId ? { supabase_user_id: userId } : {},
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe checkout session error:', message)
    return res.status(500).json({ error: message })
  }
}
