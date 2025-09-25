'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaymentIntent, PaymentProvider, PaymentMethod } from '@/lib/ap2/types'
import { ap2Service } from '@/lib/ap2/service'
import { CreditCard, Wallet, Coins, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AP2PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentIntent: PaymentIntent | null
  onPaymentSuccess: (transactionId: string) => void
}

export function AP2PaymentModal({ isOpen, onClose, paymentIntent, onPaymentSuccess }: AP2PaymentModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [walletAddress, setWalletAddress] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchProviders()
    }
  }, [isOpen])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/ap2/payments?action=providers')
      const data = await response.json()
      if (data.success) {
        setProviders(data.providers)
        // Auto-select first provider
        if (data.providers.length > 0) {
          setSelectedProvider(data.providers[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
      toast.error('Failed to load payment providers')
    }
  }

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
    const provider = providers.find(p => p.id === providerId)
    if (provider) {
      setPaymentMethod({
        type: provider.type,
        provider: provider.id,
        details: {},
      })
    }
  }

  const handlePayment = async () => {
    if (!paymentIntent || !paymentMethod || !selectedProvider) {
      toast.error('Please select a payment method')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/ap2/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_payment',
          paymentId: paymentIntent.id,
          paymentMethod,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Payment completed successfully!')
        onPaymentSuccess(data.paymentResponse.transactionId)
        onClose()
      } else {
        toast.error(data.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider.type) {
      case 'crypto':
        return <Coins className="h-5 w-5" />
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />
      case 'wallet':
        return <Wallet className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  const getProviderDescription = (provider: PaymentProvider) => {
    switch (provider.type) {
      case 'crypto':
        return 'Pay with cryptocurrency'
      case 'credit_card':
        return 'Pay with credit or debit card'
      case 'wallet':
        return 'Pay with digital wallet'
      default:
        return 'Pay online'
    }
  }

  if (!paymentIntent) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Required
          </DialogTitle>
          <DialogDescription>
            Complete payment to proceed with your AI agent execution
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Agent Execution</span>
                <span className="font-medium">${paymentIntent.amount} {paymentIntent.currency}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {paymentIntent.description}
              </div>
            </CardContent>
          </Card>

          {/* Payment Providers */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <Select value={selectedProvider} onValueChange={handleProviderSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose payment method" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-3">
                      {getProviderIcon(provider)}
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getProviderDescription(provider)}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider Details */}
          {selectedProvider && (
            <Card>
              <CardContent className="pt-4">
                {(() => {
                  const provider = providers.find(p => p.id === selectedProvider)
                  if (!provider) return null

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(provider)}
                        <span className="font-medium">{provider.name}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Fees: {provider.fees.percentage}% + ${provider.fees.fixed}</div>
                        <div>Supported: {provider.supportedCurrencies.join(', ')}</div>
                      </div>

                      {provider.type === 'crypto' && (
                        <div className="space-y-2">
                          <Label htmlFor="wallet-address">Wallet Address (Optional)</Label>
                          <Input
                            id="wallet-address"
                            placeholder="Enter your wallet address"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={!selectedProvider || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `Pay $${paymentIntent.amount}`}
            </Button>
          </div>

          {/* x402 Protocol Badge */}
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              Powered by x402 Foundation & AP2 Protocol
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
