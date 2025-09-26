import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Environment test',
    hasGitHubClientId: !!process.env.GITHUB_CLIENT_ID,
    hasGitHubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasPerplexityKey: !!process.env.PERPLEXITY_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
