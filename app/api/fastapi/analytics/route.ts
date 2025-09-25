import { NextRequest, NextResponse } from 'next/server'
import { fastAPIClient } from '@/lib/fastapi-integration'

export async function GET(request: NextRequest) {
  try {
    // Get real-time analytics from FastAPI backend
    const analytics = await fastAPIClient.getAnalytics()

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
      backend: 'FastAPI',
    })
  } catch (error) {
    console.error('FastAPI analytics error:', error)

    // Fallback to local analytics if FastAPI is unavailable
    return NextResponse.json({
      success: false,
      error: 'FastAPI analytics unavailable',
      fallback: true,
      analytics: {
        total_optimizations: 0,
        average_savings: 0.15,
        total_savings: 0,
        success_rate: 0.87,
        recent_trend: 0.12,
        top_strategies: {
          entropy_optimization: 45,
          semantic_compression: 32,
          context_aware_trimming: 23,
        },
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'health_check':
        const isHealthy = await fastAPIClient.healthCheck()
        return NextResponse.json({
          success: true,
          healthy: isHealthy,
          backend: 'FastAPI',
        })

      case 'get_providers':
        const providers = await fastAPIClient.getProviderPerformance()
        return NextResponse.json({
          success: true,
          providers,
          backend: 'FastAPI',
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error('FastAPI action error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
