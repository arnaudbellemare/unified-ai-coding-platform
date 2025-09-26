/**
 * FastAPI Backend Integration
 * Connects Next.js frontend with advanced ML optimization backend
 */

interface FastAPIOptimizationRequest {
  prompt: string
  context?: string
  budget?: number
  quality_threshold?: number
  optimization_strategy?: 'auto' | 'entropy_optimization' | 'semantic_compression' | 'ml_guided_optimization'
}

interface FastAPIOptimizationResult {
  original_prompt: string
  optimized_prompt: string
  cost_reduction: number
  quality_score: number
  optimization_strategies: string[]
  confidence: number
  estimated_savings: number
  token_analysis: {
    original_tokens: number
    optimized_tokens: number
    token_reduction: number
    reduction_percentage: number
  }
  ml_insights: {
    predicted_cost_reduction: number
    predicted_quality: number
    confidence: number
    complexity_score: number
  }
}

interface FastAPIAnalytics {
  total_optimizations: number
  average_savings: number
  total_savings: number
  success_rate: number
  recent_trend: number
  top_strategies: Record<string, number>
}

interface FastAPIProvider {
  provider_id: string
  cost_per_token: number
  quality_score: number
  response_time: number
  reliability: number
  recommendation_score: number
}

class FastAPIClient {
  private baseUrl: string
  private wsConnection: WebSocket | null = null
  private wsReconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000') {
    // In production (Vercel), disable FastAPI backend since it's not available
    // The Next.js API routes will handle optimization with local fallback
    this.baseUrl = process.env.NODE_ENV === 'production' ? '' : baseUrl
  }

  /**
   * Optimize prompt using advanced ML backend
   */
  async optimizePrompt(request: FastAPIOptimizationRequest): Promise<FastAPIOptimizationResult> {
    // In production (Vercel), FastAPI backend is not available
    if (!this.baseUrl) {
      throw new Error('FastAPI backend is not available in production deployment')
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${this.baseUrl}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          context: request.context || 'general',
          budget: request.budget || 0.05,
          quality_threshold: request.quality_threshold || 0.95,
          optimization_strategy: request.optimization_strategy || 'auto',
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`FastAPI optimization failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('🚀 FastAPI optimization result:', result)
      return result
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('FastAPI optimization timeout - backend may be unavailable')
      }
      console.error('FastAPI optimization error:', error)
      throw error
    }
  }

  /**
   * Get real-time analytics from FastAPI backend
   */
  async getAnalytics(): Promise<FastAPIAnalytics> {
    // In production (Vercel), FastAPI backend is not available
    if (!this.baseUrl) {
      throw new Error('FastAPI backend is not available in production deployment')
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`${this.baseUrl}/analytics`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`FastAPI analytics failed: ${response.status}`)
      }

      const data = await response.json()
      return data.analytics
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('FastAPI analytics timeout - backend may be unavailable')
      }
      console.error('FastAPI analytics error:', error)
      throw error
    }
  }

  /**
   * Get provider performance metrics
   */
  async getProviderPerformance(): Promise<FastAPIProvider[]> {
    // In production (Vercel), FastAPI backend is not available
    if (!this.baseUrl) {
      throw new Error('FastAPI backend is not available in production deployment')
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`${this.baseUrl}/providers`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`FastAPI providers failed: ${response.status}`)
      }

      const data = await response.json()
      return data.providers
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('FastAPI providers timeout - backend may be unavailable')
      }
      console.error('FastAPI providers error:', error)
      throw error
    }
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  connectWebSocket(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    try {
      const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws'
      this.wsConnection = new WebSocket(wsUrl)

      this.wsConnection.onopen = () => {
        console.log('🔌 FastAPI WebSocket connected')
        this.wsReconnectAttempts = 0
      }

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (error) {
          console.error('WebSocket message parsing error:', error)
        }
      }

      this.wsConnection.onerror = (error) => {
        console.warn('FastAPI WebSocket error (this is normal if WebSocket is not available):', error)
        // Don't call onError for WebSocket connection issues as they're not critical
        // onError?.(error)
      }

      this.wsConnection.onclose = () => {
        console.log('🔌 FastAPI WebSocket disconnected')
        this.reconnectWebSocket(onMessage, onError)
      }
    } catch (error) {
      console.error('FastAPI WebSocket connection error:', error)
    }
  }

  /**
   * Reconnect WebSocket with exponential backoff
   */
  private reconnectWebSocket(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    if (this.wsReconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max WebSocket reconnection attempts reached - WebSocket features disabled')
      // Reset attempts after a longer delay to allow for server restarts
      setTimeout(() => {
        this.wsReconnectAttempts = 0
        console.log('WebSocket reconnection attempts reset - ready to try again')
      }, 60000) // Reset after 1 minute
      return
    }

    this.wsReconnectAttempts++
    const delay = Math.pow(2, this.wsReconnectAttempts) * 1000 // Exponential backoff

    setTimeout(() => {
      console.log(`🔄 Attempting WebSocket reconnection (${this.wsReconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connectWebSocket(onMessage, onError)
    }, delay)
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
    this.wsReconnectAttempts = 0
  }

  /**
   * Reset WebSocket connection attempts (useful after server restart)
   */
  resetWebSocketAttempts() {
    this.wsReconnectAttempts = 0
    console.log('WebSocket connection attempts reset manually')
  }

  /**
   * Health check for FastAPI backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`)
      return response.ok
    } catch (error) {
      console.error('FastAPI health check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const fastAPIClient = new FastAPIClient()

// Export types
export type { FastAPIOptimizationRequest, FastAPIOptimizationResult, FastAPIAnalytics, FastAPIProvider }
