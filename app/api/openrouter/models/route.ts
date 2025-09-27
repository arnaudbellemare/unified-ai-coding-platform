import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'

export async function GET(request: NextRequest) {
  try {
    // Production mode - real models

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY environment variable is required' }, { status: 500 })
    }

    const client = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    const models = await client.getModels()

    // Filter and format models for the frontend
    const formattedModels = models
      .filter((model) => model.architecture?.modality === 'text' && model.top_provider?.pricing)
      .map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description || 'No description available',
        pricing: {
          prompt: model.top_provider.pricing.prompt,
          completion: model.top_provider.pricing.completion,
        },
        context_length: model.top_provider.context_length,
        architecture: {
          modality: model.architecture.modality,
          tokenizer: model.architecture.tokenizer,
          instruct_type: model.architecture.instruct_type,
        },
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      success: true,
      models: formattedModels,
      total: formattedModels.length,
    })
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}
