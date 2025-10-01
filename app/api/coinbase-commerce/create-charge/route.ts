import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, local_price, pricing_type, metadata } = body

    // Validate required fields
    if (!name || !description || !local_price || !pricing_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Coinbase Commerce API key from environment
    const apiKey = process.env.COINBASE_COMMERCE_API_KEY
    if (!apiKey) {
      console.error('COINBASE_COMMERCE_API_KEY not found in environment variables')
      return NextResponse.json(
        { error: 'Commerce API key not configured' },
        { status: 500 }
      )
    }

    // Create the charge using Coinbase Commerce API
    const chargeData = {
      name,
      description,
      local_price,
      pricing_type,
      metadata: metadata || {},
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/store/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/store/cancel`
    }

    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify(chargeData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Coinbase Commerce API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create charge', details: errorData },
        { status: response.status }
      )
    }

    const charge = await response.json()
    
    console.log('Charge created successfully:', charge.data.id)

    return NextResponse.json({
      id: charge.data.id,
      hosted_url: charge.data.hosted_url,
      status: charge.data.timeline?.[0]?.status || 'NEW'
    })

  } catch (error) {
    console.error('Error creating Coinbase Commerce charge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}