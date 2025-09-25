import { NextResponse } from 'next/server'
import { getEnvironmentConfig, validateEnvironmentForDeployment, getMinimalConfigForAgent } from '@/lib/config/env'

export async function GET() {
  try {
    const config = getEnvironmentConfig()
    const validation = validateEnvironmentForDeployment()
    
    // Get agent configurations
    const agents = ['claude', 'codex', 'perplexity', 'cursor', 'opencode']
    const agentConfigs = agents.reduce((acc, agent) => {
      acc[agent] = getMinimalConfigForAgent(agent)
      return acc
    }, {} as Record<string, any>)
    
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
        availableAgents: Object.keys(agentConfigs).filter(agent => {
          const agentConfig = agentConfigs[agent]
          return agentConfig.required.every((req: string) => {
            const envVar = req.replace('_API_KEY', '_API_KEY').replace('_TOKEN', '_TOKEN').replace('_ID', '_ID').replace('_SECRET', '_SECRET')
            return config.features[envVar.toLowerCase() as keyof typeof config.features]
          })
        }),
        costOptimized: config.hasPerplexity ? 'perplexity' : config.hasOpenAI ? 'codex' : 'opencode',
        minimalSetup: config.hasPerplexity ? ['PERPLEXITY_API_KEY'] : config.hasOpenAI ? ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY'] : []
      },
      validation: validation,
    }

    return NextResponse.json(health, { 
      status: validation.valid ? 200 : 503 
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
