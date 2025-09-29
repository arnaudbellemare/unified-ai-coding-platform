import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      hasOpenRouterKey: !!(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your-openrouter-api-key'),
      hasDatabase: !!(process.env.DATABASE_URL && process.env.DATABASE_URL !== 'your-database-url'),
      hasGitHubClientId: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your-github-client-id'),
      hasPrivyAppId: !!(process.env.NEXT_PUBLIC_PRIVY_APP_ID && process.env.NEXT_PUBLIC_PRIVY_APP_ID !== 'your-privy-app-id'),
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    }

    // Test basic functionality
    const tests = {
      jsonParsing: true,
      dateCreation: new Date().toISOString(),
      mathCalculation: 2 + 2,
      stringProcessing: 'test'.toUpperCase(),
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      tests,
      message: 'VERCLIBASE API is running correctly'
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'VERCLIBASE API has issues'
      },
      { status: 500 }
    )
  }
}
