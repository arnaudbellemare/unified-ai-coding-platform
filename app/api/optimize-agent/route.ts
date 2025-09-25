import { NextRequest, NextResponse } from 'next/server'
import { CostOptimization } from '@/lib/cost-optimization'
import { getEnvironmentConfig } from '@/lib/config/env'
import { hybridOptimizer } from '@/lib/hybrid-optimizer'
import { getPrivyUser } from '@/lib/auth/privy-auth'

interface X402PaymentRequest {
  amount: number
  currency: string
  recipient: string
  network: string
  walletAddress: string
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, selectedAgent, taskDescription, x402Payment } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Get Privy user for authentication and wallet info
    const privyUser = await getPrivyUser(request)
    
    // Check if x402 payment is required for premium optimization
    const requiresPayment = prompt.length > 500 || selectedAgent === 'premium'
    if (requiresPayment && !x402Payment) {
      return NextResponse.json({ 
        error: 'X402 payment required for premium optimization',
        requiresPayment: true,
        estimatedCost: 0.01, // $0.01 for premium optimization
        privyUser: privyUser ? {
          id: privyUser.id,
          walletAddress: privyUser.wallet?.address
        } : null
      }, { status: 402 }) // 402 Payment Required
    }

    const config = getEnvironmentConfig()
    const costOptimizer = new CostOptimization()

    // Use hybrid optimization system
    const hybridResult = await hybridOptimizer.optimize(
      prompt,
      taskDescription || {
        domain: selectedAgent === 'coding' ? 'coding' : selectedAgent === 'analytics' ? 'analysis' : 'general',
        complexity: prompt.length > 200 ? 'complex' : prompt.length > 100 ? 'medium' : 'simple',
        requirements: [],
        constraints: [],
      },
      [],
    )

    // Get agent recommendation with cost analysis
    const agentRecommendation = await costOptimizer.recommendAgent(prompt)

    // Get prompt optimization
    const optimizationResult = await costOptimizer.optimizePromptWithAnalysis(prompt)

    // Check if user's selected agent is available and cost-effective
    const availableAgents = [
      config.hasAnthropic && 'claude',
      config.hasOpenAI && 'gpt',
      config.hasPerplexity && 'perplexity',
      config.hasAIGateway && 'ai_gateway',
    ].filter(Boolean) as string[]

    const isSelectedAgentAvailable = availableAgents.includes(selectedAgent || '')
    const isSelectedAgentOptimal = agentRecommendation.recommended === selectedAgent

    // Calculate potential savings if switching to recommended agent
    let potentialSavings = 0
    if (!isSelectedAgentOptimal && selectedAgent && agentRecommendation.alternatives.length > 0) {
      const selectedAgentCost =
        agentRecommendation.alternatives.find((alt) => alt.agent === selectedAgent)?.estimatedCost || 0
      const recommendedAgentCost =
        agentRecommendation.alternatives.find((alt) => alt.agent === agentRecommendation.recommended)?.estimatedCost ||
        0
      potentialSavings = selectedAgentCost - recommendedAgentCost
    }

    return NextResponse.json({
      success: true,
      prompt: {
        original: prompt,
        optimized: hybridResult.optimizedPrompt,
        optimizationApplied: hybridResult.optimizationApplied,
        tokenReduction: hybridResult.tokenReduction,
        estimatedSavings: hybridResult.costReduction,
      },
      hybridOptimization: {
        optimizationEngine: hybridResult.optimizationEngine,
        verbosityLevel: hybridResult.verbosityLevel,
        strategies: hybridResult.strategies,
        performanceScore: hybridResult.performanceScore,
        racingScore: hybridResult.racingScore,
        paretoOptimal: hybridResult.paretoOptimal,
        evaluationsUsed: hybridResult.evaluationsUsed,
      },
      agentRecommendation: {
        recommended: agentRecommendation.recommended,
        reasoning: agentRecommendation.reasoning,
        alternatives: agentRecommendation.alternatives,
        userSelected: selectedAgent,
        isSelectedAvailable: isSelectedAgentAvailable,
        isSelectedOptimal: isSelectedAgentOptimal,
        potentialSavings: potentialSavings,
        recommendation: isSelectedAgentOptimal
          ? `✅ Your selected agent "${selectedAgent}" is already the most cost-effective choice!`
          : isSelectedAgentAvailable
            ? `💡 Consider switching to "${agentRecommendation.recommended}" for ${potentialSavings.toFixed(4)}$ savings per request`
            : `⚠️ Your selected agent "${selectedAgent}" requires additional environment variables. Consider using "${agentRecommendation.recommended}" instead.`,
      },
      environment: {
        availableAgents: availableAgents,
        missingVariables: [
          !config.hasAnthropic && 'ANTHROPIC_API_KEY',
          !config.hasOpenAI && 'OPENAI_API_KEY',
          !config.hasPerplexity && 'PERPLEXITY_API_KEY',
          !config.hasAIGateway && 'AI_GATEWAY_API_KEY',
        ].filter(Boolean) as string[],
      },
      costAnalysis: {
        originalCost: hybridResult.originalCost,
        optimizedCost: hybridResult.optimizedCost,
        totalSavings: hybridResult.savings,
        estimatedMonthlySavings: hybridResult.estimatedMonthlySavings,
        tokenReduction: hybridResult.tokenReduction,
        costReduction: hybridResult.costReduction,
        optimizationEngine: hybridResult.optimizationEngine,
        strategies: hybridResult.strategies,
        verbosityLevel: hybridResult.verbosityLevel,
      },
    })
  } catch (error) {
    console.error('Agent optimization error:', error)
    return NextResponse.json({ error: 'Failed to optimize agent selection' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const config = getEnvironmentConfig()

    return NextResponse.json({
      availableAgents: [
        config.hasAnthropic && { name: 'claude', available: true, requiredVariables: ['ANTHROPIC_API_KEY'] },
        config.hasOpenAI && { name: 'gpt', available: true, requiredVariables: ['OPENAI_API_KEY'] },
        config.hasPerplexity && { name: 'perplexity', available: true, requiredVariables: ['PERPLEXITY_API_KEY'] },
        config.hasAIGateway && { name: 'ai_gateway', available: true, requiredVariables: ['AI_GATEWAY_API_KEY'] },
      ].filter(Boolean),
      costOptimization: {
        enabled: true,
        features: ['prompt_optimization', 'agent_recommendation', 'cost_estimation', 'savings_tracking'],
      },
    })
  } catch (error) {
    console.error('Agent info error:', error)
    return NextResponse.json({ error: 'Failed to get agent information' }, { status: 500 })
  }
}

function getRequiredVariablesForAgent(agent: string): string[] {
  const agentVariables = {
    claude: ['ANTHROPIC_API_KEY'],
    codex: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY'],
    perplexity: ['PERPLEXITY_API_KEY'],
    cursor: ['CURSOR_API_KEY'],
    opencode: [],
  }

  return agentVariables[agent as keyof typeof agentVariables] || []
}
