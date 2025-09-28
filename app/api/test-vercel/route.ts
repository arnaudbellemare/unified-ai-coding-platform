import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Vercel test endpoint working!',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT_SET',
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT_SET',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      },
    })
  } catch (error) {
    console.error('Vercel test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Vercel test failed',
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
