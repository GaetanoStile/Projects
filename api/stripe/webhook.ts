import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  api: { bodyParser: false },
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing webhook environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const stripe = new Stripe(stripeKey)
  const signature = req.headers['stripe-signature'] as string

  let event: Stripe.Event

  try {
    const rawBody = await readRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return res.status(400).json({ error: `Webhook Error: ${message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id

    if (userId && session.payment_status === 'paid') {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey)

        const { error: updateError } = await supabase
          .from('users_profile')
          .update({ plan_tier: 'paid' })
          .eq('id', userId)

        if (updateError) {
          console.error('Webhook: failed to update plan_tier:', updateError)
        }
      } catch (err) {
        console.error('Webhook: exception updating plan_tier:', err)
      }
    }
  }

  return res.status(200).json({ received: true })
}
