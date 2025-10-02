'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Zap, Bot, CreditCard } from 'lucide-react'

interface ChargeResponse {
  id: string
  hosted_url: string
  status: string
  local_price: {
    amount: string
    currency: string
  }
  metadata: any
  geo_optimization: any
}

interface TrackingResponse {
  success: boolean
  message: string
  sessionId: string
  timestamp: string
}

export default function TestDynamicChargePage() {
  const [chargeResponse, setChargeResponse] = useState<ChargeResponse | null>(null)
  const [trackingResponse, setTrackingResponse] = useState<TrackingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const testScenarios = [
    {
      name: 'Basic USDC Payment',
      amount: 25.99,
      product: 'Basic AI Tool',
      metadata: { ai_agent_optimized: true },
    },
    {
      name: 'Enterprise Subscription',
      amount: 299.99,
      product: 'Enterprise AI Platform',
      metadata: {
        ai_agent_optimized: true,
        geo_tracked: true,
        subscription_type: 'annual',
        seats: 50,
      },
    },
    {
      name: 'Dynamic Pricing with Discount',
      amount: 79.99,
      product: 'Premium Analytics',
      metadata: {
        ai_agent_optimized: true,
        geo_tracked: true,
        original_price: 99.99,
        discount_percentage: 20,
        discount_code: 'SAVE20',
      },
    },
    {
      name: 'AI Agent Optimized Purchase',
      amount: 149.99,
      product: 'AI-Powered E-commerce Suite',
      metadata: {
        ai_agent_optimized: true,
        geo_tracked: true,
        agent_source: 'chatgpt',
        session_id: 'ai_session_123',
        user_intent: 'ecommerce_optimization',
      },
    },
  ]

  const testDynamicCharge = async (scenario: any) => {
    setIsLoading(true)
    setChargeResponse(null)
    setTrackingResponse(null)

    try {
      const response = await fetch('/api/create-dynamic-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: scenario.amount,
          currency: 'USDC',
          metadata: {
            product: scenario.product,
            ...scenario.metadata,
          },
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setChargeResponse(result)
        setTestResults((prev) => [...prev, `✅ ${scenario.name}: Charge created successfully`])
      } else {
        setTestResults((prev) => [...prev, `❌ ${scenario.name}: ${result.error}`])
      }
    } catch (error) {
      setTestResults((prev) => [...prev, `❌ ${scenario.name}: Network error`])
    } finally {
      setIsLoading(false)
    }
  }

  const testAITracking = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/track-ai-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment_attempt',
          timestamp: new Date().toISOString(),
          sessionId: 'test_session_' + Date.now(),
          agentSource: 'chatgpt',
          checkoutData: {
            product: 'Test Product',
            amount: '99.99',
          },
          geoOptimized: true,
          url: window.location.href,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setTrackingResponse(result)
        setTestResults((prev) => [...prev, '✅ AI Agent Tracking: Successfully tracked interaction'])
      } else {
        setTestResults((prev) => [...prev, `❌ AI Agent Tracking: ${result.error}`])
      }
    } catch (error) {
      setTestResults((prev) => [...prev, '❌ AI Agent Tracking: Network error'])
    } finally {
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    setTestResults([])

    for (const scenario of testScenarios) {
      await testDynamicCharge(scenario)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay between tests
    }

    await testAITracking()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Dynamic Charge Testing Interface</h1>
          <p className="text-gray-600">Test the dynamic charge API and AI agent tracking functionality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Test Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runAllTests} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <Label>Test Scenarios</Label>
                <div className="space-y-2">
                  {testScenarios.map((scenario, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => testDynamicCharge(scenario)}
                      disabled={isLoading}
                      className="w-full justify-start"
                    >
                      <CreditCard className="h-3 w-3 mr-2" />
                      {scenario.name} - ${scenario.amount}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={testAITracking} disabled={isLoading} variant="outline" className="w-full">
                <Bot className="h-4 w-4 mr-2" />
                Test AI Agent Tracking
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chargeResponse && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Charge Created</h3>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>ID:</strong> {chargeResponse.id}
                      </div>
                      <div>
                        <strong>Amount:</strong> {chargeResponse.local_price.amount}{' '}
                        {chargeResponse.local_price.currency}
                      </div>
                      <div>
                        <strong>Status:</strong> <Badge variant="secondary">{chargeResponse.status}</Badge>
                      </div>
                      <div>
                        <strong>AI Optimized:</strong> {chargeResponse.metadata.ai_agent_optimized ? '✅' : '❌'}
                      </div>
                      <div>
                        <strong>GEO Tracked:</strong> {chargeResponse.metadata.geo_tracked ? '✅' : '❌'}
                      </div>
                      <div className="mt-2">
                        <a
                          href={chargeResponse.hosted_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Open Checkout Page →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {trackingResponse && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">AI Tracking Success</h3>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Session ID:</strong> {trackingResponse.sessionId}
                      </div>
                      <div>
                        <strong>Message:</strong> {trackingResponse.message}
                      </div>
                      <div>
                        <strong>Timestamp:</strong> {new Date(trackingResponse.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Test Log</h3>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-sm ${
                            result.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Create Dynamic Charge</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  <div>POST /api/create-dynamic-charge</div>
                  <div className="text-gray-600 mt-1">
                    {`{
  "amount": 99.99,
  "currency": "USDC",
  "metadata": {
    "product": "AI Tool",
    "ai_agent_optimized": true
  }
}`}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Track AI Interaction</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  <div>POST /api/track-ai-interaction</div>
                  <div className="text-gray-600 mt-1">
                    {`{
  "event": "page_load",
  "sessionId": "session_123",
  "agentSource": "chatgpt",
  "geoOptimized": true
}`}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
