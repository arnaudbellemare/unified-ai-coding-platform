import { db } from '@/lib/db/client'
import { users, sessions, tasks, usageLogs } from '@/lib/db/multi-tenant-schema'
import { eq, and, gte, sql } from 'drizzle-orm'

export interface GitHubUser {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
}

export class UserService {
  /**
   * Get or create user from GitHub OAuth
   */
  static async getOrCreateUser(githubUser: GitHubUser, githubToken: string) {
    if (!db) {
      throw new Error('Database not available')
    }

    const existingUser = await db.select().from(users).where(eq(users.githubId, githubUser.id.toString())).limit(1)

    if (existingUser.length > 0) {
      return existingUser[0]
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        subscription: 'free',
        usageLimit: 10, // Free tier: 10 tasks per month
        usageCurrent: 0,
      })
      .returning()

    return newUser
  }

  /**
   * Create user session
   */
  static async createSession(userId: string, token: string, expiresInHours = 24) {
    if (!db) {
      throw new Error('Database not available')
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

    const [session] = await db
      .insert(sessions)
      .values({
        userId,
        token,
        expiresAt,
      })
      .returning()

    return session
  }

  /**
   * Validate session and get user
   */
  static async validateSession(token: string) {
    if (!db) {
      return null
    }

    const session = await db
      .select({
        user: users,
        session: sessions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.token, token), gte(sessions.expiresAt, new Date())))
      .limit(1)

    return session[0] || null
  }

  /**
   * Check if user can create a task (usage limits)
   */
  static async canCreateTask(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    if (!db) {
      return { allowed: false, reason: 'Database not available' }
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!user[0]) {
      return { allowed: false, reason: 'User not found' }
    }

    const { usageCurrent, usageLimit } = user[0]

    // Check monthly usage limit
    if ((usageCurrent || 0) >= (usageLimit || 10)) {
      return {
        allowed: false,
        reason: `Monthly limit reached (${usageLimit || 10} tasks). Upgrade to Pro for more tasks.`,
      }
    }

    return { allowed: true }
  }

  /**
   * Get user's tasks
   */
  static async getUserTasks(userId: string, limit = 50, offset = 0) {
    if (!db) {
      return []
    }

    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(tasks.createdAt)
      .limit(limit)
      .offset(offset)
  }

  /**
   * Log usage for billing and analytics
   */
  static async logUsage(
    userId: string,
    action: string,
    cost: number = 0,
    metadata?: Record<string, unknown>,
    taskId?: string,
  ) {
    if (!db) {
      return
    }

    await db.insert(usageLogs).values({
      userId,
      taskId,
      action,
      cost,
      metadata,
    })

    // Update user's current usage
    if (action === 'task_created') {
      await db
        .update(users)
        .set({
          usageCurrent: sql`${users.usageCurrent} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    }
  }

  /**
   * Reset monthly usage (run via cron job)
   */
  static async resetMonthlyUsage() {
    if (!db) {
      return
    }

    await db
      .update(users)
      .set({
        usageCurrent: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.subscription, 'free'))
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string) {
    if (!db) {
      return null
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    const taskCount = await db.select({ count: tasks.id }).from(tasks).where(eq(tasks.userId, userId))

    const monthlyUsage = await db
      .select({ count: usageLogs.id })
      .from(usageLogs)
      .where(
        and(
          eq(usageLogs.userId, userId),
          gte(usageLogs.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        ),
      )

    return {
      user: user[0],
      totalTasks: taskCount.length,
      monthlyUsage: monthlyUsage.length,
      remainingTasks: Math.max(0, (user[0]?.usageLimit || 0) - monthlyUsage.length),
    }
  }
}
