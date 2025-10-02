import { NextRequest, NextResponse } from 'next/server'

// Mock Coinbase Commerce integration for demo purposes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, local_price, pricing_type, metadata } = body

    // Validate required fields
    if (!name || !description || !local_price || !pricing_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // For demo purposes, return a mock response
    const mockCharge = {
      id: `demo_charge_${Date.now()}`,
      hosted_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/store/demo-checkout?product=${encodeURIComponent(name)}&amount=${local_price.amount}`,
      status: 'NEW',
      pricing: {
        local: {
          amount: local_price.amount,
          currency: local_price.currency,
        },
        bitcoin: {
          amount: (parseFloat(local_price.amount) / 45000).toFixed(8),
          currency: 'BTC',
        },
        ethereum: {
          amount: (parseFloat(local_price.amount) / 3000).toFixed(6),
          currency: 'ETH',
        },
        usdc: {
          amount: local_price.amount,
          currency: 'USDC',
        },
      },
      addresses: {
        bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        ethereum: '0x742d35Cc6634C0532925a3b8D5C6C6C6C6C6C6C6',
        usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      },
      timeline: [
        {
          time: new Date().toISOString(),
          status: 'NEW',
        },
      ],
    }

    console.log('🚀 Mock crypto checkout created:', mockCharge.id)
    console.log('💰 Auto USDC conversion enabled: true')
    console.log('🌐 Network support: Base + Ethereum')

    return NextResponse.json(
      {
        success: true,
        id: mockCharge.id,
        hosted_url: mockCharge.hosted_url,
        status: mockCharge.status,
        pricing: mockCharge.pricing,
        addresses: mockCharge.addresses,
        timeline: mockCharge.timeline,
        cryptoSupported: true,
        autoUSDCConversion: true,
        networkSupport: {
          base: true,
          ethereum: true,
          supportedNetworks: ['Base', 'Ethereum'],
        },
        supportedCurrencies: ['USDC', 'ETH', 'BTC', 'USDT'],
      },
      {
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
      },
    )
  } catch (error) {
    console.error('❌ Error creating crypto checkout:', error)
    return NextResponse.json(
      {
        error: 'Failed to create crypto checkout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
