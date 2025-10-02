'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Settings, Cloud, Key } from 'lucide-react'

interface AP2Config {
  useVertexAI: boolean
  cloudProject: string
  cloudLocation: string
  apiKey: string
  vertexAIKey: string
  hasCredentials: boolean
}

export function AP2Config() {
  const [config, setConfig] = useState<AP2Config>({
    useVertexAI: false,
    cloudProject: '',
    cloudLocation: 'global',
    apiKey: '',
    vertexAIKey: '',
    hasCredentials: false,
  })

  const [status, setStatus] = useState<{
    vertexAI: 'checking' | 'connected' | 'error'
    apiKey: 'checking' | 'valid' | 'invalid' | 'error'
    overall: 'checking' | 'ready' | 'error'
  }>({
    vertexAI: 'checking',
    apiKey: 'checking',
    overall: 'checking',
  })

  useEffect(() => {
    checkAP2Status()
  }, [])

  const checkAP2Status = async () => {
    try {
      // Check current configuration
      const response = await fetch('/api/ap2/config')
      const data = await response.json()

      setConfig(data.config)
      setStatus(data.status)
    } catch (error) {
      console.error('Failed to check AP2 status:', error)
      setStatus({
        vertexAI: 'error',
        apiKey: 'error',
        overall: 'error',
      })
    }
  }

  const updateConfig = async (updates: Partial<AP2Config>) => {
    try {
      const response = await fetch('/api/ap2/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await checkAP2Status()
      }
    } catch (error) {
      console.error('Failed to update AP2 config:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'valid':
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'valid':
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'error':
      case 'invalid':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">AP2 Configuration</h1>
        </div>
        <p className="text-gray-600">Configure Google's Agent Payments Protocol for production</p>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            AP2 Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span>Vertex AI</span>
              </div>
              <Badge className={getStatusColor(status.vertexAI)}>
                {getStatusIcon(status.vertexAI)}
                <span className="ml-1 capitalize">{status.vertexAI}</span>
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span>API Key</span>
              </div>
              <Badge className={getStatusColor(status.apiKey)}>
                {getStatusIcon(status.apiKey)}
                <span className="ml-1 capitalize">{status.apiKey}</span>
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Overall</span>
              </div>
              <Badge className={getStatusColor(status.overall)}>
                {getStatusIcon(status.overall)}
                <span className="ml-1 capitalize">{status.overall}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vertex AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Vertex AI (Production)
            </CardTitle>
            <CardDescription>Recommended for production deployments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cloudProject">Google Cloud Project ID</Label>
              <Input
                id="cloudProject"
                value={config.cloudProject}
                onChange={(e) => setConfig((prev) => ({ ...prev, cloudProject: e.target.value }))}
                placeholder="your-project-id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cloudLocation">Location</Label>
              <Input
                id="cloudLocation"
                value={config.cloudLocation}
                onChange={(e) => setConfig((prev) => ({ ...prev, cloudLocation: e.target.value }))}
                placeholder="global"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vertexAIKey">Vertex AI API Key</Label>
              <Input
                id="vertexAIKey"
                type="password"
                value={config.vertexAIKey}
                onChange={(e) => setConfig((prev) => ({ ...prev, vertexAIKey: e.target.value }))}
                placeholder="AQ.Ab8RN6K..."
              />
              <p className="text-xs text-gray-500">Current: {config.vertexAIKey ? '***configured***' : 'Not set'}</p>
            </div>

            <Button
              onClick={() => updateConfig({ useVertexAI: true })}
              className="w-full"
              disabled={!config.cloudProject}
            >
              Enable Vertex AI
            </Button>
          </CardContent>
        </Card>

        {/* API Key Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key (Development)
            </CardTitle>
            <CardDescription>For development and testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Google API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="AIzaSy..."
              />
            </div>

            <Button onClick={() => updateConfig({ useVertexAI: false })} className="w-full" disabled={!config.apiKey}>
              Use API Key
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">For Vertex AI (Production):</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Set up Google Cloud Project</li>
                <li>Enable Vertex AI API</li>
                <li>
                  Authenticate: <code className="bg-gray-100 px-1 rounded">gcloud auth application-default login</code>
                </li>
                <li>Configure environment variables above</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">For API Key (Development):</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Get API key from Google AI Studio</li>
                <li>Add to environment variables</li>
                <li>Test with AP2 demo</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
