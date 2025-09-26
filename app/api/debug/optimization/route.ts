import { NextRequest, NextResponse } from 'next/server'
import { OptimizationEngine } from '@/lib/advanced-optimization-engine'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing OptimizationEngine...')
    
    const engine = new OptimizationEngine()
    console.log('✅ OptimizationEngine created successfully')
    
    // Test basic methods
    const metrics = await engine.getOptimizationMetrics()
    console.log('✅ getOptimizationMetrics:', metrics)
    
    const providerPerformance = await engine.getProviderPerformance()
    console.log('✅ getProviderPerformance:', providerPerformance.length, 'providers')
    
    const optimizationHistory = await engine.getOptimizationHistory()
    console.log('✅ getOptimizationHistory:', optimizationHistory.length, 'entries')
    
    const recommendations = await engine.getOptimizationRecommendations()
    console.log('✅ getOptimizationRecommendations:', recommendations.length, 'recommendations')
    
    return NextResponse.json({
      success: true,
      metrics,
      providerPerformance: providerPerformance.length,
      optimizationHistory: optimizationHistory.length,
      recommendations: recommendations.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ OptimizationEngine test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'OptimizationEngine test failed',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
