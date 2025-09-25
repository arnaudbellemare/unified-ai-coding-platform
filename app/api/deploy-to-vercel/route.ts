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

    // Generate Vercel deployment URL - use main branch since the feature branch may not exist in the remote repo
    const vercelDeployUrl = `https://vercel.com/new/git/github/${owner}/${repoName}?env=NODE_ENV=production&env=TASK_ID=${taskId}&env=DEPLOYED_FROM=unified-ai-coding-platform`

    // For now, return a success response with the deployment URL
    // This allows users to click and deploy manually to Vercel
    return NextResponse.json({
      success: true,
      deploymentUrl: vercelDeployUrl,
      status: 'ready',
      message: 'Ready to deploy! Click the link to deploy to Vercel.',
      instructions: [
        'Click "Deploy to Vercel" above to open Vercel',
        'Sign in to Vercel if prompted',
        'Click "Deploy" on the Vercel page',
        'Note: This deploys the main branch of the repository',
        'The AI-generated changes were made in the sandbox environment',
      ],
    })
  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json({ error: 'Internal server error during deployment' }, { status: 500 })
  }
}
