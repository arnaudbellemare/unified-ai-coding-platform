'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  Sparkles, 
  MapPin, 
  CreditCard, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Bot,
  Globe,
  Database,
  Code,
  Rocket
} from 'lucide-react'
import { toast } from 'sonner'

interface BuildResult {
  storeId: string
  storeName: string
  description: string
  geoData: {
    latitude: number
    longitude: number
    address: string
    radius: number
  }
  products: Array<{
    id: string
    name: string
    price: number
    description: string
    images: string[]
    geoAttributes: Record<string, any>
  }>
  schemas: {
    geo: Record<string, any>
    aeo: Record<string, any>
    rdf: string
  }
  paymentConfig: {
    ap2: boolean
    acp: boolean
    x402: boolean
    chains: string[]
  }
  deployment: {
    url: string
    gitBranch: string
    commitHash: string
  }
  scores?: {
    geo: number
    aeo: number
    overall: number
  }
  pitfalls?: string[]
  optimizations?: string[]
}

export default function StoreForgePage() {
  const [prompt, setPrompt] = useState('')
  const [vibe, setVibe] = useState('')
  const [location, setLocation] = useState('')
  const [productType, setProductType] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [targetAgents, setTargetAgents] = useState<string[]>([])
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null)
  const [swarmStatus, setSwarmStatus] = useState<any>(null)

  // Load swarm status on mount
  useEffect(() => {
    loadSwarmStatus()
  }, [])

  const loadSwarmStatus = async () => {
    try {
      const response = await fetch('/api/storeforge/build')
      const data = await response.json()
      if (data.success) {
        setSwarmStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to load swarm status:', error)
    }
  }

  const handleBuild = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a store description')
      return
    }

    setIsBuilding(true)
    setBuildResult(null)

    try {
      const response = await fetch('/api/storeforge/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          vibe: vibe.trim() || undefined,
          location: location.trim() || undefined,
          productType: productType.trim() || undefined,
          paymentMethods: paymentMethods.length > 0 ? paymentMethods : undefined,
          targetAgents: targetAgents.length > 0 ? targetAgents : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setBuildResult(data.data)
        toast.success('Store built successfully!')
      } else {
        toast.error(data.error || 'Build failed')
      }
    } catch (error) {
      console.error('Build error:', error)
      toast.error('Failed to build store')
    } finally {
      setIsBuilding(false)
    }
  }

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    )
  }

  const toggleTargetAgent = (agent: string) => {
    setTargetAgents(prev => 
      prev.includes(agent) 
        ? prev.filter(a => a !== agent)
        : [...prev, agent]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Bot className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">StoreForge</h1>
          </div>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Zero-code agent builder for GEO/AEO-optimized agentic commerce platforms
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-blue-300 border-blue-400">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="text-green-300 border-green-400">
              <Globe className="h-3 w-3 mr-1" />
              GEO Optimized
            </Badge>
            <Badge variant="outline" className="text-purple-300 border-purple-400">
              <Zap className="h-3 w-3 mr-1" />
              Agent-Ready
            </Badge>
          </div>
        </div>

        {/* Swarm Status */}
        {swarmStatus && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Swarm Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {swarmStatus.activeAgents?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Active Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 capitalize">
                    {swarmStatus.swarmStatus}
                  </div>
                  <div className="text-sm text-gray-400">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {swarmStatus.currentBuild ? '1' : '0'}
                  </div>
                  <div className="text-sm text-gray-400">Current Build</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Store Configuration</CardTitle>
              <CardDescription className="text-gray-400">
                Describe your ideal store and let the swarm build it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-white">Store Description *</Label>
                <Textarea
                  id="prompt"
                  placeholder="Build a NYC streetwear pop-up with USDC micropayments and local pickup..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>

              {/* Vibe */}
              <div className="space-y-2">
                <Label htmlFor="vibe" className="text-white">Visual Vibe</Label>
                <Input
                  id="vibe"
                  placeholder="e.g., urban edgy, minimalist, luxury"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., NYC, Brooklyn, San Francisco"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Product Type */}
              <div className="space-y-2">
                <Label htmlFor="productType" className="text-white">Product Type</Label>
                <Input
                  id="productType"
                  placeholder="e.g., streetwear, electronics, art"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Methods
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['USDC', 'ETH', 'BTC', 'Credit Card'].map((method) => (
                    <Button
                      key={method}
                      variant={paymentMethods.includes(method) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePaymentMethod(method)}
                      className={paymentMethods.includes(method) 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                      }
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Target Agents */}
              <div className="space-y-3">
                <Label className="text-white">Target AI Agents</Label>
                <div className="flex flex-wrap gap-2">
                  {['ChatGPT', 'Perplexity', 'Claude', 'Copilot'].map((agent) => (
                    <Button
                      key={agent}
                      variant={targetAgents.includes(agent) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTargetAgent(agent)}
                      className={targetAgents.includes(agent) 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                      }
                    >
                      {agent}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Build Button */}
              <Button
                onClick={handleBuild}
                disabled={isBuilding || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Building Store...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Build Store
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-6">
            {buildResult ? (
              <>
                {/* Build Summary */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Build Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{buildResult.storeName}</h3>
                      <p className="text-gray-400">{buildResult.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Location</div>
                        <div className="text-white">{buildResult.geoData.address}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Products</div>
                        <div className="text-white">{buildResult.products.length}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(buildResult.deployment.url, '_blank')}
                        className="flex-1"
                        variant="outline"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Store
                      </Button>
                      <Button
                        onClick={() => navigator.clipboard.writeText(buildResult.deployment.url)}
                        variant="outline"
                      >
                        Copy URL
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Results */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="schemas">Schemas</TabsTrigger>
                    <TabsTrigger value="deployment">Deployment</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Optimization Scores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {buildResult.scores && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">
                                {buildResult.scores.geo}%
                              </div>
                              <div className="text-sm text-gray-400">GEO Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-400">
                                {buildResult.scores.aeo}%
                              </div>
                              <div className="text-sm text-gray-400">AEO Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">
                                {buildResult.scores.overall}%
                              </div>
                              <div className="text-sm text-gray-400">Overall</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {buildResult.pitfalls && buildResult.pitfalls.length > 0 && (
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                            Optimization Opportunities
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {buildResult.optimizations?.map((optimization, index) => (
                              <div key={index} className="text-sm text-gray-300">
                                • {optimization}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="products">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {buildResult.products.map((product) => (
                            <div key={product.id} className="border border-slate-600 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-white font-medium">{product.name}</h4>
                                  <p className="text-gray-400 text-sm">{product.description}</p>
                                </div>
                                <div className="text-lg font-bold text-green-400">
                                  ${product.price}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="schemas">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          Generated Schemas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-white font-medium mb-2">Payment Configuration</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(buildResult.paymentConfig).map(([key, value]) => (
                                <Badge 
                                  key={key} 
                                  variant={value ? 'default' : 'outline'}
                                  className={value ? 'bg-green-600' : 'border-slate-600 text-gray-400'}
                                >
                                  {key.toUpperCase()}: {value ? 'Enabled' : 'Disabled'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-white font-medium mb-2">Supported Chains</h4>
                            <div className="flex flex-wrap gap-2">
                              {buildResult.paymentConfig.chains.map((chain) => (
                                <Badge key={chain} variant="outline" className="border-blue-400 text-blue-300">
                                  {chain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="deployment">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Deployment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-400">URL</div>
                          <div className="text-white font-mono text-sm break-all">
                            {buildResult.deployment.url}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Git Branch</div>
                          <div className="text-white font-mono text-sm">
                            {buildResult.deployment.gitBranch}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Commit Hash</div>
                          <div className="text-white font-mono text-sm">
                            {buildResult.deployment.commitHash}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto" />
                    <div className="text-gray-400">
                      {isBuilding ? 'Building your store...' : 'Build a store to see results here'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
