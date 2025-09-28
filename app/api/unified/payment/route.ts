import { NextRequest, NextResponse } from 'next/server'
import { unifiedPaymentFacilitator, UnifiedPaymentRequest } from '@/lib/unified-system/unified-payment-facilitator'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'
import { DevAuth } from '@/lib/auth/dev-auth'

export async function POST(request: NextRequest) {
  try {
    // Check if development mode is enabled (when no API keys configured)
    if (DevAuth.isDevMode()) {
      const mockResult = {
        success: true,
        payment: {
          id: `unified_dev_${Date.now()}`,
          amount: 10.50,
          currency: 'USD',
          status: 'completed',
          method: 'x402',
          transactionHash: '0x' + Math.random().toString(16).substring(2, 66),
          receipt: `unified-receipt-${Date.now()}`
        },
        costBreakdown: {
          baseCost: 10.00,
          networkFees: 0.01,
          platformFees: 0.15,
          totalCost: 10.16,
          savings: 2.50
        },
        optimization: {
          applied: true,
          strategy: 'unified-optimization',
          tokenReduction: 35,
          costReduction: 0.25
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          provider: 'x402'
        }
      }
      
      return NextResponse.json({
        success: true,
        user: DevAuth.getCurrentUser(),
        result: mockResult
      })
    }

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
        email: body.email
      }
    }

    // Validate required fields
    if (!paymentRequest.amount || paymentRequest.amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment amount'
      }, { status: 400 })
    }

    // Process unified payment
    const result = await unifiedPaymentFacilitator.processPayment(paymentRequest)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url
      },
      result
    })

  } catch (error) {
    console.error('Unified payment error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get payment statistics
    const stats = unifiedPaymentFacilitator.getPaymentStats()
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to get payment stats:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve payment statistics',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
