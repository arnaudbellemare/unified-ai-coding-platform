'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Key, Zap, DollarSign, Shield, Info, CheckCircle, AlertTriangle, Settings, Brain, Database } from 'lucide-react'

interface LLMConfigurationProps {
  onConfigurationChange?: (config: {
    useOwnKeys: boolean
    provider: 'perplexity' | 'openai' | 'anthropic' | null
    apiKey: string
    model: string
  }) => void
}

export function LLMConfiguration({ onConfigurationChange }: LLMConfigurationProps) {
  const [useOwnKeys, setUseOwnKeys] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'perplexity' | 'openai' | 'anthropic' | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const providers = [
    {
      id: 'perplexity',
      name: 'Perplexity AI',
      description: 'Real-time data, best for search and current information',
      icon: '🔍',
      models: ['sonar', 'sonar-medium', 'sonar-large'],
      pricing: '$5/month for 1M tokens',
      features: ['Real-time web search', 'Current data', 'High accuracy'],
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models, excellent for coding and general tasks',
      icon: '🤖',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      pricing: '$20/month for 1M tokens',
      features: ['Code generation', 'Creative writing', 'Analysis'],
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Claude models, great for analysis and reasoning',
      icon: '🧠',
      models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
      pricing: '$15/month for 1M tokens',
      features: ['Deep reasoning', 'Long context', 'Analysis'],
    },
  ]

  const handleProviderSelect = (provider: 'perplexity' | 'openai' | 'anthropic') => {
    setSelectedProvider(provider)
    const providerData = providers.find((p) => p.id === provider)
    if (providerData) {
      setModel(providerData.models[0])
    }
  }

  const handleValidateKey = async () => {
    if (!apiKey || !selectedProvider) return

    setIsValidating(true)
    setValidationStatus('idle')

    try {
      // Test the API key with a simple request
      const response = await fetch('/api/llm/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey,
          model,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setValidationStatus('success')
        onConfigurationChange?.({
          useOwnKeys: true,
          provider: selectedProvider,
          apiKey,
          model,
        })
      } else {
        setValidationStatus('error')
      }
    } catch (error) {
      setValidationStatus('error')
    } finally {
      setIsValidating(false)
    }
  }

  const handleUseOptimized = () => {
    setUseOwnKeys(false)
    onConfigurationChange?.({
      useOwnKeys: false,
      provider: null,
      apiKey: '',
      model: '',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LLM Configuration
          </CardTitle>
          <CardDescription>
            Choose how you want to use AI agents - with your own API keys or our optimized system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="optimized" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="optimized" onClick={() => handleUseOptimized()}>
                <Zap className="h-4 w-4 mr-2" />
                Optimized System
              </TabsTrigger>
              <TabsTrigger value="own-keys" onClick={() => setUseOwnKeys(true)}>
                <Key className="h-4 w-4 mr-2" />
                Your API Keys
              </TabsTrigger>
            </TabsList>

            <TabsContent value="optimized" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Our Optimized System:</strong> Use our cost-optimized AI with advanced prompt optimization,
                  provider switching, and cost reduction. Limited to 10 tasks/month but with maximum efficiency.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cost Optimized
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">$0.02</div>
                    <p className="text-xs text-muted-foreground">per request</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Usage Limit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">10</div>
                    <p className="text-xs text-muted-foreground">tasks/month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <p className="text-xs text-muted-foreground">cost reduction</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Advanced prompt optimization</li>
                  <li>✅ Smart provider switching</li>
                  <li>✅ Real-time cost monitoring</li>
                  <li>✅ Automatic fallback systems</li>
                  <li>✅ Usage analytics and insights</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="own-keys" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Your API Keys:</strong> Use your own API keys for unlimited usage. You'll be charged directly
                  by the AI provider. No usage limits but you pay the full cost.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Select AI Provider</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {providers.map((provider) => (
                      <Card
                        key={provider.id}
                        className={`cursor-pointer transition-all ${
                          selectedProvider === provider.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleProviderSelect(provider.id as any)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <span className="text-lg">{provider.icon}</span>
                            {provider.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground mb-2">{provider.description}</p>
                          <div className="space-y-1">
                            <div className="text-xs font-medium">Pricing:</div>
                            <div className="text-xs text-muted-foreground">{provider.pricing}</div>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs font-medium">Features:</div>
                            <ul className="text-xs text-muted-foreground">
                              {provider.features.map((feature, index) => (
                                <li key={index}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedProvider && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-key">API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder={`Enter your ${providers.find((p) => p.id === selectedProvider)?.name} API key`}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Get your API key from{' '}
                        {selectedProvider === 'perplexity' && (
                          <a
                            href="https://www.perplexity.ai/settings/api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Perplexity Settings
                          </a>
                        )}
                        {selectedProvider === 'openai' && (
                          <a
                            href="https://platform.openai.com/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            OpenAI Platform
                          </a>
                        )}
                        {selectedProvider === 'anthropic' && (
                          <a
                            href="https://console.anthropic.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Anthropic Console
                          </a>
                        )}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="model">Model</Label>
                      <select
                        id="model"
                        className="w-full p-2 border rounded-md"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      >
                        {providers
                          .find((p) => p.id === selectedProvider)
                          ?.models.map((modelOption) => (
                            <option key={modelOption} value={modelOption}>
                              {modelOption}
                            </option>
                          ))}
                      </select>
                    </div>

                    <Button onClick={handleValidateKey} disabled={!apiKey || !model || isValidating} className="w-full">
                      {isValidating ? (
                        <>
                          <Database className="h-4 w-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Validate & Save
                        </>
                      )}
                    </Button>

                    {validationStatus === 'success' && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          API key validated successfully! You can now use unlimited AI agents with your own API key.
                        </AlertDescription>
                      </Alert>
                    )}

                    {validationStatus === 'error' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          API key validation failed. Please check your key and try again.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
