export interface MerchantConfigInput {
  id: string
  name: string
  description?: string
  url?: string
  trust?: {
    rating?: number
    onTimeRate?: number
    returnRate?: number
  }
  sponsoredBudgetUSD?: number
}

export interface MerchantConfig extends Required<Omit<MerchantConfigInput, 'trust' | 'sponsoredBudgetUSD'>> {
  trust: {
    rating: number
    onTimeRate: number
    returnRate: number
  }
  sponsoredBudgetUSD: number
}

class MerchantService {
  private merchants: Map<string, MerchantConfig> = new Map()

  get(id: string): MerchantConfig | undefined {
    return this.merchants.get(id)
  }

  list(): MerchantConfig[] {
    return Array.from(this.merchants.values())
  }

  upsert(config: MerchantConfigInput): MerchantConfig {
    const existing = this.merchants.get(config.id)
    const merged: MerchantConfig = {
      id: config.id,
      name: config.name,
      description: config.description || existing?.description || '',
      url: config.url || existing?.url || '',
      trust: {
        rating: Math.max(0, Math.min(5, config.trust?.rating ?? existing?.trust.rating ?? 4.5)),
        onTimeRate: Math.max(0, Math.min(1, config.trust?.onTimeRate ?? existing?.trust.onTimeRate ?? 0.98)),
        returnRate: Math.max(0, Math.min(1, config.trust?.returnRate ?? existing?.trust.returnRate ?? 0.05)),
      },
      sponsoredBudgetUSD: Math.max(0, config.sponsoredBudgetUSD ?? existing?.sponsoredBudgetUSD ?? 0),
    }
    this.merchants.set(config.id, merged)
    return merged
  }
}

export const merchantService = new MerchantService()
