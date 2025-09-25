import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json()

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
    }

    // Extract repository information from GitHub URL
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/)
    if (!repoMatch) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 })
    }

    const [, owner, repo] = repoMatch
    const repoName = repo.replace('.git', '')

    // Check if we have access to the repository
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 })
    }

    try {
      // Check repository access
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Repository not found or not accessible',
          canFork: false 
        }, { status: 404 })
      }

      if (response.status === 403) {
        return NextResponse.json({ 
          error: 'Repository access denied',
          canFork: false 
        }, { status: 403 })
      }

      if (!response.ok) {
        return NextResponse.json({ 
          error: 'Failed to check repository access',
          canFork: false 
        }, { status: response.status })
      }

      const repoData = await response.json()
      
      // Check if we can push to this repository
      const canPush = repoData.permissions?.push === true
      const isPublic = !repoData.private
      const isFork = repoData.fork === true

      return NextResponse.json({
        success: true,
        canPush,
        isPublic,
        isFork,
        canFork: isPublic && !canPush, // Can fork if it's public and we can't push
        repository: {
          owner,
          name: repoName,
          fullName: repoData.full_name,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
        },
        permissions: repoData.permissions,
      })

    } catch (error) {
      console.error('GitHub API error:', error)
      return NextResponse.json({ 
        error: 'Failed to check repository access',
        canFork: false 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Repository access check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
