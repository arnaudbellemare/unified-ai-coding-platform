'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Zap,
  DollarSign,
  Brain,
  CreditCard,
  TrendingUp,
  Activity,
  Settings,
  BarChart3,
  Target,
  Sparkles,
} from 'lucide-react'

interface OptimizationResult {
  success: boolean
  optimization: {
    strategy: string
    originalPrompt: string
    optimizedPrompt: string
    tokenReduction: number
    costReduction: number
    qualityImprovement: number
    executionTime: number
    reliability: number
    score: number
  }
  breakdown: {
    tokenSavings: {
      original: number
      optimized: number
      reduction: number
      percentage: number
    }
    costSavings: {
      original: number
      optimized: number
      reduction: number
      percentage: number
      monthlyProjection: number
    }
    qualityMetrics: {
      accuracy: number
      completeness: number
      efficiency: number
    }
  }
  recommendations: {
    bestFor: string[]
    avoidFor: string[]
    nextSteps: string[]
  }
  metadata: {
    optimizer: string
    timestamp: string
    version: string
    processingTime: number
  }
}

interface AIResponse {
  success: boolean
  response: {
    content: string
    model: string
    tokens: {
      prompt: number
      completion: number
      total: number
    }
    cost: {
      prompt: number
      completion: number
      total: number
    }
  }
  optimization?: {
    applied: boolean
    strategy: string
    originalPrompt: string
    optimizedPrompt: string
    savings: {
      tokens: number
      cost: number
      percentage: number
    }
  }
  metadata: {
    provider: string
    timestamp: string
    version: string
    processingTime: number
  }
}

interface PaymentResult {
  success: boolean
  payment: {
    id: string
    amount: number
    currency: string
    status: string
    method: string
    transactionHash?: string
    receipt?: string
  }
  costBreakdown: {
    baseCost: number
    networkFees: number
    platformFees: number
    totalCost: number
    savings: number
  }
  optimization: {
    applied: boolean
    strategy: string
    tokenReduction: number
    costReduction: number
  }
  metadata: {
    timestamp: string
    version: string
    provider: string
  }
}

export default function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState('optimize')
  const [prompt, setPrompt] = useState('')
  const [task, setTask] = useState('')
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [currentModelProviders, setCurrentModelProviders] = useState<any[]>([])

  useEffect(() => {
    loadSystemStats()
    loadAvailableModels()
  }, [])

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('/api/unified/ai?action=models')
      const data = await response.json()
      if (data.success) {
        setAvailableModels(data.models)
        // Set default model if none selected
        if (!selectedModel && data.models.length > 0) {
          setSelectedModel(data.models[0].id)
          // Set providers for the default model
          setCurrentModelProviders(data.models[0].providers || [])
          if (data.models[0].recommendedProvider) {
            setSelectedProvider(data.models[0].recommendedProvider)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    const model = availableModels.find(m => m.id === modelId)
    if (model) {
      setCurrentModelProviders(model.providers || [])
      setSelectedProvider(model.recommendedProvider || 'auto')
    }
  }

  const loadSystemStats = async () => {
    try {
      const [optimizationStats, aiStats, paymentStats] = await Promise.all([
        fetch('/api/unified/optimize').then((res) => res.json()),
        fetch('/api/unified/ai').then((res) => res.json()),
        fetch('/api/unified/payment').then((res) => res.json()),
      ])

      setSystemStats({
        optimization: optimizationStats.stats,
        ai: aiStats.stats,
        payment: paymentStats.stats,
      })
    } catch (error) {
      console.error('Failed to load system stats:', error)
    }
  }

  const handleOptimize = async () => {
    if (!prompt || !task) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/unified/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          task,
          context: {
            priority: 'balanced',
          },
          preferences: {
            preferredOptimizer: 'auto',
          },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setOptimizationResult(data.result)
      }
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!prompt || !task) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/unified/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          task,
          model: selectedModel,
          provider: selectedProvider, // Include provider selection as requested in big-AGI issue #826
          optimization: {
            enabled: true,
            strategy: 'auto',
          },
          context: {
            priority: 'balanced',
          },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setAIResponse(data.result)
      }
    } catch (error) {
      console.error('AI generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/unified/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 10.0,
          currency: 'USD',
          purpose: 'optimization',
          paymentMethod: 'x402',
          metadata: {
            optimizationType: optimizationResult?.optimization.strategy || 'general',
            tokenCount: optimizationResult?.optimization.tokenReduction || 0,
          },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPaymentResult(data.result)
      }
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Unified AI Platform
        </h1>
        <p className="text-gray-600 text-lg">All-in-one system for AI optimization, generation, and payments</p>
      </div>

      {/* System Stats */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Optimizations</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.optimization?.totalOptimizations || 0}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.optimization?.successRate?.toFixed(1) || 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.ai?.totalRequests || 0}</div>
              <p className="text-xs text-muted-foreground">{systemStats.ai?.totalTokens || 0} tokens processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${systemStats.payment?.totalVolume?.toFixed(2) || 0}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.payment?.successRate?.toFixed(1) || 0}% success rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="pay">Payment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Optimization Tab */}
        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Unified Optimization
              </CardTitle>
              <CardDescription>Optimize your prompts using our intelligent routing system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt</label>
                <Textarea
                  placeholder="Enter your prompt to optimize..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Task Description</label>
                <Input
                  placeholder="Describe the task or context..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
              </div>

              <Button onClick={handleOptimize} disabled={isLoading || !prompt || !task} className="w-full">
                {isLoading ? 'Optimizing...' : 'Optimize Prompt'}
              </Button>
            </CardContent>
          </Card>

          {/* Optimization Results */}
          {optimizationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Optimization Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimizationResult.breakdown.tokenSavings.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Token Reduction</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${optimizationResult.breakdown.costSavings.reduction.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600">Cost Savings</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{optimizationResult.optimization.score}</div>
                    <div className="text-sm text-gray-600">Optimization Score</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Optimized Prompt:</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {optimizationResult.optimization.optimizedPrompt}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations:</h4>
                  <div className="space-y-1">
                    {optimizationResult.recommendations.bestFor.map((rec, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Generation Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Generation
              </CardTitle>
              <CardDescription>Generate AI responses with automatic optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt</label>
                <Textarea
                  placeholder="Enter your prompt for AI generation..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Task Description</label>
                <Input
                  placeholder="Describe the task or context..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select AI Model</label>
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-gray-500">
                            ${model.pricing?.prompt || 0}/1M tokens • {model.context_length?.toLocaleString() || 'N/A'} context
                            {model.supportsProviderSelection && (
                              <span className="text-green-600 ml-1">• Provider Selection Available</span>
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Provider Selection - as requested in big-AGI issue #826 */}
              {currentModelProviders.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Provider</label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex flex-col">
                          <span className="font-medium">Auto (Recommended)</span>
                          <span className="text-xs text-gray-500">Let OpenRouter choose the best provider</span>
                        </div>
                      </SelectItem>
                      {currentModelProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{provider.name}</span>
                            <span className="text-xs text-gray-500">
                              {provider.latency}ms latency • {Math.round(provider.reliability * 100)}% reliability
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleAIGenerate}
                disabled={isLoading || !prompt || !task || !selectedModel}
                className="w-full"
              >
                {isLoading ? 'Generating...' : 'Generate AI Response'}
              </Button>
            </CardContent>
          </Card>

          {/* AI Results */}
          {aiResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  AI Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{aiResponse.response.model}</div>
                    <div className="text-sm text-gray-600">Model Used</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{aiResponse.response.tokens.total}</div>
                    <div className="text-sm text-gray-600">Total Tokens</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ${aiResponse.response.cost.total.toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Response:</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">{aiResponse.response.content}</div>
                </div>

                {aiResponse.optimization && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Optimization Applied:</h4>
                    <div className="p-3 bg-green-50 rounded-lg text-sm">
                      <div className="font-medium">Strategy: {aiResponse.optimization.strategy}</div>
                      <div>
                        Token Savings: {aiResponse.optimization.savings.tokens} (
                        {aiResponse.optimization.savings.percentage.toFixed(1)}%)
                      </div>
                      <div>Cost Savings: ${aiResponse.optimization.savings.cost.toFixed(4)}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="pay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Unified Payment
              </CardTitle>
              <CardDescription>Process payments with automatic optimization and multi-protocol support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input placeholder="10.00" defaultValue="10.00" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Input placeholder="USD" defaultValue="USD" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Purpose</label>
                <Input placeholder="optimization" defaultValue="optimization" />
              </div>

              <Button onClick={handlePayment} disabled={isLoading} className="w-full">
                {isLoading ? 'Processing...' : 'Process Payment'}
              </Button>
            </CardContent>
          </Card>

          {/* Payment Results */}
          {paymentResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${paymentResult.payment.amount}</div>
                    <div className="text-sm text-gray-600">Amount Paid</div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{paymentResult.payment.method.toUpperCase()}</div>
                    <div className="text-sm text-gray-600">Payment Method</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Cost Breakdown:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Cost:</span>
                      <span>${paymentResult.costBreakdown.baseCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Fees:</span>
                      <span>${paymentResult.costBreakdown.networkFees.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fees:</span>
                      <span>${paymentResult.costBreakdown.platformFees.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Cost:</span>
                      <span>${paymentResult.costBreakdown.totalCost.toFixed(4)}</span>
                    </div>
                  </div>
                </div>

                {paymentResult.payment.transactionHash && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Transaction Hash:</h4>
                    <div className="p-2 bg-gray-50 rounded text-xs font-mono">
                      {paymentResult.payment.transactionHash}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Analytics
              </CardTitle>
              <CardDescription>View comprehensive analytics across all unified services</CardDescription>
            </CardHeader>
            <CardContent>
              {systemStats ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Optimization Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Optimizations:</span>
                        <span>{systemStats.optimization?.totalOptimizations || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span>{systemStats.optimization?.successRate?.toFixed(1) || 0}%</span>
                      </div>
                      <Progress value={systemStats.optimization?.successRate || 0} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">AI Generation</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Requests:</span>
                        <span>{systemStats.ai?.totalRequests || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tokens Processed:</span>
                        <span>{systemStats.ai?.totalTokens || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span>{systemStats.ai?.successRate?.toFixed(1) || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Payment Processing</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Volume:</span>
                        <span>${systemStats.payment?.totalVolume?.toFixed(2) || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span>{systemStats.payment?.successRate?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Active Users:</span>
                        <span>{systemStats.payment?.activeUsers || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Loading system analytics...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
