import OpenAI from 'openai'

export interface OpenRouterConfig {
  apiKey: string
  baseURL?: string
  organization?: string
}

export interface OpenRouterModel {
  id: string
  name: string
  description: string
  pricing: {
    prompt: number // price per 1M tokens
    completion: number // price per 1M tokens
  }
  context_length: number
  architecture: {
    modality: string
    tokenizer: string
    instruct_type?: string
  }
  top_provider: {
    context_length: number
    pricing: {
      prompt: number
      completion: number
    }
  }
}

export interface OpenRouterUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  total_cost: number
}

export class OpenRouterClient {
  private client: OpenAI
  private config: OpenRouterConfig

  constructor(config: OpenRouterConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://openrouter.ai/api/v1',
      organization: config.organization,
    })
  }

  /**
   * Get available models from OpenRouter
   */
  async getModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error)
      throw error
    }
  }

  /**
   * Get model pricing information
   */
  async getModelPricing(modelId: string): Promise<{ prompt: number; completion: number } | null> {
    try {
      const models = await this.getModels()
      const model = models.find((m) => m.id === modelId)
      return model?.pricing || null
    } catch (error) {
      console.error('Error fetching model pricing:', error)
      return null
    }
  }

  /**
   * Calculate cost for a request
   */
  calculateCost(
    modelId: string,
    promptTokens: number,
    completionTokens: number,
    pricing?: { prompt: number; completion: number },
  ): number {
    if (!pricing) {
      // Default pricing if not available
      return (promptTokens * 0.000001 + completionTokens * 0.000001) * 0.5
    }

    const promptCost = (promptTokens / 1000000) * pricing.prompt
    const completionCost = (completionTokens / 1000000) * pricing.completion
    return promptCost + completionCost
  }

  /**
   * Generate text using OpenRouter
   */
  async generateText(
    modelId: string,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number
      max_tokens?: number
      top_p?: number
      frequency_penalty?: number
      presence_penalty?: number
    },
  ): Promise<{
    content: string
    usage: OpenRouterUsage
    model: string
    cost: number
  }> {
    try {
      const pricing = await this.getModelPricing(modelId)

      const response = await this.client.chat.completions.create({
        model: modelId,
        messages: messages as any,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 1000,
        top_p: options?.top_p || 1,
        frequency_penalty: options?.frequency_penalty || 0,
        presence_penalty: options?.presence_penalty || 0,
      })

      const usage = response.usage
      const cost = this.calculateCost(
        modelId,
        usage?.prompt_tokens || 0,
        usage?.completion_tokens || 0,
        pricing || undefined,
      )

      return {
        content: response.choices[0]?.message?.content || '',
        usage: {
          prompt_tokens: usage?.prompt_tokens || 0,
          completion_tokens: usage?.completion_tokens || 0,
          total_tokens: usage?.total_tokens || 0,
          total_cost: cost,
        },
        model: response.model,
        cost,
      }
    } catch (error) {
      console.error('OpenRouter generation error:', error)
      throw error
    }
  }

  /**
   * Generate structured output using OpenRouter
   */
  async generateStructuredOutput<T>(
    modelId: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    schema: any,
    options?: {
      temperature?: number
      max_tokens?: number
    },
  ): Promise<{
    object: T
    usage: OpenRouterUsage
    model: string
    cost: number
  }> {
    try {
      const pricing = await this.getModelPricing(modelId)

      const response = await this.client.chat.completions.create({
        model: modelId,
        messages: [
          ...messages,
          {
            role: 'system' as const,
            content: `You must respond with valid JSON that matches this schema: ${JSON.stringify(schema)}`,
          },
        ],
        temperature: options?.temperature || 0.3,
        max_tokens: options?.max_tokens || 2000,
        response_format: { type: 'json_object' },
      })

      const usage = response.usage
      const cost = this.calculateCost(
        modelId,
        usage?.prompt_tokens || 0,
        usage?.completion_tokens || 0,
        pricing || undefined,
      )

      const content = response.choices[0]?.message?.content || '{}'
      const object = JSON.parse(content) as T

      return {
        object,
        usage: {
          prompt_tokens: usage?.prompt_tokens || 0,
          completion_tokens: usage?.completion_tokens || 0,
          total_tokens: usage?.total_tokens || 0,
          total_cost: cost,
        },
        model: response.model,
        cost,
      }
    } catch (error) {
      console.error('OpenRouter structured generation error:', error)
      throw error
    }
  }
}
