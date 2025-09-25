/**
 * Token counting utilities for accurate cost optimization
 * Uses tiktoken for precise token counting across different models
 */

import { encoding_for_model, type TiktokenModel } from 'tiktoken'

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  promptCost: number
  completionCost: number
  totalCost: number
}

export interface OptimizationResult {
  originalTokens: number
  optimizedTokens: number
  tokenReduction: number
  tokenReductionPercentage: number
  originalCost: number
  optimizedCost: number
  costSavings: number
  costSavingsPercentage: number
}

// Model pricing (per 1K tokens) - updated with current rates
const MODEL_PRICING = {
  // OpenAI Models
  'gpt-4': { prompt: 0.03, completion: 0.06 },
  'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
  'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
  'gpt-4o': { prompt: 0.005, completion: 0.015 },
  
  // Anthropic Models
  'claude-3-opus-20240229': { prompt: 0.015, completion: 0.075 },
  'claude-3-sonnet-20240229': { prompt: 0.003, completion: 0.015 },
  'claude-3-5-sonnet-20241022': { prompt: 0.003, completion: 0.015 },
  
  // Perplexity Models
  'sonar': { prompt: 0.005, completion: 0.005 },
  'sonar-pro': { prompt: 0.005, completion: 0.005 },
  'llama-3.1-sonar-small-128k-online': { prompt: 0.005, completion: 0.005 },
  'llama-3.1-sonar-large-128k-online': { prompt: 0.005, completion: 0.005 },
} as const

export class TokenCounter {
  /**
   * Count tokens in text using the appropriate encoding for the model
   */
  static countTokens(text: string, model: string): number {
    try {
      // Map model names to tiktoken model names
      const tiktokenModel = this.mapToTiktokenModel(model)
      const encoding = encoding_for_model(tiktokenModel as TiktokenModel)
      const tokens = encoding.encode(text)
      encoding.free()
      return tokens.length
    } catch (error) {
      console.warn(`Failed to count tokens with tiktoken for model ${model}, using approximation:`, error)
      // Fallback to approximation: ~4 characters per token
      return Math.ceil(text.length / 4)
    }
  }

  /**
   * Calculate cost based on token usage and model
   */
  static calculateCost(tokens: number, model: string, type: 'prompt' | 'completion'): number {
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING]
    if (!pricing) {
      console.warn(`No pricing found for model ${model}, using default rate`)
      return tokens * 0.002 / 1000 // Default rate
    }
    
    const rate = type === 'prompt' ? pricing.prompt : pricing.completion
    return (tokens * rate) / 1000
  }

  /**
   * Calculate comprehensive token usage and costs
   */
  static calculateTokenUsage(
    prompt: string,
    completion: string,
    model: string
  ): TokenUsage {
    const promptTokens = this.countTokens(prompt, model)
    const completionTokens = this.countTokens(completion, model)
    const totalTokens = promptTokens + completionTokens

    const promptCost = this.calculateCost(promptTokens, model, 'prompt')
    const completionCost = this.calculateCost(completionTokens, model, 'completion')
    const totalCost = promptCost + completionCost

    return {
      promptTokens,
      completionTokens,
      totalTokens,
      promptCost,
      completionCost,
      totalCost,
    }
  }

  /**
   * Calculate optimization results comparing original vs optimized
   */
  static calculateOptimization(
    originalPrompt: string,
    optimizedPrompt: string,
    completion: string,
    model: string
  ): OptimizationResult {
    const originalTokens = this.countTokens(originalPrompt, model)
    const optimizedTokens = this.countTokens(optimizedPrompt, model)
    const completionTokens = this.countTokens(completion, model)

    const tokenReduction = originalTokens - optimizedTokens
    const tokenReductionPercentage = originalTokens > 0 ? (tokenReduction / originalTokens) * 100 : 0

    const originalCost = this.calculateCost(originalTokens + completionTokens, model, 'prompt')
    const optimizedCost = this.calculateCost(optimizedTokens + completionTokens, model, 'prompt')
    const costSavings = originalCost - optimizedCost
    const costSavingsPercentage = originalCost > 0 ? (costSavings / originalCost) * 100 : 0

    return {
      originalTokens,
      optimizedTokens,
      tokenReduction,
      tokenReductionPercentage,
      originalCost,
      optimizedCost,
      costSavings,
      costSavingsPercentage,
    }
  }

  /**
   * Map our model names to tiktoken model names
   */
  private static mapToTiktokenModel(model: string): string {
    const modelMap: Record<string, string> = {
      'gpt-4': 'gpt-4',
      'gpt-4-turbo': 'gpt-4-turbo',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'gpt-4o': 'gpt-4o',
      'claude-3-opus-20240229': 'gpt-4', // Use GPT-4 encoding as approximation
      'claude-3-sonnet-20240229': 'gpt-4',
      'claude-3-5-sonnet-20241022': 'gpt-4',
      'sonar': 'gpt-3.5-turbo', // Use GPT-3.5 encoding as approximation
      'sonar-pro': 'gpt-3.5-turbo',
      'llama-3.1-sonar-small-128k-online': 'gpt-3.5-turbo',
      'llama-3.1-sonar-large-128k-online': 'gpt-3.5-turbo',
    }

    return modelMap[model] || 'gpt-3.5-turbo'
  }

  /**
   * Get model pricing information
   */
  static getModelPricing(model: string) {
    return MODEL_PRICING[model as keyof typeof MODEL_PRICING] || { prompt: 0.002, completion: 0.002 }
  }

  /**
   * Format cost for display
   */
  static formatCost(cost: number): string {
    return cost < 0.01 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(3)}`
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(percentage: number): string {
    return `${percentage.toFixed(1)}%`
  }
}
