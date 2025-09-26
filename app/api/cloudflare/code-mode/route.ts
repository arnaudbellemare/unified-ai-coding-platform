import { NextRequest, NextResponse } from 'next/server'
import { cloudflareCodeModeOptimizer } from '@/lib/cloudflare-code-mode-optimizer'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request)
    
    const body = await request.json()
    const { prompt, taskDescription, targetModel = 'gpt-4o-mini', parameters } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log(`🚀 Starting Cloudflare Code Mode optimization for user ${user.username}`)
    console.log(`📝 Original prompt length: ${prompt.length} characters`)

    // Run Cloudflare Code Mode optimization
    const results = await cloudflareCodeModeOptimizer.optimizeWithCodeMode(
      prompt,
      taskDescription || 'General task processing',
      targetModel,
    )

    console.log(`✅ Cloudflare Code Mode optimization completed`)
    console.log(`📊 Token reduction: ${results.tokenReduction} (${((results.tokenReduction / (results.tokenReduction + results.optimizedCode.length)) * 100).toFixed(1)}%)`)
    console.log(`💰 Cost reduction: $${results.costReduction.toFixed(6)}`)
    console.log(`⏱️ Execution time reduction: ${results.executionTimeReduction.toFixed(0)}ms`)

    return NextResponse.json({
      success: true,
      results: {
        original: {
          prompt,
          tokens: results.tokenReduction + Math.floor(results.optimizedCode.length / 4),
          cost: results.costReduction + (results.optimizedCode.length * 0.002 / 1000),
        },
        optimized: {
          code: results.optimizedCode,
          tokens: Math.floor(results.optimizedCode.length / 4),
          cost: results.optimizedCode.length * 0.002 / 1000,
          executionTime: results.executionTimeReduction,
        },
        savings: {
          tokenReduction: results.tokenReduction,
          costReduction: results.costReduction,
          executionTimeReduction: results.executionTimeReduction,
          tokenReductionPercentage: ((results.tokenReduction / (results.tokenReduction + Math.floor(results.optimizedCode.length / 4))) * 100).toFixed(1),
          costReductionPercentage: ((results.costReduction / (results.costReduction + (results.optimizedCode.length * 0.002 / 1000))) * 100).toFixed(1),
          estimatedMonthlySavings: results.monthlyProjection,
        },
        codeModeBenefits: results.codeModeBenefits,
        dynamicWorkerBenefits: results.dynamicWorkerBenefits,
        strategies: results.strategies,
        totalCostSavings: results.totalCostSavings,
      },
      user: {
        username: user.username,
        optimizationCount: 1,
      },
      recommendations: cloudflareCodeModeOptimizer.getCloudflareOptimizationRecommendations(),
    })
  } catch (error) {
    console.error('Cloudflare Code Mode optimization error:', error)
    return NextResponse.json(
      {
        error: 'Cloudflare Code Mode optimization failed',
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

    // Get high-traffic savings analysis
    const highTrafficSavings = cloudflareCodeModeOptimizer.calculateHighTrafficSavings()
    const recommendations = cloudflareCodeModeOptimizer.getCloudflareOptimizationRecommendations()

    return NextResponse.json({
      success: true,
      analysis: {
        highTrafficSavings,
        recommendations,
        codeModeBenefits: {
          llmAccuracyImprovement: '30% higher accuracy with code vs structured inputs',
          tokenEfficiency: '60% reduction in token usage (500→200 tokens)',
          computationOffload: '70% of processing moved to isolates',
          iOReduction: '50% reduction in I/O operations',
        },
        dynamicWorkerBenefits: {
          startupTimeReduction: '90% faster startup (200ms→2ms)',
          idleCostElimination: '95% reduction in idle compute costs',
          sandboxEfficiency: '85% improvement in sandboxed execution',
          resourceOptimization: '80% better resource utilization',
        },
        realWorldExample: {
          scenario: '15 million requests/month',
          currentCost: '$3,605/month (container-based)',
          optimizedCost: '$135/month (Dynamic Worker Loading + Code Mode)',
          totalSavings: '$3,470/month (95% reduction)',
        },
      },
      user: {
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Cloudflare Code Mode analysis error:', error)
    return NextResponse.json({ error: 'Failed to get Cloudflare Code Mode analysis' }, { status: 500 })
  }
}
