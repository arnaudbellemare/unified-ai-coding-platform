import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'X402 payment API is working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/x402/payment',
    method: 'POST',
    requiredFields: ['amount', 'currency', 'recipient', 'network', 'walletAddress'],
    optionalFields: ['privyUserId', 'paymentMethod'],
  })
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()

    return NextResponse.json({
      success: true,
      message: 'X402 test endpoint working',
      receivedBody: bodyText ? 'Yes' : 'No',
      bodyLength: bodyText.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
