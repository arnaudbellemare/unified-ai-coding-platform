import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'
import { PrivyOpenRouterAuth } from '@/lib/openrouter/privy-auth'

export async function POST(request: NextRequest) {
  try {
    const { 
      modelId, 
      messages, 
      options, 
      accessToken 
    } = await request.json()

    if (!modelId || !messages || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (!process.env.OPENROUTER_API_KEY || !process.env.PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
      return NextResponse.json(
        { error: 'Required environment variables not configured' },
        { status: 500 }
      )
    }

    // Authenticate user with Privy
    const auth = new PrivyOpenRouterAuth({
      privyAppId: process.env.PRIVY_APP_ID,
      privyAppSecret: process.env.PRIVY_APP_SECRET,
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
    })

    const userSession = await auth.authenticateUser(accessToken)
    if (!userSession) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Get OpenRouter client
    const openRouter = auth.getOpenRouterClient()

    // Generate text
    const result = await openRouter.generateText(
      modelId,
      messages,
      options
    )

    // Check if user has sufficient credits
    const hasCredits = await auth.hasSufficientCredits(userSession.userId, result.cost)
    if (!hasCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          requiredCredits: result.cost,
          availableCredits: userSession.credits
        },
        { status: 402 }
      )
    }

    // Process payment
    const payment = await auth.processPayment(
      userSession.userId,
      result.cost,
      `OpenRouter API usage: ${modelId}`
    )

    if (!payment.success) {
      return NextResponse.json(
        { error: `Payment failed: ${payment.error}` },
        { status: 402 }
      )
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      usage: result.usage,
      model: result.model,
      cost: result.cost,
      transactionHash: payment.transactionHash,
      remainingCredits: userSession.credits - result.cost,
    })
  } catch (error) {
    console.error('OpenRouter generation error:', error)
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    )
  }
}

