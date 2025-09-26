import { NextRequest, NextResponse } from 'next/server'

interface SimpleAgentExecutionRequest {
  agentId: string
  agentType: string
  input: string
  model: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SimpleAgentExecutionRequest = await request.json()
    const { agentId, agentType, input, model } = body

    console.log(`🤖 Simple agent execution: ${agentId} (${agentType})`)

    // Simple response for testing
    const response = {
      success: true,
      agentId,
      agentType,
      input,
      model,
      result: {
        output: `This is a test response for agent ${agentId}. Input was: "${input.substring(0, 100)}..."`,
        executionTime: 150,
        tokensUsed: 25,
        cost: 0.001,
      },
      costOptimization: {
        tokenReduction: 15.5,
        costReduction: 0.0005,
        strategies: ['test_optimization'],
        realApiCost: 0.001,
        totalTokens: 25,
        promptTokens: 15,
        completionTokens: 10,
        promptCost: 0.0006,
        completionCost: 0.0004,
        totalCost: 0.001,
        model: model,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Simple agent execution error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Simple agent execution failed',
      },
      { status: 500 },
    )
  }
}
