import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/simple-auth'
import { acpService } from '@/lib/acp/acp-service'

/**
 * Agentic Commerce Protocol (ACP) MCP Endpoint
 * MCP-compatible interface for AI agents to interact with VERCLIBASE commerce
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, params = {} } = body

    console.log('🔌 ACP MCP called:', { method, params })

    switch (method) {
      case 'checkout': {
        return await handleCheckout(params)
      }

      case 'get_capabilities': {
        return await handleGetCapabilities()
      }

      case 'get_payment_methods': {
        return await handleGetPaymentMethods()
      }

      case 'process_payment': {
        return await handleProcessPayment(params)
      }

      default: {
        return NextResponse.json(
          {
            error: 'Method not supported',
            supportedMethods: ['checkout', 'get_capabilities', 'get_payment_methods', 'process_payment'],
          },
          { status: 400 },
        )
      }
    }
  } catch (error) {
    console.error('❌ ACP MCP error:', error)
    return NextResponse.json(
      {
        error: 'ACP MCP processing failed',
        message: 'Internal server error during ACP MCP operation',
      },
      { status: 500 },
    )
  }
}

async function handleCheckout(params: any) {
  const { items, amount, currency = 'USDC', paymentMethod = 'x402' } = params

  const user = await getCurrentUser({} as NextRequest)
  if (!user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'AI agent must be authenticated',
      },
      { status: 401 },
    )
  }

  if (!items || !amount) {
    return NextResponse.json(
      {
        error: 'Missing required parameters',
        message: 'Items and amount are required',
      },
      { status: 400 },
    )
  }

  // Process through ACP service
  const checkoutResult = await acpService.processCheckout(
    {
      items,
      totalAmount: amount,
      currency,
      paymentMethod: paymentMethod || 'x402',
      metadata: { acpMethod: 'checkout' },
    },
    user.id,
  )

  if (!checkoutResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: checkoutResult.error,
        message: 'ACP checkout failed',
      },
      { status: 402 },
    )
  }

  return NextResponse.json({
    success: true,
    result: {
      checkoutId: checkoutResult.checkoutId,
      paymentId: checkoutResult.paymentId,
      status: 'completed',
      amount,
      currency,
      items,
      processedAt: new Date().toISOString(),
    },
  })
}

async function handleGetCapabilities() {
  const config = acpService.getMerchantConfig()

  return NextResponse.json({
    success: true,
    result: {
      acpVersion: '1.0',
      merchantId: config.id,
      capabilities: ['ai_agent_commerce', 'cost_optimization', 'real_time_processing', 'multi_model_support'],
      supportedModels: [
        'openai/gpt-4',
        'anthropic/claude-3',
        'mistral/mistral-large',
        'x-ai/grok-4-fast',
        'nvidia/nemotron-nano-9b-v2',
        'deepseek/deepseek-chat-v3.1',
      ],
      paymentMethods: config.supportedPaymentMethods,
      currencies: config.supportedCurrencies,
      merchantInfo: {
        name: config.name,
        description: config.description,
        url: config.url,
      },
    },
  })
}

async function handleGetPaymentMethods() {
  const methods = acpService.getSupportedPaymentMethods()

  return NextResponse.json({
    success: true,
    result: {
      methods: [
        ...methods,
        {
          id: 'stripe',
          name: 'Stripe',
          description: 'Traditional payment processing',
          networks: ['card', 'bank_transfer'],
          currencies: ['USD', 'EUR', 'GBP'],
          features: ['recurring_payments', 'fraud_protection', 'global_support'],
        },
      ],
    },
  })
}

async function handleProcessPayment(params: any) {
  const { paymentMethod, amount, currency, metadata = {} } = params

  const user = await getCurrentUser({} as NextRequest)
  if (!user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'AI agent must be authenticated',
      },
      { status: 401 },
    )
  }

  if (paymentMethod !== 'x402') {
    return NextResponse.json(
      {
        error: 'Payment method not supported',
        message: 'Currently only x402 payments are supported',
      },
      { status: 400 },
    )
  }

  // Process through ACP service
  const paymentResult = await acpService.processPayment(
    {
      amount,
      currency,
      paymentMethod,
      metadata: {
        ...metadata,
        acpMethod: 'process_payment',
      },
    },
    user.id,
  )

  if (!paymentResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: paymentResult.error,
        message: 'ACP payment failed',
      },
      { status: 402 },
    )
  }

  return NextResponse.json({
    success: true,
    result: {
      paymentId: paymentResult.paymentId,
      status: 'completed',
      amount,
      currency,
      network: 'base-sepolia',
      processedAt: new Date().toISOString(),
    },
  })
}
