import { NextRequest, NextResponse } from 'next/server'
import { DevAuth } from '@/lib/auth/dev-auth'

export async function POST(request: NextRequest) {
  try {
    // Always require authentication for the unified system
    const { getCurrentUser } = await import('@/lib/auth/simple-auth')
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Please sign in with GitHub to use the unified AI system',
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { prompt, task, model, provider } = body

    if (!prompt || !task) {
      return NextResponse.json({ error: 'Prompt and task are required' }, { status: 400 })
    }

    // Step 1: Direct optimization without authentication
    const { ResearchBackedOptimizer } = await import('@/lib/research-backed-optimizer')
    const optimizer = new ResearchBackedOptimizer()

    const optimizeResult = await optimizer.optimizeWithResearch(prompt, task, model || 'gpt-4o-mini')

    // Step 2: Direct AI generation using OpenRouter client
    const { OpenRouterClient } = await import('@/lib/openrouter/openrouter-client')

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured')
    }

    const openRouterClient = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    const aiResponse = await openRouterClient.generateText(
      model || 'openai/gpt-4o-mini',
      [
        {
          role: 'user',
          content: optimizeResult.optimizedPrompt || prompt,
        },
      ],
      {
        max_tokens: 1000,
        temperature: 0.7,
        ...(provider && provider !== 'auto' && { provider }),
      },
    )

    const aiResult = {
      success: true,
      response: {
        content: aiResponse.content,
        model: model || 'openai/gpt-4o-mini',
        tokens: aiResponse.usage,
        cost: aiResponse.cost,
      },
    }

    // Step 3: Combine results
    const finalResult = {
      success: true,
      optimization: optimizeResult,
      aiResponse: aiResult.response,
      summary: {
        originalPrompt: prompt,
        optimizedPrompt: optimizeResult.optimizedPrompt,
        aiResponse: aiResult.response.content,
        costSavings: {
          original: aiResult.response.cost + optimizeResult.costReduction,
          optimized: aiResult.response.cost,
          reduction: optimizeResult.costReduction,
          percentage: Math.round(
            (optimizeResult.costReduction / (aiResult.response.cost + optimizeResult.costReduction)) * 100,
          ),
        },
        tokenSavings: {
          original: aiResult.response.tokens.total_tokens + optimizeResult.tokenReduction,
          optimized: aiResult.response.tokens.total_tokens,
          reduction: optimizeResult.tokenReduction,
          percentage: Math.round(
            (optimizeResult.tokenReduction / (aiResult.response.tokens.total_tokens + optimizeResult.tokenReduction)) *
              100,
          ),
        },
        model: model || 'openai/gpt-4o-mini',
        provider: provider || 'auto',
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(finalResult)
  } catch (error) {
    console.error('Unified process error:', error)
    return NextResponse.json({ error: 'Unified process failed', details: (error as Error).message }, { status: 500 })
  }
}
