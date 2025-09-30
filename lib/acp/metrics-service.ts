export type GeoEventType = 'impression' | 'click' | 'checkout'

export interface GeoEvent {
  ts: number
  type: GeoEventType
  query?: string
  productId?: string
  variantId?: string
  merchantId?: string
  sponsored?: boolean
  valueUSD?: number
}

export interface GeoSummary {
  impressions: number
  clicks: number
  checkouts: number
  ctr: number
  checkoutRate: number
  sponsoredShare: number
  revenueUSD: number
}

class GeoMetricsService {
  private events: GeoEvent[] = []

  log(event: GeoEvent) {
    this.events.push({ ...event, ts: event.ts || Date.now() })
    // Keep the buffer bounded
    if (this.events.length > 5000) this.events.splice(0, this.events.length - 5000)
  }

  summarize(sinceMs = 1000 * 60 * 60 * 24): GeoSummary {
    const cutoff = Date.now() - sinceMs
    const rows = this.events.filter((e) => e.ts >= cutoff)
    const impressions = rows.filter((e) => e.type === 'impression').length
    const clicks = rows.filter((e) => e.type === 'click').length
    const checkouts = rows.filter((e) => e.type === 'checkout').length
    const sponsored = rows.filter((e) => e.sponsored).length
    const revenueUSD = rows.filter((e) => e.type === 'checkout').reduce((s, e) => s + (e.valueUSD || 0), 0)

    return {
      impressions,
      clicks,
      checkouts,
      ctr: impressions > 0 ? clicks / impressions : 0,
      checkoutRate: clicks > 0 ? checkouts / clicks : 0,
      sponsoredShare: rows.length > 0 ? sponsored / rows.length : 0,
      revenueUSD,
    }
  }
}

export const geoMetrics = new GeoMetricsService()


