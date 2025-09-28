import { NextRequest, NextResponse } from 'next/server'
import { ResearchBackedOptimizer } from '@/lib/research-backed-optimizer'
import { GEPACostOptimizer } from '@/lib/gepa-optimizer'
import { CAPOEnhancedOptimizer } from '@/lib/capo-enhanced-optimizer'
import { CloudflareCodeModeOptimizer } from '@/lib/cloudflare-code-mode-optimizer'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'
import { RealX402PaymentService } from '@/lib/x402/real-x402-payments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, task, model, provider, userId } = body

    if (!prompt || !task || !model) {
      return NextResponse.json({ success: false, error: 'Prompt, task, and model are required' }, { status: 400 })
    }

    console.log(`🚀 Starting real AI processing: ${model} for task: ${task}`)

    // Initialize optimizers
    const researchOptimizer = new ResearchBackedOptimizer()
    const gepaOptimizer = new GEPACostOptimizer()
    const capoOptimizer = new CAPOEnhancedOptimizer()
    const cloudflareOptimizer = new CloudflareCodeModeOptimizer()
    const openRouterClient = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: 'https://openrouter.ai/api/v1',
    })

    // Get available models for cost optimization
    const availableModels = await openRouterClient.getModels()
    const selectedModelData = availableModels.find((m) => m.id === model)

    if (!selectedModelData) {
      return NextResponse.json({ success: false, error: `Model ${model} not available` }, { status: 400 })
    }

    // Step 1: Run all optimization engines in parallel
    console.log('🧠 Running optimization engines...')
    const optimizationPromises = [
      researchOptimizer.optimizeWithResearch(prompt, task, model).catch((err) => ({ error: err.message })),
      gepaOptimizer.optimizePrompt(prompt, model, 0.8).catch((err) => ({ error: err.message })),
      capoOptimizer.optimizeWithCAPO(prompt, { description: task, context: prompt }).catch((err) => ({ error: err.message })),
      cloudflareOptimizer.optimizeWithCodeMode(prompt, task, model).catch((err) => ({ error: err.message })),
    ]

    const optimizationResults = await Promise.all(optimizationPromises)

    // Step 2: Select best optimization result
    let bestOptimization = null
    let bestOptimizer = 'none'

    for (let i = 0; i < optimizationResults.length; i++) {
      const result = optimizationResults[i]
      if (result && !result.error) {
        if (!bestOptimization || result.costReduction > bestOptimization.costReduction) {
          bestOptimization = result
          bestOptimizer = ['research', 'gepa', 'capo', 'cloudflare'][i]
        }
      }
    }

    const optimizedPrompt = bestOptimization?.optimizedPrompt || prompt
    const costReduction = bestOptimization?.costReduction || 0

    console.log(`✅ Best optimization: ${bestOptimizer} (${costReduction}% reduction)`)

    // Step 3: Make real AI generation call
    console.log(`🤖 Generating AI response with ${model}...`)
    const startTime = Date.now()

    const aiResponse = await openRouterClient.generateText(
      model,
      [
        {
          role: 'system',
          content: `You are an AI assistant optimized for cost efficiency and accuracy. Task: ${task}`,
        },
        {
          role: 'user',
          content: optimizedPrompt,
        },
      ],
      {
        max_tokens: 1000,
        temperature: 0.7,
      },
    )

    const endTime = Date.now()

    // Step 4: Calculate real costs
    const promptTokens = Math.ceil(optimizedPrompt.length / 4)
    const completionTokens = Math.ceil(aiResponse.content.length / 4)
    const promptPrice =
      typeof selectedModelData.pricing.prompt === 'string'
        ? parseFloat(selectedModelData.pricing.prompt)
        : selectedModelData.pricing.prompt
    const completionPrice =
      typeof selectedModelData.pricing.completion === 'string'
        ? parseFloat(selectedModelData.pricing.completion)
        : selectedModelData.pricing.completion
    const promptCost = (promptPrice * promptTokens) / 1000000
    const completionCost = (completionPrice * completionTokens) / 1000000
    const totalCost = promptCost + completionCost

    console.log(`💰 Real cost: $${totalCost.toFixed(6)} (${promptTokens}p + ${completionTokens}c tokens)`)

    // Step 5: Process x402 reimbursement
    let reimbursementResult = null
    if (process.env.X402_ENABLED === 'true' && process.env.X402_PRIVATE_KEY) {
      try {
        const reimbursementData = {
          userId: userId || 'anonymous',
          model: selectedModelData.id,
          provider: 'default-provider',
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          promptCost,
          completionCost,
          totalCost,
          latency: endTime - startTime,
          timestamp: new Date().toISOString(),
          task,
          optimizationApplied: bestOptimizer,
          costReduction,
        }

        const x402Service = new RealX402PaymentService()
        reimbursementResult = await x402Service.processReimbursement(reimbursementData)
        console.log(`🔄 x402 reimbursement processed:`, reimbursementResult)
      } catch (reimbursementError) {
        console.error('x402 reimbursement failed:', reimbursementError)
      }
    }

    // Step 6: Return comprehensive result
    const result = {
      success: true,
      aiResponse: {
        content: aiResponse.content,
        model: selectedModelData.id,
        provider: 'default-provider',
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens,
        },
        cost: {
          prompt: promptCost,
          completion: completionCost,
          total: totalCost,
          currency: 'USD',
        },
        latency: endTime - startTime,
      },
      optimization: {
        originalPrompt: prompt,
        optimizedPrompt: optimizedPrompt,
        bestOptimizer: bestOptimizer,
        costReduction: costReduction,
        allResults: {
          research: optimizationResults[0],
          gepa: optimizationResults[1],
          capo: optimizationResults[2],
          cloudflare: optimizationResults[3],
        },
      },
      costAnalysis: {
        modelPricing: selectedModelData.pricing,
        efficiency: {
          costPerToken: totalCost / (promptTokens + completionTokens),
          tokensPerSecond: (promptTokens + completionTokens) / ((endTime - startTime) / 1000),
          costPerCharacter: totalCost / optimizedPrompt.length,
        },
        savings: {
          estimatedOriginalCost: (promptPrice * Math.ceil(prompt.length / 4)) / 1000000,
          actualOptimizedCost: totalCost,
          savingsAmount: (promptPrice * Math.ceil(prompt.length / 4)) / 1000000 - totalCost,
          savingsPercentage: costReduction,
        },
      },
      x402: {
        enabled: process.env.X402_ENABLED === 'true',
        reimbursement: reimbursementResult,
        data: {
          userId: userId || 'anonymous',
          totalCost,
          tokens: promptTokens + completionTokens,
          model: selectedModelData.id,
          timestamp: new Date().toISOString(),
        },
      },
      performance: {
        totalTime: endTime - startTime,
        optimizationTime: Date.now() - startTime - (endTime - startTime),
        generationTime: endTime - startTime,
        throughput: (promptTokens + completionTokens) / ((endTime - startTime) / 1000),
      },
      timestamp: new Date().toISOString(),
    }

    console.log(`✅ Real AI processing completed: ${model} - $${totalCost.toFixed(6)} - ${bestOptimizer} optimization`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Real AI processing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Real AI processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
