'use client'

import { useState, useEffect } from 'react'
import { Checkout, CheckoutButton } from '@coinbase/onchainkit/checkout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap, Shield, Sparkles } from 'lucide-react'

interface GEOOptimizedCheckoutProps {
  product: string
  amount: string
  onPaymentSuccess?: (transactionId: string) => void
  aiSessionId?: string
  isAIAgent?: boolean
}

export function GEOOptimizedCheckout({
  product,
  amount,
  onPaymentSuccess,
  aiSessionId,
  isAIAgent = false,
}: GEOOptimizedCheckoutProps) {
  const [chargeId, setChargeId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  // Create dynamic charge on component mount
  useEffect(() => {
    const createDynamicCharge = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/create-dynamic-charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(amount),
            currency: 'USDC',
            metadata: {
              product,
              ai_agent_optimized: isAIAgent,
              geo_tracked: true,
              session_id: aiSessionId,
              checkout_type: 'geo_optimized',
            },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create charge')
        }

        const charge = await response.json()
        setChargeId(charge.id)

        // Track charge creation for AI agents
        if (isAIAgent && aiSessionId) {
          await trackAIAgentInteraction('dynamic_charge_created', {
            chargeId: charge.id,
            product,
            amount,
            sessionId: aiSessionId,
          })
        }
      } catch (error) {
        console.error('Failed to create dynamic charge:', error)
        setPaymentStatus('error')
      } finally {
        setIsLoading(false)
      }
    }

    createDynamicCharge()
  }, [product, amount, isAIAgent, aiSessionId])

  // AI Agent Interaction Tracking
  const trackAIAgentInteraction = async (eventType: string, data: any) => {
    if (!isAIAgent) return

    try {
      await fetch('/api/track-ai-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          sessionId: aiSessionId,
          agentSource: detectAgentSource(),
          checkoutData: data,
          geoOptimized: true,
          url: window.location.href,
        }),
      })
    } catch (error) {
      console.error('AI tracking error:', error)
    }
  }

  // Detect AI agent source
  const detectAgentSource = () => {
    const referrer = document.referrer.toLowerCase()
    if (referrer.includes('chatgpt')) return 'chatgpt'
    if (referrer.includes('perplexity')) return 'perplexity'
    if (referrer.includes('claude')) return 'claude'
    if (referrer.includes('gemini')) return 'gemini'
    if (navigator.userAgent.toLowerCase().includes('ai')) return 'ai_agent'
    return 'unknown'
  }

  // Handle checkout status changes
  const handleCheckoutStatus = async (status: any) => {
    console.log('Checkout status changed:', status)

    if (status.statusName === 'success') {
      setPaymentStatus('success')

      // Track successful payment for AI agents
      if (isAIAgent && aiSessionId) {
        await trackAIAgentInteraction('payment_success', {
          chargeId: status.statusData?.chargeId,
          amount,
          product,
          sessionId: aiSessionId,
          timestamp: new Date().toISOString(),
        })
      }

      // Call success callback
      onPaymentSuccess?.(status.statusData?.chargeId || chargeId)
    } else if (status.statusName === 'error') {
      setPaymentStatus('error')

      // Track payment error for AI agents
      if (isAIAgent && aiSessionId) {
        await trackAIAgentInteraction('payment_error', {
          chargeId,
          amount,
          product,
          sessionId: aiSessionId,
          error: status.statusData?.error || 'Unknown error',
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Creating secure payment link...</p>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your {product} purchase has been completed.</p>
          <Badge className="bg-green-100 text-green-800">Transaction ID: {chargeId.slice(-8)}</Badge>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-4">Please try again or contact support.</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!chargeId) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Failed to initialize payment. Please refresh the page.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          GEO-Optimized Checkout
          {isAIAgent && (
            <Badge variant="secondary" className="ml-2">
              AI Agent
            </Badge>
          )}
        </CardTitle>
        <p className="text-gray-600 text-sm">Secure crypto payment with AI optimization</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">{product}</span>
            <span className="font-bold text-lg">${amount} USDC</span>
          </div>
        </div>

        {/* Base OnchainKit Checkout with Coinbase Branding */}
        <div className="space-y-4">
          <Checkout productId={chargeId}>
            <CheckoutButton coinbaseBranded text={`Pay $${amount} USDC`} />
          </Checkout>

          {/* GEO Features */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
              <Zap className="h-4 w-4" />
              GEO-Optimized Features
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              <div>✓ AI Agent Compatible</div>
              <div>✓ Instant Settlement</div>
              <div>✓ Low Fees (1%)</div>
              <div>✓ Auto USDC Conversion</div>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>AI Optimized</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
