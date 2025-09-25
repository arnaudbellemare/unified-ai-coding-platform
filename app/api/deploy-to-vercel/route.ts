import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { taskId, repoUrl, branchName, sandboxUrl } = await request.json()

    // Validate required fields
    if (!taskId || !repoUrl || !branchName) {
      return NextResponse.json({ error: 'Missing required fields: taskId, repoUrl, branchName' }, { status: 400 })
    }

    // Extract repository information from GitHub URL
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/)
    if (!repoMatch) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 })
    }
    
    const [, owner, repo] = repoMatch
    const repoName = repo.replace('.git', '')

    // Generate Vercel deployment URL
    const vercelDeployUrl = `https://vercel.com/new/git/github/${owner}/${repoName}?branch=${branchName}&env=NODE_ENV=production&env=TASK_ID=${taskId}&env=DEPLOYED_FROM=unified-ai-coding-platform`

    // For now, return a success response with the deployment URL
    // This allows users to click and deploy manually to Vercel
    return NextResponse.json({
      success: true,
      deploymentUrl: vercelDeployUrl,
      status: 'ready',
      message: 'Ready to deploy! Click the link to deploy to Vercel.',
      instructions: [
        'Click the "View Live Project" button below',
        'Sign in to Vercel if prompted',
        'Click "Deploy" on the Vercel page',
        'Your project will be deployed automatically'
      ]
    })

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json({ error: 'Internal server error during deployment' }, { status: 500 })
  }
}