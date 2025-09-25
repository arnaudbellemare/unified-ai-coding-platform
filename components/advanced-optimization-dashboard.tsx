'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
  Shield,
  Clock,
  Target,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'

interface OptimizationDecision {
  providerId: string
  providerName: string
  reason: string
  confidence: number
  expectedSavings: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface OptimizationMetrics {
  totalOptimizations: number
  totalSavings: number
  averageSavings: number
  successRate: number
  failureRate: number
  lastOptimization: Date
}

interface ProviderPerformance {
  providerId: string
  providerName: string
  totalRequests: number
  successfulRequests: number
  averageResponseTime: number
  averageCost: number
  reliability: number
  performance: number
  lastUsed: Date
}

interface OptimizationRule {
  id: string
  name: string
  condition: (metrics: OptimizationMetrics) => boolean
  action: (metrics: OptimizationMetrics) => OptimizationDecision | null
  priority: number
  enabled: boolean
}

export function AdvancedOptimizationDashboard() {
  const [optimizationMetrics, setOptimizationMetrics] = useState<OptimizationMetrics>({
    totalOptimizations: 0,
    totalSavings: 0,
    averageSavings: 0,
    successRate: 0,
    failureRate: 0,
    lastOptimization: new Date(),
  })
  const [providerPerformance, setProviderPerformance] = useState<ProviderPerformance[]>([])
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationDecision[]>([])
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([])
  const [priceData, setPriceData] = useState<Record<string, unknown>[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Load real optimization data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch('/api/optimization/advanced')

        if (!response.ok) {
          throw new Error(`Failed to load optimization data: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success) {
          setOptimizationMetrics(data.metrics)
          setProviderPerformance(data.providerPerformance)
          setOptimizationHistory(data.optimizationHistory)
          setRecommendations(data.recommendations)
          setLastUpdate(new Date())
        } else {
          throw new Error(data.error || 'Failed to load optimization data')
        }
      } catch (error) {
        console.error('Failed to load optimization data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load optimization data')

        // Fallback to default data
        setOptimizationMetrics({
          totalOptimizations: 0,
          totalSavings: 0,
          averageSavings: 0,
          successRate: 0,
          failureRate: 0,
          lastOptimization: new Date(),
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const forceOptimization = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/optimization/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_optimization' }),
      })

      if (!response.ok) {
        throw new Error(`Failed to run optimization: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Reload data after optimization
        const reloadResponse = await fetch('/api/optimization/advanced')
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json()
          if (reloadData.success) {
            setOptimizationMetrics(reloadData.metrics)
            setProviderPerformance(reloadData.providerPerformance)
            setOptimizationHistory(reloadData.optimizationHistory)
            setRecommendations(reloadData.recommendations)
          }
        }
        setLastUpdate(new Date())
      } else {
        throw new Error(data.error || 'Optimization failed')
      }
    } catch (error) {
      console.error('Optimization failed:', error)
      setError(error instanceof Error ? error.message : 'Optimization failed')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRule = async (ruleId: string) => {
    try {
      const response = await fetch('/api/optimization/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_rule', ruleId }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Reload data to get updated rules
          const reloadResponse = await fetch('/api/optimization/advanced')
          if (reloadResponse.ok) {
            const reloadData = await reloadResponse.json()
            if (reloadData.success) {
              setOptimizationRules(reloadData.optimizationRules || [])
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading optimization data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
        <span className="text-red-600">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Economy Engine</h2>
          <p className="text-muted-foreground">AI-powered provider switching and cost optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={forceOptimization} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Force Optimization
          </Button>
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Optimizations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.totalOptimizations}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${optimizationMetrics.totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cost reduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${optimizationMetrics.averageSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(optimizationMetrics.successRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Optimization success</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Provider Performance</TabsTrigger>
          <TabsTrigger value="history">Optimization History</TabsTrigger>
          <TabsTrigger value="rules">Optimization Rules</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Optimizations</CardTitle>
                <CardDescription>Latest optimization decisions</CardDescription>
              </CardHeader>
              <CardContent>
                {optimizationHistory.length > 0 ? (
                  <div className="space-y-3">
                    {optimizationHistory.slice(0, 5).map((decision, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{decision.providerName}</div>
                          <div className="text-sm text-muted-foreground">{decision.reason}</div>
                        </div>
                        <div className="text-right">
                          <Badge className={getRiskColor(decision.riskLevel)}>{decision.riskLevel}</Badge>
                          <div className="text-sm text-muted-foreground">${decision.expectedSavings.toFixed(3)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No optimization history available</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Providers</CardTitle>
                <CardDescription>Best performing AI providers</CardDescription>
              </CardHeader>
              <CardContent>
                {providerPerformance.length > 0 ? (
                  <div className="space-y-3">
                    {providerPerformance
                      .sort((a, b) => b.performance - a.performance)
                      .slice(0, 5)
                      .map((provider, index) => (
                        <div
                          key={provider.providerId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{provider.providerName}</div>
                            <div className="text-sm text-muted-foreground">{provider.totalRequests} requests</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{(provider.performance * 100).toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">${provider.averageCost.toFixed(3)} avg</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No provider data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Performance</CardTitle>
              <CardDescription>Detailed performance metrics for all AI providers</CardDescription>
            </CardHeader>
            <CardContent>
              {providerPerformance.length > 0 ? (
                <div className="space-y-4">
                  {providerPerformance.map((provider) => (
                    <div key={provider.providerId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{provider.providerName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {provider.successfulRequests}/{provider.totalRequests} successful requests
                          </p>
                        </div>
                        <Badge variant="outline">{(provider.reliability * 100).toFixed(1)}% reliable</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Avg Response Time</div>
                          <div className="font-medium">{provider.averageResponseTime}ms</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Cost</div>
                          <div className="font-medium">${provider.averageCost.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Performance</div>
                          <div className="font-medium">{(provider.performance * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Used</div>
                          <div className="font-medium">{new Date(provider.lastUsed).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No provider performance data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization History</CardTitle>
              <CardDescription>Complete history of optimization decisions</CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationHistory.length > 0 ? (
                <div className="space-y-3">
                  {optimizationHistory.map((decision, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{decision.providerName}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskColor(decision.riskLevel)}>{decision.riskLevel}</Badge>
                          <Badge variant="outline">{(decision.confidence * 100).toFixed(0)}% confidence</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{decision.reason}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Expected Savings: ${decision.expectedSavings.toFixed(4)}</span>
                        <span>Provider ID: {decision.providerId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No optimization history available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Rules</CardTitle>
              <CardDescription>Configure optimization rules and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationRules.length > 0 ? (
                <div className="space-y-4">
                  {optimizationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">Priority: {rule.priority}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={rule.id} className="text-sm">
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch id={rule.id} checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No optimization rules available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>AI-generated optimization recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No recommendations available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
