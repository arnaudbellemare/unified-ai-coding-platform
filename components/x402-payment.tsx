'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  DollarSign,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3,
  Wallet,
  Coins,
  Link,
} from 'lucide-react'
import { PrivyWalletConnection } from './privy-wallet-connection-simple'

interface PricingTier {
  id: string
  name: string
  price: number
  currency: string
  period: string
  features: string[]
  limits: {
    apiCalls: number
    tokens: number
    agents: number
  }
  popular?: boolean
}

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'paypal' | 'crypto' | 'bank_transfer' | 'x402'
  name: string
  icon: React.ComponentType
  description: string
  x402Enabled?: boolean
}

interface X402Wallet {
  address: string
  balance: string
  network: 'base-sepolia' | 'base'
  isConnected: boolean
  privyUserId?: string
}

interface X402PaymentProps {
  onPaymentComplete?: (paymentData: Record<string, unknown>) => void
  onSubscriptionChange?: (tier: PricingTier) => void
}

export function X402Payment({ onPaymentComplete, onSubscriptionChange }: X402PaymentProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [x402Wallet, setX402Wallet] = useState<X402Wallet | null>(null)
  const [x402Connected, setX402Connected] = useState(false)
  const [privyWallet, setPrivyWallet] = useState<X402Wallet | null>(null)
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  })

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      currency: 'USD',
      period: 'month',
      features: [
        '100 API calls/month',
        '10,000 tokens/month',
        '1 custom agent',
        'Basic optimization',
        'Community support',
      ],
      limits: {
        apiCalls: 100,
        tokens: 10000,
        agents: 1,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      currency: 'USD',
      period: 'month',
      features: [
        '1,000 API calls/month',
        '100,000 tokens/month',
        '5 custom agents',
        'Enhanced optimization',
        'Priority support',
        'Cost analytics',
      ],
      limits: {
        apiCalls: 1000,
        tokens: 100000,
        agents: 5,
      },
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      currency: 'USD',
      period: 'month',
      features: [
        'Unlimited API calls',
        'Unlimited tokens',
        'Unlimited agents',
        'Advanced optimization',
        '24/7 dedicated support',
        'Advanced analytics',
        'Custom integrations',
        'SLA guarantee',
      ],
      limits: {
        apiCalls: -1, // Unlimited
        tokens: -1, // Unlimited
        agents: -1, // Unlimited
      },
    },
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'x402',
      type: 'x402',
      name: 'X402 Protocol',
      icon: Coins,
      description: 'Accountless payments with x402 protocol',
      x402Enabled: true,
    },
    {
      id: 'credit_card',
      type: 'credit_card',
      name: 'Credit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      icon: DollarSign,
      description: 'Pay with PayPal account',
    },
    {
      id: 'crypto',
      type: 'crypto',
      name: 'Cryptocurrency',
      icon: Zap,
      description: 'Bitcoin, Ethereum, USDC',
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Shield,
      description: 'Direct bank transfer',
    },
  ]

  // Initialize x402 connection
  useEffect(() => {
    const initializeX402 = async () => {
      try {
        // Check if x402 is available
        if (typeof window !== 'undefined' && window.x402) {
          setX402Connected(true)
          // Initialize wallet connection
          const wallet = await window.x402.connect()
          setX402Wallet({
            address: wallet.address,
            balance: wallet.balance,
            network: process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia',
            isConnected: true,
          })
        }
      } catch (error) {
        console.error('Failed to initialize x402:', error)
      }
    }

    initializeX402()
  }, [])

  // Handle Privy wallet connection
  const handlePrivyWalletConnect = (wallet: X402Wallet) => {
    setPrivyWallet(wallet)
    setX402Connected(true)
    setX402Wallet(wallet)
  }

  const handlePrivyWalletDisconnect = () => {
    setPrivyWallet(null)
    setX402Connected(false)
    setX402Wallet(null)
  }

  const handlePayment = async () => {
    if (!selectedTier || !selectedPaymentMethod) return

    setIsProcessing(true)
    try {
      if (selectedPaymentMethod === 'x402' && x402Wallet) {
        // Process x402 payment
        const paymentResult = await processX402Payment(selectedTier, x402Wallet)

        onPaymentComplete?.({
          tier: selectedTier,
          paymentMethod: selectedPaymentMethod,
          x402Payment: paymentResult,
          timestamp: new Date().toISOString(),
        })
      } else {
        // Simulate traditional payment processing
        await new Promise((resolve) => setTimeout(resolve, 3000))

        onPaymentComplete?.({
          tier: selectedTier,
          paymentMethod: selectedPaymentMethod,
          paymentDetails: selectedPaymentMethod === 'credit_card' ? paymentDetails : null,
          timestamp: new Date().toISOString(),
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const processX402Payment = async (tier: PricingTier, wallet: X402Wallet) => {
    try {
      // Use x402 protocol for payment with Privy integration
      const paymentRequest = {
        amount: tier.price,
        currency: 'USDC',
        recipient: process.env.NEXT_PUBLIC_X402_RECIPIENT_ADDRESS,
        network: wallet.network,
        walletAddress: wallet.address,
        privyUserId: wallet.privyUserId,
        paymentMethod: 'privy_x402', // Indicate Privy integration
      }

      // Process payment through x402 protocol with Privy
      const result = await fetch('/api/x402/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest),
      })

      if (!result.ok) {
        throw new Error('X402 payment failed')
      }

      return await result.json()
    } catch (error) {
      console.error('X402 payment error:', error)
      throw error
    }
  }

  const calculateSavings = (tier: PricingTier) => {
    if (tier.id === 'free') return 0

    // Calculate potential savings based on optimization
    const baseCost = 0.03 // $0.03 per 1K tokens
    const optimizedCost = baseCost * 0.5 // 50% savings with optimization
    const monthlySavings = (tier.limits.tokens / 1000) * (baseCost - optimizedCost)

    return Math.round(monthlySavings * 100) / 100
  }

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          X402 Payment Gateway - Cost Optimization Platform
        </CardTitle>
        <CardDescription>Unlock advanced AI optimization features with our flexible pricing tiers</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingTiers.map((tier) => (
                <Card key={tier.id} className={`relative ${tier.popular ? 'ring-2 ring-primary' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      ${tier.price}
                      <span className="text-sm font-normal text-muted-foreground">/{tier.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Features:</h4>
                      <ul className="space-y-1 text-sm">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {tier.id !== 'free' && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Save ~${calculateSavings(tier)}/month with optimization
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      variant={tier.popular ? 'default' : 'outline'}
                      onClick={() => setSelectedTier(tier)}
                    >
                      {tier.id === 'free' ? 'Get Started' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            {selectedTier ? (
              <>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Selected Plan: {selectedTier.name}</h3>
                  <div className="text-2xl font-bold">
                    ${selectedTier.price}/{selectedTier.period}
                  </div>
                  {selectedTier.id !== 'free' && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Estimated savings: ~${calculateSavings(selectedTier)}/month
                    </div>
                  )}
                </div>

                {/* Privy Wallet Connection */}
                {!x402Connected && (
                  <div className="mb-6">
                    <PrivyWalletConnection
                      onWalletConnect={handlePrivyWalletConnect}
                      onWalletDisconnect={handlePrivyWalletDisconnect}
                    />
                  </div>
                )}

                {/* X402 Wallet Status */}
                {x402Connected && x402Wallet && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-900 dark:text-blue-100">
                        {privyWallet ? 'Privy Wallet Connected' : 'X402 Wallet Connected'}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <div>
                        Address: {x402Wallet.address.slice(0, 6)}...{x402Wallet.address.slice(-4)}
                      </div>
                      <div>Balance: {x402Wallet.balance} USDC</div>
                      <div>Network: {x402Wallet.network}</div>
                      {privyWallet?.privyUserId && <div>Privy User ID: {privyWallet.privyUserId.slice(0, 8)}...</div>}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-4">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <Card
                        key={method.id}
                        className={`cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                        } ${method.x402Enabled && !x402Connected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (method.x402Enabled && !x402Connected) return
                          setSelectedPaymentMethod(method.id)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6">{React.createElement(method.icon)}</div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {method.name}
                                {method.x402Enabled && (
                                  <Badge variant="outline" className="text-xs">
                                    X402
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
                              {method.x402Enabled && !x402Connected && (
                                <div className="text-xs text-orange-600 mt-1">X402 wallet not connected</div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedPaymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails((prev) => ({ ...prev, cardNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input
                          id="card-name"
                          placeholder="John Doe"
                          value={paymentDetails.name}
                          onChange={(e) => setPaymentDetails((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => setPaymentDetails((prev) => ({ ...prev, expiryDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails((prev) => ({ ...prev, cvv: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handlePayment} disabled={isProcessing || !selectedPaymentMethod} className="w-full">
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Please select a pricing plan first.</div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$127.50</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tokens Optimized</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4M</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">API Calls Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Optimization Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost Reduction</span>
                    <Badge variant="outline">45% average</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Token Efficiency</span>
                    <Badge variant="outline">38% improvement</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Quality</span>
                    <Badge variant="outline">97% maintained</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
