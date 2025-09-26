import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Simple redirect to GitHub OAuth
      const clientId = process.env.GITHUB_CLIENT_ID
      
      if (!clientId) {
        return NextResponse.json(
          {
            error: 'GitHub OAuth not configured. Missing GITHUB_CLIENT_ID environment variable.',
            hasClientId: false,
          },
          { status: 500 },
        )
      }

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/simple`
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${Date.now()}`

      return NextResponse.redirect(githubAuthUrl)
    }

    // Handle the callback
    return NextResponse.json({
      success: true,
      message: 'GitHub OAuth callback received',
      code: code,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('GitHub OAuth simple error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
