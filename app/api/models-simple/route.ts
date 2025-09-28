import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Ultra-simple fallback models that will always work
    const models = [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast and efficient model',
        pricing: { prompt: 0.15, completion: 0.6 },
        context_length: 128000,
        providers: [{ id: 'openai', name: 'OpenAI', latency: 120, reliability: 0.99 }],
        supportsProviderSelection: true,
        recommendedProvider: 'openai',
        providerMetrics: { averageLatency: 120, reliability: 0.99, costPerToken: 0.15 },
      },
      {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Balanced performance and speed',
        pricing: { prompt: 3.0, completion: 15.0 },
        context_length: 200000,
        providers: [{ id: 'anthropic', name: 'Anthropic', latency: 150, reliability: 0.98 }],
        supportsProviderSelection: true,
        recommendedProvider: 'anthropic',
        providerMetrics: { averageLatency: 150, reliability: 0.98, costPerToken: 3.0 },
      },
      {
        id: 'gemini-pro-1.5',
        name: 'Gemini Pro 1.5',
        description: "Google's latest model",
        pricing: { prompt: 1.25, completion: 5.0 },
        context_length: 1000000,
        providers: [{ id: 'google', name: 'Google', latency: 100, reliability: 0.99 }],
        supportsProviderSelection: true,
        recommendedProvider: 'google',
        providerMetrics: { averageLatency: 100, reliability: 0.99, costPerToken: 1.25 },
      },
    ]

    return NextResponse.json({
      success: true,
      models: models,
      source: 'simple-fallback',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Simple models API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load models', timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}
