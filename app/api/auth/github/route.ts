import { NextRequest, NextResponse } from 'next/server'
import { DevAuth } from '@/lib/auth/dev-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      // Redirect to GitHub OAuth
      const clientId = process.env.GITHUB_CLIENT_ID
      const clientSecret = process.env.GITHUB_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        // Check if in development mode
        if (DevAuth.isDevMode()) {
          // Redirect to home page with mock auth in development mode
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`)
        }
        
        console.error('GitHub OAuth configuration missing:', {
          clientId: !!clientId,
          clientSecret: !!clientSecret,
        })
        return NextResponse.json(
          {
            error:
              'GitHub OAuth not configured. Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variables.',
          },
          { status: 500 },
        )
      }

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github`
      console.log('OAuth Debug - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
      console.log('OAuth Debug - redirectUri:', redirectUri)
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${Date.now()}`

      return NextResponse.redirect(githubAuthUrl)
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('GitHub token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText,
      })
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status} ${tokenResponse.statusText}`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      console.error('No access token in response:', tokenData)
      throw new Error('No access token received from GitHub')
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('GitHub user info fetch failed:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        body: errorText,
      })
      throw new Error(`Failed to fetch user info: ${userResponse.status} ${userResponse.statusText}`)
    }

    const user = await userResponse.json()

    // Create response with user data and token
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?github_connected=true`,
    )

    // Set secure HTTP-only cookie with the access token
    response.cookies.set('github_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?github_error=true`)
  }
}
