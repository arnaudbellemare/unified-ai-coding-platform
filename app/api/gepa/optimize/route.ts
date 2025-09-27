import { NextRequest, NextResponse } from 'next/server'
import { gepaOptimizer } from '@/lib/gepa-optimizer'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'

export async function POST(request: NextRequest) {
  try {
    // Check if development mode is enabled (only for local development)
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true' && 
        process.env.VERCEL !== '1' && 
        process.env.NODE_ENV === 'development') {
      const { getMockOptimizationResult } = await import('@/lib/config/dev-config')
      const mockResult = getMockOptimizationResult('gepa')
      return NextResponse.json(mockResult)
    }

    // Require authentication
    const user = await requireAuth(request)

    const body = await request.json()
    const { prompt, targetModel = 'gpt-4o-mini', qualityThreshold = 0.8, parameters } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log(`🧬 Starting GEPA optimization for user ${user.username}`)
    console.log(`📝 Original prompt length: ${prompt.length} characters`)

    // Run GEPA optimization
    const results = await gepaOptimizer.optimizePrompt(prompt, targetModel, qualityThreshold)

    // Calculate savings
    const originalTokens = await import('@/lib/utils/token-counter').then((m) =>
      m.TokenCounter.countTokens(prompt, targetModel),
    )
    const originalCost = await import('@/lib/utils/token-counter').then((m) =>
      m.TokenCounter.calculateCost(originalTokens, targetModel, 'prompt'),
    )

    const tokenReduction = originalTokens - results.bestSolution.tokens
    const costReduction = originalCost - results.bestSolution.cost
    const tokenReductionPercentage = (tokenReduction / originalTokens) * 100
    const costReductionPercentage = (costReduction / originalCost) * 100

    console.log(`✅ GEPA optimization completed`)
    console.log(`📊 Token reduction: ${tokenReduction} (${tokenReductionPercentage.toFixed(1)}%)`)
    console.log(`💰 Cost reduction: $${costReduction.toFixed(6)} (${costReductionPercentage.toFixed(1)}%)`)

    return NextResponse.json({
      success: true,
      results: {
        original: {
          prompt,
          tokens: originalTokens,
          cost: originalCost,
        },
        optimized: {
          prompt: results.bestSolution.prompt,
          tokens: results.bestSolution.tokens,
          cost: results.bestSolution.cost,
          quality: results.bestSolution.quality,
          fitness: results.bestSolution.fitness,
        },
        savings: {
          tokenReduction,
          costReduction,
          tokenReductionPercentage,
          costReductionPercentage,
          estimatedMonthlySavings: costReduction * 30, // Estimate monthly savings
        },
        optimization: {
          totalGenerations: results.totalGenerations,
          totalCost: results.totalCost,
          costSavings: results.costSavings,
          history: results.optimizationHistory,
        },
        population: results.population.slice(0, 5), // Return top 5 solutions
      },
      user: {
        username: user.username,
        optimizationCount: 1, // Track user optimizations
      },
    })
  } catch (error) {
    console.error('GEPA optimization error:', error)
    return NextResponse.json(
      {
        error: 'GEPA optimization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get optimization statistics
    const stats = gepaOptimizer.getOptimizationStats()

    return NextResponse.json({
      success: true,
      statistics: stats,
      user: {
        username: user.username,
      },
    })
  } catch (error) {
    console.error('GEPA stats error:', error)
    return NextResponse.json({ error: 'Failed to get GEPA statistics' }, { status: 500 })
  }
}
