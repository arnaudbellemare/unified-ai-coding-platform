'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Zap,
  DollarSign,
  TrendingUp,
  Brain,
  Activity,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useFastAPIOptimization, useFastAPIAnalytics } from '@/lib/fastapi-hooks'
import { type FastAPIProvider } from '@/lib/fastapi-integration'
import { toast } from 'sonner'

interface FastAPIOptimizationDashboardProps {
  className?: string
}

export function FastAPIOptimizationDashboard({ className }: FastAPIOptimizationDashboardProps) {
  const [prompt, setPrompt] = useState('')
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const { optimizePrompt, analytics, isLoading, error } = useFastAPIOptimization()
  const { analytics: realtimeAnalytics, providers, isConnected, refresh } = useFastAPIAnalytics()

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to optimize')
      return
    }

    setIsOptimizing(true)
    setOptimizationResult(null)

    try {
      const result = await optimizePrompt({
        prompt,
        context: 'coding',
        budget: 0.05,
        quality_threshold: 0.95,
        optimization_strategy: 'auto',
      })

      if (result) {
        setOptimizationResult(result)
        toast.success(`Optimization completed! ${(result.cost_reduction * 100).toFixed(1)}% cost reduction`)
      } else {
        toast.error('Optimization failed')
      }
    } catch (error) {
      console.error('Optimization error:', error)
      toast.error('Failed to optimize prompt')
    } finally {
      setIsOptimizing(false)
    }
  }

  const getComplexityColor = (score: number) => {
    if (score > 0.7) return 'text-red-600'
    if (score > 0.4) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600'
    if (confidence > 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={className}>
      <Tabs defaultValue="optimize" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="optimize">ML Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Real-time Analytics</TabsTrigger>
          <TabsTrigger value="providers">Provider Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="optimize" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Advanced ML Optimization
                  </CardTitle>
                  <CardDescription>
                    Powered by FastAPI backend with scikit-learn and real-time analytics
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Wifi className="h-3 w-3 mr-1" />
                      FastAPI Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Using Local Optimization
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      FastAPI backend is not running. Using local optimization with fallback data.
                      <br />
                      <span className="text-xs text-yellow-600">
                        To enable advanced ML optimization, start the FastAPI backend:{' '}
                        <code>cd optimization-backend && ./start.sh</code>
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Enter your prompt for ML optimization:</label>
                <Textarea
                  placeholder="Create a React component for user authentication with JWT tokens..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button onClick={handleOptimize} disabled={isOptimizing || !prompt.trim()} className="w-full">
                {isOptimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing with ML...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize with FastAPI
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {optimizationResult && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Optimization Complete</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-green-600 font-medium">Cost Reduction</div>
                        <div className="text-lg font-bold text-gray-900">
                          {(optimizationResult.cost_reduction * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-green-600 font-medium">Quality Score</div>
                        <div className="text-lg font-bold text-gray-900">
                          {(optimizationResult.quality_score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-green-600 font-medium">Confidence</div>
                        <div
                          className={`text-lg font-bold ${getConfidenceColor(optimizationResult.ml_insights.confidence)}`}
                        >
                          {(optimizationResult.ml_insights.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-green-600 font-medium">Complexity</div>
                        <div
                          className={`text-lg font-bold ${getComplexityColor(optimizationResult.ml_insights.complexity_score)}`}
                        >
                          {(optimizationResult.ml_insights.complexity_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Original Prompt</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{optimizationResult.original_prompt}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {optimizationResult.token_analysis.original_tokens} tokens
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Optimized Prompt</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{optimizationResult.optimized_prompt}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {optimizationResult.token_analysis.optimized_tokens} tokens (
                          {optimizationResult.token_analysis.reduction_percentage.toFixed(1)}% reduction)
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">ML Optimization Strategies:</div>
                    <div className="flex flex-wrap gap-2">
                      {optimizationResult.optimization_strategies.map((strategy: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {strategy.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Real-time Analytics
                  </CardTitle>
                  <CardDescription>Live performance metrics from FastAPI backend</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refresh}>
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {realtimeAnalytics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{realtimeAnalytics.total_optimizations}</div>
                    <div className="text-sm text-muted-foreground">Total Optimizations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(realtimeAnalytics.average_savings * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${realtimeAnalytics.total_savings.toFixed(4)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(realtimeAnalytics.success_rate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No analytics data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Provider Performance
              </CardTitle>
              <CardDescription>AI provider performance metrics and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {providers.length > 0 ? (
                <div className="space-y-4">
                  {providers.map((provider: FastAPIProvider) => (
                    <div key={provider.provider_id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{provider.provider_id}</div>
                        <Badge variant="outline">{(provider.recommendation_score * 100).toFixed(0)}% Recommended</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Cost/Token</div>
                          <div className="font-medium">${provider.cost_per_token}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Quality</div>
                          <div className="font-medium">{(provider.quality_score * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Response Time</div>
                          <div className="font-medium">{provider.response_time}s</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Reliability</div>
                          <div className="font-medium">{(provider.reliability * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No provider data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
