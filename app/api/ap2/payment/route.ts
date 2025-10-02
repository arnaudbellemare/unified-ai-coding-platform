import { NextRequest, NextResponse } from 'next/server'
import { ap2Service, AP2PaymentRequest } from '@/lib/ap2/ap2-service'

export async function POST(request: NextRequest) {
  try {
    const body: AP2PaymentRequest = await request.json()
    
    // Validate request
    if (!ap2Service.validatePaymentRequest(body)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid AP2 payment request' 
        },
        { status: 400 }
      )
    }

    console.log('🤖 AP2 Payment Request:', body)

    // Process AP2 payment
    const result = await ap2Service.processAgentPayment(body)

    return NextResponse.json({
      success: result.status === 'completed',
      payment: result,
      message: result.status === 'completed' 
        ? 'AP2 payment processed successfully' 
        : 'AP2 payment failed'
    })

  } catch (error) {
    console.error('AP2 Payment API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const agentId = searchParams.get('agentId')

    if (paymentId) {
      // Get specific payment status
      const payment = await ap2Service.getPaymentStatus(paymentId)
      return NextResponse.json({ success: true, payment })
    }

    if (agentId) {
      // List agent payments
      const payments = await ap2Service.listAgentPayments(agentId)
      return NextResponse.json({ success: true, payments })
    }

    return NextResponse.json(
      { success: false, error: 'Missing paymentId or agentId parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('AP2 Payment Status API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
