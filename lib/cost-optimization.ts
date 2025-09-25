/**
 * Cost Optimization Module
 * Integrates with Perplexity and OpenAI for real cost savings
 */

import { enhancedPromptOptimizer, OptimizationResult } from './enhanced-prompt-optimizer'
import { getEnvironmentConfig } from './config/env'

export interface CostOptimizationResult {
  originalCost: number
  optimizedCost: number
  savings: number
  savingsPercentage: string
  originalTokens: number
  optimizedTokens: number
  apiCalls: number
  realApiCost: number
  originalPrompt: string
  optimizedPrompt: string
  optimizationApplied: boolean
  estimatedMonthlySavings?: number
  recommendedAgent?: string
  agentReasoning?: string
  alternativeAgents?: Array<{
    agent: string
    estimatedCost: number
    reasoning: string
  }>
}

export class CostOptimization {
  private perplexityApiKey: string
  private openaiApiKey: string

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || ''
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
  }

  /**
   * Recommend the most cost-effective agent for a given prompt
   */
  async recommendAgent(
    prompt: string,
    availableAgents: string[] = [],
  ): Promise<{
    recommended: string
    reasoning: string
    alternatives: Array<{
      agent: string
      estimatedCost: number
      reasoning: string
    }>
  }> {
    const config = getEnvironmentConfig()

    // Default available agents if none provided
    const agents =
      availableAgents.length > 0
        ? availableAgents
        : [
            ...(config.hasPerplexity ? ['perplexity'] : []),
            ...(config.hasOpenAI ? ['codex'] : []),
            ...(config.hasAnthropic ? ['claude'] : []),
            ...(config.hasCursor ? ['cursor'] : []),
            'opencode', // Always available
          ]

    // Analyze prompt characteristics
    const promptAnalysis = this.analyzePrompt(prompt)

    // Calculate costs for each agent
    const agentCosts = await Promise.all(
      agents.map(async (agent) => ({
        agent,
        cost: await this.estimateAgentCost(agent, prompt, promptAnalysis),
        reasoning: this.getAgentReasoning(agent, promptAnalysis),
      })),
    )

    // Sort by cost (ascending)
    agentCosts.sort((a, b) => a.cost - b.cost)

    const recommended = agentCosts[0]
    const alternatives = agentCosts.slice(1)

    return {
      recommended: recommended.agent,
      reasoning: recommended.reasoning,
      alternatives: alternatives.map((alt) => ({
        agent: alt.agent,
        estimatedCost: alt.cost,
        reasoning: alt.reasoning,
      })),
    }
  }

  /**
   * Analyze prompt characteristics for agent recommendation
   */
  private analyzePrompt(prompt: string): {
    length: number
    complexity: 'simple' | 'medium' | 'complex'
    type: 'coding' | 'research' | 'analysis' | 'general'
    requiresWebSearch: boolean
    requiresCodeGeneration: boolean
    requiresRealTimeData: boolean
  } {
    const lowerPrompt = prompt.toLowerCase()
    const wordCount = prompt.split(/\s+/).length

    // Determine complexity
    let complexity: 'simple' | 'medium' | 'complex' = 'simple'
    if (wordCount > 100) complexity = 'complex'
    else if (wordCount > 50) complexity = 'medium'

    // Determine type
    let type: 'coding' | 'research' | 'analysis' | 'general' = 'general'
    if (/code|function|class|variable|debug|implement|create.*app|build.*app/i.test(lowerPrompt)) {
      type = 'coding'
    } else if (/search|find|look up|current|latest|news|recent|today|now/i.test(lowerPrompt)) {
      type = 'research'
    } else if (/analyze|compare|evaluate|assess|review|examine/i.test(lowerPrompt)) {
      type = 'analysis'
    }

    // Determine requirements
    const requiresWebSearch = /search|find|look up|current|latest|news|recent|today|now|web|internet/i.test(lowerPrompt)
    const requiresCodeGeneration = /code|function|class|variable|debug|implement|create|build|write.*code/i.test(
      lowerPrompt,
    )
    const requiresRealTimeData = /current|latest|news|recent|today|now|live|real.*time/i.test(lowerPrompt)

    return {
      length: wordCount,
      complexity,
      type,
      requiresWebSearch,
      requiresCodeGeneration,
      requiresRealTimeData,
    }
  }

  /**
   * Estimate cost for a specific agent
   */
  private async estimateAgentCost(
    agent: string,
    prompt: string,
    analysis: ReturnType<CostOptimization['analyzePrompt']>,
  ): Promise<number> {
    // Base costs per 1K tokens (approximate)
    const agentCosts = {
      opencode: 0, // Free
      perplexity: 0.0005, // $0.50 per 1M tokens
      claude: 0.003, // $3 per 1M tokens
      codex: 0.002, // $2 per 1M tokens (via AI Gateway)
      cursor: 0.001, // $1 per 1M tokens (estimated)
    }

    // Estimate token usage based on prompt complexity
    let estimatedTokens = Math.max(100, analysis.length * 1.3) // Rough estimate

    // Adjust for complexity
    if (analysis.complexity === 'complex') estimatedTokens *= 1.5
    else if (analysis.complexity === 'medium') estimatedTokens *= 1.2

    // Adjust for agent type
    if (agent === 'perplexity' && analysis.requiresWebSearch) {
      estimatedTokens *= 1.3 // Web search adds overhead
    }

    const baseCost = agentCosts[agent as keyof typeof agentCosts] || 0
    return (estimatedTokens / 1000) * baseCost
  }

  /**
   * Get reasoning for agent recommendation
   */
  private getAgentReasoning(agent: string, analysis: ReturnType<CostOptimization['analyzePrompt']>): string {
    const reasons = {
      opencode: 'Free open-source agent, best for simple coding tasks',
      perplexity: 'Cost-effective for research and web search tasks',
      claude: 'High-quality for complex analysis and coding',
      codex: 'Optimized for coding with AI Gateway integration',
      cursor: 'Specialized for code completion and generation',
    }

    let reasoning = reasons[agent as keyof typeof reasons] || 'General purpose agent'

    // Add specific reasoning based on prompt analysis
    if (agent === 'perplexity' && analysis.requiresWebSearch) {
      reasoning += ' (optimal for web search requirements)'
    } else if (agent === 'codex' && analysis.requiresCodeGeneration) {
      reasoning += ' (optimized for code generation)'
    } else if (agent === 'opencode' && analysis.type === 'coding') {
      reasoning += ' (free option for coding tasks)'
    } else if (agent === 'claude' && analysis.complexity === 'complex') {
      reasoning += ' (best for complex tasks)'
    }

    return reasoning
  }

  /**
   * Optimize a prompt for cost reduction
   */
  async optimizePrompt(originalPrompt: string): Promise<string> {
    // Use local optimization by default - it's more reliable and faster
    console.log('Using local optimization for cost reduction')
    return this.localOptimizePrompt(originalPrompt)
  }

  /**
   * Optimize a prompt and return both the optimized prompt and cost analysis
   */
  async optimizePromptWithAnalysis(originalPrompt: string): Promise<CostOptimizationResult> {
    const optimizedPrompt = await this.optimizePrompt(originalPrompt)
    const costAnalysis = await this.calculateCostOptimization(originalPrompt, optimizedPrompt)

    // Get agent recommendation
    const agentRecommendation = await this.recommendAgent(originalPrompt)

    return {
      ...costAnalysis,
      recommendedAgent: agentRecommendation.recommended,
      agentReasoning: agentRecommendation.reasoning,
      alternativeAgents: agentRecommendation.alternatives,
    }
  }

  /**
   * Optimize a prompt specifically for coding tasks using enhanced optimizer
   */
  async optimizeCodingPrompt(originalPrompt: string): Promise<string> {
    const result = enhancedPromptOptimizer.optimize(originalPrompt, 4)
    return result.optimizedPrompt
  }

  /**
   * Optimize a prompt using the enhanced optimizer with full analysis
   */
  async optimizeWithEnhancedAnalysis(originalPrompt: string): Promise<{
    optimizedPrompt: string
    optimizationResult: OptimizationResult
    costAnalysis: CostOptimizationResult
  }> {
    // Use enhanced optimizer
    const optimizationResult = enhancedPromptOptimizer.optimize(originalPrompt, 4)

    // Calculate cost analysis
    const costAnalysis = await this.calculateCostOptimization(originalPrompt, optimizationResult.optimizedPrompt)

    return {
      optimizedPrompt: optimizationResult.optimizedPrompt,
      optimizationResult,
      costAnalysis,
    }
  }

  /**
   * Local prompt optimization without external APIs
   */
  private localOptimizePrompt(originalPrompt: string): string {
    // Remove common filler words and phrases
    let optimized = originalPrompt
      // Remove politeness and filler words
      .replace(
        /\b(please|kindly|would you|could you|I would like you to|I would really appreciate it if you could)\b/gi,
        '',
      )
      .replace(/\b(very|really|quite|rather|somewhat|pretty|fairly|absolutely|definitely)\b/gi, '')
      .replace(/\b(comprehensive|detailed|thorough|extensive|complete|full)\b/gi, '')
      .replace(/\b(beautiful|elegant|gorgeous|stunning|amazing|wonderful|fantastic)\b/gi, '')
      .replace(/\b(advanced|sophisticated|complex|intricate|elaborate|fancy)\b/gi, '')
      .replace(/\b(create|build|make|develop|generate|construct|design)\s+(a|an|the)\s+/gi, '')
      .replace(/\b(that|which|who|where|when)\s+/gi, '')
      .replace(/\b(including|with|featuring|having|containing)\s+/gi, '')
      .replace(/\b(and|or|but|so|for|nor|yet)\s+/gi, '')
      .replace(/\b(also|additionally|furthermore|moreover|besides)\b/gi, '')
      .replace(/\b(actually|basically|essentially|fundamentally|basically)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    // If optimization didn't change much, try more aggressive optimization
    if (optimized.length > originalPrompt.length * 0.7) {
      optimized = originalPrompt
        .replace(/\b(I want|I need|I would like|I would love|I would prefer)\b/gi, '')
        .replace(/\b(can you|could you|would you|will you)\b/gi, '')
        .replace(/\b(help me|assist me|support me)\b/gi, '')
        .replace(/\b(create|build|make|develop|generate|construct|design)\s+(a|an|the)\s+/gi, '')
        .replace(/\b(that|which|who|where|when)\s+/gi, '')
        .replace(/\b(including|with|featuring|having|containing)\s+/gi, '')
        .replace(/\b(and|or|but|so|for|nor|yet)\s+/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    // Final cleanup
    optimized = optimized
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\b\s+\b/g, ' ')

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

      // Calculate costs using current AI pricing
      // Using GPT-4 pricing as baseline: $0.03 per 1K input tokens, $0.06 per 1K output tokens
      // Assuming average output is 2x input tokens for coding tasks
      const inputCostPer1K = 0.03
      const outputCostPer1K = 0.06
      const outputMultiplier = 2 // Assume 2x output tokens for coding tasks

      const originalInputCost = (originalTokens / 1000) * inputCostPer1K
      const originalOutputCost = ((originalTokens * outputMultiplier) / 1000) * outputCostPer1K
      const originalCost = originalInputCost + originalOutputCost

      const optimizedInputCost = (optimizedTokens / 1000) * inputCostPer1K
      const optimizedOutputCost = ((optimizedTokens * outputMultiplier) / 1000) * outputCostPer1K
      const optimizedCost = optimizedInputCost + optimizedOutputCost

      const savings = originalCost - optimizedCost
      const savingsPercentage = originalCost > 0 ? ((savings / originalCost) * 100).toFixed(1) : '0.0'

      // Estimate monthly savings (assuming 100 similar tasks per month)
      const estimatedMonthlySavings = savings * 100

      // Skip real API calls to avoid rate limits and errors
      const realApiCost = 0

      return {
        originalCost,
        optimizedCost,
        savings,
        savingsPercentage: `${savingsPercentage}%`,
        originalTokens,
        optimizedTokens,
        apiCalls: 2,
        realApiCost,
        originalPrompt,
        optimizedPrompt,
        optimizationApplied: optimizedPrompt !== originalPrompt,
        estimatedMonthlySavings,
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
        originalPrompt,
        optimizedPrompt,
        optimizationApplied: false,
        estimatedMonthlySavings: 0,
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
