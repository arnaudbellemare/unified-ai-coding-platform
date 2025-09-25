'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, Info, Copy, ExternalLink } from 'lucide-react'

interface EnvironmentConfig {
  status: 'healthy' | 'degraded' | 'error'
  features: {
    database: boolean
    aiGateway: boolean
    vercel: boolean
    github: boolean
    openai: boolean
    anthropic: boolean
    perplexity: boolean
    cursor: boolean
  }
  agents: Record<
    string,
    {
      required: string[]
      optional: string[]
      description: string
    }
  >
  recommendations: {
    availableAgents: string[]
    costOptimized: string
    minimalSetup: string[]
  }
}

export function EnvironmentConfig() {
  const [config, setConfig] = useState<EnvironmentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEnvironmentConfig()
  }, [])

  const fetchEnvironmentConfig = async () => {
    try {
      const response = await fetch('/api/health')
      if (!response.ok) {
        throw new Error('Failed to fetch environment configuration')
      }
      const data = await response.json()
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>Loading configuration...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Configuration Error
          </CardTitle>
          <CardDescription>Unable to load environment configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchEnvironmentConfig} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const availableAgents = config.recommendations.availableAgents
  const costOptimizedAgent = config.recommendations.costOptimized

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(config.status)}
            Environment Status
            <Badge className={getStatusColor(config.status)}>{config.status.toUpperCase()}</Badge>
          </CardTitle>
          <CardDescription>Current environment configuration and available features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(config.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center gap-2">
                {enabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Available AI Agents</CardTitle>
          <CardDescription>Agents you can use based on your current configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(config.agents).map(([agentName, agentConfig]) => {
              const isAvailable = availableAgents.includes(agentName)
              const isCostOptimized = agentName === costOptimizedAgent

              return (
                <div key={agentName} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium capitalize">{agentName}</h4>
                      {isAvailable && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Available
                        </Badge>
                      )}
                      {isCostOptimized && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Cost Optimized
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{agentConfig.description}</p>

                    {agentConfig.required.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-red-600 mb-1">Required:</p>
                        <div className="flex flex-wrap gap-1">
                          {agentConfig.required.map((req) => (
                            <Badge key={req} variant="destructive" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {agentConfig.optional.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Optional:</p>
                        <div className="flex flex-wrap gap-1">
                          {agentConfig.optional.map((opt) => (
                            <Badge key={opt} variant="outline" className="text-xs">
                              {opt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Optimized setup suggestions based on your configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Cost-Optimized Agent:</h4>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {costOptimizedAgent}
            </Badge>
          </div>

          {config.recommendations.minimalSetup.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Minimal Setup Variables:</h4>
              <div className="space-y-2">
                {config.recommendations.minimalSetup.map((variable) => (
                  <div key={variable} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <code className="text-sm">{variable}=your_value_here</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${variable}=your_value_here`)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={() => window.open('/DEPLOYMENT_GUIDE.md', '_blank')} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Deployment Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
