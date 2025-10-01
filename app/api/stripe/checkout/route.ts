import { NextRequest, NextResponse } from 'next/server'
import { stripeService, StripeCheckoutRequest } from '@/lib/stripe/stripe-service'

export async function POST(request: NextRequest) {
  try {
    const body: StripeCheckoutRequest = await request.json()

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Items array is required and cannot be empty' }, { status: 400 })
    }

    if (!body.successUrl || !body.cancelUrl) {
      return NextResponse.json({ error: 'Success and cancel URLs are required' }, { status: 400 })
    }

    // Validate each item
    for (const item of body.items) {
      if (!item.id || !item.name || typeof item.price !== 'number' || !item.quantity) {
        return NextResponse.json(
          {
            error: 'Each item must have id, name, price (number), and quantity',
          },
          { status: 400 },
        )
      }
    }

    const result = await stripeService.createCheckoutSession(body)

    if (result.success) {
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        checkoutUrl: result.url,
        message: 'Stripe checkout session created successfully',
      })
    } else {
      return NextResponse.json(
        {
          error: result.error || 'Failed to create checkout session',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Stripe checkout API error:', error)
    return NextResponse.json(
      {
        error: 'Invalid request format or server error',
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe checkout endpoint - POST only',
    methods: ['POST'],
    example: {
      items: [
        {
          id: 'product_1',
          name: 'Premium T-Shirt',
          description: 'High-quality cotton t-shirt',
          price: 29.99,
          quantity: 1,
          currency: 'usd',
        },
      ],
      successUrl: 'https://yourapp.com/success',
      cancelUrl: 'https://yourapp.com/cancel',
    },
  })
}
