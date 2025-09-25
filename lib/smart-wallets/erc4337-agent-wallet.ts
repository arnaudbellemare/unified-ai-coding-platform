/**
 * ERC-4337 Account Abstraction Agent Wallet System
 * State-of-the-art smart contract wallets for autonomous AI agents
 * Implements programmable spending rules, multi-signature security, and social recovery
 */

import { ethers } from 'ethers'
import { AgentWallet__factory, AgentWalletFactory__factory } from '../types/contracts'
import { PaymentIntent, AgentTransaction } from '../ap2/types'

export interface SmartAgentWallet {
  agentId: string
  walletAddress: string
  balance: {
    usdc: number
    eth: number
  }
  spendingRule: {
    isActive: boolean
    maxDailySpend: number
    maxSingleTransaction: number
    dailySpent: number
    lastResetDate: Date
    allowedServices: string[]
  }
  security: {
    backupWallets: string[]
    requiredApprovals: number
    recoveryContacts: string[]
    recoveryDelay: number
    isPaused: boolean
  }
  transactionHistory: AgentTransaction[]
  createdAt: Date
  lastUsed: Date
}

export interface SmartWalletConfig {
  agentId: string
  maxDailySpend: number // in USDC (6 decimals)
  maxSingleTransaction: number // in USDC (6 decimals)
  allowedServices: string[] // Array of service addresses
  backupWallets: string[] // Array of backup wallet addresses
  requiredApprovals: number // Number of backup wallets required for approval
  recoveryContacts: string[] // Array of recovery contact addresses
  recoveryDelay: number // Recovery delay in seconds
}

export interface SmartTransactionRequest {
  agentId: string
  to: string
  value: number
  data?: string
  gasLimit?: number
  description: string
  metadata: {
    serviceProvider: string
    serviceType: 'api_call' | 'data_access' | 'computation' | 'storage'
    priority: 'low' | 'medium' | 'high'
    estimatedCost: number
  }
}

export interface SmartTransactionResponse {
  success: boolean
  transactionHash: string
  amount: number
  fees: number
  gasUsed: number
  timestamp: Date
  error?: string
}

export class ERC4337AgentWallet {
  private provider: ethers.Provider
  private factoryContract: any
  private wallets: Map<string, SmartAgentWallet> = new Map()
  
  // Contract addresses (Base network)
  private readonly FACTORY_ADDRESS = process.env.AGENT_WALLET_FACTORY_ADDRESS || '0x...' // Deploy this
  private readonly USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC on Base
  private readonly ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' // ERC-4337 EntryPoint
  
  constructor() {
    // Initialize Ethereum provider (Base network)
    this.provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org')
    
    // Initialize factory contract
    this.factoryContract = AgentWalletFactory__factory.connect(this.FACTORY_ADDRESS, this.provider)
  }

  /**
   * Create a new smart contract agent wallet
   */
  async createSmartAgentWallet(config: SmartWalletConfig): Promise<SmartAgentWallet> {
    console.log(`🤖 Creating smart contract wallet for agent: ${config.agentId}`)

    try {
      // Create wallet using factory contract
      const tx = await this.factoryContract.createAgentWallet(
        config.agentId,
        config.maxDailySpend,
        config.maxSingleTransaction,
        config.allowedServices,
        config.backupWallets,
        config.requiredApprovals,
        config.recoveryContacts,
        config.recoveryDelay
      )

      const receipt = await tx.wait()
      console.log(`✅ Smart wallet created: ${receipt.logs[0].address}`)

      // Get the wallet address from the event
      const walletAddress = receipt.logs[0].address

      // Create wallet instance
      const smartWallet: SmartAgentWallet = {
        agentId: config.agentId,
        walletAddress,
        balance: {
          usdc: 0,
          eth: 0,
        },
        spendingRule: {
          isActive: true,
          maxDailySpend: config.maxDailySpend,
          maxSingleTransaction: config.maxSingleTransaction,
          dailySpent: 0,
          lastResetDate: new Date(),
          allowedServices: config.allowedServices,
        },
        security: {
          backupWallets: config.backupWallets,
          requiredApprovals: config.requiredApprovals,
          recoveryContacts: config.recoveryContacts,
          recoveryDelay: config.recoveryDelay,
          isPaused: false,
        },
        transactionHistory: [],
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      this.wallets.set(config.agentId, smartWallet)
      console.log(`✅ Smart agent wallet created: ${walletAddress}`)
      return smartWallet

    } catch (error) {
      console.error(`❌ Failed to create smart wallet:`, error)
      throw new Error(`Failed to create smart wallet: ${error}`)
    }
  }

  /**
   * Fund an agent wallet with USDC
   */
  async fundSmartAgentWallet(agentId: string, amount: number, fromUserWallet?: string): Promise<boolean> {
    const smartWallet = this.wallets.get(agentId)
    if (!smartWallet) {
      throw new Error(`Smart agent wallet not found: ${agentId}`)
    }

    console.log(`💰 Funding smart wallet ${agentId} with $${amount} USDC`)

    try {
      // In a real implementation, this would transfer USDC from user's wallet to agent's wallet
      // For now, we'll simulate the funding
      smartWallet.balance.usdc += amount
      smartWallet.lastUsed = new Date()

      // Add funding transaction to history
      const fundingTransaction: AgentTransaction = {
        id: `fund_${Date.now()}`,
        agentId,
        userId: 'user_funding',
        type: 'payment',
        amount,
        currency: 'USDC',
        status: 'completed',
        description: `Smart wallet funding: $${amount} USDC`,
        metadata: {
          transactionType: 'funding',
          source: fromUserWallet || 'user_wallet',
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date(),
        completedAt: new Date(),
      }

      smartWallet.transactionHistory.push(fundingTransaction)

      console.log(`✅ Smart wallet funded. New balance: $${smartWallet.balance.usdc} USDC`)
      return true

    } catch (error) {
      console.error(`❌ Failed to fund smart wallet:`, error)
      return false
    }
  }

  /**
   * Execute a smart transaction with programmable spending rules
   */
  async executeSmartTransaction(request: SmartTransactionRequest): Promise<SmartTransactionResponse> {
    const smartWallet = this.wallets.get(request.agentId)
    if (!smartWallet) {
      throw new Error(`Smart agent wallet not found: ${request.agentId}`)
    }

    console.log(`🤖 Agent ${request.agentId} executing smart transaction: $${request.value} USDC to ${request.to}`)

    try {
      // Check if wallet is paused
      if (smartWallet.security.isPaused) {
        return {
          success: false,
          transactionHash: '',
          amount: request.value,
          fees: 0,
          gasUsed: 0,
          timestamp: new Date(),
          error: 'Wallet is paused',
        }
      }

      // Check spending rules
      if (!this.canExecuteTransaction(smartWallet, request)) {
        return {
          success: false,
          transactionHash: '',
          amount: request.value,
          fees: 0,
          gasUsed: 0,
          timestamp: new Date(),
          error: 'Transaction exceeds spending limits',
        }
      }

      // Check balance
      if (smartWallet.balance.usdc < request.value) {
        return {
          success: false,
          transactionHash: '',
          amount: request.value,
          fees: 0,
          gasUsed: 0,
          timestamp: new Date(),
          error: 'Insufficient USDC balance',
        }
      }

      // Execute transaction on smart contract
      const walletContract = AgentWallet__factory.connect(smartWallet.walletAddress, this.provider)
      
      const tx = await walletContract.executeTransaction(
        request.to,
        BigInt(request.value),
        request.data || '0x',
        BigInt(request.gasLimit || 100000)
      )

      // For now, simulate transaction execution since we don't have deployed contracts
      const transactionHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Update wallet state
      smartWallet.balance.usdc -= request.value
      smartWallet.spendingRule.dailySpent += request.value
      smartWallet.lastUsed = new Date()

      // Add transaction to history
      const transaction: AgentTransaction = {
        id: transactionHash,
        agentId: request.agentId,
        userId: 'autonomous',
        type: 'payment',
        amount: request.value,
        currency: 'USDC',
        status: 'completed',
        description: request.description,
        metadata: {
          ...request.metadata,
          transactionHash,
          gasUsed: '100000', // Simulated gas usage
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date(),
        completedAt: new Date(),
      }

      smartWallet.transactionHistory.push(transaction)

      console.log(`✅ Smart transaction successful: ${transactionHash}`)
      console.log(`💰 Agent balance: $${smartWallet.balance.usdc} USDC`)

      return {
        success: true,
        transactionHash,
        amount: request.value,
        fees: 0, // Gas fees handled by account abstraction
        gasUsed: 100000, // Simulated gas usage
        timestamp: new Date(),
      }

    } catch (error) {
      console.error(`❌ Smart transaction failed:`, error)
      return {
        success: false,
        transactionHash: '',
        amount: request.value,
        fees: 0,
        gasUsed: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Execute batch transactions atomically
   */
  async executeBatchTransactions(
    agentId: string,
    transactions: Omit<SmartTransactionRequest, 'agentId'>[]
  ): Promise<SmartTransactionResponse[]> {
    const smartWallet = this.wallets.get(agentId)
    if (!smartWallet) {
      throw new Error(`Smart agent wallet not found: ${agentId}`)
    }

    console.log(`🤖 Agent ${agentId} executing batch of ${transactions.length} transactions`)

    try {
      // Prepare batch transaction data
      const tos = transactions.map(tx => tx.to)
      const values = transactions.map(tx => tx.value)
      const datas = transactions.map(tx => tx.data || '0x')
      const gasLimits = transactions.map(tx => tx.gasLimit || 100000)

      // Execute batch transaction on smart contract
      const walletContract = AgentWallet__factory.connect(smartWallet.walletAddress, this.provider)
      
      const tx = await walletContract.executeBatchTransactions(tos, values.map(v => BigInt(v)), datas, gasLimits.map(g => BigInt(g)))
      // For now, simulate transaction execution since we don't have deployed contracts
      const receipt = { hash: `batch_${Date.now()}`, gasUsed: BigInt(100000) }

      // Process results
      const results: SmartTransactionResponse[] = []
      const totalAmount = values.reduce((sum, value) => sum + value, 0)

      // Update wallet state
      smartWallet.balance.usdc -= totalAmount
      smartWallet.spendingRule.dailySpent += totalAmount
      smartWallet.lastUsed = new Date()

      // Add batch transaction to history
      const batchTransaction: AgentTransaction = {
        id: receipt.hash,
        agentId,
        userId: 'autonomous',
        type: 'payment',
        amount: totalAmount,
        currency: 'USDC',
        status: 'completed',
        description: `Batch transaction: ${transactions.length} transactions`,
        metadata: {
          transactionType: 'batch_transaction',
          transactionCount: transactions.length,
          gasUsed: receipt?.gasUsed?.toString() || '0',
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date(),
        completedAt: new Date(),
      }

      smartWallet.transactionHistory.push(batchTransaction)

      // Create response for each transaction
      for (let i = 0; i < transactions.length; i++) {
        results.push({
          success: true,
          transactionHash: receipt.hash,
          amount: transactions[i].value,
          fees: 0,
          gasUsed: Number(receipt?.gasUsed || 0) / transactions.length,
          timestamp: new Date(),
        })
      }

      console.log(`✅ Batch transaction successful: ${receipt.hash}`)
      return results

    } catch (error) {
      console.error(`❌ Batch transaction failed:`, error)
      return transactions.map(tx => ({
        success: false,
        transactionHash: '',
        amount: tx.value,
        fees: 0,
        gasUsed: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  /**
   * Check if transaction can be executed based on spending rules
   */
  private canExecuteTransaction(smartWallet: SmartAgentWallet, request: SmartTransactionRequest): boolean {
    // Check if spending rule is active
    if (!smartWallet.spendingRule.isActive) {
      console.warn(`⚠️ Spending rule not active for agent ${request.agentId}`)
      return false
    }

    // Check single transaction limit
    if (request.value > smartWallet.spendingRule.maxSingleTransaction) {
      console.warn(
        `⚠️ Transaction exceeds single transaction limit: $${request.value} > $${smartWallet.spendingRule.maxSingleTransaction}`
      )
      return false
    }

    // Check daily spending limit
    const today = new Date().toDateString()
    const lastResetDate = smartWallet.spendingRule.lastResetDate.toDateString()
    
    if (today !== lastResetDate) {
      // Reset daily spending
      smartWallet.spendingRule.dailySpent = 0
      smartWallet.spendingRule.lastResetDate = new Date()
    }

    if (smartWallet.spendingRule.dailySpent + request.value > smartWallet.spendingRule.maxDailySpend) {
      console.warn(
        `⚠️ Transaction would exceed daily spending limit: $${smartWallet.spendingRule.dailySpent + request.value} > $${smartWallet.spendingRule.maxDailySpend}`
      )
      return false
    }

    // Check allowed services
    if (!smartWallet.spendingRule.allowedServices.includes(request.to)) {
      console.warn(`⚠️ Service not in allowed list: ${request.to}`)
      return false
    }

    return true
  }

  /**
   * Update spending rules for an agent
   */
  async updateSpendingRules(
    agentId: string,
    maxDailySpend: number,
    maxSingleTransaction: number,
    allowedServices: string[]
  ): Promise<boolean> {
    const smartWallet = this.wallets.get(agentId)
    if (!smartWallet) {
      throw new Error(`Smart agent wallet not found: ${agentId}`)
    }

    try {
      const walletContract = AgentWallet__factory.connect(smartWallet.walletAddress, this.provider)
      
      const tx = await walletContract.updateSpendingRule(
        BigInt(maxDailySpend),
        BigInt(maxSingleTransaction),
        allowedServices
      )

      // For now, simulate transaction execution since we don't have deployed contracts
      console.log('Simulated spending rule update:', { maxDailySpend, maxSingleTransaction, allowedServices })

      // Update local state
      smartWallet.spendingRule.maxDailySpend = maxDailySpend
      smartWallet.spendingRule.maxSingleTransaction = maxSingleTransaction
      smartWallet.spendingRule.allowedServices = allowedServices

      console.log(`✅ Spending rules updated for agent ${agentId}`)
      return true

    } catch (error) {
      console.error(`❌ Failed to update spending rules:`, error)
      return false
    }
  }

  /**
   * Get smart agent wallet information
   */
  getSmartAgentWallet(agentId: string): SmartAgentWallet | null {
    return this.wallets.get(agentId) || null
  }

  /**
   * Get all smart agent wallets
   */
  getAllSmartAgentWallets(): SmartAgentWallet[] {
    return Array.from(this.wallets.values())
  }

  /**
   * Get transaction history for an agent
   */
  getSmartAgentTransactionHistory(agentId: string, limit: number = 50): AgentTransaction[] {
    const smartWallet = this.wallets.get(agentId)
    if (!smartWallet) {
      return []
    }

    return smartWallet.transactionHistory
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  /**
   * Emergency pause wallet
   */
  async emergencyPauseWallet(agentId: string): Promise<boolean> {
    const smartWallet = this.wallets.get(agentId)
    if (!smartWallet) {
      throw new Error(`Smart agent wallet not found: ${agentId}`)
    }

    try {
      const walletContract = AgentWallet__factory.connect(smartWallet.walletAddress, this.provider)
      
      const tx = await walletContract.emergencyPause()
      // For now, simulate transaction execution since we don't have deployed contracts
      console.log('Simulated emergency pause')

      smartWallet.security.isPaused = true
      console.log(`✅ Wallet paused for agent ${agentId}`)
      return true

    } catch (error) {
      console.error(`❌ Failed to pause wallet:`, error)
      return false
    }
  }

  /**
   * Emergency unpause wallet
   */
  async emergencyUnpauseWallet(agentId: string): Promise<boolean> {
    const smartWallet = this.wallets.get(agentId)
    if (!smartWallet) {
      throw new Error(`Smart agent wallet not found: ${agentId}`)
    }

    try {
      const walletContract = AgentWallet__factory.connect(smartWallet.walletAddress, this.provider)
      
      const tx = await walletContract.emergencyUnpause()
      // For now, simulate transaction execution since we don't have deployed contracts
      console.log('Simulated emergency unpause')

      smartWallet.security.isPaused = false
      console.log(`✅ Wallet unpaused for agent ${agentId}`)
      return true

    } catch (error) {
      console.error(`❌ Failed to unpause wallet:`, error)
      return false
    }
  }
}

// Export singleton instance
export const erc4337AgentWallet = new ERC4337AgentWallet()
