import Stripe from 'stripe'

// Initialize Stripe with environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

export interface StripeCheckoutRequest {
  items: Array<{
    id: string
    name: string
    description?: string
    price: number
    quantity: number
    currency?: string
  }>
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export interface StripeCheckoutResponse {
  success: boolean
  sessionId?: string
  url?: string
  error?: string
}

export class StripeService {
  /**
   * Create a Stripe checkout session for e-commerce
   */
  async createCheckoutSession(request: StripeCheckoutRequest): Promise<StripeCheckoutResponse> {
    try {
      // Convert items to Stripe line items format
      const lineItems = request.items.map((item) => ({
        price_data: {
          currency: item.currency || 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            metadata: {
              product_id: item.id,
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }))

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
        metadata: request.metadata || {},
        automatic_tax: {
          enabled: true,
        },
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE'],
        },
        allow_promotion_codes: true,
      })

      return {
        success: true,
        sessionId: session.id,
        url: session.url || undefined,
      }
    } catch (error) {
      console.error('Stripe checkout session creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Create a Stripe payment intent for direct payments
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>,
  ): Promise<{ success: boolean; clientSecret?: string; error?: string }> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        success: true,
        clientSecret: paymentIntent.client_secret || undefined,
      }
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Retrieve a checkout session
   */
  async getCheckoutSession(
    sessionId: string,
  ): Promise<{ success: boolean; session?: Stripe.Checkout.Session; error?: string }> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      return {
        success: true,
        session,
      }
    } catch (error) {
      console.error('Stripe session retrieval failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Verify webhook signature (for production use)
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      stripe.webhooks.constructEvent(payload, signature, secret)
      return true
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return false
    }
  }
}

export const stripeService = new StripeService()
