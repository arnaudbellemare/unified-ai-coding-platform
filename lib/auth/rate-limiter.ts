import { db } from '@/lib/db/client'
import { rateLimits } from '@/lib/db/multi-tenant-schema'
import { eq, and, gte } from 'drizzle-orm'

export interface RateLimitConfig {
  requests: number
  windowMs: number // in milliseconds
}

export class RateLimiter {
  private static readonly RATE_LIMITS: Record<string, RateLimitConfig> = {
    '/api/tasks': { requests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
    '/api/tasks/create': { requests: 5, windowMs: 60 * 1000 }, // 5 creates per minute
    '/api/optimize': { requests: 20, windowMs: 60 * 1000 }, // 20 optimizations per minute
  }

  /**
   * Check if user has exceeded rate limit
   */
  static async checkRateLimit(
    userId: string,
    endpoint: string,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const config = this.RATE_LIMITS[endpoint]
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: new Date() }
    }

    const windowStart = new Date(Date.now() - config.windowMs)

    if (!db) {
      return { allowed: true, remaining: Infinity, resetTime: new Date() }
    }

    // Get current rate limit record
    const existing = await db
      .select()
      .from(rateLimits)
      .where(
        and(eq(rateLimits.userId, userId), eq(rateLimits.endpoint, endpoint), gte(rateLimits.windowStart, windowStart)),
      )
      .limit(1)

    const now = new Date()

    if (existing.length === 0) {
      // No existing record, create new one
      await db.insert(rateLimits).values({
        userId,
        endpoint,
        requests: 1,
        windowStart: now,
      })

      return {
        allowed: true,
        remaining: config.requests - 1,
        resetTime: new Date(now.getTime() + config.windowMs),
      }
    }

    const record = existing[0]

    if ((record.requests || 0) >= config.requests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(record.windowStart.getTime() + config.windowMs),
      }
    }

    // Increment request count
    await db
      .update(rateLimits)
      .set({ requests: (record.requests || 0) + 1 })
      .where(eq(rateLimits.id, record.id))

    return {
      allowed: true,
      remaining: config.requests - ((record.requests || 0) + 1),
      resetTime: new Date(record.windowStart.getTime() + config.windowMs),
    }
  }

  /**
   * Get rate limit status for user
   */
  static async getRateLimitStatus(userId: string, endpoint: string) {
    const config = this.RATE_LIMITS[endpoint]
    if (!config) {
      return null
    }

    const windowStart = new Date(Date.now() - config.windowMs)

    if (!db) {
      return null
    }

    const record = await db
      .select()
      .from(rateLimits)
      .where(
        and(eq(rateLimits.userId, userId), eq(rateLimits.endpoint, endpoint), gte(rateLimits.windowStart, windowStart)),
      )
      .limit(1)

    if (record.length === 0) {
      return {
        limit: config.requests,
        remaining: config.requests,
        resetTime: new Date(Date.now() + config.windowMs),
      }
    }

    const current = record[0]
    return {
      limit: config.requests,
      remaining: Math.max(0, config.requests - (current.requests || 0)),
      resetTime: new Date(current.windowStart.getTime() + config.windowMs),
    }
  }
}

/**
 * Middleware for rate limiting
 */
export function withRateLimit(endpoint: string) {
  return async function rateLimitMiddleware(request: Request, userId: string): Promise<Response | null> {
    const result = await RateLimiter.checkRateLimit(userId, endpoint)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.remaining.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toISOString(),
            'Retry-After': Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    return null // Continue with request
  }
}
