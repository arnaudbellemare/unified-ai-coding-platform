import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check current AP2 configuration
    const config = {
      useVertexAI: process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true',
      cloudProject: process.env.GOOGLE_CLOUD_PROJECT || '',
      cloudLocation: process.env.GOOGLE_CLOUD_LOCATION || 'global',
      apiKey: process.env.GOOGLE_API_KEY ? '***configured***' : '',
      vertexAIKey: process.env.VERTEX_AI_API_KEY ? '***configured***' : '',
      hasCredentials: !!(
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.GOOGLE_API_KEY ||
        process.env.VERTEX_AI_API_KEY
      ),
    }

    // Check status
    const status = {
      vertexAI: config.useVertexAI && config.cloudProject ? 'connected' : 'error',
      apiKey: config.apiKey ? 'valid' : 'invalid',
      overall: (config.useVertexAI && config.cloudProject) || config.apiKey ? 'ready' : 'error',
    }

    return NextResponse.json({
      success: true,
      config,
      status,
    })
  } catch (error) {
    console.error('AP2 Config API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // This would typically update environment variables
    // In production, you'd want to use a secure configuration service
    console.log('AP2 Config Update Request:', body)

    // For now, just return success
    // In production, you'd implement actual configuration updates
    return NextResponse.json({
      success: true,
      message: 'Configuration updated (demo mode)',
      config: body,
    })
  } catch (error) {
    console.error('AP2 Config Update Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
