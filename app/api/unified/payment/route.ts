import { NextRequest, NextResponse } from 'next/server'
import { unifiedPaymentFacilitator, UnifiedPaymentRequest } from '@/lib/unified-system/unified-payment-facilitator'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'
import { DevAuth } from '@/lib/auth/dev-auth'

export async function POST(request: NextRequest) {
  try {
    // Always use real payments - no mock data

    // Require authentication for production
    const user = await requireAuth(request)

    const body = await request.json()
    const paymentRequest: UnifiedPaymentRequest = {
      amount: body.amount,
      currency: body.currency || 'USD',
      purpose: body.purpose || 'optimization',
      metadata: body.metadata,
      paymentMethod: body.paymentMethod,
      user: {
        id: user.id,
        walletAddress: body.walletAddress,
        email: body.email,
      },
    }

    // Validate required fields
    if (!paymentRequest.amount || paymentRequest.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment amount',
        },
        { status: 400 },
      )
    }

    // Process unified payment
    const result = await unifiedPaymentFacilitator.processPayment(paymentRequest)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      result,
    })
  } catch (error) {
    console.error('Unified payment error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get payment statistics
    const stats = unifiedPaymentFacilitator.getPaymentStats()

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to get payment stats:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve payment statistics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
