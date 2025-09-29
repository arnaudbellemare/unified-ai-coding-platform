import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simple X402 Payment API called')
    
    const body = await request.json()
    console.log('📝 Request body:', body)

    // Simple payment simulation
    const paymentResult = {
      success: true,
      transactionId: `simple_x402_${Date.now()}`,
      amount: body.amount || 0.01,
      currency: body.currency || 'USDC',
      recipient: body.recipient || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      network: body.network || 'base-sepolia',
      walletAddress: body.walletAddress || '0x0000000000000000000000000000000000000000',
      timestamp: new Date().toISOString(),
      status: 'completed',
    }

    console.log('✅ Payment processed:', paymentResult)

    return NextResponse.json({
      success: true,
      payment: paymentResult,
      message: 'Simple X402 payment processed successfully',
    })
  } catch (error) {
    console.error('❌ Simple X402 payment error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process simple X402 payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Simple X402 payment endpoint is working',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
  })
}
