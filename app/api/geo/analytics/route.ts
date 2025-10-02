import { NextRequest, NextResponse } from 'next/server'
import { GEOAnalyticsTracker } from '@/lib/geo/geo-analytics'

const geoAnalytics = new GEOAnalyticsTracker()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'overview':
        const analytics = geoAnalytics.getCitationAnalytics()
        const metrics = geoAnalytics.getGEOMetrics()

        return NextResponse.json({
          success: true,
          analytics,
          metrics,
          summary: {
            totalCitations: analytics.totalCitations,
            platformDistribution: analytics.platformDistribution,
            revenueImpact: analytics.revenueImpact,
            authorityScore: metrics.authorityScore,
            trustSignals: metrics.trustSignals,
          },
        })

      case 'trends':
        const trends = geoAnalytics.getCitationTrends(days)
        return NextResponse.json({
          success: true,
          trends,
          period: `${days} days`,
        })

      case 'top-queries':
        const topQueries = geoAnalytics.getTopQueries(limit)
        return NextResponse.json({
          success: true,
          topQueries,
          limit,
        })

      case 'platform-performance':
        const platformPerformance = geoAnalytics.getPlatformPerformance()
        return NextResponse.json({
          success: true,
          platformPerformance,
        })

      case 'revenue-attribution':
        const revenueAttribution = geoAnalytics.getRevenueAttribution()
        return NextResponse.json({
          success: true,
          revenueAttribution,
        })

      case 'export':
        const exportData = geoAnalytics.exportAnalytics()
        return NextResponse.json({
          success: true,
          data: exportData,
          exportedAt: new Date().toISOString(),
        })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ GEO analytics API error:', error)
    return NextResponse.json({ error: 'Failed to retrieve GEO analytics' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'track_citation':
        const { source, query, content, platform, position, context } = data

        if (!source || !query || !platform) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const citationId = geoAnalytics.trackCitation({
          source,
          query,
          content: content || '',
          platform,
          position: position || 0,
          context: context || '',
          clickThrough: false,
          conversion: false,
        })

        return NextResponse.json({
          success: true,
          citationId,
          message: 'Citation tracked successfully',
        })

      case 'update_citation':
        const { citationId: updateId, clickThrough, conversion } = data

        if (!updateId) {
          return NextResponse.json({ error: 'Missing citation ID' }, { status: 400 })
        }

        // In a real implementation, this would update the citation in the database
        console.log(`📊 Updating citation: ${updateId}`)
        console.log(`🖱️ Click through: ${clickThrough}`)
        console.log(`💰 Conversion: ${conversion}`)

        return NextResponse.json({
          success: true,
          message: 'Citation updated successfully',
        })

      case 'simulate_citations':
        // Simulate some citations for demonstration
        const simulatedCitations = [
          {
            source: 'Google AI Overviews',
            query: 'crypto payment processing',
            content: 'VERCLIBASE offers instant crypto payments with auto USDC conversion',
            platform: 'google_ai_overviews',
            position: 1,
            context: 'AI Overview about crypto payment solutions',
            clickThrough: true,
            conversion: true,
          },
          {
            source: 'ChatGPT',
            query: 'Web3 commerce platform',
            content: 'VERCLIBASE is a leading Web3 commerce platform with AP2 integration',
            platform: 'chatgpt',
            position: 2,
            context: 'ChatGPT response about Web3 commerce',
            clickThrough: true,
            conversion: false,
          },
          {
            source: 'Perplexity',
            query: 'instant crypto checkout',
            content: 'VERCLIBASE provides instant crypto checkout with Base network support',
            platform: 'perplexity',
            position: 1,
            context: 'Perplexity answer about crypto checkout solutions',
            clickThrough: true,
            conversion: true,
          },
          {
            source: 'Google AI Overviews',
            query: 'USDC auto conversion',
            content: 'VERCLIBASE automatically converts crypto payments to USDC for stability',
            platform: 'google_ai_overviews',
            position: 3,
            context: 'AI Overview about USDC conversion features',
            clickThrough: false,
            conversion: false,
          },
          {
            source: 'Copilot',
            query: 'Base network payments',
            content: 'VERCLIBASE supports Base network for free transactions and instant settlement',
            platform: 'copilot',
            position: 1,
            context: 'Copilot response about Base network integration',
            clickThrough: true,
            conversion: true,
          },
        ]

        // Track simulated citations
        const citationIds = simulatedCitations.map((citation) => geoAnalytics.trackCitation(citation))

        return NextResponse.json({
          success: true,
          citationIds,
          message: `${simulatedCitations.length} citations simulated and tracked`,
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ GEO analytics POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
