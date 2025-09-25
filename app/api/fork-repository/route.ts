import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, taskId } = await request.json()

    if (!repoUrl || !taskId) {
      return NextResponse.json({ error: 'Repository URL and task ID are required' }, { status: 400 })
    }

    // Get user's GitHub token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const userToken = authHeader?.replace('Bearer ', '') || request.cookies.get('github_token')?.value
    const serverToken = process.env.GITHUB_TOKEN
    
    const githubToken = userToken || serverToken

    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub authentication required' }, { status: 401 })
    }

    // Extract repository information from GitHub URL
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/)
    if (!repoMatch) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 })
    }

    const [, owner, repo] = repoMatch
    const repoName = repo.replace('.git', '')

    // Check if we have access to the repository
    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub authentication required' }, { status: 401 })
    }

    try {
      // Fork the repository
      const forkResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/forks`, {
        method: 'POST',
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          name: `${repoName}-ai-task-${taskId}`,
          description: `Forked for AI task: ${taskId}`,
          default_branch_only: true,
        }),
      })

      if (!forkResponse.ok) {
        const errorData = await forkResponse.json()
        return NextResponse.json(
          {
            error: `Failed to fork repository: ${errorData.message || 'Unknown error'}`,
            details: errorData,
          },
          { status: forkResponse.status },
        )
      }

      const forkData = await forkResponse.json()

      // Wait a moment for the fork to be ready
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check if the fork is ready
      let forkReady = false
      let attempts = 0
      const maxAttempts = 10

      while (!forkReady && attempts < maxAttempts) {
        const checkResponse = await fetch(`https://api.github.com/repos/${forkData.full_name}`, {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        })

        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          if (checkData.owner.login === process.env.GITHUB_USERNAME || checkData.permissions?.push) {
            forkReady = true
          }
        }

        if (!forkReady) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          attempts++
        }
      }

      if (!forkReady) {
        return NextResponse.json(
          {
            error: 'Fork created but not ready for use yet. Please try again in a few minutes.',
            forkUrl: forkData.html_url,
            forkName: forkData.full_name,
          },
          { status: 202 },
        )
      }

      return NextResponse.json({
        success: true,
        forkUrl: forkData.html_url,
        forkName: forkData.full_name,
        cloneUrl: forkData.clone_url,
        sshUrl: forkData.ssh_url,
        defaultBranch: forkData.default_branch,
        message: 'Repository forked successfully',
      })
    } catch (error) {
      console.error('GitHub fork error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fork repository',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Fork repository error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
