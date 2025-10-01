'use client'

import React, { useState } from 'react'
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image?: string
}

interface CoinbaseCommerceCheckoutProps {
  product: Product
  onSuccess?: (chargeId: string) => void
  onError?: (error: string) => void
}

export function CoinbaseCommerceCheckout({ 
  product, 
  onSuccess, 
  onError 
}: CoinbaseCommerceCheckoutProps) {
  const [isCreatingCharge, setIsCreatingCharge] = useState(false)
  const [chargeId, setChargeId] = useState<string | null>(null)

  // Create a charge dynamically using our backend
  const chargeHandler = async (): Promise<string> => {
    setIsCreatingCharge(true)
    
    try {
      const response = await fetch('/api/coinbase-commerce/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          local_price: {
            amount: product.price.toString(),
            currency: product.currency.toUpperCase()
          },
          pricing_type: 'fixed_price',
          metadata: {
            product_id: product.id,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create charge')
      }

      const data = await response.json()
      const chargeId = data.id
      setChargeId(chargeId)
      setIsCreatingCharge(false)
      
      return chargeId
    } catch (error) {
      setIsCreatingCharge(false)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onError?.(errorMessage)
      throw error
    }
  }

  // Handle successful checkout
  const handleStatus = async (status: any) => {
    const { statusName, statusData } = status
    
    switch (statusName) {
      case 'success':
        console.log('Checkout successful:', statusData)
        if (statusData.chargeId) {
          onSuccess?.(statusData.chargeId)
        }
        break
      case 'pending':
        console.log('Payment pending:', statusData)
        break
      case 'error':
        console.error('Checkout error:', statusData)
        onError?.(statusData.message || 'Payment failed')
        break
      default:
        console.log('Checkout status:', statusName, statusData)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
        <p className="text-gray-600 text-sm">{product.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Product Price */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {product.currency.toUpperCase()}
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Free gas fees on Base</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Instant settlement</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>No chargebacks</span>
          </div>
        </div>

        {/* Coinbase Commerce Checkout */}
        <div className="border-t pt-4">
          <Checkout 
            chargeHandler={chargeHandler}
            onStatus={handleStatus}
          >
            <CheckoutButton 
              coinbaseBranded
              text={`Pay ${product.currency.toUpperCase()} ${product.price.toFixed(2)}`}
              disabled={isCreatingCharge}
            />
            <CheckoutStatus />
          </Checkout>
        </div>

        {/* Loading State */}
        {isCreatingCharge && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating payment...</span>
          </div>
        )}

        {/* Success State */}
        {chargeId && (
          <div className="text-center">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Payment Ready
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Charge ID: {chargeId.slice(0, 8)}...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CoinbaseCommerceCheckout
