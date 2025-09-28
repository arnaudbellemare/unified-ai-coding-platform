import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      // Redirect to GitHub OAuth
      const clientId = process.env.GITHUB_CLIENT_ID
      const clientSecret = process.env.GITHUB_CLIENT_SECRET

      if (!clientId || !clientSecret || 
          clientId === 'your_github_client_id_here' || 
          clientSecret === 'your_github_client_secret_here') {
        
        // Return a user-friendly error page
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>GitHub OAuth Setup Required</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .error { color: #dc2626; background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
                .info { color: #059669; background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
                .button { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px; }
                .button:hover { background: #2563eb; }
                .step { text-align: left; margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 6px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🔧 GitHub OAuth Setup Required</h1>
                <div class="error">
                  <h3>Missing GitHub OAuth Configuration</h3>
                  <p>The GitHub OAuth credentials are not configured in your Vercel environment variables.</p>
                </div>
                <div class="info">
                  <h3>🚀 Setup Instructions</h3>
                  <div class="step">
                    <strong>1. Create GitHub OAuth App:</strong><br>
                    Go to <a href="https://github.com/settings/developers" target="_blank">GitHub Developer Settings</a><br>
                    Create new OAuth app with callback URL: <code>https://unified-ai-coding-platform.vercel.app/api/github-auth</code>
                  </div>
                  <div class="step">
                    <strong>2. Add Environment Variables to Vercel:</strong><br>
                    <code>GITHUB_CLIENT_ID=your_client_id</code><br>
                    <code>GITHUB_CLIENT_SECRET=your_client_secret</code><br>
                    <code>NEXT_PUBLIC_APP_URL=https://unified-ai-coding-platform.vercel.app</code>
                  </div>
                  <div class="step">
                    <strong>3. Redeploy your Vercel app</strong>
                  </div>
                </div>
                <a href="/" class="button">← Back to Home</a>
                <a href="https://github.com/settings/developers" class="button" target="_blank">Create GitHub OAuth App</a>
              </div>
            </body>
          </html>
          `,
          {
            status: 400,
            headers: {
              'Content-Type': 'text/html',
            },
          }
        )
      }

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://unified-ai-coding-platform.vercel.app'}/api/github-auth`
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
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`)
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
      throw new Error(`Failed to fetch user info: ${userResponse.status}`)
    }

    const user = await userResponse.json()

    // Create response with user data and token
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://unified-ai-coding-platform.vercel.app'}/?github_connected=true`
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
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://unified-ai-coding-platform.vercel.app'}/?github_error=true`
    )
  }
}
