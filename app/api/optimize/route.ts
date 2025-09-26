import { NextRequest, NextResponse } from 'next/server'
import { costOptimization } from '@/lib/cost-optimization'
import { hybridOptimizer } from '@/lib/hybrid-optimizer'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        {
          error: 'Prompt is required',
        },
        { status: 400 },
      )
    }

    console.log('[Cost Optimization] Optimizing prompt:', prompt.substring(0, 50) + '...')

    // Use hybrid optimization for advanced ML-powered optimization
    try {
      const hybridResult = await hybridOptimizer.optimize(
        prompt,
        {
          domain: 'coding',
          complexity: prompt.length > 200 ? 'complex' : prompt.length > 100 ? 'medium' : 'simple',
          requirements: [],
          constraints: [],
        },
        [],
      )

      console.log('[Cost Optimization] Hybrid optimization completed:', {
        originalLength: prompt.length,
        optimizedLength: hybridResult.optimizedPrompt.length,
        tokenReduction: hybridResult.tokenReduction,
        costReduction: hybridResult.costReduction,
        strategies: hybridResult.strategies,
      })

      // Calculate detailed cost analysis
      const costResult = {
        originalCost: 0.00405, // Base cost
        optimizedCost: 0.00405 * (1 - hybridResult.costReduction / 100),
        savings: 0.00405 * (hybridResult.costReduction / 100),
        savingsPercentage: `${hybridResult.costReduction.toFixed(1)}%`,
        originalTokens: Math.floor(prompt.length / 4), // Rough token estimate
        optimizedTokens: Math.floor(hybridResult.optimizedPrompt.length / 4),
        apiCalls: 2,
        realApiCost: 0.00405 * (1 - hybridResult.costReduction / 100),
        originalPrompt: prompt,
        optimizedPrompt: hybridResult.optimizedPrompt,
        optimizationApplied: true,
        estimatedMonthlySavings: 0.00405 * (hybridResult.costReduction / 100) * 30,
        // Hybrid optimization specific data
        mlInsights: {
          predicted_cost_reduction: hybridResult.costReduction / 100,
          predicted_quality: hybridResult.accuracyMaintained,
          confidence: hybridResult.performanceScore,
          complexity_score: prompt.length > 200 ? 0.9 : prompt.length > 100 ? 0.6 : 0.3,
        },
        confidence: hybridResult.performanceScore,
        strategies: hybridResult.strategies,
        optimizationEngine: hybridResult.optimizationEngine,
      }

      return NextResponse.json({
        success: true,
        originalPrompt: prompt,
        optimizedPrompt: hybridResult.optimizedPrompt,
        costOptimization: costResult,
        mlInsights: costResult.mlInsights,
        confidence: costResult.confidence,
        optimizationEngine: hybridResult.optimizationEngine,
      })
    } catch (hybridError) {
      console.warn('[Cost Optimization] Hybrid optimization failed, using basic optimization:', hybridError)

      // Fallback to basic local optimization
      const optimizedPrompt = await costOptimization.optimizePrompt(prompt)
      const costResult = await costOptimization.calculateCostOptimization(prompt, optimizedPrompt)

      return NextResponse.json({
        success: true,
        originalPrompt: prompt,
        optimizedPrompt,
        costOptimization: costResult,
        fallback: true,
      })
    }
  } catch (error) {
    console.error('[Cost Optimization] Error:', error)
    return NextResponse.json(
      {
        error: 'Cost optimization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
