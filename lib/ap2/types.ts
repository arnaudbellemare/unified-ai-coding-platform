/**
 * Agent Payments Protocol (AP2) Types
 * Based on Google's AP2 specification and x402 Foundation standard
 * https://github.com/google-agentic-commerce/AP2
 * https://www.cloudflare.com/en-ca/press/press-releases/2025/cloudflare-and-coinbase-will-launch-x402-foundation/
 */

export interface PaymentRequest {
  id: string
  amount: number
  currency: string
  description: string
  recipient: string
  metadata?: Record<string, any>
  expiresAt?: Date
  createdAt: Date
}

export interface PaymentResponse {
  id: string
  requestId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  transactionId?: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  processedAt?: Date
  error?: string
}

export interface PaymentMethod {
  type: 'crypto' | 'credit_card' | 'bank_transfer' | 'wallet'
  provider: string
  details: {
    address?: string // For crypto
    cardLast4?: string // For credit cards
    bankAccount?: string // For bank transfers
    walletId?: string // For digital wallets
  }
}

export interface AgentPaymentCapability {
  agentId: string
  supportedCurrencies: string[]
  supportedPaymentMethods: PaymentMethod['type'][]
  maxAmount?: number
  minAmount?: number
  fees: {
    fixed?: number
    percentage?: number
  }
}

export interface PaymentIntent {
  id: string
  agentId: string
  userId: string
  amount: number
  currency: string
  description: string
  metadata: {
    taskId?: string
    executionId?: string
    optimizationLevel?: string
  }
  status: 'created' | 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

export interface X402PaymentRequest {
  httpStatus: 402
  headers: {
    'X-Payment-Required': string
    'X-Payment-Amount': string
    'X-Payment-Currency': string
    'X-Payment-Description': string
    'X-Payment-Provider': string
  }
  body: {
    paymentId: string
    amount: number
    currency: string
    description: string
    providers: PaymentProvider[]
    expiresAt: string
  }
}

export interface PaymentProvider {
  id: string
  name: string
  type: PaymentMethod['type']
  fees: {
    fixed: number
    percentage: number
  }
  supportedCurrencies: string[]
  endpoint: string
}

export interface AgentTransaction {
  id: string
  agentId: string
  userId: string
  type: 'payment' | 'refund' | 'fee'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  description: string
  metadata: Record<string, any>
  createdAt: Date
  completedAt?: Date
}

export interface PaymentWebhook {
  event: 'payment.completed' | 'payment.failed' | 'payment.refunded'
  data: {
    paymentId: string
    transactionId: string
    amount: number
    currency: string
    status: string
    timestamp: string
  }
}
