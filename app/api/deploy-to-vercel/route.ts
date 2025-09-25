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

    // Check if this is a forked repository (contains task ID in name)
    const isForkedRepo = repoName.includes(`-ai-task-${taskId}`)

    // Generate Vercel deployment URL
    // Use the main Vercel "New Project" page
    const vercelDeployUrl = `https://vercel.com/new`

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
        'Click "Import Git Repository" on the Vercel page',
        `Enter this repository URL: https://github.com/${owner}/${repoName}`,
        isForkedRepo
          ? 'This deploys from your forked repository with AI changes'
          : 'This deploys the main branch of the original repository',
        isForkedRepo
          ? `After import, switch to branch "${branchName}" in Vercel settings`
          : 'AI changes were made in the sandbox environment',
        'Click "Deploy" to deploy your project',
        '⚠️ IMPORTANT: After deployment, configure environment variables in Vercel Settings → Environment Variables',
        'Required variables: POSTGRES_URL, AI_GATEWAY_API_KEY, VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID',
        'See DEPLOYMENT_GUIDE.md for detailed setup instructions',
      ],
    })
  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json({ error: 'Internal server error during deployment' }, { status: 500 })
  }
}
