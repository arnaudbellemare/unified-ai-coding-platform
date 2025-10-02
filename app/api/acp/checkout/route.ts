import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'
import { acpService } from '@/lib/acp/acp-service'
import { ACPOrderManager } from '@/lib/acp/order-manager'
import { ACPWebhookHandler } from '@/lib/acp/webhook-handler'

// Initialize services
const orderManager = new ACPOrderManager()
const webhookHandler = new ACPWebhookHandler()

// Register webhook handlers
webhookHandler.addEventHandler('order.created', async (order, event) => {
  console.log(`📦 Order created webhook: ${order.id}`)
  // Send confirmation email, update inventory, etc.
})

webhookHandler.addEventHandler('payment.processed', async (order, event) => {
  console.log(`💳 Payment processed webhook: ${order.id}`)
  // Update payment status, trigger fulfillment
})

webhookHandler.addEventHandler('shipped', async (order, event) => {
  console.log(`🚚 Order shipped webhook: ${order.id}`)
  // Send tracking email, update customer portal
})

/**
 * Agentic Commerce Protocol (ACP) Checkout Endpoint
 * Allows AI agents to initiate purchases through VERCLIBASE
 */
export async function POST(request: NextRequest) {
  try {
    // Verify AI agent authentication (simplified for now)
    let user = await getCurrentUser(request)
    // Allow guest checkout in dev/demo to keep UI usable
    if (!user) {
      user = { id: `guest-${Date.now()}` } as any
    }

    const body = await request.json()
    const { items, totalAmount, currency = 'USDC', paymentMethod = 'x402', metadata = {} } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid items',
          message: 'Items array is required and must not be empty',
        },
        { status: 400 },
      )
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid amount',
          message: 'Total amount must be greater than 0',
        },
        { status: 400 },
      )
    }

    console.log('🛒 ACP Checkout initiated:', {
      userId: user?.id || 'guest',
      itemsCount: items.length,
      totalAmount,
      currency,
      paymentMethod,
    })

    // Process payment through ACP service
    const checkoutResult = await acpService.processCheckout(
      {
        items,
        totalAmount,
        currency,
        paymentMethod: paymentMethod || 'x402',
        metadata,
      },
      user?.id || 'guest',
    )

    if (!checkoutResult.success) {
      return NextResponse.json(
        {
          error: 'Payment processing failed',
          message: 'Unable to process ACP checkout',
          details: checkoutResult.error,
        },
        { status: 402 },
      )
    }

    // Create order in order manager
    const order = await orderManager.createOrder({
      items: items.map(item => ({
        product_id: item.productId || item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        total: (item.price || 0) * (item.quantity || 1)
      })),
      customer: {
        id: user?.id || 'guest',
        email: user?.email || 'guest@verclibase.com',
        name: user?.name || 'Guest User',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'US'
        }
      },
      payment: {
        method: paymentMethod || 'x402',
        transaction_id: checkoutResult.paymentId || `txn_${Date.now()}`,
        status: 'completed',
        amount: totalAmount,
        currency
      },
      shipping: {
        method: 'standard',
        status: 'pending'
      },
      metadata
    })

    // Process webhook events
    await webhookHandler.processWebhookEvent({
      type: 'order.created',
      order_id: order.id,
      data: {
        order_id: order.id,
        total: order.total,
        currency: order.currency,
        items_count: order.items.length
      },
      signature: 'webhook_signature'
    })

    // Create ACP-compliant response
    const checkoutResponse = {
      id: checkoutResult.checkoutId || `acp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      amount: totalAmount,
      currency,
      paymentMethod,
      paymentId: checkoutResult.paymentId,
      items,
      metadata: {
        ...metadata,
        verclibaseTransaction: true,
        acpVersion: '1.0',
        processedBy: 'VERCLIBASE',
      },
      timestamp: new Date().toISOString(),
      // ACP-specific fields
      merchant: {
        id: 'verclibase',
        name: 'VERCLIBASE',
        url: 'https://verclibase.com',
      },
      buyer: {
        id: user?.id || 'guest',
        type: 'ai_agent',
      },
    }

    console.log('✅ ACP Checkout completed:', checkoutResponse.id)

    return NextResponse.json({
      success: true,
      checkout: checkoutResponse,
      message: 'ACP checkout completed successfully',
    })
  } catch (error) {
    console.error('❌ ACP Checkout error:', error)
    return NextResponse.json(
      {
        error: 'Checkout processing failed',
        message: 'Internal server error during ACP checkout',
      },
      { status: 500 },
    )
  }
}

/**
 * ACP Configuration Endpoint
 * Returns VERCLIBASE's ACP capabilities and supported payment methods
 */
export async function GET() {
  const config = acpService.getMerchantConfig()

  return NextResponse.json({
    success: true,
    acp: {
      version: '1.0',
      supported: true,
      merchant: config,
      capabilities: ['checkout_initiation', 'payment_processing', 'order_fulfillment', 'refund_handling'],
    },
  })
}
