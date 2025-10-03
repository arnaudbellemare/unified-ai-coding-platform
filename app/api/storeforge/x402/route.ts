import { NextRequest, NextResponse } from 'next/server'
import { x402Processor } from '@/lib/storeforge/x402-integration'
import { z } from 'zod'

// Request validation schemas
const PaymentRequestSchema = z.object({
  amount: z.number().positive(),
  chain: z.enum(['base', 'algorand', 'ethereum', 'polygon']).optional(),
  currency: z.enum(['USDC', 'ETH', 'MATIC', 'ALGO']).optional(),
  purpose: z.enum(['data_access', 'api_call', 'computation', 'storage', 'premium_feature']),
  agentId: z.string().optional(),
  recipient: z.string().optional(),
})

const MandateRequestSchema = z.object({
  agentId: z.string(),
  maxAmount: z.number().positive(),
  allowedServices: z.array(z.string()),
  expiresInHours: z.number().positive().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Determine the operation type
    if (body.operation === 'payment') {
      // Process x402 payment
      const validatedData = PaymentRequestSchema.parse(body)

      console.log('💳 x402 payment request:', validatedData)

      const result = await x402Processor.processPayment({
        chain: validatedData.chain || 'base',
        currency: validatedData.currency || 'USDC',
        amount: validatedData.amount,
        recipient:
          validatedData.recipient || process.env.X402_DEFAULT_RECIPIENT || '0x742d35Cc6634C0532925a3b8D0c3e2C5E6e9B1F',
        purpose: validatedData.purpose,
        agentId: validatedData.agentId,
      })

      return NextResponse.json({
        success: true,
        data: result,
        message: 'x402 payment processed successfully',
      })
    } else if (body.operation === 'mandate') {
      // Create payment mandate
      const validatedData = MandateRequestSchema.parse(body)

      console.log('📋 Creating x402 mandate:', validatedData)

      const expiresAt = validatedData.expiresInHours
        ? new Date(Date.now() + validatedData.expiresInHours * 60 * 60 * 1000)
        : undefined

      const mandateId = await x402Processor.createPaymentMandate(
        validatedData.agentId,
        validatedData.maxAmount,
        validatedData.allowedServices,
        expiresAt,
      )

      return NextResponse.json({
        success: true,
        data: { mandateId },
        message: 'Payment mandate created successfully',
      })
    } else if (body.operation === 'status') {
      // Get payment status
      const { transactionId } = body
      if (!transactionId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Transaction ID is required',
          },
          { status: 400 },
        )
      }

      const status = await x402Processor.getPaymentStatus(transactionId)

      return NextResponse.json({
        success: true,
        data: status,
        message: 'Payment status retrieved successfully',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid operation. Supported: payment, mandate, status',
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error('❌ x402 API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')

    if (operation === 'pricing') {
      // Get chain-specific pricing
      const chain = searchParams.get('chain') as 'base' | 'algorand' | 'ethereum' | 'polygon'

      if (!chain) {
        return NextResponse.json(
          {
            success: false,
            error: 'Chain parameter is required',
          },
          { status: 400 },
        )
      }

      const pricing = x402Processor.getDataAccessPricing(chain)

      return NextResponse.json({
        success: true,
        data: pricing,
        message: 'Pricing information retrieved successfully',
      })
    } else if (operation === 'routing') {
      // Calculate optimal routing
      const amount = parseFloat(searchParams.get('amount') || '0')
      const recipient = searchParams.get('recipient') || ''
      const preferredChains = (searchParams.get('chains') || 'base,algorand').split(',') as any[]

      if (!amount || amount <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Valid amount is required',
          },
          { status: 400 },
        )
      }

      const routing = x402Processor.calculateOptimalRouting(amount, recipient, preferredChains)

      return NextResponse.json({
        success: true,
        data: routing,
        message: 'Optimal routing calculated successfully',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid operation. Supported: pricing, routing',
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error('❌ x402 GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
