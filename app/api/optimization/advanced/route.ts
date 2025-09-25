import { NextRequest, NextResponse } from 'next/server'
import { OptimizationEngine } from '@/lib/advanced-optimization-engine'

// Global optimization engine instance
let optimizationEngine: OptimizationEngine | null = null

function getOptimizationEngine(): OptimizationEngine {
  if (!optimizationEngine) {
    optimizationEngine = new OptimizationEngine()
  }
  return optimizationEngine
}

export async function GET(request: NextRequest) {
  try {
    const engine = getOptimizationEngine()

    // Get real optimization data
    const metrics = await engine.getOptimizationMetrics()
    const providerPerformance = await engine.getProviderPerformance()
    const optimizationHistory = await engine.getOptimizationHistory()
    const recommendations = await engine.getOptimizationRecommendations()

    return NextResponse.json({
      success: true,
      metrics,
      providerPerformance,
      optimizationHistory,
      recommendations,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Advanced optimization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get optimization data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, providerId, ruleId } = body

    const engine = getOptimizationEngine()

    switch (action) {
      case 'run_optimization':
        const result = await engine.forceOptimizationCheck()
        return NextResponse.json({
          success: true,
          result,
          timestamp: new Date().toISOString(),
        })

      case 'toggle_rule':
        if (ruleId) {
          await engine.toggleOptimizationRule(ruleId)
          return NextResponse.json({
            success: true,
            message: `Rule ${ruleId} toggled`,
            timestamp: new Date().toISOString(),
          })
        }
        break

      case 'reset_metrics':
        await engine.resetOptimizationMetrics()
        return NextResponse.json({
          success: true,
          message: 'Optimization metrics reset',
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Advanced optimization action error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute optimization action',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
