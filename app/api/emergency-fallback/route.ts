import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Emergency fallback for when all other APIs fail
    const emergencyResponse = {
      success: true,
      message: 'Emergency Fallback Active',
      timestamp: new Date().toISOString(),
      environment: {
        vercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
        hasGithub: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        hasDatabase: !!process.env.DATABASE_URL,
      },
      status: 'Emergency mode - Environment variables not configured',
      recommendation: 'Please configure environment variables in Vercel dashboard',
    }

    return NextResponse.json(emergencyResponse)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Emergency fallback failed',
        message: 'System is completely down - check deployment',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Emergency AI processing fallback
    const emergencyAIResponse = {
      success: true,
      aiResponse: {
        content: `Emergency AI Response: ${body.prompt || 'No prompt provided'}\n\nThis is a fallback response because the OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your Vercel environment variables.`,
        model: 'emergency-fallback',
        cost: 0,
        tokens: 50,
      },
      optimization: {
        originalPrompt: body.prompt || 'No prompt',
        optimizedPrompt: body.prompt || 'No prompt',
        costReduction: 0,
        tokenReduction: 0,
        optimizationMethod: 'emergency-fallback',
      },
      summary: {
        totalCost: 0,
        tokensUsed: 50,
        optimizationApplied: false,
        model: 'emergency-fallback',
        warning: 'OpenRouter API key not configured',
      },
      timestamp: new Date().toISOString(),
      environment: {
        hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
        hasGithub: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        hasDatabase: !!process.env.DATABASE_URL,
      },
    }

    return NextResponse.json(emergencyAIResponse)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Emergency processing failed',
        message: 'System is completely down - check deployment',
      },
      { status: 500 }
    )
  }
}
