'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface TestResult {
  endpoint: string
  status: 'success' | 'error' | 'loading' | 'pending'
  response?: any
  error?: string
  timestamp?: string
}

export default function VercelSandboxTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const testEndpoints = [
    { name: 'Main Page', url: '/', type: 'page' },
    { name: 'Models API (Simple)', url: '/api/models-simple', type: 'api' },
    { name: 'Process API (Simple)', url: '/api/process-simple', type: 'api' },
    { name: 'Models API (Main)', url: '/api/models', type: 'api' },
    { name: 'Process API (Main)', url: '/api/process', type: 'api' },
    { name: 'GitHub Auth API', url: '/api/github-auth', type: 'api' },
    { name: 'Test Sandbox', url: '/api/test-sandbox', type: 'api' },
  ]

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])

    for (const endpoint of testEndpoints) {
      // Set loading state
      setTestResults((prev) => [
        ...prev,
        {
          endpoint: endpoint.name,
          status: 'loading',
          timestamp: new Date().toISOString(),
        },
      ])

      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.type === 'api' ? 'GET' : 'GET',
        })

        let result: TestResult = {
          endpoint: endpoint.name,
          status: 'success',
          response: {
            status: response.status,
            statusText: response.statusText,
            url: endpoint.url,
          },
          timestamp: new Date().toISOString(),
        }

        if (endpoint.type === 'api') {
          try {
            const data = await response.json()
            result.response.data = data
          } catch (jsonError) {
            const text = await response.text()
            result.response.text = text.substring(0, 200) + '...'
          }
        }

        if (!response.ok) {
          result.status = 'error'
          result.error = `HTTP ${response.status}: ${response.statusText}`
        }

        setTestResults((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((r) => r.endpoint === endpoint.name)
          if (index !== -1) {
            updated[index] = result
          }
          return updated
        })

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        const result: TestResult = {
          endpoint: endpoint.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }

        setTestResults((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((r) => r.endpoint === endpoint.name)
          if (index !== -1) {
            updated[index] = result
          }
          return updated
        })
      }
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'loading':
        return <Badge variant="secondary">Testing...</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const successCount = testResults.filter((r) => r.status === 'success').length
  const errorCount = testResults.filter((r) => r.status === 'error').length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Vercel Sandbox Testing Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Badge variant="outline">
                Tests: {testResults.length}/{testEndpoints.length}
              </Badge>
              <Badge variant="default" className="bg-green-500">
                Success: {successCount}
              </Badge>
              <Badge variant="destructive">Errors: {errorCount}</Badge>
            </div>
            <Button onClick={runTests} disabled={isRunning} className="flex items-center gap-2">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>

          {testResults.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Test Results: {successCount} passed, {errorCount} failed out of {testResults.length} total tests.
                {errorCount > 0 && ' Check the details below for specific issues.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {testResults.map((result, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(result.status)}
                  {result.endpoint}
                </CardTitle>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.status === 'loading' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing endpoint...
                </div>
              )}

              {result.status === 'success' && result.response && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Status:</strong> {result.response.status} {result.response.statusText}
                  </div>
                  <div className="text-sm">
                    <strong>URL:</strong> {result.response.url}
                  </div>
                  {result.response.data && (
                    <div className="text-sm">
                      <strong>Response:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.response.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.response.text && (
                    <div className="text-sm">
                      <strong>Response (Text):</strong>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        {result.response.text}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {result.status === 'error' && (
                <div className="space-y-2">
                  <div className="text-sm text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                  {result.response && (
                    <div className="text-sm">
                      <strong>Status:</strong> {result.response.status} {result.response.statusText}
                    </div>
                  )}
                </div>
              )}

              {result.timestamp && (
                <div className="text-xs text-gray-500">
                  Tested at: {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost-Effective AI Models Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Top 5 Most Cost-Effective Models:</strong>
                <ol className="mt-2 space-y-1">
                  <li>
                    1. <strong>Mistral 7B Instruct</strong> - $0.20/1M tokens (Ultra-fast, best for high-volume tasks)
                  </li>
                  <li>
                    2. <strong>GPT-4o Mini</strong> - $0.15-0.60/1M tokens (OpenAI's most cost-effective)
                  </li>
                  <li>
                    3. <strong>Llama 3.2 3B</strong> - $0.30/1M tokens (Meta's ultra-lightweight)
                  </li>
                  <li>
                    4. <strong>Qwen 2.5 7B</strong> - $0.25/1M tokens (Alibaba's efficient multilingual)
                  </li>
                  <li>
                    5. <strong>Gemma 7B Instruct</strong> - $0.35/1M tokens (Google's efficient open model)
                  </li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-600">Ultra Budget</h4>
                <p className="text-sm text-gray-600">$0.20-0.50/1M tokens</p>
                <p className="text-xs">High-volume, simple tasks</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-blue-600">Balanced</h4>
                <p className="text-sm text-gray-600">$0.40-1.50/1M tokens</p>
                <p className="text-xs">Good performance at reasonable cost</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-purple-600">Premium</h4>
                <p className="text-sm text-gray-600">$3.00-15.00/1M tokens</p>
                <p className="text-xs">Best quality when cost is secondary</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
