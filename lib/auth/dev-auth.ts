/**
 * Development Authentication Bypass
 * Allows testing without full authentication setup
 */

export interface DevUser {
  id: string
  username: string
  email: string
  name: string
  image?: string
}

export class DevAuth {
  private static devUser: DevUser = {
    id: 'dev-user-123',
    username: 'developer',
    email: 'dev@example.com',
    name: 'Development User',
    image: 'https://avatars.githubusercontent.com/u/1?v=4',
  }

  /**
   * Get current development user
   */
  static getCurrentUser(): DevUser {
    return this.devUser
  }

  /**
   * Check if development mode is enabled
   * Only use dev mode for local development, not on Vercel
   */
  static isDevMode(): boolean {
    // Use dev mode only for local development
    // On Vercel, use real functionality with provided API keys
    return process.env.NEXT_PUBLIC_DEV_MODE === 'true' && 
           process.env.VERCEL !== '1' && 
           process.env.NODE_ENV === 'development'
  }

  /**
   * Require authentication (bypass in dev mode)
   */
  static async requireAuth(): Promise<DevUser> {
    if (this.isDevMode()) {
      console.log('🔧 Development mode: Bypassing authentication')
      return this.devUser
    }

    throw new Error('Authentication required - set up environment variables for production')
  }

  /**
   * Get user from request (bypass in dev mode)
   */
  static async getCurrentUserFromRequest(request: Request): Promise<DevUser | null> {
    if (this.isDevMode()) {
      return this.devUser
    }

    return null
  }
}
