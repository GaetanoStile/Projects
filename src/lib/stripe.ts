import { loadStripe } from '@stripe/stripe-js'

let stripePromise: ReturnType<typeof loadStripe> | null = null

/**
 * Lazily initialise the Stripe.js client using the publishable key.
 * Call this only when you need to interact with Stripe on the frontend
 * (e.g. for Elements). For redirect-based Checkout, the server returns
 * a URL and we navigate directly — no Stripe.js required.
 */
export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined
    if (!key) {
      console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not set')
      return null
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

/**
 * Call the server-side checkout endpoint and redirect to Stripe Checkout.
 * Returns an error string if something goes wrong, otherwise navigates away.
 */
export const redirectToCheckout = async (userId?: string): Promise<string | null> => {
  try {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      return data.error ?? 'Failed to create checkout session'
    }

    const data = (await res.json()) as { url?: string }
    if (!data.url) return 'No checkout URL returned'

    window.location.href = data.url
    return null
  } catch (err) {
    return err instanceof Error ? err.message : 'Unexpected error'
  }
}
