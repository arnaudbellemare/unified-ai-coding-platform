import { NextRequest } from 'next/server'

interface PrivyUser {
  id: string
  wallet?: {
    address: string
    chainId: string
  }
  email?: {
    address: string
  }
  createdAt: string
}

interface PrivyAuthResult {
  isValid: boolean
  user?: PrivyUser
  error?: string
}

/**
 * Verify Privy authentication token
 * In production, this would validate the token with Privy's API
 */
export async function verifyPrivyAuth(request: NextRequest): Promise<PrivyAuthResult> {
  try {
    const authHeader = request.headers.get('authorization')
    const privyAppId = request.headers.get('privy-app-id')

    if (!authHeader || !privyAppId) {
      return {
        isValid: false,
        error: 'Missing Privy authentication headers',
      }
    }

    // Extract token from Bearer format
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return {
        isValid: false,
        error: 'Invalid authorization format',
      }
    }

    // In production, validate with Privy API:
    // const response = await fetch('https://api.privy.io/v1/users/me', {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'privy-app-id': privyAppId,
    //   }
    // })

    // For now, simulate validation
    const mockUser: PrivyUser = {
      id: `privy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wallet: {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        chainId: '8453', // Base mainnet
      },
      email: {
        address: `user_${Math.random().toString(36).substr(2, 8)}@example.com`,
      },
      createdAt: new Date().toISOString(),
    }

    return {
      isValid: true,
      user: mockUser,
    }
  } catch (error) {
    console.error('Privy auth verification error:', error)
    return {
      isValid: false,
      error: 'Authentication verification failed',
    }
  }
}

/**
 * Middleware to require Privy authentication
 */
export function requirePrivyAuth(handler: (request: NextRequest, user: PrivyUser) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const authResult = await verifyPrivyAuth(request)

    if (!authResult.isValid || !authResult.user) {
      return new Response(
        JSON.stringify({
          error: authResult.error || 'Privy authentication required',
          requiresAuth: true,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    return handler(request, authResult.user)
  }
}

/**
 * Get Privy user from request headers
 */
export async function getPrivyUser(request: NextRequest): Promise<PrivyUser | null> {
  const authResult = await verifyPrivyAuth(request)
  return authResult.isValid ? authResult.user || null : null
}
