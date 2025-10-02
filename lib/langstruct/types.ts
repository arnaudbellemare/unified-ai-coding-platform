/**
 * LangStruct TypeScript Integration Types
 * For structured data extraction in GEO + ACP + AP2 system
 */

export interface ExtractionResult {
  entities: Record<string, any>
  confidence: number
  sources: Record<string, Array<{
    text: string
    start: number
    end: number
  }>>
  success: boolean
  error?: string
}

export interface GEOQueryEntities {
  query_type: string
  price_range?: {
    min: number
    max: number
  }
  product_category?: string
  brand_preference?: string
  urgency?: 'low' | 'medium' | 'high'
  location?: string
}

export interface ACPPaymentEntities {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_amount: number
  payment_method: 'crypto' | 'card' | 'bank'
  currency: 'USDC' | 'USD' | 'ETH' | 'BTC'
  customer_id: string
}

export interface AP2AgentEntities {
  from_agent: string
  to_agent: string
  amount: number
  service: string
  mandate_id: string
  currency: string
  description: string
}

export interface DocumentMetadataEntities {
  document_type: string
  company?: string
  revenue?: number
  quarter?: string
  key_metrics?: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export type ExtractorType = 
  | 'geo_query'
  | 'acp_payment' 
  | 'ap2_agent'
  | 'document_metadata'

export interface LangStructConfig {
  apiKey?: string
  model?: string
  refine?: boolean
  maxWorkers?: number
  rateLimit?: number
}
