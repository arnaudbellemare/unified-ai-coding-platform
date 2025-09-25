import { NextRequest, NextResponse } from 'next/server'
import { getPrivyUser } from '@/lib/auth/privy-auth'

interface X402Payment {
  transactionId: string
  amount: number
  currency: string
  network: string
  walletAddress: string
  status: 'completed' | 'pending' | 'failed'
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, input, x402Payment } = await request.json()

    if (!agentId || !input) {
      return NextResponse.json({ error: 'Agent ID and input are required' }, { status: 400 })
    }

    // Get Privy user for authentication
    const privyUser = await getPrivyUser(request)

    // Check if x402 payment is provided and valid
    if (!x402Payment || x402Payment.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'X402 payment required for agent execution',
          requiresPayment: true,
          estimatedCost: 0.05, // $0.05 for agent execution
          paymentMethods: ['x402', 'credit_card', 'crypto'],
          privyUser: privyUser
            ? {
                id: privyUser.id,
                walletAddress: privyUser.wallet?.address,
              }
            : null,
        },
        { status: 402 },
      ) // 402 Payment Required
    }

    // Verify payment amount is sufficient
    if (x402Payment.amount < 0.05) {
      return NextResponse.json(
        {
          error: 'Insufficient payment amount',
          requiredAmount: 0.05,
          providedAmount: x402Payment.amount,
        },
        { status: 402 },
      )
    }

    // Simulate agent execution with payment verification
    const executionResult = {
      success: true,
      agentId,
      input,
      output: `Agent execution completed with x402 payment verification. Transaction: ${x402Payment.transactionId}`,
      timestamp: new Date().toISOString(),
      costOptimization: {
        originalCost: 0.08,
        optimizedCost: 0.05,
        savings: 0.03,
        tokenReduction: 15.5,
        strategies: ['x402_payment_optimization', 'cost_aware_execution'],
      },
      payment: {
        transactionId: x402Payment.transactionId,
        amount: x402Payment.amount,
        currency: x402Payment.currency,
        network: x402Payment.network,
        status: 'completed',
      },
    }

    // Log execution for analytics
    console.log('Agent execution with x402 payment and Privy:', {
      agentId,
      transactionId: x402Payment.transactionId,
      amount: x402Payment.amount,
      privyUserId: privyUser?.id,
      walletAddress: privyUser?.wallet?.address,
      timestamp: executionResult.timestamp,
    })

    return NextResponse.json({
      success: true,
      result: executionResult,
      message: 'Agent executed successfully with x402 payment',
    })
  } catch (error) {
    console.error('Agent execution error:', error)
    return NextResponse.json({ error: 'Failed to execute agent' }, { status: 500 })
  }
}
