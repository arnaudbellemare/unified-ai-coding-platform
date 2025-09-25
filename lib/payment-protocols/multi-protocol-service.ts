/**
 * Multi-Protocol Payment Service
 * Supports SEPA, x402, L402, and other payment protocols
 * with intelligent protocol selection and fallback mechanisms
 */

import { PaymentProtocol, PAYMENT_PROTOCOLS, PaymentProtocolAnalyzer, PROTOCOL_COMPARISON } from './analysis'

export interface PaymentRequest {
  id: string
  amount: number
  currency: string
  description: string
  recipient: string
  metadata?: Record<string, any>
  preferences?: {
    preferredProtocol?: string
    requireReversibility?: boolean
    maxSettlementTime?: number // seconds
    minDecentralization?: 'low' | 'medium' | 'high'
  }
  context?: {
    agentType: string
    isAutomated: boolean
    isMicropayment: boolean
    requiresGlobalReach: boolean
  }
}

export interface PaymentResponse {
  id: string
  requestId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  protocol: string
  transactionId?: string
  amount: number
  currency: string
  fees: number
  settlementTime: number // seconds
  finality: 'reversible' | 'cryptographic' | 'hybrid'
  metadata: Record<string, any>
  timestamp: Date
}

export interface ProtocolCapability {
  protocol: string
  supported: boolean
  reason?: string
  estimatedCost: number
  estimatedTime: number
  features: {
    reversibility: boolean
    micropayments: boolean
    automation: boolean
    globalReach: boolean
  }
}

export class MultiProtocolPaymentService {
  private supportedProtocols: Set<string> = new Set(['x402', 'stripe']) // Start with implemented protocols

  constructor() {
    this.initializeProtocols()
  }

  private initializeProtocols() {
    // Initialize available payment protocols based on configuration
    console.log('🔧 Initializing multi-protocol payment service...')
    
    // x402 Foundation Protocol
    if (this.isProtocolAvailable('x402')) {
      console.log('✅ x402 Foundation Protocol: Available')
    }

    // Stripe (traditional)
    if (this.isProtocolAvailable('stripe')) {
      console.log('✅ Stripe Payments: Available')
    }

    // L402 Lightning Network (future implementation)
    if (this.isProtocolAvailable('l402')) {
      console.log('✅ Lightning Network (L402): Available')
    }

    // SEPA (future implementation)
    if (this.isProtocolAvailable('sepa')) {
      console.log('✅ SEPA Payments: Available')
    }
  }

  private isProtocolAvailable(protocol: string): boolean {
    // Check if protocol is configured and available
    switch (protocol) {
      case 'x402':
        return !!process.env.NEXT_PUBLIC_PRIVY_APP_ID // x402 requires Privy setup
      case 'stripe':
        return !!process.env.STRIPE_SECRET_KEY
      case 'l402':
        return false // Not implemented yet
      case 'sepa':
        return false // Not implemented yet
      default:
        return false
    }
  }

  /**
   * Analyze payment request and recommend optimal protocol
   */
  async analyzePaymentRequest(request: PaymentRequest): Promise<{
    recommendedProtocol: string
    alternatives: ProtocolCapability[]
    reasoning: string
  }> {
    const requirements = {
      automationLevel: (request.context?.isAutomated ? 'high' : 'medium') as 'low' | 'medium' | 'high',
      decentralizationPreference: (request.preferences?.minDecentralization || 'medium') as 'low' | 'medium' | 'high',
      costSensitivity: (request.amount < 1 ? 'high' : 'medium') as 'low' | 'medium' | 'high',
      technicalComplexity: 'medium' as 'low' | 'medium' | 'high',
      reversibilityRequired: request.preferences?.requireReversibility || false,
      micropayments: request.context?.isMicropayment || request.amount < 0.01,
      globalReach: request.context?.requiresGlobalReach || false,
      regulatoryCompliance: 'medium' as 'low' | 'medium' | 'high'
    }

    const recommendation = PaymentProtocolAnalyzer.analyzeRequirements(requirements)
    
    // Filter to only supported protocols
    const supportedAlternatives = recommendation.fallbackProtocols
      .filter(protocol => this.supportedProtocols.has(protocol))
      .map(protocol => this.getProtocolCapability(protocol, request))

    return {
      recommendedProtocol: this.supportedProtocols.has(recommendation.primaryProtocol) 
        ? recommendation.primaryProtocol 
        : supportedAlternatives[0]?.protocol || 'stripe',
      alternatives: supportedAlternatives,
      reasoning: recommendation.reasoning
    }
  }

  /**
   * Get protocol capabilities for a specific request
   */
  private getProtocolCapability(protocol: string, request: PaymentRequest): ProtocolCapability {
    const protocolInfo = PAYMENT_PROTOCOLS[protocol]
    const comparison = PROTOCOL_COMPARISON[protocol]

    if (!protocolInfo || !comparison) {
      return {
        protocol,
        supported: false,
        reason: 'Protocol not available',
        estimatedCost: 0,
        estimatedTime: 0,
        features: {
          reversibility: false,
          micropayments: false,
          automation: false,
          globalReach: false
        }
      }
    }

    return {
      protocol,
      supported: this.supportedProtocols.has(protocol),
      reason: this.supportedProtocols.has(protocol) ? undefined : 'Not configured',
      estimatedCost: this.calculateEstimatedCost(protocol, request.amount),
      estimatedTime: this.getEstimatedSettlementTime(protocol),
      features: {
        reversibility: protocolInfo.reversibility.supported,
        micropayments: protocolInfo.micropayments === 'excellent',
        automation: protocolInfo.automation === 'excellent',
        globalReach: protocol !== 'sepa' // SEPA is EU-only
      }
    }
  }

  /**
   * Calculate estimated cost for a protocol
   */
  private calculateEstimatedCost(protocol: string, amount: number): number {
    const protocolInfo = PAYMENT_PROTOCOLS[protocol]
    
    switch (protocol) {
      case 'x402':
        // x402: ~0.5% + gas fees
        return amount * 0.005 + 0.001
      case 'l402':
        // Lightning: ~0.01% + routing fees
        return amount * 0.0001 + 0.0001
      case 'stripe':
        // Stripe: 2.9% + $0.30
        return amount * 0.029 + 0.30
      case 'sepa':
        // SEPA: ~$0.10-0.50 depending on amount
        return amount < 10 ? 0.10 : 0.50
      default:
        return amount * 0.03 // 3% default
    }
  }

  /**
   * Get estimated settlement time
   */
  private getEstimatedSettlementTime(protocol: string): number {
    switch (protocol) {
      case 'x402':
      case 'l402':
        return 30 // 30 seconds for blockchain
      case 'stripe':
        return 3600 // 1 hour for card processing
      case 'sepa':
        return 86400 // 24 hours for SEPA
      default:
        return 3600 // 1 hour default
    }
  }

  /**
   * Process payment using the recommended protocol
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const analysis = await this.analyzePaymentRequest(request)
    const protocol = analysis.recommendedProtocol

    console.log(`💳 Processing payment with ${protocol} protocol`)
    console.log(`📊 Analysis: ${analysis.reasoning}`)

    switch (protocol) {
      case 'x402':
        return this.processX402Payment(request)
      case 'stripe':
        return this.processStripePayment(request)
      case 'l402':
        return this.processL402Payment(request)
      case 'sepa':
        return this.processSEPAPayment(request)
      default:
        throw new Error(`Unsupported payment protocol: ${protocol}`)
    }
  }

  /**
   * Process x402 Foundation payment
   */
  private async processX402Payment(request: PaymentRequest): Promise<PaymentResponse> {
    // Import AP2 service dynamically to avoid circular dependencies
    const { ap2Service } = await import('../ap2/service')
    
    const paymentIntent = await ap2Service.createPaymentRequest(
      `agent_${request.context?.agentType || 'unknown'}`,
      request.recipient,
      request.amount,
      request.currency,
      request.description,
      request.metadata || {}
    )

    // Simulate payment processing
    const fees = this.calculateEstimatedCost('x402', request.amount)
    
    return {
      id: `x402_${Date.now()}`,
      requestId: request.id,
      status: 'completed',
      protocol: 'x402',
      transactionId: paymentIntent.id,
      amount: request.amount,
      currency: request.currency,
      fees,
      settlementTime: 30,
      finality: 'cryptographic',
      metadata: {
        paymentIntent: paymentIntent.id,
        network: 'base',
        token: 'usdc'
      },
      timestamp: new Date()
    }
  }

  /**
   * Process Stripe payment
   */
  private async processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate Stripe payment processing
    const fees = this.calculateEstimatedCost('stripe', request.amount)
    
    return {
      id: `stripe_${Date.now()}`,
      requestId: request.id,
      status: 'completed',
      protocol: 'stripe',
      transactionId: `pi_${Date.now()}`,
      amount: request.amount,
      currency: request.currency,
      fees,
      settlementTime: 3600,
      finality: 'reversible',
      metadata: {
        paymentMethod: 'card',
        processor: 'stripe'
      },
      timestamp: new Date()
    }
  }

  /**
   * Process Lightning Network payment (placeholder)
   */
  private async processL402Payment(request: PaymentRequest): Promise<PaymentResponse> {
    throw new Error('L402 Lightning Network payments not yet implemented')
  }

  /**
   * Process SEPA payment (placeholder)
   */
  private async processSEPAPayment(request: PaymentRequest): Promise<PaymentResponse> {
    throw new Error('SEPA payments not yet implemented')
  }

  /**
   * Get available protocols and their capabilities
   */
  getAvailableProtocols(): ProtocolCapability[] {
    return Array.from(this.supportedProtocols).map(protocol => ({
      protocol,
      supported: true,
      estimatedCost: 0,
      estimatedTime: 0,
      features: {
        reversibility: PAYMENT_PROTOCOLS[protocol]?.reversibility.supported || false,
        micropayments: PAYMENT_PROTOCOLS[protocol]?.micropayments === 'excellent',
        automation: PAYMENT_PROTOCOLS[protocol]?.automation === 'excellent',
        globalReach: protocol !== 'sepa'
      }
    }))
  }

  /**
   * Get protocol comparison for UI display
   */
  getProtocolComparison(): Array<{
    protocol: string
    name: string
    decentralization: string
    automation: string
    cost: string
    speed: string
    reversibility: string
    micropayments: string
    advantages: string[]
    disadvantages: string[]
  }> {
    return Object.values(PROTOCOL_COMPARISON).map(comparison => ({
      protocol: comparison.protocol.id,
      name: comparison.protocol.name,
      decentralization: comparison.protocol.decentralization,
      automation: comparison.protocol.automation,
      cost: comparison.protocol.cost,
      speed: comparison.protocol.speed,
      reversibility: comparison.protocol.reversibility.supported ? 'Yes' : 'No',
      micropayments: comparison.protocol.micropayments,
      advantages: comparison.advantages,
      disadvantages: comparison.disadvantages
    }))
  }
}

// Export singleton instance
export const multiProtocolPaymentService = new MultiProtocolPaymentService()
