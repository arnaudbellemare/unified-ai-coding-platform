import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'

export async function GET(request: NextRequest) {
  try {
    // Check if development mode is enabled (only for local development)
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true' && 
        process.env.VERCEL !== '1' && 
        process.env.NODE_ENV === 'development') {
      // Return mock models for development
      return NextResponse.json([
        {
          id: 'openai/gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Fast and efficient model for most tasks',
          pricing: { prompt: 0.15, completion: 0.6 },
          context_length: 128000,
          architecture: { modality: 'text', tokenizer: 'cl100k_base', instruct_type: 'chat' }
        },
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          description: 'Balanced performance and speed',
          pricing: { prompt: 3.0, completion: 15.0 },
          context_length: 200000,
          architecture: { modality: 'text', tokenizer: 'claude', instruct_type: 'chat' }
        },
        {
          id: 'google/gemini-pro-1.5',
          name: 'Gemini Pro 1.5',
          description: 'Google\'s latest model with long context',
          pricing: { prompt: 1.25, completion: 5.0 },
          context_length: 1000000,
          architecture: { modality: 'text', tokenizer: 'gemini', instruct_type: 'chat' }
        }
      ])
    }

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
