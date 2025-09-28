import { NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'

export async function GET() {
  try {
    console.log('🔍 Fetching real OpenRouter models...')

    const openRouterClient = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: 'https://openrouter.ai/api/v1',
    })
    const models = await openRouterClient.getModels()

    if (!models || models.length === 0) {
      return NextResponse.json({ success: false, error: 'No models available from OpenRouter' }, { status: 500 })
    }

    // Sort models by cost efficiency (cost per token)
    const sortedModels = models
      .filter((model) => model.pricing && model.pricing.prompt && model.pricing.completion)
      .map((model) => {
        const avgCost = ((model.pricing.prompt as number) + (model.pricing.completion as number)) / 2
        return {
          ...model,
          costEfficiency: 1000 / avgCost, // Higher is better
          avgCost,
        }
      })
      .sort((a, b) => b.costEfficiency - a.costEfficiency) // Sort by cost efficiency (best first)

    // Enhance models with provider information
    const enhancedModels = sortedModels.map((model) => ({
      id: model.id,
      name: model.name,
      description: model.description || `${model.name} - ${model.context_length} context`,
      pricing: model.pricing,
      context_length: model.context_length,
        providers: [
          {
            id: 'default-provider',
            name: 'Default Provider',
            latency: 100,
            reliability: 0.95,
          },
        ],
      supportsProviderSelection: true,
      recommendedProvider: 'default-provider',
      providerMetrics: {
        averageLatency: 100,
        reliability: 0.95,
        costPerToken: ((model.pricing.prompt as number) + (model.pricing.completion as number)) / 2,
      },
      costEfficiency: model.costEfficiency,
      avgCost: model.avgCost,
      performance:
        model.avgCost < 1
          ? 'ultra-fast'
          : model.avgCost < 5
            ? 'fast'
            : model.avgCost < 10
              ? 'balanced'
              : 'high-quality',
      useCase:
        model.avgCost < 1
          ? 'High-volume, simple tasks'
          : model.avgCost < 5
            ? 'General purpose, coding, analysis'
            : 'Complex reasoning, high quality output',
    }))

    console.log(`✅ Loaded ${enhancedModels.length} real OpenRouter models`)

    return NextResponse.json({
      success: true,
      models: enhancedModels,
      source: 'openrouter-real',
      count: enhancedModels.length,
      timestamp: new Date().toISOString(),
      costOptimization: {
        mostCostEffective: enhancedModels[0],
        categories: {
          ultraBudget: enhancedModels.filter((m) => m.avgCost < 1),
          budget: enhancedModels.filter((m) => m.avgCost >= 1 && m.avgCost < 5),
          balanced: enhancedModels.filter((m) => m.avgCost >= 5 && m.avgCost < 10),
          premium: enhancedModels.filter((m) => m.avgCost >= 10),
        },
      },
    })
  } catch (error) {
    console.error('Real models API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch real models from OpenRouter',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
