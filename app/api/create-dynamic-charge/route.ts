import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, metadata } = await request.json()

    // Validate required fields
    if (!amount || !currency) {
      return NextResponse.json({ error: 'Amount and currency are required' }, { status: 400 })
    }

    // Generate dynamic charge ID
    const chargeId = `charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create dynamic charge response
    const charge = {
      id: chargeId,
      hosted_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/store/demo-checkout?product=${encodeURIComponent(metadata?.product || 'Dynamic Product')}&amount=${amount}&charge_id=${chargeId}`,
      status: 'NEW',
      pricing_type: 'fixed_price',
      local_price: {
        amount: amount.toString(),
        currency: currency.toUpperCase(),
      },
      metadata: {
        ...metadata,
        ai_agent_optimized: metadata?.ai_agent_optimized || false,
        geo_tracked: metadata?.geo_tracked || false,
        dynamic_pricing: true,
        created_at: new Date().toISOString(),
      },
      timeline: [
        {
          time: new Date().toISOString(),
          status: 'NEW',
        },
      ],
      // GEO optimization metadata
      geo_optimization: {
        ai_agent_compatible: true,
        structured_data_enabled: true,
        conversion_tracking: true,
        network: 'base',
      },
    }

    // Log charge creation for monitoring
    console.log('💰 Dynamic Charge Created:', {
      chargeId,
      amount,
      currency,
      metadata,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(charge)
  } catch (error) {
    console.error('Dynamic charge creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create dynamic charge',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// GET endpoint to retrieve charge status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chargeId = searchParams.get('charge_id')

    if (!chargeId) {
      return NextResponse.json({ error: 'Charge ID is required' }, { status: 400 })
    }

    // Mock charge retrieval - in production, query your database
    const mockCharge = {
      id: chargeId,
      status: 'COMPLETED', // Mock status
      payments: [
        {
          id: `payment_${Date.now()}`,
          status: 'COMPLETED',
          transaction: {
            id: `txn_${Date.now()}`,
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            amount: {
              amount: '100.00',
              currency: 'USDC',
            },
          },
        },
      ],
      timeline: [
        {
          time: new Date(Date.now() - 60000).toISOString(),
          status: 'NEW',
        },
        {
          time: new Date().toISOString(),
          status: 'COMPLETED',
        },
      ],
    }

    return NextResponse.json(mockCharge)
  } catch (error) {
    console.error('Charge retrieval error:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve charge',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
