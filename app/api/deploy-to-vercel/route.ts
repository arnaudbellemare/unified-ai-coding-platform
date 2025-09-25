import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { taskId, repoUrl, branchName, sandboxUrl } = await request.json()

    // Validate required fields
    if (!taskId || !repoUrl || !branchName) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, repoUrl, branchName' },
        { status: 400 }
      )
    }

    // Check if Vercel credentials are available
    if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TEAM_ID) {
      return NextResponse.json(
        { error: 'Vercel credentials not configured' },
        { status: 500 }
      )
    }

    // Create deployment using Vercel API
    const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `task-${taskId}`,
        gitSource: {
          type: 'github',
          repo: repoUrl,
          ref: branchName,
        },
        projectId: process.env.VERCEL_PROJECT_ID,
        teamId: process.env.VERCEL_TEAM_ID,
        target: 'production',
        // Enable automatic deployments
        autoAlias: true,
        // Set environment variables for the deployment
        env: {
          NODE_ENV: 'production',
          TASK_ID: taskId,
          DEPLOYED_FROM: 'unified-ai-coding-platform',
        },
      }),
    })

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.json()
      console.error('Vercel deployment failed:', errorData)
      return NextResponse.json(
        { error: `Vercel deployment failed: ${errorData.message || 'Unknown error'}` },
        { status: deploymentResponse.status }
      )
    }

    const deploymentData = await deploymentResponse.json()
    
    // Wait for deployment to be ready (optional - you can also return immediately)
    let deploymentUrl = deploymentData.url
    
    // If the deployment is still building, we can poll for completion
    if (deploymentData.state === 'BUILDING' || deploymentData.state === 'QUEUED') {
      // Return the deployment URL immediately - Vercel will handle the build
      deploymentUrl = `https://${deploymentData.url}`
    } else if (deploymentData.state === 'READY') {
      deploymentUrl = `https://${deploymentData.url}`
    }

    return NextResponse.json({
      success: true,
      deploymentId: deploymentData.id,
      deploymentUrl,
      status: deploymentData.state,
      message: 'Deployment initiated successfully',
    })

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      { error: 'Internal server error during deployment' },
      { status: 500 }
    )
  }
}
