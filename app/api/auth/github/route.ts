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

      if (
        !clientId ||
        !clientSecret ||
        clientId === 'your_github_client_id_here' ||
        clientSecret === 'your_github_client_secret_here'
      ) {
        console.error('GitHub OAuth configuration missing:', {
          clientId: !!clientId,
          clientSecret: !!clientSecret,
        })

        // Return a user-friendly error page instead of 500
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>GitHub OAuth Not Configured</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .container { max-width: 600px; margin: 0 auto; }
                .error { color: #dc2626; background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .info { color: #059669; background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .button { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px; }
                .button:hover { background: #2563eb; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🔧 GitHub OAuth Not Configured</h1>
                <div class="error">
                  <h3>Missing Environment Variables</h3>
                  <p>The GitHub OAuth credentials are not configured for local development.</p>
                  <p><strong>Missing:</strong> GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET</p>
                </div>
                <div class="info">
                  <h3>🚀 For Production Deployment</h3>
                  <p>This will work automatically when deployed to Vercel with your configured GitHub OAuth app.</p>
                  <p>Your Vercel deployment already has the GitHub OAuth credentials configured.</p>
                </div>
                <a href="/" class="button">← Back to Home</a>
              </div>
            </body>
          </html>
          `,
          {
            status: 400,
            headers: {
              'Content-Type': 'text/html',
            },
          },
        )
      }

      const redirectUri = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github`
      console.log('OAuth Debug - NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
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
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?github_connected=true`,
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
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?github_error=true`,
    )
  }
}
