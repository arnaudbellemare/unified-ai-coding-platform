import { OpenRouterClient } from '../openrouter/openrouter-client'
import { unifiedOptimizer } from './unified-optimizer'
import { DevAuth } from '../auth/dev-auth'

export interface UnifiedAIRequest {
  prompt: string
  task: string
  model?: string
  context?: {
    repoUrl?: string
    branchName?: string
    budget?: number
    priority?: 'cost' | 'quality' | 'speed' | 'balanced'
  }
  optimization?: {
    enabled: boolean
    strategy?: string
    targetReduction?: number
  }
  user?: {
    id: string
    preferences?: {
      preferredModel?: string
      costThreshold?: number
      qualityThreshold?: number
    }
  }
}

export interface UnifiedAIResponse {
  success: boolean
  response: {
    content: string
    model: string
    tokens: {
      prompt: number
      completion: number
      total: number
    }
    cost: {
      prompt: number
      completion: number
      total: number
    }
  }
  optimization?: {
    applied: boolean
    strategy: string
    originalPrompt: string
    optimizedPrompt: string
    savings: {
      tokens: number
      cost: number
      percentage: number
    }
  }
  metadata: {
    provider: string
    timestamp: string
    version: string
    processingTime: number
  }
}

export class UnifiedAIRouter {
  private static instance: UnifiedAIRouter
  private openRouterClient?: OpenRouterClient
  private modelCache: Map<string, any> = new Map()
  private requestHistory: Map<string, UnifiedAIResponse[]> = new Map()

  static getInstance(): UnifiedAIRouter {
    if (!UnifiedAIRouter.instance) {
      UnifiedAIRouter.instance = new UnifiedAIRouter()
    }
    return UnifiedAIRouter.instance
  }

  constructor() {
    this.initializeOpenRouter()
  }

  /**
   * Initialize OpenRouter client
   */
  private initializeOpenRouter() {
    if (process.env.OPENROUTER_API_KEY && !DevAuth.isDevMode()) {
      this.openRouterClient = new OpenRouterClient({
        apiKey: process.env.OPENROUTER_API_KEY,
      })
    }
  }

  /**
   * Process unified AI request with optimization
   */
  async processRequest(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    const startTime = Date.now()
    
    try {
      // Step 1: Optimize prompt if requested
      let finalPrompt = request.prompt
      let optimizationResult = null
      
      if (request.optimization?.enabled) {
        optimizationResult = await this.optimizePrompt(request)
        finalPrompt = optimizationResult.optimization.optimizedPrompt
      }
      
      // Step 2: Select best model
      const selectedModel = this.selectBestModel(request, optimizationResult)
      
      // Step 3: Execute AI request
      const aiResponse = await this.executeAIRequest(finalPrompt, selectedModel, request)
      
      // Step 4: Enhance response with optimization data
      const enhancedResponse = this.enhanceResponse(
        aiResponse, 
        request, 
        optimizationResult, 
        startTime
      )
      
      // Step 5: Store request history
      this.storeRequestHistory(request.user?.id || 'anonymous', enhancedResponse)
      
      return enhancedResponse
      
    } catch (error) {
      console.error('Unified AI request failed:', error)
      
      return this.createFallbackResponse(request, error as Error, startTime)
    }
  }

  /**
   * Optimize prompt using unified optimizer
   */
  private async optimizePrompt(request: UnifiedAIRequest): Promise<any> {
    const optimizationRequest = {
      prompt: request.prompt,
      task: request.task,
      context: request.context,
      user: request.user
    }
    
    return await unifiedOptimizer.optimize(optimizationRequest)
  }

  /**
   * Select best model based on request context and optimization results
   */
  private selectBestModel(request: UnifiedAIRequest, optimizationResult: any): string {
    const { model, context, user } = request
    
    // User preference override
    if (user?.preferences?.preferredModel) {
      return user.preferences.preferredModel
    }
    
    // Direct model specification
    if (model) {
      return model
    }
    
    // Context-based selection
    const priority = context?.priority || 'balanced'
    const budget = context?.budget || 100
    
    if (DevAuth.isDevMode()) {
      return 'openai/gpt-4o-mini' // Mock model for development
    }
    
    // Production model selection
    switch (priority) {
      case 'cost':
        if (budget < 50) {
          return 'openai/gpt-3.5-turbo'
        } else {
          return 'openai/gpt-4o-mini'
        }
      
      case 'quality':
        return 'anthropic/claude-3.5-sonnet'
      
      case 'speed':
        return 'openai/gpt-4o-mini'
      
      case 'balanced':
      default:
        if (budget > 200) {
          return 'anthropic/claude-3.5-sonnet'
        } else {
          return 'openai/gpt-4o-mini'
        }
    }
  }

  /**
   * Execute AI request with selected model
   */
  private async executeAIRequest(
    prompt: string, 
    model: string, 
    request: UnifiedAIRequest
  ): Promise<any> {
    if (DevAuth.isDevMode()) {
      // Mock AI response for development
      return {
        content: `This is a mock AI response for development mode. The original prompt was: "${prompt.substring(0, 100)}..."`,
        model,
        tokens: {
          prompt: Math.floor(prompt.length / 4), // Rough token estimation
          completion: 50,
          total: Math.floor(prompt.length / 4) + 50
        },
        cost: {
          prompt: 0.001,
          completion: 0.002,
          total: 0.003
        }
      }
    }
    
    if (!this.openRouterClient) {
      throw new Error('OpenRouter client not initialized')
    }
    
    try {
      // Execute request with OpenRouter
      const response = await this.openRouterClient.generateText(
        model,
        [
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          max_tokens: 1000,
          temperature: 0.7
        }
      )
      
      return {
        content: response.content,
        model,
        tokens: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        },
        cost: {
          prompt: (response.usage?.prompt_tokens || 0) * 0.000001, // Rough cost calculation
          completion: (response.usage?.completion_tokens || 0) * 0.000002,
          total: response.cost || 0
        }
      }
      
    } catch (error) {
      console.error('OpenRouter request failed:', error)
      throw new Error('AI request failed')
    }
  }

  /**
   * Enhance response with optimization data
   */
  private enhanceResponse(
    aiResponse: any,
    request: UnifiedAIRequest,
    optimizationResult: any,
    startTime: number
  ): UnifiedAIResponse {
    const processingTime = Date.now() - startTime
    
    const response: UnifiedAIResponse = {
      success: true,
      response: {
        content: aiResponse.content,
        model: aiResponse.model,
        tokens: aiResponse.tokens,
        cost: aiResponse.cost
      },
      metadata: {
        provider: 'openrouter',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        processingTime
      }
    }
    
    // Add optimization data if available
    if (optimizationResult) {
      response.optimization = {
        applied: true,
        strategy: optimizationResult.optimization.strategy,
        originalPrompt: optimizationResult.optimization.originalPrompt,
        optimizedPrompt: optimizationResult.optimization.optimizedPrompt,
        savings: {
          tokens: optimizationResult.breakdown.tokenSavings.reduction,
          cost: optimizationResult.breakdown.costSavings.reduction,
          percentage: optimizationResult.breakdown.tokenSavings.percentage
        }
      }
    }
    
    return response
  }

  /**
   * Store request history for learning
   */
  private storeRequestHistory(userId: string, response: UnifiedAIResponse) {
    if (!this.requestHistory.has(userId)) {
      this.requestHistory.set(userId, [])
    }
    
    const history = this.requestHistory.get(userId)!
    history.push(response)
    
    // Keep only last 100 requests per user
    if (history.length > 100) {
      history.shift()
    }
  }

  /**
   * Create fallback response when request fails
   */
  private createFallbackResponse(
    request: UnifiedAIRequest, 
    error: Error, 
    startTime: number
  ): UnifiedAIResponse {
    return {
      success: false,
      response: {
        content: `Request failed: ${error.message}`,
        model: 'fallback',
        tokens: {
          prompt: 0,
          completion: 0,
          total: 0
        },
        cost: {
          prompt: 0,
          completion: 0,
          total: 0
        }
      },
      metadata: {
        provider: 'fallback',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<any[]> {
    if (DevAuth.isDevMode()) {
      return [
        {
          id: 'openai/gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Fast and efficient model for most tasks',
          pricing: { prompt: 0.15, completion: 0.6 },
          context_length: 128000
        },
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          description: 'Balanced performance and speed',
          pricing: { prompt: 3.0, completion: 15.0 },
          context_length: 200000
        },
        {
          id: 'google/gemini-pro-1.5',
          name: 'Gemini Pro 1.5',
          description: 'Google\'s latest model with long context',
          pricing: { prompt: 1.25, completion: 5.0 },
          context_length: 1000000
        }
      ]
    }
    
    if (!this.openRouterClient) {
      throw new Error('OpenRouter client not initialized')
    }
    
    try {
      const models = await this.openRouterClient.getModels()
      return models.filter(model => 
        model.architecture?.modality === 'text' && 
        model.top_provider?.pricing
      )
    } catch (error) {
      console.error('Failed to get models:', error)
      throw new Error('Failed to retrieve available models')
    }
  }

  /**
   * Get request history for user
   */
  getRequestHistory(userId: string): UnifiedAIResponse[] {
    return this.requestHistory.get(userId) || []
  }

  /**
   * Get system AI statistics
   */
  getAIStats(): any {
    const totalRequests = Array.from(this.requestHistory.values())
      .reduce((sum, history) => sum + history.length, 0)
    
    const successfulRequests = Array.from(this.requestHistory.values())
      .flat()
      .filter(response => response.success).length
    
    const totalTokens = Array.from(this.requestHistory.values())
      .flat()
      .filter(response => response.success)
      .reduce((sum, response) => sum + response.response.tokens.total, 0)
    
    return {
      totalRequests,
      successfulRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      totalTokens,
      activeUsers: this.requestHistory.size
    }
  }
}

export const unifiedAIRouter = UnifiedAIRouter.getInstance()
