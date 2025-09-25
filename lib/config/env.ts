/**
 * Environment Configuration
 * Handles environment variables gracefully for different deployment scenarios
 */

export interface EnvironmentConfig {
  // Database
  hasDatabase: boolean
  postgresUrl?: string

  // AI Gateway
  hasAIGateway: boolean
  aiGatewayApiKey?: string

  // Vercel
  hasVercel: boolean
  vercelToken?: string
  vercelTeamId?: string
  vercelProjectId?: string

  // GitHub
  hasGitHub: boolean
  githubToken?: string
  githubClientId?: string
  githubClientSecret?: string

  // AI Providers
  hasOpenAI: boolean
  hasAnthropic: boolean
  hasPerplexity: boolean
  hasCursor: boolean

  // Deployment info
  isProduction: boolean
  isVercel: boolean
  isBuildTime: boolean
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercel = !!process.env.VERCEL
  const isBuildTime = isProduction && !process.env.VERCEL_ENV

  return {
    // Database
    hasDatabase: !!process.env.POSTGRES_URL,
    postgresUrl: process.env.POSTGRES_URL,

    // AI Gateway
    hasAIGateway: !!process.env.AI_GATEWAY_API_KEY,
    aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY,

    // Vercel
    hasVercel: !!(process.env.VERCEL_TOKEN && process.env.VERCEL_TEAM_ID && process.env.VERCEL_PROJECT_ID),
    vercelToken: process.env.VERCEL_TOKEN,
    vercelTeamId: process.env.VERCEL_TEAM_ID,
    vercelProjectId: process.env.VERCEL_PROJECT_ID,

    // GitHub
    hasGitHub: !!process.env.GITHUB_TOKEN,
    githubToken: process.env.GITHUB_TOKEN,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,

    // AI Providers
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    hasPerplexity: !!process.env.PERPLEXITY_API_KEY,
    hasCursor: !!process.env.CURSOR_API_KEY,

    // Deployment info
    isProduction,
    isVercel,
    isBuildTime,
  }
}

export function logEnvironmentStatus() {
  const config = getEnvironmentConfig()

  console.log('🔧 Environment Configuration:')
  console.log(`  Database: ${config.hasDatabase ? '✅' : '❌'}`)
  console.log(`  AI Gateway: ${config.hasAIGateway ? '✅' : '❌'}`)
  console.log(`  Vercel: ${config.hasVercel ? '✅' : '❌'}`)
  console.log(`  GitHub: ${config.hasGitHub ? '✅' : '❌'}`)
  console.log(`  OpenAI: ${config.hasOpenAI ? '✅' : '❌'}`)
  console.log(`  Anthropic: ${config.hasAnthropic ? '✅' : '❌'}`)
  console.log(`  Perplexity: ${config.hasPerplexity ? '✅' : '❌'}`)
  console.log(`  Cursor: ${config.hasCursor ? '✅' : '❌'}`)
  console.log(`  Environment: ${config.isProduction ? 'Production' : 'Development'}`)
  console.log(`  Platform: ${config.isVercel ? 'Vercel' : 'Other'}`)
  console.log(`  Build Time: ${config.isBuildTime ? 'Yes' : 'No'}`)
}

export function getMissingEnvironmentVariables(): string[] {
  const config = getEnvironmentConfig()
  const missing: string[] = []

  // Only check for required variables in production runtime (not build time)
  if (config.isProduction && !config.isBuildTime) {
    if (!config.hasDatabase) missing.push('POSTGRES_URL')
    if (!config.hasAIGateway) missing.push('AI_GATEWAY_API_KEY')
    if (!config.hasVercel) {
      missing.push('VERCEL_TOKEN', 'VERCEL_TEAM_ID', 'VERCEL_PROJECT_ID')
    }
  }

  return missing
}

export function validateEnvironmentForDeployment(): { valid: boolean; missing: string[] } {
  const missing = getMissingEnvironmentVariables()
  return {
    valid: missing.length === 0,
    missing,
  }
}

export function getRequiredVariablesForFeatures(features: {
  useDatabase?: boolean
  useAIGateway?: boolean
  useVercel?: boolean
  useGitHub?: boolean | 'oauth'
  useOpenAI?: boolean
  useAnthropic?: boolean
  usePerplexity?: boolean
  useCursor?: boolean
}): string[] {
  const required: string[] = []

  if (features.useDatabase) {
    required.push('POSTGRES_URL')
  }

  if (features.useAIGateway) {
    required.push('AI_GATEWAY_API_KEY')
  }

  if (features.useVercel) {
    required.push('VERCEL_TOKEN', 'VERCEL_TEAM_ID', 'VERCEL_PROJECT_ID')
  }

  if (features.useGitHub) {
    required.push('GITHUB_TOKEN')
    if (features.useGitHub === 'oauth') {
      required.push('GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET')
    }
  }

  if (features.useOpenAI) {
    required.push('OPENAI_API_KEY')
  }

  if (features.useAnthropic) {
    required.push('ANTHROPIC_API_KEY')
  }

  if (features.usePerplexity) {
    required.push('PERPLEXITY_API_KEY')
  }

  if (features.useCursor) {
    required.push('CURSOR_API_KEY')
  }

  return required
}

export function getMinimalConfigForAgent(agent: string): {
  required: string[]
  optional: string[]
  description: string
} {
  const configs = {
    claude: {
      required: ['ANTHROPIC_API_KEY'],
      optional: ['POSTGRES_URL', 'GITHUB_TOKEN'],
      description: 'Claude agent for code generation and analysis',
    },
    codex: {
      required: ['AI_GATEWAY_API_KEY', 'OPENAI_API_KEY'],
      optional: ['POSTGRES_URL', 'GITHUB_TOKEN', 'VERCEL_TOKEN', 'VERCEL_TEAM_ID', 'VERCEL_PROJECT_ID'],
      description: 'Codex agent with Vercel AI Gateway integration',
    },
    cursor: {
      required: ['CURSOR_API_KEY'],
      optional: ['POSTGRES_URL', 'GITHUB_TOKEN'],
      description: 'Cursor agent for code completion and generation',
    },
    perplexity: {
      required: ['PERPLEXITY_API_KEY'],
      optional: ['POSTGRES_URL', 'GITHUB_TOKEN'],
      description: 'Perplexity agent for real-time web search and research',
    },
    opencode: {
      required: [],
      optional: ['POSTGRES_URL', 'GITHUB_TOKEN'],
      description: 'OpenCode agent (open source, no API keys required)',
    },
  }

  return (
    configs[agent as keyof typeof configs] || {
      required: [],
      optional: ['POSTGRES_URL', 'GITHUB_TOKEN'],
      description: 'Unknown agent',
    }
  )
}
