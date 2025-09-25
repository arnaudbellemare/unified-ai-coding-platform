import { NextResponse } from 'next/server'

export async function GET() {
  try {
    if (!process.env.GITHUB_TOKEN) {
      // Return a default user object when no token is provided
      return NextResponse.json({
        login: 'public-user',
        name: 'Public User',
        avatar_url: 'https://github.com/identicons/public-user.png',
      })
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const user = await response.json()

    return NextResponse.json({
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
    })
  } catch (error) {
    console.error('Error fetching GitHub user:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}
