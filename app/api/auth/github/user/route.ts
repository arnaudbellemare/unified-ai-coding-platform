import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('github_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await response.json()

    return NextResponse.json({
      login: user.login,
      name: user.name || user.login,
      avatar_url: user.avatar_url,
    })
  } catch (error) {
    console.error('Error fetching GitHub user:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}
