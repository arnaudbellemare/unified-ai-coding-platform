import { NextRequest } from 'next/server'

/**
 * Simple user identification using GitHub OAuth
 * This is a basic implementation for immediate deployment
 */

export interface SimpleUser {
  id: string
  username: string
  name: string
  avatar_url: string
}

/**
 * Get user from GitHub token (simplified version)
 */
export async function getCurrentUser(request: NextRequest): Promise<SimpleUser | null> {
  try {
    // Try to get GitHub token from cookie
    const githubToken = request.cookies.get('github_token')?.value

    if (!githubToken) {
      return null
    }

    // Verify token with GitHub API
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      return null
    }

    const user = await response.json()

    return {
      id: user.id.toString(), // Use GitHub ID as user ID
      username: user.login,
      name: user.name || user.login,
      avatar_url: user.avatar_url,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Generate a simple user ID from GitHub user
 */
export function generateUserId(githubUser: SimpleUser): string {
  // Use GitHub ID as the primary identifier
  return githubUser.id
}

/**
 * Check if user is authenticated
 */
export async function requireAuth(request: NextRequest): Promise<SimpleUser> {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Simple usage tracking (in-memory for now)
 * In production, you'd store this in the database
 */
export class SimpleUsageTracker {
  private static usage: Map<string, { count: number; resetDate: Date }> = new Map()

  /**
   * Check if user can create a task
   */
  static canCreateTask(userId: string): { allowed: boolean; remaining: number; reason?: string } {
    const now = new Date()
    const userUsage = this.usage.get(userId)

    // Reset monthly usage if it's a new month
    if (!userUsage || userUsage.resetDate.getMonth() !== now.getMonth()) {
      this.usage.set(userId, { count: 0, resetDate: now })
      return { allowed: true, remaining: 10 }
    }

    const limit = 10 // Free tier: 10 tasks per month
    const remaining = Math.max(0, limit - userUsage.count)

    if (userUsage.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Monthly limit reached (${limit} tasks). Upgrade to Pro for more tasks.`,
      }
    }

    return { allowed: true, remaining }
  }

  /**
   * Record task creation
   */
  static recordTaskCreation(userId: string): void {
    const now = new Date()
    const userUsage = this.usage.get(userId)

    if (!userUsage || userUsage.resetDate.getMonth() !== now.getMonth()) {
      this.usage.set(userId, { count: 1, resetDate: now })
    } else {
      this.usage.set(userId, { count: userUsage.count + 1, resetDate: userUsage.resetDate })
    }
  }

  /**
   * Get user's current usage
   */
  static getUserUsage(userId: string): { used: number; remaining: number; limit: number } {
    const now = new Date()
    const userUsage = this.usage.get(userId)

    if (!userUsage || userUsage.resetDate.getMonth() !== now.getMonth()) {
      return { used: 0, remaining: 10, limit: 10 }
    }

    const limit = 10
    return {
      used: userUsage.count,
      remaining: Math.max(0, limit - userUsage.count),
      limit,
    }
  }
}
