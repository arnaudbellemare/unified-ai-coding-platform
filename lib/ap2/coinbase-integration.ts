/**
 * AP2 + Coinbase Commerce Integration
 * Enables agent-to-agent payments with crypto settlement
 */

import { CompleteCoinbaseCommerceIntegration } from '@/lib/coinbase-commerce/complete-integration'
import { AP2MandateManager } from './mandate-manager'
import { GoogleAP2Integration } from './google-integration'

export interface AP2CoinbasePaymentRequest {
  fromAgent: string
  toAgent: string
  amount: number
  currency: string
  description: string
  mandateId: string
  cryptoPreferred?: boolean
  autoUSDCConversion?: boolean
}

export interface AP2CoinbasePaymentResponse {
  paymentId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transactionHash?: string
  coinbaseChargeId?: string
  mandateStatus: string
  cryptoPaymentUrl?: string
  timestamp: Date
  metadata: {
    fromAgent: string
    toAgent: string
    amount: number
    currency: string
    autoConverted: boolean
    network: string
  }
}

export interface AgentPaymentCapability {
  agentId: string
  supportedCurrencies: string[]
  cryptoEnabled: boolean
  autoUSDCConversion: boolean
  networkSupport: string[]
  maxPaymentAmount: number
  minPaymentAmount: number
}

export class AP2CoinbaseIntegration {
  private coinbaseCommerce: CompleteCoinbaseCommerceIntegration
  private mandateManager: AP2MandateManager
  private googleAP2: GoogleAP2Integration

  constructor(
    coinbaseConfig: {
      apiKey: string
      webhookSecret: string
      autoUSDCConversion: boolean
      supportedCurrencies: string[]
      baseNetwork: boolean
    },
    googleAP2Config: {
      projectId: string
      location: string
      apiKey: string
      vertexAIKey?: string
      useVertexAI: boolean
    },
  ) {
    this.coinbaseCommerce = new CompleteCoinbaseCommerceIntegration(coinbaseConfig)
    this.mandateManager = new AP2MandateManager()
    this.googleAP2 = new GoogleAP2Integration(googleAP2Config)
  }

  /**
   * Process AP2 agent payment with Coinbase Commerce settlement
   */
  async processAgentPayment(request: AP2CoinbasePaymentRequest): Promise<AP2CoinbasePaymentResponse> {
    try {
      console.log(
        `🤖 AP2 Agent Payment: ${request.fromAgent} → ${request.toAgent} (${request.amount} ${request.currency})`,
      )

      // Step 1: Verify AP2 mandate
      const mandateVerification = await this.mandateManager.verifyIntentMandate(request.mandateId)
      if (!mandateVerification.valid) {
        throw new Error(`AP2 mandate not valid: ${request.mandateId}`)
      }

      // Step 2: Check agent payment capabilities
      const fromAgentCapability = await this.getAgentPaymentCapability(request.fromAgent)
      const toAgentCapability = await this.getAgentPaymentCapability(request.toAgent)

      if (!fromAgentCapability.cryptoEnabled) {
        throw new Error(`Agent ${request.fromAgent} does not support crypto payments`)
      }

      // Step 3: Create Coinbase Commerce charge for crypto settlement
      const cryptoPaymentRequest = {
        name: `AP2 Payment: ${request.fromAgent} → ${request.toAgent}`,
        description: request.description,
        amount: request.amount,
        currency: request.currency,
        metadata: {
          productId: `ap2_payment_${Date.now()}`,
          agentId: request.fromAgent,
          ap2MandateId: request.mandateId,
          autoConvertUSDC: request.autoUSDCConversion ?? true,
        },
      }

      const coinbaseCharge = await this.coinbaseCommerce.createCryptoCheckout(cryptoPaymentRequest)

      // Step 4: Create AP2 transaction record
      const ap2Transaction = await this.googleAP2.createTransaction({
        from_agent: request.fromAgent,
        to_agent: request.toAgent,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        mandate_id: request.mandateId,
      })

      // Step 5: Mandate verified and payment initiated

      console.log(`✅ AP2 Payment initiated: ${ap2Transaction.id}`)
      console.log(`💰 Coinbase Charge: ${coinbaseCharge.id}`)
      console.log(`🔄 Auto USDC conversion: ${request.autoUSDCConversion ?? true}`)

      return {
        paymentId: ap2Transaction.id,
        status: 'pending',
        coinbaseChargeId: coinbaseCharge.id,
        mandateStatus: 'payment_initiated',
        cryptoPaymentUrl: coinbaseCharge.hosted_url,
        timestamp: new Date(),
        metadata: {
          fromAgent: request.fromAgent,
          toAgent: request.toAgent,
          amount: request.amount,
          currency: request.currency,
          autoConverted: request.autoUSDCConversion ?? true,
          network: this.coinbaseCommerce.getNetworkSupport().base ? 'Base' : 'Ethereum',
        },
      }
    } catch (error) {
      console.error('❌ AP2 Coinbase payment failed:', error)
      return {
        paymentId: `ap2_error_${Date.now()}`,
        status: 'failed',
        mandateStatus: 'payment_failed',
        timestamp: new Date(),
        metadata: {
          fromAgent: request.fromAgent,
          toAgent: request.toAgent,
          amount: request.amount,
          currency: request.currency,
          autoConverted: false,
          network: 'unknown',
        },
      }
    }
  }

  /**
   * Handle Coinbase Commerce webhook for AP2 payments
   */
  async handleCoinbaseWebhook(webhookEvent: any): Promise<{
    success: boolean
    ap2PaymentId?: string
    mandateId?: string
    status: string
  }> {
    try {
      const { data } = webhookEvent
      const chargeId = data.id
      const status = data.timeline?.[data.timeline.length - 1]?.status

      console.log(`📨 Coinbase webhook for AP2 payment: ${chargeId} - ${status}`)

      // Find the associated AP2 payment
      const ap2Payment = await this.findAP2PaymentByChargeId(chargeId)
      if (!ap2Payment) {
        console.log(`⚠️ No AP2 payment found for charge: ${chargeId}`)
        return { success: false, status: 'not_found' }
      }

      // Update AP2 payment status based on Coinbase status
      let ap2Status = 'pending'
      let mandateStatus = 'payment_initiated'

      switch (status) {
        case 'CONFIRMED':
          ap2Status = 'completed'
          mandateStatus = 'payment_completed'
          console.log(`✅ AP2 payment completed: ${ap2Payment.paymentId}`)
          break

        case 'FAILED':
          ap2Status = 'failed'
          mandateStatus = 'payment_failed'
          console.log(`❌ AP2 payment failed: ${ap2Payment.paymentId}`)
          break

        case 'PENDING':
          ap2Status = 'processing'
          mandateStatus = 'payment_processing'
          console.log(`⏳ AP2 payment processing: ${ap2Payment.paymentId}`)
          break

        default:
          console.log(`ℹ️ Unknown Coinbase status: ${status}`)
      }

      // Update AP2 payment status
      await this.updateAP2PaymentStatus(ap2Payment.paymentId, ap2Status)

      // Mandate status would be updated here in a full implementation

      return {
        success: true,
        ap2PaymentId: ap2Payment.paymentId,
        mandateId: ap2Payment.mandateId,
        status: ap2Status,
      }
    } catch (error) {
      console.error('❌ Coinbase webhook handling failed:', error)
      return { success: false, status: 'error' }
    }
  }

  /**
   * Get agent payment capabilities
   */
  async getAgentPaymentCapability(agentId: string): Promise<AgentPaymentCapability> {
    // In a real implementation, this would query the agent's capabilities
    // For now, we'll return default capabilities
    return {
      agentId,
      supportedCurrencies: ['USD', 'USDC', 'ETH', 'BTC'],
      cryptoEnabled: true,
      autoUSDCConversion: true,
      networkSupport: ['Base', 'Ethereum'],
      maxPaymentAmount: 10000,
      minPaymentAmount: 0.01,
    }
  }

  /**
   * Find AP2 payment by Coinbase charge ID
   */
  private async findAP2PaymentByChargeId(chargeId: string): Promise<{
    paymentId: string
    mandateId?: string
  } | null> {
    // In a real implementation, this would query the database
    // For now, we'll simulate finding the payment
    try {
      // This would be a database query in production
      console.log(`🔍 Looking up AP2 payment for charge: ${chargeId}`)
      return {
        paymentId: `ap2_${chargeId}`,
        mandateId: `mandate_${chargeId}`,
      }
    } catch (error) {
      console.error('❌ Failed to find AP2 payment:', error)
      return null
    }
  }

  /**
   * Update AP2 payment status
   */
  private async updateAP2PaymentStatus(paymentId: string, status: string): Promise<void> {
    try {
      console.log(`📝 Updating AP2 payment status: ${paymentId} → ${status}`)
      // In a real implementation, this would update the database
    } catch (error) {
      console.error('❌ Failed to update AP2 payment status:', error)
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: string
    mandateStatus: string
    coinbaseStatus?: string
    amount: number
    currency: string
    autoConverted: boolean
  }> {
    try {
      // In a real implementation, this would query the database
      console.log(`📊 Getting payment status: ${paymentId}`)

      return {
        status: 'completed',
        mandateStatus: 'payment_completed',
        coinbaseStatus: 'CONFIRMED',
        amount: 100,
        currency: 'USD',
        autoConverted: true,
      }
    } catch (error) {
      console.error('❌ Failed to get payment status:', error)
      throw error
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCurrencies(): string[] {
    return this.coinbaseCommerce.getSupportedCurrencies()
  }

  /**
   * Check if auto USDC conversion is enabled
   */
  isAutoUSDCConversionEnabled(): boolean {
    return this.coinbaseCommerce.isAutoUSDCConversionEnabled()
  }

  /**
   * Get network support
   */
  getNetworkSupport() {
    return this.coinbaseCommerce.getNetworkSupport()
  }
}
