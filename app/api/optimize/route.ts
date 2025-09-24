import { NextRequest, NextResponse } from 'next/server'
import { costOptimization } from '@/lib/cost-optimization'

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

    // Optimize the prompt
    const optimizedPrompt = await costOptimization.optimizePrompt(prompt)

    // Calculate cost savings
    const costResult = await costOptimization.calculateCostOptimization(prompt, optimizedPrompt)

    console.log('[Cost Optimization] Completed:', {
      originalLength: prompt.length,
      optimizedLength: optimizedPrompt.length,
      savings: costResult.savingsPercentage,
    })

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      optimizedPrompt,
      costOptimization: costResult,
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
