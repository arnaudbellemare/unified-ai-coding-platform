/**
 * OpenRouter Cost Optimization Research
 * Based on current OpenRouter API pricing and performance data
 * Updated: 2024
 */

export interface ModelCostData {
  id: string
  name: string
  provider: string
  promptCost: number // per 1M tokens
  completionCost: number // per 1M tokens
  contextLength: number
  performance: 'ultra-fast' | 'fast' | 'balanced' | 'high-quality'
  useCase: string
  costEfficiency: number // calculated score
}

// Most cost-effective models based on OpenRouter pricing (as of 2024)
export const MOST_COST_EFFECTIVE_MODELS: ModelCostData[] = [
  {
    id: 'mistralai/mistral-7b-instruct',
    name: 'Mistral 7B Instruct',
    provider: 'Mistral AI',
    promptCost: 0.2,
    completionCost: 0.2,
    contextLength: 32000,
    performance: 'ultra-fast',
    useCase: 'Quick tasks, simple reasoning, high-volume processing',
    costEfficiency: 100, // Best score
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    promptCost: 0.15,
    completionCost: 0.6,
    contextLength: 128000,
    performance: 'fast',
    useCase: 'General purpose, coding, analysis',
    costEfficiency: 95,
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct',
    name: 'Llama 3.2 3B Instruct',
    provider: 'Meta',
    promptCost: 0.3,
    completionCost: 0.3,
    contextLength: 128000,
    performance: 'ultra-fast',
    useCase: 'Lightweight tasks, edge computing',
    costEfficiency: 90,
  },
  {
    id: 'qwen/qwen-2.5-7b-instruct',
    name: 'Qwen 2.5 7B Instruct',
    provider: 'Alibaba',
    promptCost: 0.25,
    completionCost: 0.25,
    contextLength: 128000,
    performance: 'fast',
    useCase: 'Multilingual tasks, reasoning',
    costEfficiency: 88,
  },
  {
    id: 'google/gemma-7b-it',
    name: 'Gemma 7B Instruct',
    provider: 'Google',
    promptCost: 0.35,
    completionCost: 0.35,
    contextLength: 8192,
    performance: 'fast',
    useCase: 'Research, analysis, instruction following',
    costEfficiency: 85,
  },
  {
    id: 'microsoft/phi-3.5-mini-instruct',
    name: 'Phi-3.5 Mini Instruct',
    provider: 'Microsoft',
    promptCost: 0.45,
    completionCost: 0.45,
    contextLength: 128000,
    performance: 'balanced',
    useCase: 'Reasoning, math, code generation',
    costEfficiency: 82,
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    provider: 'Meta',
    promptCost: 0.4,
    completionCost: 0.4,
    contextLength: 128000,
    performance: 'balanced',
    useCase: 'General purpose, good balance',
    costEfficiency: 80,
  },
  {
    id: 'mistralai/mistral-8x7b-instruct',
    name: 'Mistral 8x7B Instruct',
    provider: 'Mistral AI',
    promptCost: 0.5,
    completionCost: 0.5,
    contextLength: 32000,
    performance: 'balanced',
    useCase: 'Complex reasoning, MoE efficiency',
    costEfficiency: 78,
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    promptCost: 0.25,
    completionCost: 1.25,
    contextLength: 200000,
    performance: 'fast',
    useCase: 'Fast responses, large context',
    costEfficiency: 75,
  },
  {
    id: 'google/gemini-pro-1.5-flash',
    name: 'Gemini Pro 1.5 Flash',
    provider: 'Google',
    promptCost: 0.75,
    completionCost: 3.0,
    contextLength: 1000000,
    performance: 'fast',
    useCase: 'Large context, fast processing',
    costEfficiency: 70,
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    provider: 'Meta',
    promptCost: 0.9,
    completionCost: 0.9,
    contextLength: 128000,
    performance: 'high-quality',
    useCase: 'Complex reasoning, high quality',
    costEfficiency: 65,
  },
  {
    id: 'qwen/qwen-2.5-14b-instruct',
    name: 'Qwen 2.5 14B Instruct',
    provider: 'Alibaba',
    promptCost: 0.8,
    completionCost: 0.8,
    contextLength: 128000,
    performance: 'balanced',
    useCase: 'Better reasoning than 7B',
    costEfficiency: 62,
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    promptCost: 1.25,
    completionCost: 5.0,
    contextLength: 1000000,
    performance: 'high-quality',
    useCase: 'Long context, high quality',
    costEfficiency: 55,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    promptCost: 3.0,
    completionCost: 15.0,
    contextLength: 200000,
    performance: 'high-quality',
    useCase: 'Best reasoning, code generation',
    costEfficiency: 45,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    promptCost: 5.0,
    completionCost: 15.0,
    contextLength: 128000,
    performance: 'high-quality',
    useCase: 'Multimodal, flagship performance',
    costEfficiency: 35,
  },
]

// Cost optimization strategies
export const COST_OPTIMIZATION_STRATEGIES = {
  ultraBudget: {
    models: ['mistralai/mistral-7b-instruct', 'openai/gpt-4o-mini'],
    maxCostPer1M: 0.5,
    useCase: 'High-volume, simple tasks',
  },
  budget: {
    models: ['meta-llama/llama-3.2-3b-instruct', 'qwen/qwen-2.5-7b-instruct'],
    maxCostPer1M: 0.8,
    useCase: 'Balanced cost/performance',
  },
  balanced: {
    models: ['microsoft/phi-3.5-mini-instruct', 'meta-llama/llama-3.1-8b-instruct'],
    maxCostPer1M: 1.5,
    useCase: 'Good performance at reasonable cost',
  },
  premium: {
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o'],
    maxCostPer1M: 10.0,
    useCase: 'Best quality when cost is secondary',
  },
}

// Calculate cost efficiency score
export function calculateCostEfficiency(
  promptCost: number,
  completionCost: number,
  performance: number = 1.0
): number {
  const avgCost = (promptCost + completionCost) / 2
  return Math.round((performance / avgCost) * 100)
}

// Get optimal model for use case
export function getOptimalModel(
  useCase: 'speed' | 'cost' | 'quality' | 'balance',
  maxBudget: number = 1.0
): ModelCostData | null {
  const filtered = MOST_COST_EFFECTIVE_MODELS.filter(
    (model) => (model.promptCost + model.completionCost) / 2 <= maxBudget
  )

  switch (useCase) {
    case 'speed':
      return filtered.find((m) => m.performance === 'ultra-fast') || filtered[0]
    case 'cost':
      return filtered[0] // Already sorted by cost efficiency
    case 'quality':
      return filtered.reverse().find((m) => m.performance === 'high-quality') || filtered[0]
    case 'balance':
      return filtered.find((m) => m.performance === 'balanced') || filtered[Math.floor(filtered.length / 2)]
    default:
      return filtered[0]
  }
}

// OpenRouter specific optimizations
export const OPENROUTER_OPTIMIZATIONS = {
  // Use streaming for large responses
  streaming: true,
  // Enable caching for repeated requests
  caching: true,
  // Use fallback models for reliability
  fallbacks: [
    'mistralai/mistral-7b-instruct',
    'openai/gpt-4o-mini',
    'meta-llama/llama-3.2-3b-instruct',
  ],
  // Rate limiting to avoid overuse
  rateLimit: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
  },
}
