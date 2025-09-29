import { acpService } from '@/lib/acp/acp-service'
import { merchantService } from '@/lib/acp/merchant-service'

export interface MerchantTrustSignals {
  rating: number // 0-5
  onTimeRate: number // 0-1
  returnRate: number // 0-1 (lower is better)
}

export interface ProductVariant {
  id: string
  attributes: Record<string, string | number | boolean>
  price: number // base price without fees
  currency: string
  inStock: boolean
  etaDays?: number
}

export interface Product {
  id: string
  title: string
  description?: string
  brand?: string
  category?: string
  tags?: string[]
  variants: ProductVariant[]
  images?: string[]
  merchant?: {
    id: string
    name: string
    trust?: MerchantTrustSignals
  }
  shipping?: {
    fixedCost?: number
    regions?: string[]
  }
  returns?: {
    policy?: string
    windowDays?: number
    restockingFeePercent?: number
  }
  sponsoredBudgetUSD?: number
}

export interface SearchFilters {
  attributes?: Record<string, string | number | boolean>
  maxPrice?: number
  currency?: string
}

export interface RankedOffer {
  productId: string
  variantId: string
  title: string
  attributes: Record<string, string | number | boolean>
  basePrice: number
  effectivePrice: number
  currency: string
  inStock: boolean
  etaDays?: number
  merchantId?: string
  merchantName?: string
  sponsored: boolean
  score: number
  reasons: Array<{ key: string; value: number; note?: string }>
}

/**
 * Lightweight in-memory catalog with ranking and ACP/x402-aware pricing.
 * For production, you can back this by a DB table and replace the store.
 */
class CatalogService {
  private products: Map<string, Product> = new Map()

  seedDefaultsIfEmpty() {
    if (this.products.size > 0) return

    const merchant = {
      id: 'verclibase-merchant',
      name: 'VERCLIBASE',
      trust: { rating: 4.7, onTimeRate: 0.98, returnRate: 0.06 },
    }

    const defaults: Product[] = [
      {
        id: 'tee-blue',
        title: 'Classic Tee – Blue',
        description: 'Soft cotton tee in blue',
        brand: 'Verclibase Apparel',
        category: 'tops',
        tags: ['shirt', 'tee', 'blue'],
        variants: [
          {
            id: 'tee-blue-l',
            attributes: { color: 'blue', size: 'L' },
            price: 26,
            currency: 'USD',
            inStock: true,
            etaDays: 3,
          },
        ],
        images: [],
        merchant,
        shipping: { fixedCost: 5, regions: ['US', 'CA'] },
        returns: { policy: '30-day returns', windowDays: 30 },
        sponsoredBudgetUSD: 25,
      },
      {
        id: 'tee-heavy-natural',
        title: 'Heavyweight Tee – Natural',
        description: 'Thick, durable tee in natural',
        brand: 'Verclibase Apparel',
        category: 'tops',
        tags: ['shirt', 'tee', 'natural'],
        variants: [
          {
            id: 'tee-heavy-natural-l',
            attributes: { color: 'natural', size: 'L' },
            price: 26,
            currency: 'USD',
            inStock: true,
            etaDays: 4,
          },
        ],
        merchant,
        sponsoredBudgetUSD: 0,
      },
    ]

    defaults.forEach((p) => this.products.set(p.id, p))
  }

  upsertProducts(items: Product[]) {
    items.forEach((p) => this.products.set(p.id, p))
  }

  listProducts(): Product[] {
    this.seedDefaultsIfEmpty()
    return Array.from(this.products.values())
  }

  private getX402SavingsPercent(): number {
    const envValue = process.env.X402_ESTIMATED_SAVINGS_PERCENT
    const parsed = envValue ? parseFloat(envValue) : NaN
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 50) return parsed
    return 1.0 // default 1% effective savings
  }

  private computeEffectivePrice(basePrice: number, shipping?: number): number {
    const subtotal = basePrice + (shipping || 0)
    const savingsPercent = this.getX402SavingsPercent() / 100
    const discounted = subtotal * (1 - savingsPercent)
    return Math.max(0, Number(discounted.toFixed(2)))
  }

  private textRelevance(query: string, text: string): number {
    if (!query || !text) return 0
    const q = query.toLowerCase().split(/\s+/).filter(Boolean)
    const t = text.toLowerCase()
    let hits = 0
    q.forEach((term) => {
      if (t.includes(term)) hits += 1
    })
    return Math.min(1, hits / Math.max(1, q.length))
  }

  private attributesMatchScore(queryAttrs: Record<string, any> | undefined, attrs: Record<string, any>): number {
    if (!queryAttrs) return 0
    let matched = 0
    let total = 0
    for (const key of Object.keys(queryAttrs)) {
      total += 1
      if (String(attrs[key]).toLowerCase() === String(queryAttrs[key]).toLowerCase()) matched += 1
    }
    if (total === 0) return 0
    return matched / total
  }

  private normalize(values: number[]): (x: number) => number {
    const min = Math.min(...values)
    const max = Math.max(...values)
    if (!isFinite(min) || !isFinite(max) || min === max) return () => 1
    return (x: number) => (x - min) / (max - min)
  }

  searchAndRank(query: string, filters: SearchFilters = {}): RankedOffer[] {
    const config = acpService.getMerchantConfig()
    const products = this.listProducts()

    const candidates: RankedOffer[] = []
    for (const p of products) {
      for (const v of p.variants) {
        if (filters.currency && v.currency !== filters.currency) continue
        if (typeof filters.maxPrice === 'number' && v.price > filters.maxPrice) continue
        if (filters.attributes) {
          const attrMiss = Object.entries(filters.attributes).some(
            ([k, val]) => String(v.attributes[k]).toLowerCase() !== String(val).toLowerCase(),
          )
          if (attrMiss) continue
        }

        const effectivePrice = this.computeEffectivePrice(v.price, p.shipping?.fixedCost)
        const merchantOverride = v.attributes && typeof v.attributes['merchantId'] === 'string'
          ? merchantService.get(String(v.attributes['merchantId']))
          : undefined

        const merchantName = merchantOverride?.name || p.merchant?.name || config.name
        const merchantId = merchantOverride?.id || p.merchant?.id || config.id
        const sponsoredBudgetUSD = merchantOverride?.sponsoredBudgetUSD ?? p.sponsoredBudgetUSD ?? 0

        candidates.push({
          productId: p.id,
          variantId: v.id,
          title: p.title,
          attributes: v.attributes,
          basePrice: v.price,
          effectivePrice,
          currency: v.currency,
          inStock: v.inStock,
          etaDays: v.etaDays,
          merchantId,
          merchantName,
          sponsored: sponsoredBudgetUSD > 0,
          score: 0,
          reasons: [],
        })
      }
    }

    if (candidates.length === 0) return []

    // Feature values
    const priceValues = candidates.map((c) => c.effectivePrice)
    const normCheaperIsBetter = this.normalize(priceValues)

    for (const c of candidates) {
      const product = this.products.get(c.productId)!

      const relevanceTxt = this.textRelevance(query, `${product.title} ${product.description || ''} ${(product.tags || []).join(' ')}`)
      const relevanceAttr = this.attributesMatchScore(filters.attributes, c.attributes)
      const relevance = Math.max(relevanceTxt, relevanceAttr)

      const priceScore = 1 - normCheaperIsBetter(c.effectivePrice) // lower price => higher score
      const availability = c.inStock ? 1 : 0
      const eta = typeof c.etaDays === 'number' ? c.etaDays : 7
      const etaScore = Math.max(0, Math.min(1, 1 - eta / 14)) // faster better

      const trust = merchantService.get(c.merchantId || '')?.trust || product.merchant?.trust || { rating: 4, onTimeRate: 0.95, returnRate: 0.08 }
      const trustScore = Math.min(1, (trust.rating / 5) * 0.6 + trust.onTimeRate * 0.3 + (1 - trust.returnRate) * 0.1)

      // Sponsored lift if minimally relevant
      const budget = merchantService.get(c.merchantId || '')?.sponsoredBudgetUSD ?? product.sponsoredBudgetUSD ?? 0
      const sponsoredLift = budget && relevance >= 0.4 ? Math.min(0.08, budget / 1000) : 0

      // Final score
      const score =
        0.35 * relevance +
        0.20 * priceScore +
        0.15 * availability +
        0.15 * trustScore +
        0.10 * etaScore +
        0.05 * 1 + // diversity placeholder
        sponsoredLift

      c.score = Number(score.toFixed(6))
      c.reasons = [
        { key: 'relevance', value: Number(relevance.toFixed(3)) },
        { key: 'priceScore', value: Number(priceScore.toFixed(3)), note: `effective ${c.effectivePrice} ${c.currency}` },
        { key: 'availability', value: availability },
        { key: 'etaScore', value: Number(etaScore.toFixed(3)), note: `${eta}d` },
        { key: 'trust', value: Number(trustScore.toFixed(3)) },
        ...(sponsoredLift > 0 ? [{ key: 'sponsoredLift', value: Number(sponsoredLift.toFixed(3)) }] : []),
      ]
    }

    // Sort by score desc, then price asc
    candidates.sort((a, b) => (b.score - a.score) || (a.effectivePrice - b.effectivePrice))
    return candidates
  }
}

export const catalogService = new CatalogService()


