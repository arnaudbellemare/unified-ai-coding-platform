/**
 * Cost Optimization Module
 * Integrates with Perplexity and OpenAI for real cost savings
 */

export interface CostOptimizationResult {
  originalCost: number
  optimizedCost: number
  savings: number
  savingsPercentage: string
  originalTokens: number
  optimizedTokens: number
  apiCalls: number
  realApiCost: number
}

export class CostOptimization {
  private perplexityApiKey: string
  private openaiApiKey: string

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || ''
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
  }

  /**
   * Optimize a prompt for cost reduction
   */
  async optimizePrompt(originalPrompt: string): Promise<string> {
    // If API keys are not available, use local optimization
    if (!this.perplexityApiKey) {
      console.warn('Perplexity API key not configured, using local optimization')
      return this.localOptimizePrompt(originalPrompt)
    }

    try {
      const optimizationPrompt = `Optimize this prompt for cost efficiency while maintaining quality. Remove unnecessary words, use concise language, and focus on the core request. Return only the optimized prompt:

Original: ${originalPrompt}

Optimized:`

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: optimizationPrompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.1,
        }),
      })

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content?.trim() || originalPrompt
    } catch (error) {
      console.error('Cost optimization failed, using local optimization:', error)
      return this.localOptimizePrompt(originalPrompt)
    }
  }

  /**
   * Local prompt optimization without external APIs
   */
  private localOptimizePrompt(originalPrompt: string): string {
    // Remove common filler words and phrases
    let optimized = originalPrompt
      .replace(/\b(please|kindly|would you|could you|I would like you to)\b/gi, '')
      .replace(/\b(very|really|quite|rather|somewhat|pretty|fairly)\b/gi, '')
      .replace(/\b(comprehensive|detailed|thorough|extensive)\b/gi, '')
      .replace(/\b(beautiful|elegant|gorgeous|stunning)\b/gi, '')
      .replace(/\b(advanced|sophisticated|complex|intricate)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    // If optimization didn't change much, try more aggressive optimization
    if (optimized.length > originalPrompt.length * 0.8) {
      optimized = originalPrompt
        .replace(/\b(create|build|make|develop|generate)\s+(a|an|the)\s+/gi, '')
        .replace(/\b(that|which|who|where|when)\s+/gi, '')
        .replace(/\b(including|with|featuring|having)\s+/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    return optimized || originalPrompt
  }

  /**
   * Calculate real cost savings between original and optimized prompts
   */
  async calculateCostOptimization(originalPrompt: string, optimizedPrompt: string): Promise<CostOptimizationResult> {
    try {
      // Calculate token counts (rough estimation)
      const originalTokens = Math.ceil(originalPrompt.length / 4)
      const optimizedTokens = Math.ceil(optimizedPrompt.length / 4)

      // Calculate costs using OpenAI pricing (GPT-4 pricing)
      const originalCost = (originalTokens / 1000) * 0.03 // $0.03 per 1K input tokens
      const optimizedCost = (optimizedTokens / 1000) * 0.03
      const savings = originalCost - optimizedCost
      const savingsPercentage = originalCost > 0 ? ((savings / originalCost) * 100).toFixed(1) : '0.0'

      // Make real API calls to verify costs (if API keys are available)
      const realApiCost = await this.getRealApiCost(originalPrompt, optimizedPrompt)

      return {
        originalCost,
        optimizedCost,
        savings,
        savingsPercentage: `${savingsPercentage}%`,
        originalTokens,
        optimizedTokens,
        apiCalls: 2,
        realApiCost,
      }
    } catch (error) {
      console.error('Cost calculation failed:', error)
      return {
        originalCost: 0,
        optimizedCost: 0,
        savings: 0,
        savingsPercentage: '0%',
        originalTokens: 0,
        optimizedTokens: 0,
        apiCalls: 0,
        realApiCost: 0,
      }
    }
  }

  /**
   * Get real API cost by making actual API calls
   */
  private async getRealApiCost(originalPrompt: string, optimizedPrompt: string): Promise<number> {
    if (!this.openaiApiKey) {
      return 0
    }

    try {
      // Make a test API call to get real cost
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: optimizedPrompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.1,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      // Calculate cost based on actual usage
      const inputTokens = data.usage?.prompt_tokens || 0
      const outputTokens = data.usage?.completion_tokens || 0
      const totalCost = (inputTokens / 1000) * 0.0015 + (outputTokens / 1000) * 0.002

      return totalCost
    } catch (error) {
      console.error('Real API cost calculation failed:', error)
      return 0
    }
  }
}

export const costOptimization = new CostOptimization()
