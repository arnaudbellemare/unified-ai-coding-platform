/**
 * GEO Authority Tracker
 * Monitors AI citations and authority signals
 */

export interface AICitation {
  id: string
  platform: 'chatgpt' | 'gemini' | 'perplexity' | 'claude' | 'copilot'
  query: string
  product: string
  position: number
  timestamp: Date
  context: string
  confidence: number
}

export interface AuthoritySignal {
  id: string
  type: 'backlink' | 'mention' | 'review' | 'expert_opinion' | 'media_coverage'
  source: string
  url: string
  domain_authority: number
  relevance_score: number
  timestamp: Date
  content: string
}

export interface GEOMetrics {
  total_citations: number
  platform_breakdown: Record<string, number>
  authority_score: number
  trending_queries: string[]
  conversion_rate: number
  ai_visibility_score: number
}

export class GEOAuthorityTracker {
  private citations: AICitation[] = []
  private authoritySignals: AuthoritySignal[] = []

  /**
   * Track AI citation
   */
  trackCitation(citation: Omit<AICitation, 'id' | 'timestamp'>): AICitation {
    const newCitation: AICitation = {
      ...citation,
      id: `citation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    
    this.citations.push(newCitation)
    console.log(`📊 GEO Citation tracked: ${citation.product} on ${citation.platform}`)
    
    return newCitation
  }

  /**
   * Track authority signal
   */
  trackAuthoritySignal(signal: Omit<AuthoritySignal, 'id' | 'timestamp'>): AuthoritySignal {
    const newSignal: AuthoritySignal = {
      ...signal,
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    
    this.authoritySignals.push(newSignal)
    console.log(`🔗 Authority signal tracked: ${signal.type} from ${signal.source}`)
    
    return newSignal
  }

  /**
   * Get GEO metrics
   */
  getGEOMetrics(): GEOMetrics {
    const platformBreakdown = this.citations.reduce((acc, citation) => {
      acc[citation.platform] = (acc[citation.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const authorityScore = this.calculateAuthorityScore()
    const aiVisibilityScore = this.calculateAIVisibilityScore()
    
    const trendingQueries = this.getTrendingQueries()
    const conversionRate = this.calculateConversionRate()

    return {
      total_citations: this.citations.length,
      platform_breakdown: platformBreakdown,
      authority_score: authorityScore,
      trending_queries: trendingQueries,
      conversion_rate: conversionRate,
      ai_visibility_score: aiVisibilityScore
    }
  }

  /**
   * Calculate authority score based on signals
   */
  private calculateAuthorityScore(): number {
    if (this.authoritySignals.length === 0) return 0

    const weightedScore = this.authoritySignals.reduce((total, signal) => {
      const typeWeight = this.getTypeWeight(signal.type)
      const domainWeight = signal.domain_authority / 100
      const relevanceWeight = signal.relevance_score / 100
      
      return total + (typeWeight * domainWeight * relevanceWeight)
    }, 0)

    return Math.min(100, Math.round(weightedScore / this.authoritySignals.length * 100))
  }

  /**
   * Calculate AI visibility score
   */
  private calculateAIVisibilityScore(): number {
    if (this.citations.length === 0) return 0

    const platformWeights = {
      chatgpt: 1.0,
      gemini: 0.9,
      perplexity: 0.8,
      claude: 0.7,
      copilot: 0.6
    }

    const weightedCitations = this.citations.reduce((total, citation) => {
      const platformWeight = platformWeights[citation.platform] || 0.5
      const positionWeight = Math.max(0, 1 - (citation.position - 1) * 0.1)
      const confidenceWeight = citation.confidence / 100
      
      return total + (platformWeight * positionWeight * confidenceWeight)
    }, 0)

    return Math.min(100, Math.round(weightedCitations / this.citations.length * 100))
  }

  /**
   * Get trending queries
   */
  private getTrendingQueries(): string[] {
    const queryCounts = this.citations.reduce((acc, citation) => {
      acc[citation.query] = (acc[citation.query] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(queryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([query]) => query)
  }

  /**
   * Calculate conversion rate (mock implementation)
   */
  private calculateConversionRate(): number {
    // In real implementation, this would track actual conversions
    const baseRate = 0.15 // 15% base conversion rate
    const citationBoost = Math.min(0.1, this.citations.length * 0.001) // Up to 10% boost
    const authorityBoost = Math.min(0.05, this.authoritySignals.length * 0.002) // Up to 5% boost
    
    return Math.min(1.0, baseRate + citationBoost + authorityBoost)
  }

  /**
   * Get type weight for authority signals
   */
  private getTypeWeight(type: AuthoritySignal['type']): number {
    const weights = {
      backlink: 1.0,
      expert_opinion: 0.9,
      media_coverage: 0.8,
      review: 0.7,
      mention: 0.5
    }
    
    return weights[type] || 0.3
  }

  /**
   * Get recent citations
   */
  getRecentCitations(limit: number = 10): AICitation[] {
    return this.citations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Get authority signals by type
   */
  getAuthoritySignalsByType(type: AuthoritySignal['type']): AuthoritySignal[] {
    return this.authoritySignals.filter(signal => signal.type === type)
  }
}
