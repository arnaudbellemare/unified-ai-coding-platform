import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Simple API test working',
    timestamp: new Date().toISOString(),
    hasGitHubClientId: !!process.env.GITHUB_CLIENT_ID,
    hasGitHubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
  })
}
