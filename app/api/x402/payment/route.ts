import { NextRequest, NextResponse } from 'next/server'

// Handle all HTTP methods
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'X402 payment endpoint is working',
    methods: ['POST', 'GET'],
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  console.log('🚀 X402 Payment API called:', {
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  })

  try {
    // Read the request body as text first to handle potential JSON parsing issues
    const bodyText = await request.text()

    console.log('📝 Request body received:', {
      bodyLength: bodyText.length,
      bodyPreview: bodyText.substring(0, 200),
    })

    if (!bodyText) {
      return NextResponse.json(
        {
          error: 'Empty request body',
          details: 'No JSON data received',
        },
        { status: 400 },
      )
    }

    let requestData
    try {
      requestData = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json(
        {
          error: 'Invalid JSON format',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          receivedBody: bodyText.substring(0, 200), // Log first 200 chars for debugging
        },
        { status: 400 },
      )
    }

    const { amount, currency, recipient, network, walletAddress, privyUserId, paymentMethod } = requestData

    if (!amount || !currency || !recipient || !network || !walletAddress) {
      return NextResponse.json(
        {
          error: 'Missing required payment parameters',
          details: {
            amount: !!amount,
            currency: !!currency,
            recipient: !!recipient,
            network: !!network,
            walletAddress: !!walletAddress,
          },
          receivedData: requestData,
        },
        { status: 400 },
      )
    }

    // Simulate x402 payment processing with Privy integration
    // In a real implementation, this would integrate with the x402 protocol and Privy API
    const paymentResult = {
      success: true,
      transactionId: `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      recipient,
      network,
      walletAddress,
      privyUserId,
      paymentMethod: paymentMethod || 'x402',
      timestamp: new Date().toISOString(),
      status: 'completed',
      gasUsed: '0.001',
      gasPrice: '0.0001',
      totalCost: amount + 0.001, // amount + gas
      privyIntegration: !!privyUserId,
    }

    // Log payment for analytics
    console.log('X402 Payment processed with Privy:', {
      transactionId: paymentResult.transactionId,
      amount,
      currency,
      network,
      privyUserId,
      paymentMethod,
      timestamp: paymentResult.timestamp,
    })

    return NextResponse.json({
      success: true,
      payment: paymentResult,
      message: 'X402 payment processed successfully',
    })
  } catch (error) {
    console.error('X402 payment error:', error)
    return NextResponse.json({ error: 'Failed to process X402 payment' }, { status: 500 })
  }
}

// Handle any other HTTP methods
export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed. Use POST for payments.' }, { status: 405 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed. Use POST for payments.' }, { status: 405 })
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed. Use POST for payments.' }, { status: 405 })
}
