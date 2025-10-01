'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentMethodSelector } from '@/components/payment-method-selector'
import { CoinbaseCommerceCheckout } from '@/components/coinbase-commerce-checkout'

interface RankedOffer {
  productId: string
  variantId: string
  title: string
  image?: string
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'x402' | 'coinbase' | undefined>()
  const [showPaymentSelector, setShowPaymentSelector] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<RankedOffer | null>(null)

  const handleCheckout = async (offer: RankedOffer) => {
    setSelectedProduct(offer)
    setShowPaymentSelector(true)
  }

  const handlePaymentMethodSelect = async (method: 'stripe' | 'x402' | 'coinbase') => {
    setSelectedPaymentMethod(method)
    setShowPaymentSelector(false)

    // Here you would implement the actual checkout logic
    if (method === 'stripe') {
      // Redirect to Stripe checkout
      setMessage('Redirecting to Stripe checkout...')
    } else if (method === 'x402') {
      // Handle x402 payment
      setMessage('Initiating x402 payment...')
    } else if (method === 'coinbase') {
      setMessage('Initializing Coinbase Commerce checkout...')
    }
  }

  const handleCoinbaseSuccess = (chargeId: string) => {
    setMessage(`Payment successful! Charge ID: ${chargeId}`)
    setSelectedPaymentMethod(undefined)
    setSelectedProduct(null)
  }

  const handleCoinbaseError = (error: string) => {
    setMessage(`Payment failed: ${error}`)
    setSelectedPaymentMethod(undefined)
    setSelectedProduct(null)
  }

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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      console.log('ACP Search Response:', data) // Debug log

      if (data.success && Array.isArray(data.results)) {
        setOffers(
          data.results.map((r: any) => ({
            ...r,
            image: r.image || r.images?.[0] || '/next.svg',
          })),
        )
        setMessage(null)
      } else {
        setMessage(`Search failed: ${data.error || 'Invalid response format'}`)
        setOffers([])
      }
    } catch (e) {
      console.error('ACP Search Error:', e)
      setMessage(`Search failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
      setOffers([])
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
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">Agentic Commerce Demo (ACP + x402)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-white text-black placeholder-gray-500"
            placeholder="Search products (e.g., blue shirt)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={search} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {message && <div className="text-sm text-blue-700">{message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {offers.slice(0, 6).map((o) => (
            <div key={o.variantId} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-black">{o.title}</div>
                  {typeof o.score === 'number' && (
                    <Badge variant="outline" className="text-xs">
                      GEO {Math.round(o.score)}
                    </Badge>
                  )}
                  {o.sponsored && <Badge className="bg-emerald-600 text-white text-xs">Sponsored</Badge>}
                </div>

                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">Product Description:</div>
                  <div className="text-xs text-gray-600 mb-2">
                    {o.title.includes('Blue Cotton')
                      ? 'Classic crew neck t-shirt in vibrant blue, made from premium cotton blend for comfort and durability.'
                      : 'Thick, durable cotton tee in slate blue, heavyweight construction for long-lasting wear.'}
                  </div>

                  <div className="font-medium mb-1">x402 Payment Benefits:</div>
                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                    • <strong>FREE</strong> Coinbase x402 facilitator (no fees!)
                    <br />• <strong>FREE</strong> gas fees (sponsored by Coinbase)
                    <br />• <strong>FREE</strong> receiving (always free)
                    <br />
                    • Instant settlement on Base network
                    <br />
                    • No credit card fees or chargebacks
                    <br />• Total cost: ${o.effectivePrice.toFixed(2)} {o.currency} (product only)
                    <br />• {o.inStock ? 'In stock' : 'Out of stock'} • ETA {o.etaDays || 5}d
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleCheckout(o)}
                  disabled={!o.inStock}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Choose Payment Method
                </Button>
              </div>
            </div>
          ))}
          {offers.length === 0 && !loading && (
            <div className="text-sm text-gray-700">No results yet. Try another query.</div>
          )}
        </div>

        {/* Payment Method Selector */}
        {showPaymentSelector && (
          <div className="mt-6 p-6 border-t bg-gray-50">
            <PaymentMethodSelector onSelect={handlePaymentMethodSelect} selectedMethod={selectedPaymentMethod} />
          </div>
        )}

        {/* Coinbase Commerce Checkout */}
        {selectedPaymentMethod === 'coinbase' && selectedProduct && (
          <div className="mt-6 p-6 border-t bg-gray-50">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Complete Your Purchase</h3>
              <p className="text-sm text-gray-600">Pay with cryptocurrency using Coinbase Commerce</p>
            </div>
            <CoinbaseCommerceCheckout
              product={{
                id: selectedProduct.productId,
                name: selectedProduct.title,
                description: selectedProduct.description,
                price: selectedProduct.effectivePrice,
                currency: selectedProduct.currency.toLowerCase()
              }}
              onSuccess={handleCoinbaseSuccess}
              onError={handleCoinbaseError}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
