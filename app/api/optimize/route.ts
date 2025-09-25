import { NextRequest, NextResponse } from 'next/server'
import { costOptimization } from '@/lib/cost-optimization'
import { fastAPIClient } from '@/lib/fastapi-integration'

export async function POST(req: NextRequest) {
  try {
    const { prompt, useFastAPI = true } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        {
          error: 'Prompt is required',
        },
        { status: 400 },
      )
    }

    console.log('[Cost Optimization] Optimizing prompt:', prompt.substring(0, 50) + '...')

    // Try FastAPI backend first for advanced ML optimization
    if (useFastAPI) {
      try {
        const fastAPIResult = await fastAPIClient.optimizePrompt({
          prompt,
          context: 'coding',
          budget: 0.05,
          quality_threshold: 0.95,
          optimization_strategy: 'auto',
        })

        console.log('[Cost Optimization] FastAPI optimization completed:', {
          originalLength: prompt.length,
          optimizedLength: fastAPIResult.optimized_prompt.length,
          costReduction: fastAPIResult.cost_reduction,
          qualityScore: fastAPIResult.quality_score,
          strategies: fastAPIResult.optimization_strategies,
        })

        // Convert FastAPI result to our format
        const costResult = {
          originalCost: 0.00405, // Base cost
          optimizedCost: 0.00405 * (1 - fastAPIResult.cost_reduction),
          savings: 0.00405 * fastAPIResult.cost_reduction,
          savingsPercentage: `${(fastAPIResult.cost_reduction * 100).toFixed(1)}%`,
          originalTokens: fastAPIResult.token_analysis.original_tokens,
          optimizedTokens: fastAPIResult.token_analysis.optimized_tokens,
          apiCalls: 2,
          realApiCost: 0.00405 * (1 - fastAPIResult.cost_reduction),
          originalPrompt: fastAPIResult.original_prompt,
          optimizedPrompt: fastAPIResult.optimized_prompt,
          optimizationApplied: true,
          estimatedMonthlySavings: fastAPIResult.estimated_savings * 30,
          // FastAPI specific data
          mlInsights: fastAPIResult.ml_insights,
          confidence: fastAPIResult.ml_insights.confidence,
          strategies: fastAPIResult.optimization_strategies,
        }

        return NextResponse.json({
          success: true,
          originalPrompt: prompt,
          optimizedPrompt: fastAPIResult.optimized_prompt,
          costOptimization: costResult,
          fastAPIBackend: true,
          mlInsights: fastAPIResult.ml_insights,
          confidence: fastAPIResult.ml_insights.confidence,
        })
      } catch (fastAPIError) {
        console.warn(
          '[Cost Optimization] FastAPI backend unavailable, falling back to local optimization:',
          fastAPIError,
        )
        // Fall through to local optimization
      }
    }

    // Fallback to local optimization
    console.log('[Cost Optimization] Using local optimization fallback')

    // Optimize the prompt
    const optimizedPrompt = await costOptimization.optimizePrompt(prompt)

    // Calculate cost savings
    const costResult = await costOptimization.calculateCostOptimization(prompt, optimizedPrompt)

    console.log('[Cost Optimization] Local optimization completed:', {
      originalLength: prompt.length,
      optimizedLength: optimizedPrompt.length,
      savings: costResult.savingsPercentage,
    })

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      optimizedPrompt,
      costOptimization: costResult,
      fastAPIBackend: false,
      fallback: true,
    })
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
