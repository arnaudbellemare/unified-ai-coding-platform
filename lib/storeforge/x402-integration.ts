/**
 * StoreForge x402 Integration
 * Enhanced crypto micropayments with chain routing and agent-to-agent transactions
 */

import { z } from 'zod'

// x402 Payment Configuration Schema
export const X402ConfigSchema = z.object({
  chain: z.enum(['base', 'algorand', 'ethereum', 'polygon']),
  currency: z.enum(['USDC', 'ETH', 'MATIC', 'ALGO']),
  amount: z.number().positive(),
  recipient: z.string(),
  purpose: z.enum(['data_access', 'api_call', 'computation', 'storage', 'premium_feature']),
  agentId: z.string().optional(),
  mandateId: z.string().optional(),
})

export type X402Config = z.infer<typeof X402ConfigSchema>

// x402 Payment Result Schema
export const X402PaymentResultSchema = z.object({
  success: z.boolean(),
  transactionId: z.string(),
  amount: z.number(),
  fees: z.number(),
  gasUsed: z.number(),
  chain: z.string(),
  blockNumber: z.number().optional(),
  timestamp: z.number(),
  agentId: z.string().optional(),
})

export type X402PaymentResult = z.infer<typeof X402PaymentResultSchema>

// Chain-specific configurations
const CHAIN_CONFIGS = {
  base: {
    name: 'Base',
    currency: 'USDC',
    gasPrice: 0.001, // ETH
    confirmationTime: 2, // seconds
    minAmount: 0.01,
    maxAmount: 10000,
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  },
  algorand: {
    name: 'Algorand',
    currency: 'USDC',
    gasPrice: 0.001, // ALGO
    confirmationTime: 4, // seconds
    minAmount: 0.01,
    maxAmount: 10000,
    rpcUrl: process.env.ALGORAND_RPC_URL || 'https://mainnet-algorand.api.purestake.io',
  },
  ethereum: {
    name: 'Ethereum',
    currency: 'USDC',
    gasPrice: 0.02, // ETH
    confirmationTime: 15, // seconds
    minAmount: 0.1,
    maxAmount: 50000,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com',
  },
  polygon: {
    name: 'Polygon',
    currency: 'USDC',
    gasPrice: 0.001, // MATIC
    confirmationTime: 2, // seconds
    minAmount: 0.01,
    maxAmount: 10000,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com',
  },
}

export class X402PaymentProcessor {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.X402_API_KEY || 'demo-key'
    this.baseUrl = process.env.X402_BASE_URL || 'https://api.x402.org/v1'
  }

  /**
   * Process x402 micropayment with chain routing
   */
  async processPayment(config: X402Config): Promise<X402PaymentResult> {
    try {
      // Validate configuration
      const validatedConfig = X402ConfigSchema.parse(config)

      // Select optimal chain based on amount and purpose
      const optimalChain = this.selectOptimalChain(validatedConfig)
      const chainConfig = CHAIN_CONFIGS[optimalChain]

      console.log(`💳 Processing x402 payment on ${chainConfig.name}:`, {
        amount: validatedConfig.amount,
        currency: chainConfig.currency,
        purpose: validatedConfig.purpose,
        agentId: validatedConfig.agentId,
      })

      // Simulate payment processing (replace with real x402 API calls)
      const paymentResult = await this.simulatePayment(
        {
          ...validatedConfig,
          chain: optimalChain,
        },
        chainConfig,
      )

      console.log(`✅ x402 payment successful:`, paymentResult)
      return paymentResult
    } catch (error) {
      console.error('❌ x402 payment failed:', error)
      throw new Error(`x402 payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Select optimal chain based on amount, purpose, and current network conditions
   */
  private selectOptimalChain(config: X402Config): keyof typeof CHAIN_CONFIGS {
    const { amount, purpose } = config

    // For small micropayments (< $1), prefer fast/cheap chains
    if (amount < 1) {
      return purpose === 'data_access' ? 'algorand' : 'base'
    }

    // For medium payments ($1-$100), use Base for global reach
    if (amount < 100) {
      return 'base'
    }

    // For large payments, use Ethereum for security
    return 'ethereum'
  }

  /**
   * Simulate payment processing (replace with real x402 implementation)
   */
  private async simulatePayment(
    config: X402Config,
    chainConfig: typeof CHAIN_CONFIGS.base,
  ): Promise<X402PaymentResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, chainConfig.confirmationTime * 1000))

    const fees = chainConfig.gasPrice * 21000 // Standard gas limit
    const transactionId = `0x${Math.random().toString(16).substr(2, 64)}`

    return {
      success: true,
      transactionId,
      amount: config.amount,
      fees,
      gasUsed: 21000,
      chain: config.chain,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      timestamp: Date.now(),
      agentId: config.agentId,
    }
  }

  /**
   * Get payment status by transaction ID
   */
  async getPaymentStatus(transactionId: string): Promise<X402PaymentResult | null> {
    try {
      // Simulate API call to x402 service
      console.log(`🔍 Checking payment status for: ${transactionId}`)

      // In real implementation, this would query the blockchain or x402 API
      return {
        success: true,
        transactionId,
        amount: 0.01,
        fees: 0.001,
        gasUsed: 21000,
        chain: 'base',
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('❌ Failed to get payment status:', error)
      return null
    }
  }

  /**
   * Create payment mandate for agent-to-agent transactions
   */
  async createPaymentMandate(
    agentId: string,
    maxAmount: number,
    allowedServices: string[],
    expiresAt?: Date,
  ): Promise<string> {
    try {
      const mandateId = `mandate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log(`📋 Created payment mandate for agent ${agentId}:`, {
        mandateId,
        maxAmount,
        allowedServices,
        expiresAt,
      })

      // In real implementation, this would create a cryptographically signed mandate
      return mandateId
    } catch (error) {
      console.error('❌ Failed to create payment mandate:', error)
      throw error
    }
  }

  /**
   * Verify payment mandate
   */
  async verifyPaymentMandate(mandateId: string, amount: number, service: string): Promise<boolean> {
    try {
      console.log(`🔍 Verifying payment mandate:`, { mandateId, amount, service })

      // In real implementation, this would verify the cryptographic signature
      // and check against the mandate parameters
      return true
    } catch (error) {
      console.error('❌ Failed to verify payment mandate:', error)
      return false
    }
  }

  /**
   * Get chain-specific pricing for data access
   */
  getDataAccessPricing(chain: keyof typeof CHAIN_CONFIGS): {
    basePrice: number
    perMbPrice: number
    perQueryPrice: number
  } {
    const chainConfig = CHAIN_CONFIGS[chain]

    return {
      basePrice: 0.001, // Base fee for any data access
      perMbPrice: 0.01, // Price per MB of data
      perQueryPrice: 0.005, // Price per API query
    }
  }

  /**
   * Calculate optimal routing for multi-chain payments
   */
  calculateOptimalRouting(
    amount: number,
    recipient: string,
    preferredChains: (keyof typeof CHAIN_CONFIGS)[],
  ): {
    chain: keyof typeof CHAIN_CONFIGS
    estimatedFees: number
    estimatedTime: number
    reason: string
  } {
    let bestOption = {
      chain: 'base' as keyof typeof CHAIN_CONFIGS,
      estimatedFees: 0.001,
      estimatedTime: 2,
      reason: 'Default selection',
    }

    for (const chain of preferredChains) {
      const config = CHAIN_CONFIGS[chain]
      const fees = config.gasPrice * 21000
      const time = config.confirmationTime

      // Prefer chains with lower fees and faster confirmation
      if (fees < bestOption.estimatedFees || (fees === bestOption.estimatedFees && time < bestOption.estimatedTime)) {
        bestOption = {
          chain,
          estimatedFees: fees,
          estimatedTime: time,
          reason: `Optimal for ${amount < 1 ? 'micropayments' : 'standard payments'}`,
        }
      }
    }

    return bestOption
  }
}

// Export singleton instance
export const x402Processor = new X402PaymentProcessor()

// Utility functions for StoreForge integration
export const createX402Payment = async (
  amount: number,
  purpose: X402Config['purpose'],
  agentId?: string,
): Promise<X402PaymentResult> => {
  return x402Processor.processPayment({
    chain: 'base', // Will be optimized by processor
    currency: 'USDC',
    amount,
    recipient: process.env.X402_DEFAULT_RECIPIENT || '0x742d35Cc6634C0532925a3b8D0c3e2C5E6e9B1F',
    purpose,
    agentId,
  })
}

export const createAgentMandate = async (
  agentId: string,
  maxDailySpend: number,
  allowedServices: string[],
): Promise<string> => {
  return x402Processor.createPaymentMandate(
    agentId,
    maxDailySpend,
    allowedServices,
    new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  )
}
