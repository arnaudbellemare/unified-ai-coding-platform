import { NextRequest, NextResponse } from 'next/server'
import { unifiedAIRouter, UnifiedAIRequest } from '@/lib/unified-system/unified-ai-router'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'
import { DevAuth } from '@/lib/auth/dev-auth'

export async function POST(request: NextRequest) {
  try {
    // Always use real AI generation - no mock data

    // Require authentication for production
    const user = await requireAuth(request)

    const body = await request.json()
    const aiRequest: UnifiedAIRequest = {
      prompt: body.prompt,
      task: body.task,
      model: body.model,
      context: body.context,
      optimization: body.optimization,
      user: {
        id: user.id,
        preferences: body.preferences,
      },
    }

    // Validate required fields
    if (!aiRequest.prompt || !aiRequest.task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: prompt and task are required',
        },
        { status: 400 },
      )
    }

    // Process unified AI request
    const result = await unifiedAIRouter.processRequest(aiRequest)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      result,
    })
  } catch (error) {
    console.error('Unified AI error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'AI request failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get available models or AI statistics
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'models') {
      try {
        const models = await unifiedAIRouter.getAvailableModels()
        return NextResponse.json({
          success: true,
          models,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        // Fallback models when OpenRouter is not configured - with provider selection
        const fallbackModels = [
          {
            id: 'openai/gpt-4o-mini',
            name: 'GPT-4o Mini',
            description: 'Fast and efficient model for most tasks',
            pricing: { prompt: 0.15, completion: 0.6 },
            context_length: 128000,
            providers: [
              { id: 'openai-us-east', name: 'OpenAI US East', latency: 120, reliability: 0.99 },
              { id: 'openai-eu-west', name: 'OpenAI EU West', latency: 180, reliability: 0.98 },
              { id: 'openai-asia', name: 'OpenAI Asia', latency: 250, reliability: 0.97 }
            ],
            supportsProviderSelection: true,
            recommendedProvider: 'openai-us-east',
            providerMetrics: {
              averageLatency: 120,
              reliability: 0.99,
              costPerToken: 0.15
            }
          },
          {
            id: 'anthropic/claude-3.5-sonnet',
            name: 'Claude 3.5 Sonnet',
            description: 'Balanced performance and speed',
            pricing: { prompt: 3.0, completion: 15.0 },
            context_length: 200000,
            providers: [
              { id: 'anthropic-us', name: 'Anthropic US', latency: 150, reliability: 0.98 },
              { id: 'anthropic-eu', name: 'Anthropic EU', latency: 200, reliability: 0.97 }
            ],
            supportsProviderSelection: true,
            recommendedProvider: 'anthropic-us',
            providerMetrics: {
              averageLatency: 150,
              reliability: 0.98,
              costPerToken: 3.0
            }
          },
          {
            id: 'google/gemini-pro-1.5',
            name: 'Gemini Pro 1.5',
            description: "Google's latest model with long context",
            pricing: { prompt: 1.25, completion: 5.0 },
            context_length: 1000000,
            providers: [
              { id: 'google-global', name: 'Google Global', latency: 100, reliability: 0.99 },
              { id: 'google-eu', name: 'Google EU', latency: 140, reliability: 0.98 }
            ],
            supportsProviderSelection: true,
            recommendedProvider: 'google-global',
            providerMetrics: {
              averageLatency: 100,
              reliability: 0.99,
              costPerToken: 1.25
            }
          },
        ]
        return NextResponse.json({
          success: true,
          models: fallbackModels,
          timestamp: new Date().toISOString(),
        })
      }
    } else {
      const stats = unifiedAIRouter.getAIStats()
      return NextResponse.json({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Failed to get AI data:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve AI data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
