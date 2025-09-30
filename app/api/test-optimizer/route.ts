import { NextRequest, NextResponse } from 'next/server'
import { simpleEffectiveOptimizer } from '@/lib/simple-effective-optimizer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, verbosityLevel = 'medium' } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('🧠 Testing Simple Effective Optimizer...')
    
    // Test the optimizer
    const startTime = Date.now()
    const optimizationResult = simpleEffectiveOptimizer.optimizePrompt(prompt, verbosityLevel)
    const optimizationTime = Date.now() - startTime

    console.log(`✅ Optimization completed in ${optimizationTime}ms`)
    console.log(`📝 Original: "${prompt}" (${optimizationResult.originalTokens} tokens)`)
    console.log(`✨ Optimized: "${optimizationResult.optimizedPrompt}" (${optimizationResult.optimizedTokens} tokens)`)
    console.log(`💰 Token Reduction: ${optimizationResult.tokenReduction} tokens (${optimizationResult.costReduction.toFixed(1)}%)`)
    console.log(`🔧 Strategies: ${optimizationResult.strategies.join(', ')}`)

    return NextResponse.json({
      success: true,
      optimization: {
        originalPrompt: prompt,
        optimizedPrompt: optimizationResult.optimizedPrompt,
        originalTokens: optimizationResult.originalTokens,
        optimizedTokens: optimizationResult.optimizedTokens,
        tokenReduction: optimizationResult.tokenReduction,
        costReduction: optimizationResult.costReduction,
        strategies: optimizationResult.strategies,
        verbosityLevel: optimizationResult.verbosityLevel,
        optimizationTime: optimizationTime
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Optimizer test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Optimizer test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    )
  }
}
