import { NextResponse } from 'next/server'
import { getEnvironmentConfig, validateEnvironmentForDeployment, getMinimalConfigForAgent } from '@/lib/config/env'

export async function GET() {
  try {
    const config = getEnvironmentConfig()
    const validation = validateEnvironmentForDeployment()

    // Get agent configurations
    const agents = ['claude', 'codex', 'perplexity', 'cursor', 'opencode']
    const agentConfigs = agents.reduce(
      (acc, agent) => {
        acc[agent] = getMinimalConfigForAgent(agent)
        return acc
      },
      {} as Record<string, any>,
    )

    const health = {
      status: validation.valid ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV,
      },
      features: {
        database: config.hasDatabase,
        aiGateway: config.hasAIGateway,
        vercel: config.hasVercel,
        github: config.hasGitHub,
        openai: config.hasOpenAI,
        anthropic: config.hasAnthropic,
        perplexity: config.hasPerplexity,
        cursor: config.hasCursor,
      },
      deployment: {
        isProduction: config.isProduction,
        isVercel: config.isVercel,
        isBuildTime: config.isBuildTime,
      },
      agents: agentConfigs,
      recommendations: {
        availableAgents: Object.keys(agentConfigs).filter((agent) => {
          const agentConfig = agentConfigs[agent]
          return agentConfig.required.every((req: string) => {
            // Check if the required environment variable is available
            const envVar = req
            switch (envVar) {
              case 'POSTGRES_URL':
                return config.hasDatabase
              case 'AI_GATEWAY_API_KEY':
                return config.hasAIGateway
              case 'VERCEL_TOKEN':
              case 'VERCEL_TEAM_ID':
              case 'VERCEL_PROJECT_ID':
                return config.hasVercel
              case 'GITHUB_TOKEN':
                return config.hasGitHub
              case 'OPENAI_API_KEY':
                return config.hasOpenAI
              case 'ANTHROPIC_API_KEY':
                return config.hasAnthropic
              case 'PERPLEXITY_API_KEY':
                return config.hasPerplexity
              case 'CURSOR_API_KEY':
                return config.hasCursor
              default:
                return false
            }
          })
        }),
        costOptimized: config.hasPerplexity ? 'perplexity' : config.hasOpenAI ? 'codex' : 'opencode',
        minimalSetup: config.hasPerplexity
          ? ['PERPLEXITY_API_KEY']
          : config.hasOpenAI
            ? ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY']
            : [],
      },
      validation: validation,
    }

    return NextResponse.json(health, {
      status: validation.valid ? 200 : 503,
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
