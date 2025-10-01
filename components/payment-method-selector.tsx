'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Wallet, Zap, CheckCircle, ArrowRight } from 'lucide-react'

interface PaymentMethod {
  id: 'stripe' | 'x402'
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  badge?: string
  recommended?: boolean
}

interface PaymentMethodSelectorProps {
  onSelect: (method: 'stripe' | 'x402') => void
  selectedMethod?: 'stripe' | 'x402'
  disabled?: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Traditional card payments with full checkout experience',
    icon: <CreditCard className="h-6 w-6" />,
    features: [
      'Credit & Debit Cards',
      'Apple Pay & Google Pay',
      'Full checkout flow',
      'Tax calculation',
      'Shipping collection',
      'Promo codes support',
    ],
    badge: 'Vercel Marketplace',
    recommended: true,
  },
  {
    id: 'x402',
    name: 'x402 Protocol',
    description: 'Next-gen micro-payments with crypto wallet integration',
    icon: <Wallet className="h-6 w-6" />,
    features: [
      'Crypto wallet payments',
      'Micro-transactions',
      'Base network integration',
      'Gas-free transactions',
      'Real-time settlement',
      'AI agent compatible',
    ],
    badge: 'Free Gas Fees',
  },
]

export function PaymentMethodSelector({ onSelect, selectedMethod, disabled }: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<'stripe' | 'x402' | undefined>(selectedMethod)

  const handleSelect = (method: 'stripe' | 'x402') => {
    if (disabled) return
    setSelected(method)
    onSelect(method)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>
        <p className="text-sm text-gray-600 mt-1">Select your preferred payment option</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 ${
              selected === method.id
                ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50'
                : 'hover:shadow-md border-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleSelect(method.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selected === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {method.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{method.name}</CardTitle>
                    {method.recommended && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        <Zap className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
                {selected === method.id && <CheckCircle className="h-5 w-5 text-blue-500" />}
              </div>

              {method.badge && (
                <Badge variant="outline" className="w-fit text-xs">
                  {method.badge}
                </Badge>
              )}

              <CardDescription className="text-sm">{method.description}</CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-2">
                {method.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {selected === method.id && (
                <Button
                  size="sm"
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(method.id)
                  }}
                >
                  Continue with {method.name}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>
          💡 <strong>Tip:</strong> Stripe is great for traditional e-commerce, while x402 excels for AI agents and
          micro-payments
        </p>
      </div>
    </div>
  )
}
