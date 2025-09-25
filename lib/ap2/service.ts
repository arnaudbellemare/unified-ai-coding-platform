/**
 * Agent Payments Protocol (AP2) Service
 * Handles payment processing for AI agents using x402 standard
 */

import {
  PaymentRequest,
  PaymentResponse,
  PaymentIntent,
  AgentPaymentCapability,
  X402PaymentRequest,
  PaymentProvider,
  AgentTransaction,
  PaymentWebhook,
  PaymentMethod,
} from './types'

export class AP2Service {
  private paymentProviders: PaymentProvider[] = [
    {
      id: 'coinbase',
      name: 'Coinbase',
      type: 'crypto',
      fees: { fixed: 0.01, percentage: 0.5 },
      supportedCurrencies: ['USD', 'EUR', 'BTC', 'ETH'],
      endpoint: 'https://api.coinbase.com/v2/payments',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'credit_card',
      fees: { fixed: 0.3, percentage: 2.9 },
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
      endpoint: 'https://api.stripe.com/v1/charges',
    },
    {
      id: 'privy',
      name: 'Privy Wallet',
      type: 'wallet',
      fees: { fixed: 0, percentage: 0.1 },
      supportedCurrencies: ['USD', 'ETH', 'USDC'],
      endpoint: 'https://auth.privy.io/api/v1/payments',
    },
  ]

  /**
   * Create a payment request for an agent execution
   */
  async createPaymentRequest(
    agentId: string,
    userId: string,
    amount: number,
    currency: string = 'USD',
    description: string,
    metadata: Record<string, any> = {},
  ): Promise<PaymentIntent> {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const paymentIntent: PaymentIntent = {
      id: paymentId,
      agentId,
      userId,
      amount,
      currency,
      description,
      metadata,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Store payment intent (in a real implementation, this would be in a database)
    await this.storePaymentIntent(paymentIntent)

    return paymentIntent
  }

  /**
   * Generate x402 HTTP response for payment required
   */
  generateX402Response(paymentIntent: PaymentIntent): X402PaymentRequest {
    const supportedProviders = this.paymentProviders.filter((provider) =>
      provider.supportedCurrencies.includes(paymentIntent.currency),
    )

    return {
      httpStatus: 402,
      headers: {
        'X-Payment-Required': 'true',
        'X-Payment-Amount': paymentIntent.amount.toString(),
        'X-Payment-Currency': paymentIntent.currency,
        'X-Payment-Description': paymentIntent.description,
        'X-Payment-Provider': supportedProviders.map((p) => p.id).join(','),
      },
      body: {
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        providers: supportedProviders,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      },
    }
  }

  /**
   * Process a payment for an agent execution
   */
  async processPayment(
    paymentId: string,
    paymentMethod: PaymentMethod,
    amount: number,
    currency: string,
  ): Promise<PaymentResponse> {
    try {
      // Update payment intent status
      const paymentIntent = await this.getPaymentIntent(paymentId)
      if (!paymentIntent) {
        throw new Error('Payment intent not found')
      }

      if (paymentIntent.status !== 'created') {
        throw new Error('Payment intent is not in a valid state for processing')
      }

      // Calculate fees based on payment method
      const provider = this.paymentProviders.find((p) => p.id === paymentMethod.provider)
      if (!provider) {
        throw new Error('Payment provider not found')
      }

      const fees = this.calculateFees(amount, provider.fees)
      const totalAmount = amount + fees

      // Simulate payment processing (in real implementation, call actual payment provider)
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Update payment intent
      paymentIntent.status = 'completed'
      paymentIntent.updatedAt = new Date()
      await this.storePaymentIntent(paymentIntent)

      // Create transaction record
      const transaction: AgentTransaction = {
        id: transactionId,
        agentId: paymentIntent.agentId,
        userId: paymentIntent.userId,
        type: 'payment',
        amount: totalAmount,
        currency,
        status: 'completed',
        description: `Payment for ${paymentIntent.description}`,
        metadata: {
          paymentId,
          paymentMethod: paymentMethod.type,
          provider: paymentMethod.provider,
          fees,
        },
        createdAt: new Date(),
        completedAt: new Date(),
      }

      await this.storeTransaction(transaction)

      return {
        id: transactionId,
        requestId: paymentId,
        status: 'completed',
        transactionId,
        amount: totalAmount,
        currency,
        paymentMethod,
        processedAt: new Date(),
      }
    } catch (error) {
      return {
        id: `error_${Date.now()}`,
        requestId: paymentId,
        status: 'failed',
        amount,
        currency,
        paymentMethod,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get agent payment capabilities
   */
  getAgentCapabilities(agentId: string): AgentPaymentCapability {
    return {
      agentId,
      supportedCurrencies: ['USD', 'EUR', 'BTC', 'ETH', 'USDC'],
      supportedPaymentMethods: ['crypto', 'credit_card', 'wallet'],
      maxAmount: 10000, // $10,000 max
      minAmount: 0.01, // $0.01 min
      fees: {
        fixed: 0.01,
        percentage: 0.5,
      },
    }
  }

  /**
   * Calculate payment fees
   */
  private calculateFees(amount: number, feeStructure: { fixed?: number; percentage?: number }): number {
    let fees = 0

    if (feeStructure.fixed) {
      fees += feeStructure.fixed
    }

    if (feeStructure.percentage) {
      fees += (amount * feeStructure.percentage) / 100
    }

    return Math.round(fees * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Store payment intent (placeholder - would use database in production)
   */
  private async storePaymentIntent(paymentIntent: PaymentIntent): Promise<void> {
    // In production, this would store in a database
    // For now, we'll use localStorage for demo purposes
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('ap2_payment_intents') || '[]')
      const updated = existing.filter((pi: PaymentIntent) => pi.id !== paymentIntent.id)
      updated.push(paymentIntent)
      localStorage.setItem('ap2_payment_intents', JSON.stringify(updated))
    }
  }

  /**
   * Get payment intent by ID
   */
  private async getPaymentIntent(paymentId: string): Promise<PaymentIntent | null> {
    if (typeof window !== 'undefined') {
      const intents = JSON.parse(localStorage.getItem('ap2_payment_intents') || '[]')
      return intents.find((pi: PaymentIntent) => pi.id === paymentId) || null
    }
    return null
  }

  /**
   * Store transaction (placeholder - would use database in production)
   */
  private async storeTransaction(transaction: AgentTransaction): Promise<void> {
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('ap2_transactions') || '[]')
      existing.push(transaction)
      localStorage.setItem('ap2_transactions', JSON.stringify(existing))
    }
  }

  /**
   * Get payment providers
   */
  getPaymentProviders(): PaymentProvider[] {
    return this.paymentProviders
  }

  /**
   * Handle payment webhook
   */
  async handleWebhook(webhook: PaymentWebhook): Promise<void> {
    console.log('Received payment webhook:', webhook)

    // In production, this would update the database based on the webhook
    // For now, we'll just log it
    switch (webhook.event) {
      case 'payment.completed':
        console.log(`Payment ${webhook.data.paymentId} completed`)
        break
      case 'payment.failed':
        console.log(`Payment ${webhook.data.paymentId} failed`)
        break
      case 'payment.refunded':
        console.log(`Payment ${webhook.data.paymentId} refunded`)
        break
    }
  }
}

// Export singleton instance
export const ap2Service = new AP2Service()
