/**
 * AP2 Mandate Manager
 * Handles cryptographic mandate flows for Google AP2
 */

export interface IntentMandate {
  id: string
  agent_id: string
  intent: string
  constraints: Record<string, any>
  expires_at: Date
  signature: string
  created_at: Date
}

export interface CartMandate {
  id: string
  intent_mandate_id: string
  cart_data: {
    items: Array<{
      product_id: string
      name: string
      quantity: number
      price: number
    }>
    total: number
    currency: string
  }
  merchant_signature: string
  created_at: Date
}

export interface PaymentMandate {
  id: string
  cart_mandate_id: string
  payment_data: {
    amount: number
    currency: string
    payment_method: string
    billing_address: any
  }
  user_signature: string
  created_at: Date
}

export interface MandateVerification {
  valid: boolean
  signature_valid: boolean
  constraints_met: boolean
  not_expired: boolean
  error?: string
}

export class AP2MandateManager {
  private intentMandates: Map<string, IntentMandate> = new Map()
  private cartMandates: Map<string, CartMandate> = new Map()
  private paymentMandates: Map<string, PaymentMandate> = new Map()

  /**
   * Create Intent Mandate
   */
  async createIntentMandate(agentId: string, intent: string, constraints: Record<string, any>): Promise<IntentMandate> {
    const mandateId = `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const mandate: IntentMandate = {
      id: mandateId,
      agent_id: agentId,
      intent,
      constraints,
      expires_at: expiresAt,
      signature: await this.signMandate({ agentId, intent, constraints }),
      created_at: new Date()
    }

    this.intentMandates.set(mandateId, mandate)
    console.log(`🔐 AP2 Intent Mandate created: ${mandateId}`)

    return mandate
  }

  /**
   * Create Cart Mandate from Intent
   */
  async createCartMandate(intentMandateId: string, cartData: any, merchantSignature: string): Promise<CartMandate> {
    const intentMandate = this.intentMandates.get(intentMandateId)
    if (!intentMandate) {
      throw new Error(`Intent mandate ${intentMandateId} not found`)
    }

    // Verify intent mandate is still valid
    const verification = await this.verifyIntentMandate(intentMandateId)
    if (!verification.valid) {
      throw new Error(`Intent mandate ${intentMandateId} is invalid: ${verification.error}`)
    }

    const mandateId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const mandate: CartMandate = {
      id: mandateId,
      intent_mandate_id: intentMandateId,
      cart_data: cartData,
      merchant_signature,
      created_at: new Date()
    }

    this.cartMandates.set(mandateId, mandate)
    console.log(`🛒 AP2 Cart Mandate created: ${mandateId}`)

    return mandate
  }

  /**
   * Create Payment Mandate from Cart
   */
  async createPaymentMandate(cartMandateId: string, paymentData: any, userSignature: string): Promise<PaymentMandate> {
    const cartMandate = this.cartMandates.get(cartMandateId)
    if (!cartMandate) {
      throw new Error(`Cart mandate ${cartMandateId} not found`)
    }

    const mandateId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const mandate: PaymentMandate = {
      id: mandateId,
      cart_mandate_id: cartMandateId,
      payment_data: paymentData,
      user_signature,
      created_at: new Date()
    }

    this.paymentMandates.set(mandateId, mandate)
    console.log(`💳 AP2 Payment Mandate created: ${mandateId}`)

    return mandate
  }

  /**
   * Verify Intent Mandate
   */
  async verifyIntentMandate(mandateId: string): Promise<MandateVerification> {
    const mandate = this.intentMandates.get(mandateId)
    if (!mandate) {
      return { valid: false, signature_valid: false, constraints_met: false, not_expired: false, error: 'Mandate not found' }
    }

    const now = new Date()
    const notExpired = mandate.expires_at > now
    const signatureValid = await this.verifySignature(mandate.signature, { agentId: mandate.agent_id, intent: mandate.intent, constraints: mandate.constraints })
    const constraintsMet = this.checkConstraints(mandate.constraints)

    return {
      valid: notExpired && signatureValid && constraintsMet,
      signature_valid: signatureValid,
      constraints_met: constraintsMet,
      not_expired: notExpired,
      error: !notExpired ? 'Mandate expired' : !signatureValid ? 'Invalid signature' : !constraintsMet ? 'Constraints not met' : undefined
    }
  }

  /**
   * Verify Cart Mandate
   */
  async verifyCartMandate(mandateId: string): Promise<MandateVerification> {
    const mandate = this.cartMandates.get(mandateId)
    if (!mandate) {
      return { valid: false, signature_valid: false, constraints_met: false, not_expired: false, error: 'Mandate not found' }
    }

    // Verify the intent mandate is still valid
    const intentVerification = await this.verifyIntentMandate(mandate.intent_mandate_id)
    if (!intentVerification.valid) {
      return { valid: false, signature_valid: false, constraints_met: false, not_expired: false, error: 'Intent mandate invalid' }
    }

    const signatureValid = await this.verifyMerchantSignature(mandate.merchant_signature, mandate.cart_data)

    return {
      valid: intentVerification.valid && signatureValid,
      signature_valid: signatureValid,
      constraints_met: intentVerification.constraints_met,
      not_expired: intentVerification.not_expired,
      error: !signatureValid ? 'Invalid merchant signature' : intentVerification.error
    }
  }

  /**
   * Verify Payment Mandate
   */
  async verifyPaymentMandate(mandateId: string): Promise<MandateVerification> {
    const mandate = this.paymentMandates.get(mandateId)
    if (!mandate) {
      return { valid: false, signature_valid: false, constraints_met: false, not_expired: false, error: 'Mandate not found' }
    }

    // Verify the cart mandate is still valid
    const cartVerification = await this.verifyCartMandate(mandate.cart_mandate_id)
    if (!cartVerification.valid) {
      return { valid: false, signature_valid: false, constraints_met: false, not_expired: false, error: 'Cart mandate invalid' }
    }

    const signatureValid = await this.verifyUserSignature(mandate.user_signature, mandate.payment_data)

    return {
      valid: cartVerification.valid && signatureValid,
      signature_valid: signatureValid,
      constraints_met: cartVerification.constraints_met,
      not_expired: cartVerification.not_expired,
      error: !signatureValid ? 'Invalid user signature' : cartVerification.error
    }
  }

  /**
   * Get mandate by ID
   */
  getIntentMandate(mandateId: string): IntentMandate | null {
    return this.intentMandates.get(mandateId) || null
  }

  getCartMandate(mandateId: string): CartMandate | null {
    return this.cartMandates.get(mandateId) || null
  }

  getPaymentMandate(mandateId: string): PaymentMandate | null {
    return this.paymentMandates.get(mandateId) || null
  }

  /**
   * Sign mandate (mock implementation)
   */
  private async signMandate(data: any): Promise<string> {
    // In real implementation, this would use actual cryptographic signing
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', 'ap2_secret_key')
    hmac.update(JSON.stringify(data))
    return `sha256=${hmac.digest('hex')}`
  }

  /**
   * Verify signature (mock implementation)
   */
  private async verifySignature(signature: string, data: any): Promise<boolean> {
    const expectedSignature = await this.signMandate(data)
    return signature === expectedSignature
  }

  /**
   * Verify merchant signature
   */
  private async verifyMerchantSignature(signature: string, data: any): Promise<boolean> {
    // In real implementation, this would verify merchant's cryptographic signature
    return signature.startsWith('merchant_')
  }

  /**
   * Verify user signature
   */
  private async verifyUserSignature(signature: string, data: any): Promise<boolean> {
    // In real implementation, this would verify user's cryptographic signature
    return signature.startsWith('user_')
  }

  /**
   * Check constraints
   */
  private checkConstraints(constraints: Record<string, any>): boolean {
    // Check if constraints are met (mock implementation)
    if (constraints.max_amount && constraints.max_amount < 1000) {
      return true
    }
    if (constraints.allowed_merchants && constraints.allowed_merchants.includes('verclibase')) {
      return true
    }
    return true // Default to true for demo
  }

  /**
   * Get mandate statistics
   */
  getMandateStatistics(): {
    intent_mandates: number
    cart_mandates: number
    payment_mandates: number
    active_mandates: number
  } {
    const now = new Date()
    const activeIntentMandates = Array.from(this.intentMandates.values())
      .filter(m => m.expires_at > now).length

    return {
      intent_mandates: this.intentMandates.size,
      cart_mandates: this.cartMandates.size,
      payment_mandates: this.paymentMandates.size,
      active_mandates: activeIntentMandates
    }
  }
}
