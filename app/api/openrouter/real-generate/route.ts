import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'
import { RealX402PaymentService } from '@/lib/x402/real-x402-payments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, model, provider, task, userId } = body

    if (!prompt || !model) {
      return NextResponse.json({ success: false, error: 'Prompt and model are required' }, { status: 400 })
    }

    // Initialize OpenRouter client
    const openRouterClient = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: 'https://openrouter.ai/api/v1',
    })

    // Get model pricing for cost calculation
    const models = await openRouterClient.getModels()
    const selectedModel = models.find((m) => m.id === model)

    if (!selectedModel) {
      return NextResponse.json({ success: false, error: `Model ${model} not found` }, { status: 400 })
    }

    // Calculate estimated cost
    const estimatedTokens = Math.ceil(prompt.length / 4) // Rough estimation
    const promptPrice =
      typeof selectedModel.pricing.prompt === 'string'
        ? parseFloat(selectedModel.pricing.prompt)
        : selectedModel.pricing.prompt
    const completionPrice =
      typeof selectedModel.pricing.completion === 'string'
        ? parseFloat(selectedModel.pricing.completion)
        : selectedModel.pricing.completion
    const promptCost = (promptPrice * estimatedTokens) / 1000000
    const estimatedCompletionCost = (completionPrice * 100) / 1000000 // Estimate 100 tokens completion
    const totalEstimatedCost = promptCost + estimatedCompletionCost

    console.log(`💰 Estimated cost for ${model}: $${totalEstimatedCost.toFixed(6)}`)

    // Make real API call to OpenRouter
    const startTime = Date.now()
    const aiResponse = await openRouterClient.generateText(
      model,
      [
        {
          role: 'system',
          content: `You are an AI assistant optimized for cost efficiency. Provide concise, accurate responses. Task: ${task || 'General assistance'}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        max_tokens: 1000,
        temperature: 0.7,
      },
    )
    const endTime = Date.now()

    // Calculate actual cost based on response
    const actualPromptTokens = Math.ceil(prompt.length / 4)
    const actualCompletionTokens = Math.ceil(aiResponse.content.length / 4)
    const actualPromptCost = (promptPrice * actualPromptTokens) / 1000000
    const actualCompletionCost = (completionPrice * actualCompletionTokens) / 1000000
    const actualTotalCost = actualPromptCost + actualCompletionCost

    console.log(
      `💰 Actual cost: $${actualTotalCost.toFixed(6)} (${actualPromptTokens}p + ${actualCompletionTokens}c tokens)`,
    )

    // Prepare x402 reimbursement data
    const reimbursementData = {
      userId: userId || 'anonymous',
      model: selectedModel.id,
      provider: 'default-provider',
      promptTokens: actualPromptTokens,
      completionTokens: actualCompletionTokens,
      totalTokens: actualPromptTokens + actualCompletionTokens,
      promptCost: actualPromptCost,
      completionCost: actualCompletionCost,
      totalCost: actualTotalCost,
      latency: endTime - startTime,
      timestamp: new Date().toISOString(),
      task: task || 'general',
    }

    // Process x402 reimbursement (if configured)
    let reimbursementResult = null
    if (process.env.X402_ENABLED === 'true' && process.env.X402_PRIVATE_KEY) {
      try {
        const x402Service = new RealX402PaymentService()
        reimbursementResult = await x402Service.processReimbursement(reimbursementData)
        console.log(`🔄 x402 reimbursement processed:`, reimbursementResult)
      } catch (reimbursementError) {
        console.error('x402 reimbursement failed:', reimbursementError)
        // Continue without reimbursement rather than failing
      }
    }

    // Return real AI response with cost data
    const result = {
      success: true,
      aiResponse: {
        content: aiResponse.content,
        model: selectedModel.id,
        provider: 'default-provider',
        tokens: {
          prompt: actualPromptTokens,
          completion: actualCompletionTokens,
          total: actualPromptTokens + actualCompletionTokens,
        },
        cost: {
          prompt: actualPromptCost,
          completion: actualCompletionCost,
          total: actualTotalCost,
          currency: 'USD',
        },
        latency: endTime - startTime,
        pricing: selectedModel.pricing,
      },
      optimization: {
        modelSelected: selectedModel.id,
        providerSelected: provider || selectedModel.providers?.[0]?.id,
        costOptimized: true,
        efficiency: {
          costPerToken: actualTotalCost / (actualPromptTokens + actualCompletionTokens),
          tokensPerSecond: (actualPromptTokens + actualCompletionTokens) / ((endTime - startTime) / 1000),
        },
      },
      x402: {
        enabled: process.env.X402_ENABLED === 'true',
        reimbursement: reimbursementResult,
        data: reimbursementData,
      },
      timestamp: new Date().toISOString(),
    }

    console.log(`✅ Real AI generation completed: ${model} - $${actualTotalCost.toFixed(6)}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Real OpenRouter generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'AI generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
