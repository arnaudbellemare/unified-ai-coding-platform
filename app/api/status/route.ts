import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const status = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        vercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION,
        url: process.env.VERCEL_URL,
      },
      services: {
        openrouter: {
          configured: !!process.env.OPENROUTER_API_KEY,
          status: process.env.OPENROUTER_API_KEY ? 'ready' : 'missing-api-key',
        },
        github: {
          configured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
          status: (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) ? 'ready' : 'missing-credentials',
        },
        database: {
          configured: !!process.env.DATABASE_URL,
          status: process.env.DATABASE_URL ? 'ready' : 'missing-url',
        },
      },
      recommendations: {
        critical: process.env.OPENROUTER_API_KEY ? [] : ['Add OPENROUTER_API_KEY to enable AI functionality'],
        optional: [
          !process.env.GITHUB_CLIENT_ID && 'Add GITHUB_CLIENT_ID for GitHub integration',
          !process.env.GITHUB_CLIENT_SECRET && 'Add GITHUB_CLIENT_SECRET for GitHub integration',
          !process.env.DATABASE_URL && 'Add DATABASE_URL for database functionality',
        ].filter(Boolean),
      },
      fallbacks: {
        models: 'Hardcoded 15 cost-effective models available',
        processing: 'Emergency fallback processing available',
        testing: 'Comprehensive testing suite available',
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Status check failed',
        message: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
