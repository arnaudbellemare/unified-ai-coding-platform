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
   * DISABLED - Always use production mode
   */
  static isDevMode(): boolean {
    // Always return false - use production mode everywhere
    return false
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
