'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { usePrivy } from '@privy-io/react-auth'
import { Wallet, CreditCard, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface PaymentTestResult {
  success: boolean
  message: string
  transactionId?: string
  amount?: number
  currency?: string
  network?: string
  status?: string
}

export function PaymentProtocolTester() {
  const { user, authenticated, login, logout } = usePrivy()
  const [isLoading, setIsLoading] = useState(false)
  const [testAmount, setTestAmount] = useState('0.01')
  const [result, setResult] = useState<PaymentTestResult | null>(null)
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4')
  const [testPrompt, setTestPrompt] = useState('Write a simple hello world function in JavaScript')

  const testPaymentProtocol = async () => {
    if (!authenticated || !user) {
      alert('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // Step 1: Test payment requirement detection
      console.log('🧪 Testing payment requirement detection...')

      const paymentRequest = {
        amount: parseFloat(testAmount),
        currency: 'USDC',
        recipient: process.env.NEXT_PUBLIC_X402_RECIPIENT_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        network: 'base-sepolia',
        walletAddress: user.wallet?.address,
        privyUserId: user.id,
        paymentMethod: 'privy_x402',
        model: selectedModel,
        prompt: testPrompt,
      }

      // Test x402 payment endpoint
      const response = await fetch('/api/x402/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: 'Payment protocol test successful!',
          transactionId: data.payment?.transactionId,
          amount: data.payment?.amount,
          currency: data.payment?.currency,
          network: data.payment?.network,
          status: data.payment?.status,
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Payment test failed',
        })
      }
    } catch (error) {
      console.error('Payment test error:', error)
      setResult({
        success: false,
        message: `Payment test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAIProcessing = async () => {
    if (!authenticated || !user) {
      alert('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      console.log('🧪 Testing AI processing with payment...')

      const response = await fetch('/api/process-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          task: 'coding',
          model: selectedModel,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: 'AI processing completed successfully!',
          amount: data.summary?.totalCost || 0,
          currency: 'USD',
        })
      } else if (response.status === 402) {
        setResult({
          success: false,
          message: `Payment required: $${data.amount} ${data.currency}. This is expected for paid models!`,
          amount: data.amount,
          currency: data.currency,
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'AI processing test failed',
        })
      }
    } catch (error) {
      console.error('AI processing test error:', error)
      setResult({
        success: false,
        message: `AI processing test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    if (success) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Payment Protocol Tester
          </CardTitle>
          <CardDescription>
            Test the x402 payment protocol and AI processing with Privy wallet integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Status */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {authenticated && user ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-900">
                  Connected: {user.wallet?.address?.slice(0, 6)}...{user.wallet?.address?.slice(-4)}
                </span>
                <Badge variant="secondary" className="ml-auto">
                  Base Network
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Not connected</span>
                <Button size="sm" onClick={login} className="ml-auto">
                  Connect Wallet
                </Button>
              </>
            )}
          </div>

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Test Amount (USDC)</label>
              <Input
                type="number"
                step="0.01"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">AI Model</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="openai/gpt-4">OpenAI GPT-4 (Paid)</option>
                <option value="anthropic/claude-3-opus">Claude 3 Opus (Paid)</option>
                <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</option>
                <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 (Free)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Test Prompt</label>
            <Input
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter your test prompt here..."
            />
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button onClick={testPaymentProtocol} disabled={!authenticated || isLoading} className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Test x402 Payment
            </Button>
            <Button
              onClick={testAIProcessing}
              disabled={!authenticated || isLoading}
              variant="outline"
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Test AI Processing
            </Button>
          </div>

          {/* Results */}
          {result && (
            <Card className={`border-l-4 ${result.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(result.success)}
                  Test Result
                  <Badge className={getStatusColor(result.success)}>{result.success ? 'SUCCESS' : 'FAILED'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-2">{result.message}</p>
                {result.transactionId && (
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>
                      <strong>Transaction ID:</strong> {result.transactionId}
                    </p>
                    <p>
                      <strong>Amount:</strong> {result.amount} {result.currency}
                    </p>
                    <p>
                      <strong>Network:</strong> {result.network}
                    </p>
                    <p>
                      <strong>Status:</strong> {result.status}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                Testing Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs space-y-1 text-blue-800">
                <p>
                  1. <strong>Connect Wallet:</strong> Click "Connect Wallet" to link your Base Sepolia wallet
                </p>
                <p>
                  2. <strong>Test Payment:</strong> Click "Test x402 Payment" to simulate a payment
                </p>
                <p>
                  3. <strong>Test AI Processing:</strong> Click "Test AI Processing" to test with paid models
                </p>
                <p>
                  4. <strong>Expected Behavior:</strong> Paid models should return HTTP 402 (Payment Required)
                </p>
                <p>
                  5. <strong>Free Models:</strong> Should process successfully without payment
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
