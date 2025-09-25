// Price Monitor for Real-time Provider Cost Tracking
interface PriceUpdate {
  providerId: string
  providerName: string
  oldPrice: number
  newPrice: number
  changePercentage: number
  timestamp: Date
}

interface PriceAlert {
  id: string
  providerId: string
  condition: 'above' | 'below' | 'change'
  threshold: number
  isActive: boolean
  lastTriggered?: Date
}

export class PriceMonitor {
  private priceHistory: Map<string, number[]> = new Map()
  private priceAlerts: PriceAlert[] = []
  private updateInterval: NodeJS.Timeout | null = null
  private priceUpdateCallbacks: ((update: PriceUpdate) => void)[] = []

  constructor() {
    this.startPriceMonitoring()
  }

  // Start monitoring prices
  private startPriceMonitoring() {
    // Check prices every 5 minutes
    this.updateInterval = setInterval(
      () => {
        this.updatePrices()
      },
      5 * 60 * 1000,
    )

    // Initial price update
    this.updatePrices()
  }

  // Update prices for all providers
  private async updatePrices() {
    const { x402APIWrapper } = await import('./x402APIWrapper')
    const providers = x402APIWrapper.getProviders()

    for (const provider of providers) {
      await this.updateProviderPrice(provider.id, provider.name)
    }
  }

  // Update price for a specific provider
  private async updateProviderPrice(providerId: string, providerName: string) {
    try {
      const currentPrice = this.getCurrentPrice(providerId)
      const newPrice = this.simulatePriceChange(currentPrice)

      // Store price in history
      if (!this.priceHistory.has(providerId)) {
        this.priceHistory.set(providerId, [])
      }

      const history = this.priceHistory.get(providerId)!
      history.push(newPrice)

      // Keep only last 100 price points
      if (history.length > 100) {
        history.shift()
      }

      // Check for significant price changes
      if (Math.abs(newPrice - currentPrice) / currentPrice > 0.05) {
        // 5% change
        const priceUpdate: PriceUpdate = {
          providerId,
          providerName,
          oldPrice: currentPrice,
          newPrice,
          changePercentage: ((newPrice - currentPrice) / currentPrice) * 100,
          timestamp: new Date(),
        }

        // Notify callbacks
        this.priceUpdateCallbacks.forEach((callback) => {
          try {
            callback(priceUpdate)
          } catch (error) {
            console.error('Error in price update callback:', error)
          }
        })

        // Check alerts
        this.checkPriceAlerts(priceUpdate)

        console.log(
          `Price update: ${providerName} - $${currentPrice.toFixed(4)} → $${newPrice.toFixed(4)} (${priceUpdate.changePercentage.toFixed(2)}%)`,
        )
      }
    } catch (error) {
      console.error(`Error updating price for ${providerId}:`, error)
    }
  }

  // Simulate price change (in real implementation, this would fetch from APIs)
  private simulatePriceChange(currentPrice: number): number {
    // Simulate realistic price fluctuations
    const volatility = 0.02 // 2% volatility
    const trend = (Math.random() - 0.5) * 0.001 // Slight trending
    const randomChange = (Math.random() - 0.5) * volatility

    return Math.max(0.001, currentPrice * (1 + trend + randomChange)) // Minimum price of $0.001
  }

  // Get current price for a provider
  getCurrentPrice(providerId: string): number {
    const history = this.priceHistory.get(providerId)
    if (history && history.length > 0) {
      return history[history.length - 1]
    }

    // Realistic AI API prices (per 1K tokens)
    const defaultPrices: Record<string, number> = {
      'openai-gpt4': 0.03,        // $0.03 per 1K tokens
      'openai-gpt35': 0.002,      // $0.002 per 1K tokens
      'anthropic-claude': 0.032,  // $0.032 per 1K tokens
      'google-palm': 0.025,       // $0.025 per 1K tokens
      'cohere-command': 0.015,    // $0.015 per 1K tokens
      'huggingface-inference': 0.008, // $0.008 per 1K tokens
      'perplexity-sonar-small': 0.005, // $0.005 per 1K tokens
      'perplexity-sonar-medium': 0.015, // $0.015 per 1K tokens
      'perplexity-sonar-large': 0.025, // $0.025 per 1K tokens
    }

    return defaultPrices[providerId] || 0.01
  }

  // Get current prices for all providers
  async getCurrentPrices(): Promise<
    Array<{
      providerId: string
      providerName: string
      currentCost: number
      previousCost: number
      changePercentage: number
      trend: 'up' | 'down' | 'stable'
    }>
  > {
    const { x402APIWrapper } = await import('./x402APIWrapper')
    const providers = x402APIWrapper.getProviders()

    return providers.map((provider) => {
      const history = this.priceHistory.get(provider.id)
      const currentCost = this.getCurrentPrice(provider.id)
      const previousCost = history && history.length > 1 ? history[history.length - 2] : currentCost
      const changePercentage = ((currentCost - previousCost) / previousCost) * 100

      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (Math.abs(changePercentage) > 1) {
        trend = changePercentage > 0 ? 'up' : 'down'
      }

      return {
        providerId: provider.id,
        providerName: provider.name,
        currentCost,
        previousCost,
        changePercentage,
        trend,
      }
    })
  }

  // Get price history for a provider
  getPriceHistory(providerId: string, limit?: number): number[] {
    const history = this.priceHistory.get(providerId) || []
    return limit ? history.slice(-limit) : history
  }

  // Get price statistics
  getPriceStats(providerId: string): {
    currentPrice: number
    averagePrice: number
    minPrice: number
    maxPrice: number
    volatility: number
    trend: 'up' | 'down' | 'stable'
  } | null {
    const history = this.priceHistory.get(providerId)
    if (!history || history.length === 0) return null

    const currentPrice = history[history.length - 1]
    const averagePrice = history.reduce((sum, price) => sum + price, 0) / history.length
    const minPrice = Math.min(...history)
    const maxPrice = Math.max(...history)

    // Calculate volatility (standard deviation)
    const variance = history.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / history.length
    const volatility = Math.sqrt(variance) / averagePrice

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (history.length >= 2) {
      const recent = history.slice(-5) // Last 5 prices
      const older = history.slice(-10, -5) // Previous 5 prices
      const recentAvg = recent.reduce((sum, price) => sum + price, 0) / recent.length
      const olderAvg = older.length > 0 ? older.reduce((sum, price) => sum + price, 0) / older.length : recentAvg

      const change = (recentAvg - olderAvg) / olderAvg
      if (Math.abs(change) > 0.02) {
        // 2% threshold
        trend = change > 0 ? 'up' : 'down'
      }
    }

    return {
      currentPrice,
      averagePrice,
      minPrice,
      maxPrice,
      volatility,
      trend,
    }
  }

  // Add price alert
  addPriceAlert(alert: Omit<PriceAlert, 'id'>): string {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newAlert: PriceAlert = {
      ...alert,
      id,
    }

    this.priceAlerts.push(newAlert)
    console.log(`Added price alert: ${alert.providerId} ${alert.condition} ${alert.threshold}`)

    return id
  }

  // Remove price alert
  removePriceAlert(alertId: string): boolean {
    const index = this.priceAlerts.findIndex((alert) => alert.id === alertId)
    if (index > -1) {
      this.priceAlerts.splice(index, 1)
      console.log(`Removed price alert: ${alertId}`)
      return true
    }
    return false
  }

  // Check price alerts
  private checkPriceAlerts(priceUpdate: PriceUpdate) {
    const alerts = this.priceAlerts.filter((alert) => alert.providerId === priceUpdate.providerId && alert.isActive)

    for (const alert of alerts) {
      let triggered = false

      switch (alert.condition) {
        case 'above':
          triggered = priceUpdate.newPrice > alert.threshold
          break
        case 'below':
          triggered = priceUpdate.newPrice < alert.threshold
          break
        case 'change':
          triggered = Math.abs(priceUpdate.changePercentage) > alert.threshold
          break
      }

      if (triggered) {
        alert.lastTriggered = new Date()
        console.log(
          `Price alert triggered: ${alert.id} - ${priceUpdate.providerName} ${alert.condition} ${alert.threshold}`,
        )

        // In a real implementation, you would send notifications here
        // this.sendAlert(alert, priceUpdate);
      }
    }
  }

  // Subscribe to price updates
  onPriceUpdate(callback: (update: PriceUpdate) => void): () => void {
    this.priceUpdateCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.priceUpdateCallbacks.indexOf(callback)
      if (index > -1) {
        this.priceUpdateCallbacks.splice(index, 1)
      }
    }
  }

  // Get optimization recommendations based on prices
  async getOptimizationRecommendations(): Promise<string[]> {
    const prices = await this.getCurrentPrices()
    const recommendations: string[] = []

    // Find cheapest provider
    const cheapest = prices.reduce((min, current) => (current.currentCost < min.currentCost ? current : min))

    // Find providers with significant price changes
    const significantChanges = prices.filter((p) => Math.abs(p.changePercentage) > 5)

    recommendations.push(
      `💰 Cheapest option: ${cheapest.providerName} at $${cheapest.currentCost.toFixed(3)} per 1K tokens`,
    )

    if (significantChanges.length > 0) {
      significantChanges.forEach((change) => {
        const direction = change.changePercentage > 0 ? 'increased' : 'decreased'
        recommendations.push(
          `📈 ${change.providerName} price ${direction} by ${Math.abs(change.changePercentage).toFixed(1)}%`,
        )
      })
    }

    // Find stable providers
    const stableProviders = prices.filter((p) => Math.abs(p.changePercentage) < 2)
    if (stableProviders.length > 0) {
      recommendations.push(`📊 Stable pricing: ${stableProviders.map((p) => p.providerName).join(', ')}`)
    }

    return recommendations
  }

  // Stop price monitoring
  stopPriceMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log('Price monitoring stopped')
    }
  }

  // Get all price alerts
  getPriceAlerts(): PriceAlert[] {
    return [...this.priceAlerts]
  }

  // Update alert status
  updateAlertStatus(alertId: string, isActive: boolean): boolean {
    const alert = this.priceAlerts.find((a) => a.id === alertId)
    if (alert) {
      alert.isActive = isActive
      console.log(`Alert ${alertId} ${isActive ? 'enabled' : 'disabled'}`)
      return true
    }
    return false
  }
}

export const priceMonitor = new PriceMonitor()
