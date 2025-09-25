import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/auth/user-service'
import { RateLimiter } from '@/lib/auth/rate-limiter'

/**
 * GET /api/tasks/user-tasks - Get user's tasks
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const token = request.cookies.get('session_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const session = await UserService.validateSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Check rate limit
    const rateLimitResult = await RateLimiter.checkRateLimit(session.user.id, '/api/tasks')
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user's tasks
    const tasks = await UserService.getUserTasks(session.user.id, limit, offset)
    const stats = await UserService.getUserStats(session.user.id)

    return NextResponse.json({
      tasks,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: tasks.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching user tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}
