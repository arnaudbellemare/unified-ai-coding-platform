import { NextRequest, NextResponse } from 'next/server'
import { microEcommerceOptimizer } from '@/lib/micro-ecommerce/payment-optimizer'
import { getPrivyUser } from '@/lib/auth/privy-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    // Get user for authentication
    const privyUser = await getPrivyUser(request)
    if (!privyUser) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    switch (action) {
      case 'process_payment': {
        const { amount, description, paymentMethod } = data

        // Validate amount
        if (amount > 10) {
          return NextResponse.json(
            { success: false, error: 'Amount exceeds $10 limit for micro payments' },
            { status: 400 },
          )
        }

        const transaction = await microEcommerceOptimizer.processMicroPayment(
          privyUser.id,
          amount,
          description,
          paymentMethod === 'credits',
        )

        return NextResponse.json({
          success: true,
          transaction,
          message: `Payment processed successfully. Settlement time: ${transaction.settlementTime}s`,
        })
      }

      case 'topup_credits': {
        const { amount } = data
        const success = await microEcommerceOptimizer.topUpCredits(privyUser.id, amount)

        return NextResponse.json({
          success,
          message: success ? `Credits topped up with $${amount}` : 'Top-up failed',
          newBalance: success ? microEcommerceOptimizer.getCreditBalance(privyUser.id) : null,
        })
      }

      case 'batch_payments': {
        const { payments } = data
        const transactions = await microEcommerceOptimizer.batchMicroPayments(privyUser.id, payments)

        return NextResponse.json({
          success: true,
          transactions,
          message: `Batch processed: ${payments.length} payments`,
        })
      }

      case 'get_recommendation': {
        const { monthlySpend } = data
        const recommendation = microEcommerceOptimizer.getPaymentRecommendation(privyUser.id, monthlySpend)

        return NextResponse.json({ success: true, recommendation })
      }

      case 'get_balance': {
        const balance = microEcommerceOptimizer.getCreditBalance(privyUser.id)
        return NextResponse.json({ success: true, balance })
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Micro e-commerce payment error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    // Get user for authentication
    const privyUser = await getPrivyUser(request)
    if (!privyUser) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    switch (action) {
      case 'balance':
        const balance = microEcommerceOptimizer.getCreditBalance(privyUser.id)
        return NextResponse.json({ success: true, balance })

      case 'recommendation':
        const monthlySpend = parseFloat(url.searchParams.get('monthlySpend') || '20')
        const recommendation = microEcommerceOptimizer.getPaymentRecommendation(privyUser.id, monthlySpend)
        return NextResponse.json({ success: true, recommendation })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Micro e-commerce GET error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
