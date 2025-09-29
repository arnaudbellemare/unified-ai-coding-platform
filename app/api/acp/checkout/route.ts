import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'
import { acpService } from '@/lib/acp/acp-service'

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
      userId: user.id,
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
      user.id,
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
        id: user.id,
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
