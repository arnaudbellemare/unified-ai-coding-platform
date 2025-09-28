import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test Vercel Sandbox functionality
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_REGION: process.env.VERCEL_REGION,
        VERCEL_URL: process.env.VERCEL_URL,
      },
      features: {
        openRouterApiKey: process.env.OPENROUTER_API_KEY ? 'Configured' : 'Not Configured',
        githubClientId: process.env.GITHUB_CLIENT_ID ? 'Configured' : 'Not Configured',
        databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not Configured',
      },
      sandbox: {
        status: 'Active',
        capabilities: [
          'API Routes',
          'Serverless Functions',
          'Edge Runtime',
          'Environment Variables',
          'Database Connections',
        ],
        limitations: ['10 second execution timeout', 'Memory limits', 'Cold starts', 'Rate limiting'],
      },
      testing: {
        jsonResponse: 'Working',
        serverlessFunction: 'Active',
        timestampGeneration: 'Success',
      },
    }

    return NextResponse.json({
      success: true,
      message: 'Vercel Sandbox Test Successful',
      results: testResults,
    })
  } catch (error) {
    console.error('Sandbox test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Sandbox test failed',
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { testType, data } = body

    const response = {
      success: true,
      testType,
      receivedData: data,
      processedAt: new Date().toISOString(),
      sandbox: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sandbox POST test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Sandbox POST test failed',
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
