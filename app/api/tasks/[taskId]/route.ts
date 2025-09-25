import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { tasks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'

interface RouteParams {
  params: Promise<{
    taskId: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { taskId } = await params

    // Get current user
    const user = await getCurrentUser(request)

    // Handle case when database is not available
    if (!db) {
      // Return a fallback task for development (only if user is authenticated)
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const fallbackTask = {
        id: taskId,
        userId: user.id,
        prompt: 'Task created in fallback mode',
        repoUrl: 'https://github.com/example/repo',
        selectedAgent: 'codex',
        selectedModel: 'gpt-5',
        status: 'processing' as const,
        progress: 50,
        logs: [
          {
            type: 'info' as const,
            message: 'Task is being processed (database not available - using fallback mode)',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sandboxUrl: 'https://example-sandbox.vercel.app',
        branchName: `task-${taskId}`,
      }

      return NextResponse.json({ task: fallbackTask })
    }

    // Require authentication for database mode
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get task and verify user ownership
    const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)

    if (!task[0]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user owns this task
    if (task[0].userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ task: task[0] })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { taskId } = await params

    // Require authentication
    const user = await requireAuth(request)

    // Handle case when database is not available
    if (!db) {
      return NextResponse.json(
        {
          error: 'Database not available',
          message: 'Task cannot be deleted without database connection',
        },
        { status: 503 },
      )
    }

    // Check if task exists first and verify user ownership
    const existingTask = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)

    if (!existingTask[0]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user owns this task
    if (existingTask[0].userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the task
    await db.delete(tasks).where(eq(tasks.id, taskId))

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
