'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RankedOffer {
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
  sponsored?: boolean
  score?: number
  reasons?: Array<{ key: string; value: number; note?: string }>
  label?: string
}

export function AcpDemo() {
  const [query, setQuery] = useState('blue shirt')
  const [offers, setOffers] = useState<RankedOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const search = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/acp/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters: { currency: 'USD', maxPrice: 200 },
        }),
      })
      const data = await res.json()
      setOffers(data.results || [])
    } catch (e) {
      setMessage('Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkout = async (offer: RankedOffer) => {
    setMessage(null)
    try {
      const res = await fetch('/api/acp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: offer.productId,
              name: offer.title,
              price: offer.effectivePrice,
              quantity: 1,
              description: `${offer.attributes?.color || ''} ${offer.attributes?.size || ''}`.trim(),
            },
          ],
          totalAmount: offer.effectivePrice,
          currency: offer.currency || 'USDC',
          paymentMethod: 'x402',
        }),
      })
      const data = await res.json()
      if (data?.success) {
        setMessage(`Checkout complete: ${data.checkout.id}`)
      } else {
        setMessage(`Checkout failed: ${data?.message || 'Unknown error'}`)
      }
    } catch (e) {
      setMessage('Checkout failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Agentic Commerce Demo (ACP + x402)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Search products (e.g., blue shirt)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={search} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {message && <div className="text-sm text-gray-700">{message}</div>}

        <div className="space-y-2">
          {offers.slice(0, 6).map((o) => (
            <div key={o.variantId} className="flex items-center justify-between border rounded p-3 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <div className="font-semibold text-black">{o.title}</div>
                  <div className="text-xs text-gray-800">
                    ${o.effectivePrice.toFixed(2)} {o.currency} • {o.inStock ? 'In stock' : 'Out of stock'}
                    {typeof o.etaDays === 'number' ? ` • ETA ${o.etaDays}d` : ''}
                    {o.label ? ' • ' : ''}
                    {o.label && <Badge variant="outline">{o.label}</Badge>}
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => checkout(o)} disabled={!o.inStock}>
                Checkout
              </Button>
            </div>
          ))}
          {offers.length === 0 && !loading && (
            <div className="text-sm text-gray-500">No results yet. Try another query.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
