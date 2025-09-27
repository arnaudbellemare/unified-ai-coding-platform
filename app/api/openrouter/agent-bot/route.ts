import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'
import { PrivyOpenRouterAuth } from '@/lib/openrouter/privy-auth'

export async function POST(request: NextRequest) {
  try {
    // Production mode - real agent

    const { modelId, instruction, connectToOtherBots = true, accessToken } = await request.json()

    if (!modelId || !instruction || !accessToken) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY || !process.env.PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
      return NextResponse.json({ error: 'Required environment variables not configured' }, { status: 500 })
    }

    // Authenticate user with Privy
    const auth = new PrivyOpenRouterAuth({
      privyAppId: process.env.PRIVY_APP_ID,
      privyAppSecret: process.env.PRIVY_APP_SECRET,
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
    })

    const userSession = await auth.authenticateUser(accessToken)
    if (!userSession) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Get OpenRouter client
    const openRouter = auth.getOpenRouterClient()

    // Generate agent bot configuration
    const messages = [
      {
        role: 'system',
        content: `You are an AI agent creation specialist. Create a detailed agent configuration that can connect and communicate with other agents. The agent should be able to:
        - Process tasks autonomously
        - Communicate with other agents
        - Share data and results
        - Coordinate complex workflows
        - Handle errors gracefully
        
        Return a JSON configuration for the agent.`,
      },
      {
        role: 'user',
        content: `Create an AI agent with these instructions: ${instruction}`,
      },
    ]

    const result = await openRouter.generateText(modelId, messages, {
      temperature: 0.7,
      max_tokens: 3000,
    })

    // Check if user has sufficient credits
    const hasCredits = await auth.hasSufficientCredits(userSession.userId, result.cost)
    if (!hasCredits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          requiredCredits: result.cost,
          availableCredits: userSession.credits,
        },
        { status: 402 },
      )
    }

    // Generate agent ID and configuration
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Parse the agent response to extract configuration
    let agentConfig = null
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        agentConfig = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.log('Could not parse agent config as JSON, using raw response')
    }

    // Create agent connections if requested
    let connections: Array<{
      agentId: string
      status: string
      capabilities: string[]
    }> = []
    if (connectToOtherBots) {
      // In a real implementation, this would find other available agents
      // For now, create mock connections
      connections = [
        {
          agentId: 'agent_data_processor',
          status: 'connected',
          capabilities: ['data_processing', 'analysis'],
        },
        {
          agentId: 'agent_web_scraper',
          status: 'connected',
          capabilities: ['web_scraping', 'data_extraction'],
        },
      ]
    }

    // Process payment
    const payment = await auth.processPayment(userSession.userId, result.cost, `OpenRouter agent bot: ${agentId}`)

    if (!payment.success) {
      return NextResponse.json({ error: `Payment failed: ${payment.error}` }, { status: 402 })
    }

    return NextResponse.json({
      success: true,
      agentId,
      agentResponse: result.content,
      agentConfig,
      connections,
      usage: result.usage,
      model: result.model,
      cost: result.cost,
      status: 'active',
      transactionHash: payment.transactionHash,
      remainingCredits: userSession.credits - result.cost,
    })
  } catch (error) {
    console.error('Agent bot creation error:', error)
    return NextResponse.json({ error: 'Agent bot creation failed' }, { status: 500 })
  }
}
