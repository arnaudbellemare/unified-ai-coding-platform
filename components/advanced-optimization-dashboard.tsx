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
  RefreshCw
} from 'lucide-react'

interface OptimizationDecision {
  providerId: string;
  providerName: string;
  reason: string;
  confidence: number;
  expectedSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface OptimizationMetrics {
  totalOptimizations: number;
  totalSavings: number;
  averageSavings: number;
  successRate: number;
  failureRate: number;
  lastOptimization: Date;
}

interface ProviderPerformance {
  providerId: string;
  providerName: string;
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  averageCost: number;
  reliability: number;
  performance: number;
  lastUsed: Date;
}

interface OptimizationRule {
  id: string;
  name: string;
  condition: (metrics: OptimizationMetrics) => boolean;
  action: (metrics: OptimizationMetrics) => OptimizationDecision | null;
  priority: number;
  enabled: boolean;
}

export function AdvancedOptimizationDashboard() {
  const [optimizationMetrics, setOptimizationMetrics] = useState<OptimizationMetrics>({
    totalOptimizations: 0,
    totalSavings: 0,
    averageSavings: 0,
    successRate: 0,
    failureRate: 0,
    lastOptimization: new Date()
  })
  
  const [providerPerformance, setProviderPerformance] = useState<ProviderPerformance[]>([])
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationDecision[]>([])
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([])
  const [priceData, setPriceData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      setOptimizationMetrics({
        totalOptimizations: 47,
        totalSavings: 234.56,
        averageSavings: 4.99,
        successRate: 0.94,
        failureRate: 0.06,
        lastOptimization: new Date()
      })

      setProviderPerformance([
        {
          providerId: 'openai-gpt4',
          providerName: 'OpenAI GPT-4',
          totalRequests: 1250,
          successfulRequests: 1235,
          averageResponseTime: 1200,
          averageCost: 0.03,
          reliability: 0.988,
          performance: 0.95,
          lastUsed: new Date()
        },
        {
          providerId: 'anthropic-claude',
          providerName: 'Anthropic Claude',
          totalRequests: 890,
          successfulRequests: 875,
          averageResponseTime: 1450,
          averageCost: 0.032,
          reliability: 0.983,
          performance: 0.92,
          lastUsed: new Date()
        },
        {
          providerId: 'openai-gpt35',
          providerName: 'OpenAI GPT-3.5',
          totalRequests: 2100,
          successfulRequests: 2080,
          averageResponseTime: 800,
          averageCost: 0.002,
          reliability: 0.990,
          performance: 0.90,
          lastUsed: new Date()
        },
        {
          providerId: 'perplexity-sonar-medium',
          providerName: 'Perplexity Sonar Medium',
          totalRequests: 650,
          successfulRequests: 640,
          averageResponseTime: 1100,
          averageCost: 0.015,
          reliability: 0.985,
          performance: 0.92,
          lastUsed: new Date()
        },
        {
          providerId: 'perplexity-sonar-small',
          providerName: 'Perplexity Sonar Small',
          totalRequests: 1200,
          successfulRequests: 1180,
          averageResponseTime: 900,
          averageCost: 0.005,
          reliability: 0.983,
          performance: 0.88,
          lastUsed: new Date()
        }
      ])

      setOptimizationHistory([
        {
          providerId: 'openai-gpt35',
          providerName: 'OpenAI GPT-3.5',
          reason: 'Cost savings: $0.028 per request',
          confidence: 0.85,
          expectedSavings: 0.028,
          riskLevel: 'low'
        },
        {
          providerId: 'anthropic-claude',
          providerName: 'Anthropic Claude',
          reason: 'Better reliability: 0.98 vs 0.95',
          confidence: 0.75,
          expectedSavings: 0,
          riskLevel: 'medium'
        }
      ])

      setOptimizationRules([
        {
          id: 'cost_optimization',
          name: 'Cost-Based Provider Switching',
          condition: () => true,
          action: () => null,
          priority: 1,
          enabled: true
        },
        {
          id: 'performance_optimization',
          name: 'Performance-Based Provider Switching',
          condition: () => true,
          action: () => null,
          priority: 2,
          enabled: true
        },
        {
          id: 'load_balancing',
          name: 'Load Balancing Optimization',
          condition: () => true,
          action: () => null,
          priority: 3,
          enabled: false
        }
      ])

      setPriceData([
        { provider: 'OpenAI GPT-4', price: 0.03, change: -2.1, trend: 'down' },
        { provider: 'Anthropic Claude', price: 0.032, change: 1.5, trend: 'up' },
        { provider: 'OpenAI GPT-3.5', price: 0.002, change: 0, trend: 'stable' },
        { provider: 'Google PaLM 2', price: 0.025, change: -0.8, trend: 'down' },
        { provider: 'Cohere Command', price: 0.015, change: 3.2, trend: 'up' },
        { provider: 'Perplexity Sonar Small', price: 0.005, change: -1.2, trend: 'down' },
        { provider: 'Perplexity Sonar Medium', price: 0.015, change: 0.5, trend: 'stable' },
        { provider: 'Perplexity Sonar Large', price: 0.025, change: 2.1, trend: 'up' }
      ])

      setIsLoading(false)
      setLastUpdate(new Date())
    }

    loadData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleRule = (ruleId: string, enabled: boolean) => {
    setOptimizationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      )
    )
  }

  const forceOptimization = async () => {
    setIsLoading(true)
    // Simulate optimization check
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setLastUpdate(new Date())
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Optimization Engine</h2>
          <p className="text-muted-foreground">
            AI-powered provider switching and cost optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={forceOptimization} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Force Check
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Optimizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.totalOptimizations}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${optimizationMetrics.totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(optimizationMetrics.successRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              -2% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${optimizationMetrics.averageSavings.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">
              per optimization
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provider Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Provider Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {providerPerformance.map((provider) => (
                  <div key={provider.providerId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{provider.providerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {provider.totalRequests} requests • {(provider.reliability * 100).toFixed(1)}% reliability
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${provider.averageCost.toFixed(4)}</div>
                      <div className="text-sm text-muted-foreground">
                        {provider.averageResponseTime}ms
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Price Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {priceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(item.trend)}
                      <div>
                        <div className="font-medium">{item.provider}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.price.toFixed(4)} per request
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${item.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </div>
                      <Badge variant="outline" className={getRiskColor(item.change >= 2 ? 'high' : item.change >= 0 ? 'medium' : 'low')}>
                        {item.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics for each AI provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerPerformance.map((provider) => (
                  <div key={provider.providerId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{provider.providerName}</h3>
                      <Badge variant="outline">
                        {(provider.reliability * 100).toFixed(1)}% reliable
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Requests</div>
                        <div className="font-medium">{provider.totalRequests.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-medium">{(provider.successfulRequests / provider.totalRequests * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Response Time</div>
                        <div className="font-medium">{provider.averageResponseTime}ms</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cost per Request</div>
                        <div className="font-medium">${provider.averageCost.toFixed(4)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Rules</CardTitle>
              <CardDescription>
                Configure automatic optimization rules and triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          Priority {rule.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.id === 'cost_optimization' && 'Automatically switch to cheaper providers when cost savings exceed 10%'}
                        {rule.id === 'performance_optimization' && 'Switch to more reliable providers when current reliability drops below 90%'}
                        {rule.id === 'load_balancing' && 'Distribute load across providers to prevent rate limiting'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`rule-${rule.id}`} className="text-sm">
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id={`rule-${rule.id}`}
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization History</CardTitle>
              <CardDescription>
                Recent optimization decisions and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationHistory.map((decision, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">Switched to {decision.providerName}</h3>
                        <Badge className={getRiskColor(decision.riskLevel)}>
                          {decision.riskLevel} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {decision.reason}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Confidence: {(decision.confidence * 100).toFixed(0)}%</span>
                        {decision.expectedSavings > 0 && (
                          <span className="text-green-600">
                            Savings: ${decision.expectedSavings.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Applied</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
