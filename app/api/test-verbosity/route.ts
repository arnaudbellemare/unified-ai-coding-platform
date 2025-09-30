import { NextRequest, NextResponse } from 'next/server'
import { ResearchBackedOptimizer } from '@/lib/research-backed-optimizer'

export async function POST(request: NextRequest) {
  try {
    const { prompt, verbosityLevel } = await request.json()

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 })
    }

    const testPrompt =
      prompt ||
      'Write a comprehensive guide on how to build a React application with TypeScript, including setup, components, state management, testing, and deployment best practices.'

    const optimizer = new ResearchBackedOptimizer()

    // Test all verbosity levels
    const results = await Promise.all([
      optimizer.optimizeWithResearch(
        testPrompt,
        'Create a detailed tutorial',
        'meta-llama/llama-3.2-3b-instruct:free',
        'low',
      ),
      optimizer.optimizeWithResearch(
        testPrompt,
        'Create a detailed tutorial',
        'meta-llama/llama-3.2-3b-instruct:free',
        'medium',
      ),
      optimizer.optimizeWithResearch(
        testPrompt,
        'Create a detailed tutorial',
        'meta-llama/llama-3.2-3b-instruct:free',
        'high',
      ),
    ])

    return NextResponse.json({
      success: true,
      originalPrompt: testPrompt,
      verbosityLevels: {
        low: {
          optimizedPrompt: results[0].optimizedPrompt,
          tokenReduction: results[0].tokenReduction,
          costReduction: results[0].costReduction,
          strategies: results[0].strategies.slice(0, 3), // Show first 3 strategies
        },
        medium: {
          optimizedPrompt: results[1].optimizedPrompt,
          tokenReduction: results[1].tokenReduction,
          costReduction: results[1].costReduction,
          strategies: results[1].strategies.slice(0, 6), // Show first 6 strategies
        },
        high: {
          optimizedPrompt: results[2].optimizedPrompt,
          tokenReduction: results[2].tokenReduction,
          costReduction: results[2].costReduction,
          strategies: results[2].strategies, // Show all strategies
        },
      },
      comparison: {
        lowVsMedium: {
          tokenImprovement: results[1].tokenReduction - results[0].tokenReduction,
          costImprovement: results[1].costReduction - results[0].costReduction,
        },
        mediumVsHigh: {
          tokenImprovement: results[2].tokenReduction - results[1].tokenReduction,
          costImprovement: results[2].costReduction - results[1].costReduction,
        },
        lowVsHigh: {
          tokenImprovement: results[2].tokenReduction - results[0].tokenReduction,
          costImprovement: results[2].costReduction - results[0].costReduction,
        },
      },
    })
  } catch (error) {
    console.error('Verbosity test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
