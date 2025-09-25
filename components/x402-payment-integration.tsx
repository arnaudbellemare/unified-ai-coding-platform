'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AP2PaymentModal } from './ap2-payment-modal'
import { PaymentIntent } from '@/lib/ap2/types'
import { DollarSign, Globe, Zap, Shield, CreditCard, Coins, Wallet } from 'lucide-react'

interface X402PaymentIntegrationProps {
  onPaymentSuccess?: (transactionId: string) => void
}

export function X402PaymentIntegration({ onPaymentSuccess }: X402PaymentIntegrationProps) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* x402 Foundation Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-blue-600" />
            x402 Foundation Integration
            <Badge variant="outline" className="ml-auto">
              Internet-Native Money
            </Badge>
          </CardTitle>
          <CardDescription>
            Powered by the x402 Foundation standard for autonomous agent payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="font-medium text-sm">Instant Payments</div>
                <div className="text-xs text-muted-foreground">Real-time processing</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium text-sm">Global Standard</div>
                <div className="text-xs text-muted-foreground">Currency agnostic</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium text-sm">Secure Protocol</div>
                <div className="text-xs text-muted-foreground">Blockchain verified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Supported Payment Methods
          </CardTitle>
          <CardDescription>
            Multiple payment options following x402 Foundation standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Crypto Payments */}
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Coins className="h-6 w-6 text-orange-500" />
                <div>
                  <div className="font-medium">Cryptocurrency</div>
                  <div className="text-sm text-muted-foreground">BTC, ETH, USDC</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Instant settlement</div>
                <div>• Low fees (0.5%)</div>
                <div>• Global accessibility</div>
              </div>
            </div>

            {/* Credit Card Payments */}
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-medium">Credit Cards</div>
                  <div className="text-sm text-muted-foreground">Visa, Mastercard</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Familiar interface</div>
                <div>• 2.9% + $0.30 fee</div>
                <div>• Instant processing</div>
              </div>
            </div>

            {/* Digital Wallets */}
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="h-6 w-6 text-purple-500" />
                <div>
                  <div className="font-medium">Digital Wallets</div>
                  <div className="text-sm text-muted-foreground">Privy, MetaMask</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Web3 native</div>
                <div>• 0.1% fee</div>
                <div>• Self-custody</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Payment Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Execution Pricing</CardTitle>
          <CardDescription>
            Transparent pricing based on agent complexity and x402 Foundation standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium mb-2">Coding Agent</div>
                <div className="text-2xl font-bold text-green-600">$0.05</div>
                <div className="text-sm text-muted-foreground">per execution</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium mb-2">Analytics Agent</div>
                <div className="text-2xl font-bold text-blue-600">$0.03</div>
                <div className="text-sm text-muted-foreground">per execution</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium mb-2">Content Agent</div>
                <div className="text-2xl font-bold text-purple-600">$0.02</div>
                <div className="text-sm text-muted-foreground">per execution</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium mb-2">Support Agent</div>
                <div className="text-2xl font-bold text-orange-600">$0.01</div>
                <div className="text-sm text-muted-foreground">per execution</div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>💡 Internet-Native Money Benefits:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• No geographic restrictions</li>
                  <li>• Instant global settlement</li>
                  <li>• Transparent, predictable pricing</li>
                  <li>• Autonomous agent payments</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <AP2PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentIntent={paymentIntent}
        onPaymentSuccess={(transactionId) => {
          console.log('Payment successful:', transactionId)
          onPaymentSuccess?.(transactionId)
          setIsPaymentModalOpen(false)
        }}
      />
    </div>
  )
}
