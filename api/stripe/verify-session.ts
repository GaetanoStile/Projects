import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!stripeKey || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing server environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const { sessionId } = (req.body ?? {}) as { sessionId?: string }

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' })
  }

  try {
    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Session is not paid' })
    }

    const userId = session.metadata?.supabase_user_id
    if (!userId) {
      return res.status(400).json({ error: 'No user linked to this session' })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { error: updateError } = await supabase
      .from('users_profile')
      .update({ plan_tier: 'paid' })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating plan_tier:', updateError)
      return res.status(500).json({ error: 'Failed to activate plan' })
    }

    return res.status(200).json({ planTier: 'paid' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Verify session error:', message)
    return res.status(500).json({ error: message })
  }
}
