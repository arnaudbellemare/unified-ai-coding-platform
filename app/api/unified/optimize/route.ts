import { NextRequest, NextResponse } from 'next/server'
import { unifiedOptimizer, UnifiedOptimizationRequest } from '@/lib/unified-system/unified-optimizer'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'
import { DevAuth } from '@/lib/auth/dev-auth'

export async function POST(request: NextRequest) {
  try {
    // Always use real optimization - no mock data

    // Require authentication for production
    const user = await requireAuth(request)

    const body = await request.json()
    const optimizationRequest: UnifiedOptimizationRequest = {
      prompt: body.prompt,
      task: body.task,
      context: body.context,
      user: {
        id: user.id,
        preferences: body.preferences,
      },
    }

    // Validate required fields
    if (!optimizationRequest.prompt || !optimizationRequest.task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: prompt and task are required',
        },
        { status: 400 },
      )
    }

    // Execute unified optimization
    const result = await unifiedOptimizer.optimize(optimizationRequest)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      result,
    })
  } catch (error) {
    console.error('Unified optimization error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Optimization failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get system statistics
    const stats = unifiedOptimizer.getSystemStats()

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to get system stats:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve system statistics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
