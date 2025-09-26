import { PrivyClient } from '@privy-io/server-auth'
import { OpenRouterClient } from './openrouter-client'

export interface PrivyOpenRouterConfig {
  privyAppId: string
  privyAppSecret: string
  openRouterApiKey: string
  baseURL?: string
}

export interface UserSession {
  userId: string
  walletAddress: string
  isAuthenticated: boolean
  credits: number
  totalSpent: number
}

export class PrivyOpenRouterAuth {
  private privy: PrivyClient
  private openRouter: OpenRouterClient
  private config: PrivyOpenRouterConfig

  constructor(config: PrivyOpenRouterConfig) {
    this.config = config
    this.privy = new PrivyClient(config.privyAppId, config.privyAppSecret)
    this.openRouter = new OpenRouterClient({
      apiKey: config.openRouterApiKey,
      baseURL: config.baseURL,
    })
  }

  /**
   * Authenticate user with Privy
   */
  async authenticateUser(accessToken: string): Promise<UserSession | null> {
    try {
      const user = await this.privy.verifyAuthToken(accessToken)

      if (!user) {
        return null
      }

      // Get user's wallet address
      const walletAddress = (user as any).linkedAccounts?.find((account: any) => account.type === 'wallet')?.address

      if (!walletAddress) {
        throw new Error('No wallet address found for user')
      }

      // Get user's credit balance (this would be stored in your database)
      const credits = await this.getUserCredits((user as any).id)
      const totalSpent = await this.getUserTotalSpent((user as any).id)

      return {
        userId: (user as any).id,
        walletAddress,
        isAuthenticated: true,
        credits,
        totalSpent,
      }
    } catch (error) {
      console.error('Privy authentication error:', error)
      return null
    }
  }

  /**
   * Get user's credit balance
   */
  private async getUserCredits(userId: string): Promise<number> {
    // This would typically query your database
    // For now, return a default value
    return 100 // Default 100 credits
  }

  /**
   * Get user's total spent amount
   */
  private async getUserTotalSpent(userId: string): Promise<number> {
    // This would typically query your database
    // For now, return a default value
    return 0
  }

  /**
   * Deduct credits from user's balance
   */
  async deductCredits(userId: string, amount: number): Promise<boolean> {
    try {
      // This would typically update your database
      // For now, just return true
      console.log(`Deducting ${amount} credits from user ${userId}`)
      return true
    } catch (error) {
      console.error('Error deducting credits:', error)
      return false
    }
  }

  /**
   * Check if user has sufficient credits
   */
  async hasSufficientCredits(userId: string, requiredAmount: number): Promise<boolean> {
    const credits = await this.getUserCredits(userId)
    return credits >= requiredAmount
  }

  /**
   * Get OpenRouter client for authenticated user
   */
  getOpenRouterClient(): OpenRouterClient {
    return this.openRouter
  }

  /**
   * Sign message for transaction
   */
  async signMessage(userId: string, message: string): Promise<string> {
    try {
      // This would typically use the user's wallet to sign the message
      // For now, return a mock signature
      const signature = `0x${Math.random().toString(16).substr(2, 64)}`
      console.log(`User ${userId} signed message: ${message}`)
      return signature
    } catch (error) {
      console.error('Error signing message:', error)
      throw error
    }
  }

  /**
   * Process payment for API usage
   */
  async processPayment(
    userId: string,
    amount: number,
    description: string,
  ): Promise<{
    success: boolean
    transactionHash?: string
    error?: string
  }> {
    try {
      // Check if user has sufficient credits
      const hasCredits = await this.hasSufficientCredits(userId, amount)
      if (!hasCredits) {
        return {
          success: false,
          error: 'Insufficient credits',
        }
      }

      // Deduct credits
      const deducted = await this.deductCredits(userId, amount)
      if (!deducted) {
        return {
          success: false,
          error: 'Failed to deduct credits',
        }
      }

      // In a real implementation, this would process a blockchain transaction
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`

      return {
        success: true,
        transactionHash,
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
