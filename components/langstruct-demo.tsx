'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, CreditCard, Bot, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ExtractionResult {
  entities: Record<string, any>
  confidence: number
  sources: Record<
    string,
    Array<{
      text: string
      start: number
      end: number
    }>
  >
  success: boolean
  error?: string
}

export function LangStructDemo() {
  const [activeTab, setActiveTab] = useState('geo')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, ExtractionResult>>({})

  // Input states
  const [geoQuery, setGeoQuery] = useState('Find me Apple products under $100 in San Francisco')
  const [acpText, setAcpText] = useState('Customer bought 2 Base T-Shirts for $45 total, paid with USDC crypto')
  const [ap2Text, setAp2Text] = useState('ShoppingBot_001 paid PaymentBot_002 $25.50 for recommendation service')
  const [documentText, setDocumentText] = useState(
    'Apple Inc. reported Q3 2024 revenue of $125.3B with positive growth',
  )

  const extractData = async (type: string, text: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/langstruct/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractorType: type, text }),
      })

      const data = await response.json()

      if (data.success) {
        setResults((prev) => ({ ...prev, [type]: data.data }))
      } else {
        setResults((prev) => ({
          ...prev,
          [type]: {
            entities: {},
            confidence: 0,
            sources: {},
            success: false,
            error: data.error,
          },
        }))
      }
    } catch (error) {
      console.error('Extraction error:', error)
      setResults((prev) => ({
        ...prev,
        [type]: {
          entities: {},
          confidence: 0,
          sources: {},
          success: false,
          error: 'Network error',
        },
      }))
    } finally {
      setLoading(false)
    }
  }

  const getResultIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  }

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">LangStruct Integration Demo</h1>
        <p className="text-lg text-gray-600">
          Extract structured data from AI interactions using LangStruct + DSPy optimization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geo" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            GEO Query
          </TabsTrigger>
          <TabsTrigger value="acp" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            ACP Payment
          </TabsTrigger>
          <TabsTrigger value="ap2" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AP2 Agent
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document
          </TabsTrigger>
        </TabsList>

        {/* GEO Query Tab */}
        <TabsContent value="geo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                GEO Query Extraction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">User Query</label>
                <Input
                  value={geoQuery}
                  onChange={(e) => setGeoQuery(e.target.value)}
                  placeholder="Enter a search query..."
                  className="w-full"
                />
              </div>

              <Button onClick={() => extractData('geo_query', geoQuery)} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Extract GEO Data
              </Button>

              {results.geo_query && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      {getResultIcon(results.geo_query.success)}
                      <span className="font-medium">
                        {results.geo_query.success ? 'Extraction Successful' : 'Extraction Failed'}
                      </span>
                      {results.geo_query.success && (
                        <Badge variant="secondary">{formatConfidence(results.geo_query.confidence)}</Badge>
                      )}
                    </div>

                    {results.geo_query.success ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Extracted Entities:</h4>
                          <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                            {JSON.stringify(results.geo_query.entities, null, 2)}
                          </pre>
                        </div>

                        {Object.keys(results.geo_query.sources).length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Source Mapping:</h4>
                            <div className="space-y-2">
                              {Object.entries(results.geo_query.sources).map(([field, spans]) => (
                                <div key={field} className="text-sm">
                                  <span className="font-medium text-gray-700">{field}:</span>
                                  {spans.map((span, i) => (
                                    <span key={i} className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800">
                                      "{span.text}"
                                    </span>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-600">Error: {results.geo_query.error}</div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACP Payment Tab */}
        <TabsContent value="acp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                ACP Payment Extraction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Text</label>
                <Textarea
                  value={acpText}
                  onChange={(e) => setAcpText(e.target.value)}
                  placeholder="Enter payment description..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <Button onClick={() => extractData('acp_payment', acpText)} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Extract ACP Data
              </Button>

              {results.acp_payment && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      {getResultIcon(results.acp_payment.success)}
                      <span className="font-medium">
                        {results.acp_payment.success ? 'Extraction Successful' : 'Extraction Failed'}
                      </span>
                      {results.acp_payment.success && (
                        <Badge variant="secondary">{formatConfidence(results.acp_payment.confidence)}</Badge>
                      )}
                    </div>

                    {results.acp_payment.success && (
                      <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                        {JSON.stringify(results.acp_payment.entities, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AP2 Agent Tab */}
        <TabsContent value="ap2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                AP2 Agent Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Agent Communication</label>
                <Textarea
                  value={ap2Text}
                  onChange={(e) => setAp2Text(e.target.value)}
                  placeholder="Enter agent communication..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <Button onClick={() => extractData('ap2_agent', ap2Text)} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Extract AP2 Data
              </Button>

              {results.ap2_agent && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      {getResultIcon(results.ap2_agent.success)}
                      <span className="font-medium">
                        {results.ap2_agent.success ? 'Extraction Successful' : 'Extraction Failed'}
                      </span>
                      {results.ap2_agent.success && (
                        <Badge variant="secondary">{formatConfidence(results.ap2_agent.confidence)}</Badge>
                      )}
                    </div>

                    {results.ap2_agent.success && (
                      <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                        {JSON.stringify(results.ap2_agent.entities, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Metadata Tab */}
        <TabsContent value="document" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Document Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Document Text</label>
                <Textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Enter document text..."
                  className="w-full"
                  rows={4}
                />
              </div>

              <Button
                onClick={() => extractData('document_metadata', documentText)}
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Extract Metadata
              </Button>

              {results.document_metadata && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      {getResultIcon(results.document_metadata.success)}
                      <span className="font-medium">
                        {results.document_metadata.success ? 'Extraction Successful' : 'Extraction Failed'}
                      </span>
                      {results.document_metadata.success && (
                        <Badge variant="secondary">{formatConfidence(results.document_metadata.confidence)}</Badge>
                      )}
                    </div>

                    {results.document_metadata.success && (
                      <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                        {JSON.stringify(results.document_metadata.entities, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
