import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simple fallback models that always work
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
        ],
        supportsProviderSelection: true,
        recommendedProvider: 'openai-us-east',
        providerMetrics: {
          averageLatency: 120,
          reliability: 0.99,
          costPerToken: 0.15,
        },
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Balanced performance and speed',
        pricing: { prompt: 3.0, completion: 15.0 },
        context_length: 200000,
        providers: [
          { id: 'anthropic-us', name: 'Anthropic US', latency: 150, reliability: 0.98 },
          { id: 'anthropic-eu', name: 'Anthropic EU', latency: 200, reliability: 0.97 },
        ],
        supportsProviderSelection: true,
        recommendedProvider: 'anthropic-us',
        providerMetrics: {
          averageLatency: 150,
          reliability: 0.98,
          costPerToken: 3.0,
        },
      },
      {
        id: 'google/gemini-pro-1.5',
        name: 'Gemini Pro 1.5',
        description: "Google's latest model with long context",
        pricing: { prompt: 1.25, completion: 5.0 },
        context_length: 1000000,
        providers: [
          { id: 'google-global', name: 'Google Global', latency: 100, reliability: 0.99 },
          { id: 'google-eu', name: 'Google EU', latency: 140, reliability: 0.98 },
        ],
        supportsProviderSelection: true,
        recommendedProvider: 'google-global',
        providerMetrics: {
          averageLatency: 100,
          reliability: 0.99,
          costPerToken: 1.25,
        },
      },
      {
        id: 'meta-llama/llama-3.1-70b-instruct',
        name: 'Llama 3.1 70B Instruct',
        description: 'Open source model with excellent reasoning',
        pricing: { prompt: 0.9, completion: 0.9 },
        context_length: 128000,
        providers: [{ id: 'meta-global', name: 'Meta Global', latency: 200, reliability: 0.95 }],
        supportsProviderSelection: true,
        recommendedProvider: 'meta-global',
        providerMetrics: {
          averageLatency: 200,
          reliability: 0.95,
          costPerToken: 0.9,
        },
      },
      {
        id: 'mistralai/mistral-7b-instruct',
        name: 'Mistral 7B Instruct',
        description: 'Efficient small model for quick tasks',
        pricing: { prompt: 0.2, completion: 0.2 },
        context_length: 32000,
        providers: [{ id: 'mistral-eu', name: 'Mistral EU', latency: 80, reliability: 0.97 }],
        supportsProviderSelection: true,
        recommendedProvider: 'mistral-eu',
        providerMetrics: {
          averageLatency: 80,
          reliability: 0.97,
          costPerToken: 0.2,
        },
      },
    ]

    // Try to get real OpenRouter models if API key is available
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          const openrouterModels = data.data
            .filter(
              (model: any) =>
                model.architecture?.modality?.includes('text') && (model.pricing || model.top_provider?.pricing),
            )
            .slice(0, 20) // Limit to first 20 models
            .map((model: any) => ({
              id: model.id,
              name: model.name,
              description: model.description || 'No description available',
              pricing: model.pricing || model.top_provider?.pricing || { prompt: 0, completion: 0 },
              context_length: model.context_length || 128000,
              providers: [
                {
                  id: 'default-provider',
                  name: 'Default Provider',
                  latency: 150,
                  reliability: 0.95,
                  pricing: model.pricing || model.top_provider?.pricing,
                },
              ],
              supportsProviderSelection: true,
              recommendedProvider: 'default-provider',
              providerMetrics: {
                averageLatency: 150,
                reliability: 0.95,
                costPerToken:
                  typeof model.pricing?.prompt === 'string'
                    ? parseFloat(model.pricing.prompt)
                    : model.pricing?.prompt || 0,
              },
            }))

          return NextResponse.json({
            success: true,
            models: [...fallbackModels, ...openrouterModels],
            source: 'openrouter + fallback',
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log('OpenRouter API failed, using fallback models:', error)
      }
    }

    // Return fallback models
    return NextResponse.json({
      success: true,
      models: fallbackModels,
      source: 'fallback',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Models API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load models',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
