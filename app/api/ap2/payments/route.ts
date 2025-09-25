import { NextRequest, NextResponse } from 'next/server'
import { ap2Service } from '@/lib/ap2/service'
import { PaymentMethod } from '@/lib/ap2/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create_payment_request': {
        const { agentId, userId, amount, currency, description, metadata } = data
        const paymentIntent = await ap2Service.createPaymentRequest(
          agentId,
          userId,
          amount,
          currency,
          description,
          metadata,
        )
        return NextResponse.json({ success: true, paymentIntent })
      }

      case 'process_payment': {
        const { paymentId, paymentMethod, amount, currency } = data
        const paymentResponse = await ap2Service.processPayment(paymentId, paymentMethod, amount, currency)
        return NextResponse.json({ success: true, paymentResponse })
      }

      case 'get_capabilities': {
        const { agentId } = data
        const capabilities = ap2Service.getAgentCapabilities(agentId)
        return NextResponse.json({ success: true, capabilities })
      }

      case 'get_providers': {
        const providers = ap2Service.getPaymentProviders()
        return NextResponse.json({ success: true, providers })
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AP2 Payment API Error:', error)
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

    switch (action) {
      case 'providers':
        const providers = ap2Service.getPaymentProviders()
        return NextResponse.json({ success: true, providers })

      case 'capabilities':
        const agentId = url.searchParams.get('agentId')
        if (!agentId) {
          return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 })
        }
        const capabilities = ap2Service.getAgentCapabilities(agentId)
        return NextResponse.json({ success: true, capabilities })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AP2 Payment API Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
