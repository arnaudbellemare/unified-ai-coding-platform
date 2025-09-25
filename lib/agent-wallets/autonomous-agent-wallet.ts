/**
 * Autonomous Agent Wallet System
 * Enables AI agents to have their own USDC wallets and make autonomous payments
 * Implements A2A x402 extension for agent-to-agent transactions
 */

import { ethers } from 'ethers'
import { PaymentIntent, AgentTransaction } from '../ap2/types'

export interface AgentWallet {
  agentId: string
  walletAddress: string
  balance: {
    usdc: number
    eth: number // For gas fees
  }
  fundingSource: 'user' | 'autonomous' | 'hybrid'
  autonomousSettings: {
    maxDailySpend: number
    maxSingleTransaction: number
    allowedServices: string[]
    autoTopUp: boolean
    topUpThreshold: number
  }
  transactionHistory: AgentTransaction[]
  isActive: boolean
  createdAt: Date
  lastUsed: Date
}

export interface AutonomousPaymentRequest {
  agentId: string
  serviceProvider: string
  amount: number
  currency: 'USDC'
  description: string
  metadata: {
    apiEndpoint?: string
    serviceType: 'api_call' | 'data_access' | 'computation' | 'storage'
    priority: 'low' | 'medium' | 'high'
    estimatedCost?: number
  }
}

export interface AutonomousPaymentResponse {
  success: boolean
  transactionId: string
  amount: number
  fees: number
  gasUsed: number
  timestamp: Date
  error?: string
}

export class AutonomousAgentWallet {
  private wallets: Map<string, AgentWallet> = new Map()
  private provider: ethers.Provider
  private usdcContract: ethers.Contract

  constructor() {
    // Initialize Ethereum provider (Base network for x402)
    this.provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org')

    // USDC contract on Base network
    const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC on Base
    const USDC_ABI = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address account) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ]

    this.usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, this.provider)
  }

  /**
   * Create a new autonomous agent wallet
   */
  async createAgentWallet(
    agentId: string,
    fundingSource: 'user' | 'autonomous' | 'hybrid' = 'hybrid',
    initialFunding?: number,
  ): Promise<AgentWallet> {
    console.log(`🤖 Creating autonomous wallet for agent: ${agentId}`)

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom()
    const walletAddress = await wallet.getAddress()

    const agentWallet: AgentWallet = {
      agentId,
      walletAddress,
      balance: {
        usdc: initialFunding || 0,
        eth: 0.01, // Small amount for gas
      },
      fundingSource,
      autonomousSettings: {
        maxDailySpend: 10, // $10 USDC per day
        maxSingleTransaction: 2, // $2 USDC per transaction
        allowedServices: ['openai', 'anthropic', 'perplexity', 'vercel', 'aws'],
        autoTopUp: true,
        topUpThreshold: 1, // Auto-topup when below $1 USDC
      },
      transactionHistory: [],
      isActive: true,
      createdAt: new Date(),
      lastUsed: new Date(),
    }

    this.wallets.set(agentId, agentWallet)

    console.log(`✅ Agent wallet created: ${walletAddress}`)
    return agentWallet
  }

  /**
   * Fund an agent wallet with USDC
   */
  async fundAgentWallet(agentId: string, amount: number, fromUserWallet?: string): Promise<boolean> {
    const agentWallet = this.wallets.get(agentId)
    if (!agentWallet) {
      throw new Error(`Agent wallet not found: ${agentId}`)
    }

    console.log(`💰 Funding agent wallet ${agentId} with $${amount} USDC`)

    // In a real implementation, this would transfer USDC from user's wallet to agent's wallet
    // For now, we'll simulate the funding
    agentWallet.balance.usdc += amount
    agentWallet.lastUsed = new Date()

    // Add funding transaction to history
    const fundingTransaction: AgentTransaction = {
      id: `fund_${Date.now()}`,
      agentId,
      userId: 'user_funding', // In real implementation, this would be the actual user ID
      type: 'payment',
      amount,
      currency: 'USDC',
      status: 'completed',
      description: `Wallet funding: $${amount} USDC`,
      metadata: {
        transactionType: 'funding',
        source: fromUserWallet || 'user_wallet',
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
      completedAt: new Date(),
    }

    agentWallet.transactionHistory.push(fundingTransaction)

    console.log(`✅ Agent wallet funded. New balance: $${agentWallet.balance.usdc} USDC`)
    return true
  }

  /**
   * Make an autonomous payment for API services
   */
  async makeAutonomousPayment(request: AutonomousPaymentRequest): Promise<AutonomousPaymentResponse> {
    const agentWallet = this.wallets.get(request.agentId)
    if (!agentWallet) {
      throw new Error(`Agent wallet not found: ${request.agentId}`)
    }

    console.log(
      `🤖 Agent ${request.agentId} making autonomous payment: $${request.amount} USDC to ${request.serviceProvider}`,
    )

    // Check autonomous spending limits
    if (!this.canMakePayment(agentWallet, request)) {
      return {
        success: false,
        transactionId: '',
        amount: request.amount,
        fees: 0,
        gasUsed: 0,
        timestamp: new Date(),
        error: 'Payment exceeds autonomous spending limits',
      }
    }

    // Check balance
    if (agentWallet.balance.usdc < request.amount) {
      // Attempt auto-topup if enabled
      if (agentWallet.autonomousSettings.autoTopUp) {
        const topupAmount = agentWallet.autonomousSettings.maxDailySpend
        console.log(`🔄 Auto-topping up agent wallet with $${topupAmount} USDC`)
        await this.fundAgentWallet(request.agentId, topupAmount)
      } else {
        return {
          success: false,
          transactionId: '',
          amount: request.amount,
          fees: 0,
          gasUsed: 0,
          timestamp: new Date(),
          error: 'Insufficient USDC balance',
        }
      }
    }

    // Calculate fees (x402 protocol fees + gas)
    const protocolFee = request.amount * 0.005 // 0.5% x402 fee
    const gasFee = 0.001 // Estimated gas fee in ETH
    const totalCost = request.amount + protocolFee

    try {
      // Simulate USDC transfer (in real implementation, this would be an actual blockchain transaction)
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Update wallet balance
      agentWallet.balance.usdc -= totalCost
      agentWallet.balance.eth -= gasFee
      agentWallet.lastUsed = new Date()

      // Add transaction to history
      const transaction: AgentTransaction = {
        id: transactionId,
        agentId: request.agentId,
        userId: 'autonomous', // Agent is paying for itself
        type: 'payment',
        amount: totalCost,
        currency: 'USDC',
        status: 'completed',
        description: `Autonomous payment: ${request.description}`,
        metadata: {
          ...request.metadata,
          serviceProvider: request.serviceProvider,
          protocolFee,
          gasFee,
          transactionType: 'autonomous_payment',
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date(),
        completedAt: new Date(),
      }

      agentWallet.transactionHistory.push(transaction)

      console.log(`✅ Autonomous payment successful: ${transactionId}`)
      console.log(`💰 Agent balance: $${agentWallet.balance.usdc} USDC`)

      return {
        success: true,
        transactionId,
        amount: request.amount,
        fees: protocolFee,
        gasUsed: gasFee,
        timestamp: new Date(),
      }
    } catch (error) {
      console.error(`❌ Autonomous payment failed:`, error)
      return {
        success: false,
        transactionId: '',
        amount: request.amount,
        fees: protocolFee,
        gasUsed: gasFee,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Check if agent can make a payment based on autonomous settings
   */
  private canMakePayment(agentWallet: AgentWallet, request: AutonomousPaymentRequest): boolean {
    // Check single transaction limit
    if (request.amount > agentWallet.autonomousSettings.maxSingleTransaction) {
      console.warn(
        `⚠️ Payment exceeds single transaction limit: $${request.amount} > $${agentWallet.autonomousSettings.maxSingleTransaction}`,
      )
      return false
    }

    // Check daily spending limit
    const today = new Date().toDateString()
    const todayTransactions = agentWallet.transactionHistory.filter(
      (tx) => tx.createdAt.toDateString() === today && tx.status === 'completed',
    )
    const todaySpent = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0)

    if (todaySpent + request.amount > agentWallet.autonomousSettings.maxDailySpend) {
      console.warn(
        `⚠️ Payment would exceed daily spending limit: $${todaySpent + request.amount} > $${agentWallet.autonomousSettings.maxDailySpend}`,
      )
      return false
    }

    // Check allowed services
    if (!agentWallet.autonomousSettings.allowedServices.includes(request.serviceProvider)) {
      console.warn(`⚠️ Service provider not in allowed list: ${request.serviceProvider}`)
      return false
    }

    return true
  }

  /**
   * Get agent wallet information
   */
  getAgentWallet(agentId: string): AgentWallet | null {
    return this.wallets.get(agentId) || null
  }

  /**
   * Update autonomous settings for an agent
   */
  updateAutonomousSettings(agentId: string, settings: Partial<AgentWallet['autonomousSettings']>): boolean {
    const agentWallet = this.wallets.get(agentId)
    if (!agentWallet) {
      return false
    }

    agentWallet.autonomousSettings = {
      ...agentWallet.autonomousSettings,
      ...settings,
    }

    console.log(`⚙️ Updated autonomous settings for agent ${agentId}`)
    return true
  }

  /**
   * Get all agent wallets for a user
   */
  getAllAgentWallets(): AgentWallet[] {
    return Array.from(this.wallets.values())
  }

  /**
   * Get transaction history for an agent
   */
  getAgentTransactionHistory(agentId: string, limit: number = 50): AgentTransaction[] {
    const agentWallet = this.wallets.get(agentId)
    if (!agentWallet) {
      return []
    }

    return agentWallet.transactionHistory.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit)
  }

  /**
   * Simulate agent making API call with autonomous payment
   */
  async simulateAgentAPICall(
    agentId: string,
    apiProvider: string,
    apiCost: number,
    description: string,
  ): Promise<AutonomousPaymentResponse> {
    const request: AutonomousPaymentRequest = {
      agentId,
      serviceProvider: apiProvider,
      amount: apiCost,
      currency: 'USDC',
      description,
      metadata: {
        serviceType: 'api_call',
        priority: 'medium',
        estimatedCost: apiCost,
      },
    }

    return this.makeAutonomousPayment(request)
  }
}

// Export singleton instance
export const autonomousAgentWallet = new AutonomousAgentWallet()
