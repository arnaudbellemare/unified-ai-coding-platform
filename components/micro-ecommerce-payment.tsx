'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShoppingCart, 
  CreditCard, 
  Coins, 
  DollarSign, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Wallet,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentMethod {
  id: 'credits' | 'crypto' | 'fiat'
  name: string
  icon: any
  cost: string
  speed: string
  fees: string
  description: string
  recommended?: boolean
}

export function MicroEcommercePayment() {
  const [selectedProduct, setSelectedProduct] = useState<{
    name: string
    price: number
    description: string
  } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'credits' | 'crypto' | 'fiat'>('credits')
  const [creditBalance, setCreditBalance] = useState(15.50)
  const [isProcessing, setIsProcessing] = useState(false)

  const products = [
    { name: 'Arduino Sensor Kit', price: 8.99, description: 'Complete sensor kit for IoT projects' },
    { name: 'Raspberry Pi Case', price: 4.50, description: 'Protective case with cooling fan' },
    { name: 'USB-C Cable', price: 2.99, description: 'High-speed data cable' },
    { name: 'LED Strip', price: 6.75, description: 'WS2812B addressable LED strip' },
    { name: 'Breadboard Kit', price: 3.25, description: '400-point breadboard with jumper wires' }
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credits',
      name: 'Credit Account',
      icon: Wallet,
      cost: 'Free',
      speed: 'Instant',
      fees: '0% (prepaid)',
      description: 'Use prepaid credits - no per-transaction fees',
      recommended: true
    },
    {
      id: 'crypto',
      name: 'Crypto (x402)',
      icon: Coins,
      cost: 'Low',
      speed: '5 min',
      fees: '0.5% + $0.01',
      description: 'Direct crypto payment with minimal fees'
    },
    {
      id: 'fiat',
      name: 'Card/Bank',
      icon: CreditCard,
      cost: 'Medium',
      speed: '1 hour',
      fees: '2.9% + $0.30',
      description: 'Traditional payment with higher fees'
    }
  ]

  const handleProductSelect = (product: typeof products[0]) => {
    setSelectedProduct(product)
  }

  const handlePayment = async () => {
    if (!selectedProduct) return

    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success(`Payment successful! ${selectedProduct.name} ordered for $${selectedProduct.price}`)
      setIsProcessing(false)
      setSelectedProduct(null)
    }, 2000)
  }

  const topUpCredits = () => {
    setCreditBalance(prev => prev + 20)
    toast.success('Credits topped up with $20')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            Micro E-commerce Payment System
          </CardTitle>
          <CardDescription>
            Optimized for &lt;$10 USD physical goods with minimal overhead and fast settlement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Payment Overhead Solution:</strong> Use credit accounts to eliminate per-transaction 
              fees. Pre-pay $20-50 in credits and make unlimited &lt;$10 purchases with zero additional fees.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Product</CardTitle>
              <CardDescription>Choose from our micro electronics catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <Button
                    key={product.name}
                    variant={selectedProduct?.name === product.name ? "default" : "outline"}
                    className="h-auto p-4 justify-start"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.description}</div>
                      <div className="text-lg font-bold text-green-600">${product.price}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Options */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how to pay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon
                return (
                  <Button
                    key={method.id}
                    variant={paymentMethod === method.id ? "default" : "outline"}
                    className="w-full justify-start gap-3 h-auto p-4"
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <IconComponent className="h-5 w-5" />
                    <div className="text-left flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {method.name}
                        {method.recommended && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {method.fees} • {method.speed}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Credit Balance */}
          {paymentMethod === 'credits' && (
            <Card className="mt-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Credit Balance</span>
                  <span className="text-lg font-bold text-green-600">
                    ${creditBalance.toFixed(2)}
                  </span>
                </div>
                <Button onClick={topUpCredits} size="sm" className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Top Up $20
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Processing */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedProduct.name}</div>
                <div className="text-sm text-muted-foreground">{selectedProduct.description}</div>
              </div>
              <div className="text-lg font-bold">${selectedProduct.price}</div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span>Payment Method</span>
                <span className="font-medium">
                  {paymentMethods.find(m => m.id === paymentMethod)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span>Fees</span>
                <span className="font-medium">
                  {paymentMethod === 'credits' ? '$0.00' :
                   paymentMethod === 'crypto' ? `$${(selectedProduct.price * 0.005 + 0.01).toFixed(3)}` :
                   `$${(selectedProduct.price * 0.029 + 0.30).toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span>Settlement Time</span>
                <span className="font-medium">
                  {paymentMethod === 'credits' ? 'Instant' :
                   paymentMethod === 'crypto' ? '5 minutes' :
                   '1 hour'}
                </span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>
                  ${paymentMethod === 'credits' ? selectedProduct.price.toFixed(2) :
                    paymentMethod === 'crypto' ? (selectedProduct.price * 1.005 + 0.01).toFixed(2) :
                    (selectedProduct.price * 1.029 + 0.30).toFixed(2)}
                </span>
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={isProcessing || (paymentMethod === 'credits' && creditBalance < selectedProduct.price)}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Purchase
                </>
              )}
            </Button>

            {paymentMethod === 'credits' && creditBalance < selectedProduct.price && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient credits. Top up your account to continue.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Comparison</CardTitle>
          <CardDescription>See how much you save with different payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <method.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Fees:</span>
                    <span>{method.fees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span>{method.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best for:</span>
                    <span className="text-right">
                      {method.id === 'credits' ? 'Frequent buyers' :
                       method.id === 'crypto' ? 'Crypto users' :
                       'One-time buyers'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
