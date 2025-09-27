import { NextRequest, NextResponse } from 'next/server'
import { integratedOptimizerComparison } from '@/lib/integrated-optimizer-comparison'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'

export async function POST(request: NextRequest) {
  try {
    // Check if development mode is enabled
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      const { getMockComparisonResult } = await import('@/lib/config/dev-config')
      const mockResult = getMockComparisonResult()
      return NextResponse.json(mockResult)
    }

    // Require authentication
    const user = await requireAuth(request)
    
    const body = await request.json()
    const { testCase, runAllTests = false } = body

    console.log(`🔬 Starting optimizer comparison for user ${user.username}`)
    console.log(`Run all tests: ${runAllTests}`)

    let results

    if (runAllTests) {
      // Run comprehensive comparison on all test cases
      results = await integratedOptimizerComparison.runComprehensiveComparison()
    } else if (testCase) {
      // Run comparison on specific test case
      const comparisonResult = await integratedOptimizerComparison.compareOptimizers(testCase)
      results = [comparisonResult]
    } else {
      return NextResponse.json({ error: 'Either testCase or runAllTests must be provided' }, { status: 400 })
    }

    // Calculate overall statistics
    const overallStats = calculateOverallStatistics(results)

    console.log(`✅ Optimizer comparison completed`)
    console.log(`📊 Total tests: ${results.length}`)
    console.log(`🏆 Overall winner: ${overallStats.overallWinner}`)

    return NextResponse.json({
      success: true,
      results,
      overallStats,
      user: {
        username: user.username,
        comparisonCount: 1,
      },
    })
  } catch (error) {
    console.error('Optimizer comparison error:', error)
    return NextResponse.json(
      {
        error: 'Optimizer comparison failed',
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

    // Get available test cases
    const testCases = integratedOptimizerComparison.getTestCases()

    return NextResponse.json({
      success: true,
      testCases,
      optimizers: [
        {
          name: 'CAPO Hybrid Enhanced',
          description: 'Smart engine selection with racing algorithms',
          strengths: ['Multi-objective optimization', 'High reliability', 'Smart selection'],
          weaknesses: ['Complex setup', 'Slower for simple tasks'],
          bestFor: 'Complex tasks requiring thorough optimization',
        },
        {
          name: 'GEPA Genetic Algorithm',
          description: 'Evolutionary optimization with genetic operations',
          strengths: ['Evolutionary learning', 'Quality preservation', 'Adaptive'],
          weaknesses: ['Slower execution', 'Higher computational cost'],
          bestFor: 'Complex tasks where quality is paramount',
        },
        {
          name: 'Research-Backed Optimization',
          description: 'Stanford, MIT, Berkeley, Google, OpenAI findings',
          strengths: ['Academic research', 'High reliability', 'Fast execution'],
          weaknesses: ['Limited to research findings', 'May not adapt'],
          bestFor: 'General-purpose optimization with proven methods',
        },
        {
          name: 'Cloudflare Code Mode',
          description: 'Cutting-edge Cloudflare innovations',
          strengths: ['Modern technology', 'High performance', 'Cost-effective'],
          weaknesses: ['Newer technology', 'Cloudflare dependency'],
          bestFor: 'High-performance applications with modern infrastructure',
        },
      ],
      user: {
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Optimizer comparison info error:', error)
    return NextResponse.json({ error: 'Failed to get optimizer comparison info' }, { status: 500 })
  }
}

/**
 * Calculate overall statistics from comparison results
 */
function calculateOverallStatistics(results: any[]): any {
  const optimizerStats: Record<string, any> = {}

  // Initialize stats for each optimizer
  const optimizers = [
    'CAPO Hybrid Enhanced',
    'GEPA Genetic Algorithm',
    'Research-Backed Optimization',
    'Cloudflare Code Mode',
  ]
  optimizers.forEach((opt) => {
    optimizerStats[opt] = {
      wins: 0,
      totalScore: 0,
      avgScore: 0,
      bestPerformance: '',
      totalTests: 0,
    }
  })

  // Calculate stats from results
  results.forEach((result) => {
    Object.values(result.results).forEach((optResult: any) => {
      const optimizer = optResult.optimizer
      if (optimizerStats[optimizer]) {
        optimizerStats[optimizer].totalScore += optResult.score
        optimizerStats[optimizer].totalTests += 1

        if (result.winner.optimizer === optimizer) {
          optimizerStats[optimizer].wins += 1
        }
      }
    })
  })

  // Calculate averages and find overall winner
  let overallWinner = ''
  let highestAvgScore = 0

  Object.entries(optimizerStats).forEach(([optimizer, stats]) => {
    stats.avgScore = stats.totalTests > 0 ? stats.totalScore / stats.totalTests : 0
    stats.winRate = stats.totalTests > 0 ? (stats.wins / stats.totalTests) * 100 : 0

    if (stats.avgScore > highestAvgScore) {
      highestAvgScore = stats.avgScore
      overallWinner = optimizer
    }
  })

  return {
    overallWinner,
    optimizerStats,
    totalTests: results.length,
    summary: {
      mostWins: Object.entries(optimizerStats).reduce(
        (best, [name, stats]) => (stats.wins > best.wins ? { name, ...stats } : best),
        { name: '', wins: 0 },
      ),
      highestAvgScore: Object.entries(optimizerStats).reduce(
        (best, [name, stats]) => (stats.avgScore > best.avgScore ? { name, ...stats } : best),
        { name: '', avgScore: 0 },
      ),
    },
  }
}
