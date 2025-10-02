/**
 * GEO Analytics and Citation Tracking
 * Measures AI visibility and citation performance
 */

export interface GEOCitation {
  id: string
  source: string
  query: string
  content: string
  timestamp: Date
  platform: 'google_ai_overviews' | 'chatgpt' | 'perplexity' | 'copilot' | 'gemini'
  position: number
  context: string
  clickThrough: boolean
  conversion: boolean
}

export interface GEOAnalytics {
  totalCitations: number
  platformDistribution: Record<string, number>
  queryPerformance: Array<{
    query: string
    citations: number
    impressions: number
    clickThroughRate: number
    conversionRate: number
  }>
  contentPerformance: Array<{
    contentId: string
    title: string
    citations: number
    authoritySignals: number
    backlinks: number
  }>
  competitorAnalysis: {
    marketShare: number
    competitorCitations: Record<string, number>
    gapAnalysis: string[]
  }
  revenueImpact: {
    assistedConversions: number
    revenueAttribution: number
    averageOrderValue: number
    conversionRate: number
  }
}

export interface GEOMetrics {
  citations: number
  impressions: number
  clickThroughRate: number
  conversionRate: number
  revenueAttribution: number
  authorityScore: number
  trustSignals: number
  backlinks: number
  socialSignals: number
}

export class GEOAnalyticsTracker {
  private citations: GEOCitation[] = []
  private analytics: GEOAnalytics | null = null

  /**
   * Track a new citation
   */
  trackCitation(citation: Omit<GEOCitation, 'id' | 'timestamp'>): string {
    const id = `geo_citation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newCitation: GEOCitation = {
      ...citation,
      id,
      timestamp: new Date()
    }

    this.citations.push(newCitation)
    console.log(`📊 GEO Citation tracked: ${citation.platform} - "${citation.query}"`)
    
    return id
  }

  /**
   * Get citation analytics
   */
  getCitationAnalytics(): GEOAnalytics {
    if (this.analytics && this.citations.length === this.analytics.totalCitations) {
      return this.analytics
    }

    const totalCitations = this.citations.length
    const platformDistribution = this.citations.reduce((acc, citation) => {
      acc[citation.platform] = (acc[citation.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by query for performance analysis
    const queryGroups = this.citations.reduce((acc, citation) => {
      if (!acc[citation.query]) {
        acc[citation.query] = []
      }
      acc[citation.query].push(citation)
      return acc
    }, {} as Record<string, GEOCitation[]>)

    const queryPerformance = Object.entries(queryGroups).map(([query, citations]) => {
      const impressions = citations.length
      const clickThrough = citations.filter(c => c.clickThrough).length
      const conversions = citations.filter(c => c.conversion).length
      
      return {
        query,
        citations: impressions,
        impressions,
        clickThroughRate: clickThrough / impressions,
        conversionRate: conversions / impressions
      }
    })

    // Content performance analysis
    const contentGroups = this.citations.reduce((acc, citation) => {
      const contentId = citation.content
      if (!acc[contentId]) {
        acc[contentId] = {
          contentId,
          title: citation.content,
          citations: 0,
          authoritySignals: 0,
          backlinks: 0
        }
      }
      acc[contentId].citations++
      return acc
    }, {} as Record<string, any>)

    const contentPerformance = Object.values(contentGroups)

    // Competitor analysis (simulated)
    const competitorAnalysis = {
      marketShare: 0.15, // 15% market share
      competitorCitations: {
        'competitor1': 45,
        'competitor2': 32,
        'competitor3': 28
      },
      gapAnalysis: [
        'Missing citations in "crypto payment processing" queries',
        'Low visibility in "Web3 commerce" searches',
        'Need more authority signals for "blockchain payments"'
      ]
    }

    // Revenue impact analysis
    const revenueImpact = {
      assistedConversions: this.citations.filter(c => c.conversion).length,
      revenueAttribution: this.citations.filter(c => c.conversion).length * 150, // $150 average order
      averageOrderValue: 150,
      conversionRate: this.citations.filter(c => c.conversion).length / totalCitations
    }

    this.analytics = {
      totalCitations,
      platformDistribution,
      queryPerformance,
      contentPerformance,
      competitorAnalysis,
      revenueImpact
    }

    return this.analytics
  }

  /**
   * Get GEO metrics summary
   */
  getGEOMetrics(): GEOMetrics {
    const analytics = this.getCitationAnalytics()
    
    return {
      citations: analytics.totalCitations,
      impressions: analytics.totalCitations,
      clickThroughRate: analytics.queryPerformance.reduce((sum, q) => sum + q.clickThroughRate, 0) / analytics.queryPerformance.length,
      conversionRate: analytics.revenueImpact.conversionRate,
      revenueAttribution: analytics.revenueImpact.revenueAttribution,
      authorityScore: this.calculateAuthorityScore(),
      trustSignals: this.calculateTrustSignals(),
      backlinks: this.calculateBacklinks(),
      socialSignals: this.calculateSocialSignals()
    }
  }

  /**
   * Calculate authority score based on citations and signals
   */
  private calculateAuthorityScore(): number {
    const analytics = this.getCitationAnalytics()
    const baseScore = analytics.totalCitations * 0.1
    const platformBonus = Object.keys(analytics.platformDistribution).length * 5
    const contentBonus = analytics.contentPerformance.length * 2
    
    return Math.min(100, baseScore + platformBonus + contentBonus)
  }

  /**
   * Calculate trust signals
   */
  private calculateTrustSignals(): number {
    // Simulate trust signals based on citations and content quality
    const analytics = this.getCitationAnalytics()
    const highQualityCitations = analytics.totalCitations * 0.7 // 70% high quality
    const authorityContent = analytics.contentPerformance.length * 0.8 // 80% authority content
    
    return Math.round(highQualityCitations + authorityContent)
  }

  /**
   * Calculate backlinks
   */
  private calculateBacklinks(): number {
    // Simulate backlink calculation
    const analytics = this.getCitationAnalytics()
    return Math.round(analytics.totalCitations * 0.3) // 30% of citations generate backlinks
  }

  /**
   * Calculate social signals
   */
  private calculateSocialSignals(): number {
    // Simulate social signals
    const analytics = this.getCitationAnalytics()
    return Math.round(analytics.totalCitations * 0.2) // 20% of citations generate social signals
  }

  /**
   * Get citation trends over time
   */
  getCitationTrends(days: number = 30): Array<{
    date: string
    citations: number
    platforms: Record<string, number>
  }> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
    
    const filteredCitations = this.citations.filter(c => 
      c.timestamp >= startDate && c.timestamp <= endDate
    )

    // Group by day
    const dailyGroups = filteredCitations.reduce((acc, citation) => {
      const date = citation.timestamp.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(citation)
      return acc
    }, {} as Record<string, GEOCitation[]>)

    return Object.entries(dailyGroups).map(([date, citations]) => ({
      date,
      citations: citations.length,
      platforms: citations.reduce((acc, citation) => {
        acc[citation.platform] = (acc[citation.platform] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }))
  }

  /**
   * Get top performing queries
   */
  getTopQueries(limit: number = 10): Array<{
    query: string
    citations: number
    clickThroughRate: number
    conversionRate: number
  }> {
    const analytics = this.getCitationAnalytics()
    
    return analytics.queryPerformance
      .sort((a, b) => b.citations - a.citations)
      .slice(0, limit)
      .map(q => ({
        query: q.query,
        citations: q.citations,
        clickThroughRate: q.clickThroughRate,
        conversionRate: q.conversionRate
      }))
  }

  /**
   * Get platform performance
   */
  getPlatformPerformance(): Array<{
    platform: string
    citations: number
    percentage: number
    growth: number
  }> {
    const analytics = this.getCitationAnalytics()
    const total = analytics.totalCitations
    
    return Object.entries(analytics.platformDistribution).map(([platform, citations]) => ({
      platform,
      citations,
      percentage: (citations / total) * 100,
      growth: Math.random() * 20 - 10 // Simulated growth rate
    }))
  }

  /**
   * Get revenue attribution
   */
  getRevenueAttribution(): {
    totalRevenue: number
    geoRevenue: number
    geoPercentage: number
    averageOrderValue: number
    assistedConversions: number
  } {
    const analytics = this.getCitationAnalytics()
    
    return {
      totalRevenue: 50000, // Simulated total revenue
      geoRevenue: analytics.revenueImpact.revenueAttribution,
      geoPercentage: (analytics.revenueImpact.revenueAttribution / 50000) * 100,
      averageOrderValue: analytics.revenueImpact.averageOrderValue,
      assistedConversions: analytics.revenueImpact.assistedConversions
    }
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): {
    citations: GEOCitation[]
    analytics: GEOAnalytics
    metrics: GEOMetrics
    trends: Array<{ date: string; citations: number; platforms: Record<string, number> }>
    topQueries: Array<{ query: string; citations: number; clickThroughRate: number; conversionRate: number }>
    platformPerformance: Array<{ platform: string; citations: number; percentage: number; growth: number }>
    revenueAttribution: { totalRevenue: number; geoRevenue: number; geoPercentage: number; averageOrderValue: number; assistedConversions: number }
  } {
    return {
      citations: this.citations,
      analytics: this.getCitationAnalytics(),
      metrics: this.getGEOMetrics(),
      trends: this.getCitationTrends(),
      topQueries: this.getTopQueries(),
      platformPerformance: this.getPlatformPerformance(),
      revenueAttribution: this.getRevenueAttribution()
    }
  }
}
