'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Zap,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  Play,
  Download,
  Sparkles,
} from 'lucide-react'
import { GitHubAuthButton } from './github-auth-button'

interface Model {
  id: string
  name: string
  description: string
  pricing: { prompt: string | number; completion: string | number }
  context_length: number
  providers: any[]
  supportsProviderSelection: boolean
  recommendedProvider: string
  providerMetrics: {
    averageLatency: number
    reliability: number
    costPerToken: number
  }
}

interface UnifiedResult {
  success: boolean
  optimization?: any
  aiResponse?: any
  multiOptimizerResults?: any
  bestOptimizer?: string
  costAnalysis?: any
  contextAnalysis?: any
  performanceMetrics?: {
    optimizationSpeed: number
    qualityScore: number
    reliabilityScore: number
    costEfficiency: number
  }
  summary: {
    originalPrompt: string
    optimizedPrompt: string
    aiResponse: string
    costSavings: {
      original: number
      optimized: number
      reduction: number
      percentage: number
    }
    tokenSavings: {
      original: number
      optimized: number
      reduction: number
      percentage: number
    }
    model: string
    provider: string
    timestamp: string
    optimizationEngines?: string[]
    selectedEngine?: string
    performanceScore?: number
    costEfficiency?: number
  }
}

export default function UnifiedAllInOne() {
  // State management
  const [prompt, setPrompt] = useState('')
  const [task, setTask] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('auto')
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<UnifiedResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  // Authentication removed - system works for everyone

  // Load models on component mount
  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      // Try the main models endpoint first
      let response = await fetch('/api/models')
      let data = await response.json()

      // If it fails, try the simple fallback
      if (!data.success || !data.models || data.models.length === 0) {
        console.log('Main models API failed, trying simple fallback...')
        response = await fetch('/api/models-simple')
        data = await response.json()
      }

      if (data.success && data.models && data.models.length > 0) {
        setAvailableModels(data.models)
        setSelectedModel(data.models[0].id)
        setSelectedProvider(data.models[0].recommendedProvider || 'auto')
        console.log(`Loaded ${data.models.length} models from ${data.source}`)
      } else {
        console.error('Both model endpoints failed, using hardcoded fallback')
        // 15 Most cost-effective AI models (sorted by cost efficiency)
        const fallbackModels = [
          {
            id: 'mistral-7b-instruct',
            name: 'Mistral 7B Instruct',
            description: 'Ultra-efficient small model for quick tasks',
            pricing: { prompt: 0.2, completion: 0.2 },
            context_length: 32000,
            providers: [{ id: 'mistral', name: 'Mistral', latency: 80, reliability: 0.97 }],
            supportsProviderSelection: true,
            recommendedProvider: 'mistral',
            providerMetrics: { averageLatency: 80, reliability: 0.97, costPerToken: 0.2 },
          },
          {
            id: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            description: "OpenAI's most cost-effective model",
            pricing: { prompt: 0.15, completion: 0.6 },
            context_length: 128000,
            providers: [{ id: 'openai', name: 'OpenAI', latency: 120, reliability: 0.99 }],
            supportsProviderSelection: true,
            recommendedProvider: 'openai',
            providerMetrics: { averageLatency: 120, reliability: 0.99, costPerToken: 0.15 },
          },
          {
            id: 'llama-3.2-3b',
            name: 'Llama 3.2 3B',
            description: "Meta's ultra-lightweight model",
            pricing: { prompt: 0.3, completion: 0.3 },
            context_length: 128000,
            providers: [{ id: 'meta', name: 'Meta', latency: 60, reliability: 0.96 }],
            supportsProviderSelection: true,
            recommendedProvider: 'meta',
            providerMetrics: { averageLatency: 60, reliability: 0.96, costPerToken: 0.3 },
          },
          {
            id: 'qwen-2.5-7b',
            name: 'Qwen 2.5 7B',
            description: "Alibaba's efficient multilingual model",
            pricing: { prompt: 0.25, completion: 0.25 },
            context_length: 128000,
            providers: [{ id: 'qwen', name: 'Qwen', latency: 90, reliability: 0.95 }],
            supportsProviderSelection: true,
            recommendedProvider: 'qwen',
            providerMetrics: { averageLatency: 90, reliability: 0.95, costPerToken: 0.25 },
          },
          {
            id: 'gemma-7b-it',
            name: 'Gemma 7B Instruct',
            description: "Google's efficient open model",
            pricing: { prompt: 0.35, completion: 0.35 },
            context_length: 8192,
            providers: [{ id: 'google', name: 'Google', latency: 100, reliability: 0.94 }],
            supportsProviderSelection: true,
            recommendedProvider: 'google',
            providerMetrics: { averageLatency: 100, reliability: 0.94, costPerToken: 0.35 },
          },
          {
            id: 'llama-3.1-8b',
            name: 'Llama 3.1 8B',
            description: 'Balanced performance and cost',
            pricing: { prompt: 0.4, completion: 0.4 },
            context_length: 128000,
            providers: [{ id: 'meta', name: 'Meta', latency: 120, reliability: 0.95 }],
            supportsProviderSelection: true,
            recommendedProvider: 'meta',
            providerMetrics: { averageLatency: 120, reliability: 0.95, costPerToken: 0.4 },
          },
          {
            id: 'phi-3.5-mini',
            name: 'Phi-3.5 Mini',
            description: "Microsoft's compact reasoning model",
            pricing: { prompt: 0.45, completion: 0.45 },
            context_length: 128000,
            providers: [{ id: 'microsoft', name: 'Microsoft', latency: 110, reliability: 0.96 }],
            supportsProviderSelection: true,
            recommendedProvider: 'microsoft',
            providerMetrics: { averageLatency: 110, reliability: 0.96, costPerToken: 0.45 },
          },
          {
            id: 'mistral-8x7b',
            name: 'Mistral 8x7B MoE',
            description: 'Mixture of experts for better efficiency',
            pricing: { prompt: 0.5, completion: 0.5 },
            context_length: 32000,
            providers: [{ id: 'mistral', name: 'Mistral', latency: 140, reliability: 0.97 }],
            supportsProviderSelection: true,
            recommendedProvider: 'mistral',
            providerMetrics: { averageLatency: 140, reliability: 0.97, costPerToken: 0.5 },
          },
          {
            id: 'llama-3.1-70b',
            name: 'Llama 3.1 70B',
            description: 'High-performance open source model',
            pricing: { prompt: 0.9, completion: 0.9 },
            context_length: 128000,
            providers: [{ id: 'meta', name: 'Meta', latency: 200, reliability: 0.95 }],
            supportsProviderSelection: true,
            recommendedProvider: 'meta',
            providerMetrics: { averageLatency: 200, reliability: 0.95, costPerToken: 0.9 },
          },
          {
            id: 'qwen-2.5-14b',
            name: 'Qwen 2.5 14B',
            description: 'Larger Qwen model with better reasoning',
            pricing: { prompt: 0.8, completion: 0.8 },
            context_length: 128000,
            providers: [{ id: 'qwen', name: 'Qwen', latency: 150, reliability: 0.96 }],
            supportsProviderSelection: true,
            recommendedProvider: 'qwen',
            providerMetrics: { averageLatency: 150, reliability: 0.96, costPerToken: 0.8 },
          },
          {
            id: 'gemini-pro-1.5-flash',
            name: 'Gemini Pro 1.5 Flash',
            description: "Google's fastest model",
            pricing: { prompt: 0.75, completion: 3.0 },
            context_length: 1000000,
            providers: [{ id: 'google', name: 'Google', latency: 80, reliability: 0.98 }],
            supportsProviderSelection: true,
            recommendedProvider: 'google',
            providerMetrics: { averageLatency: 80, reliability: 0.98, costPerToken: 0.75 },
          },
          {
            id: 'claude-3-haiku',
            name: 'Claude 3 Haiku',
            description: "Anthropic's fastest and cheapest model",
            pricing: { prompt: 0.25, completion: 1.25 },
            context_length: 200000,
            providers: [{ id: 'anthropic', name: 'Anthropic', latency: 100, reliability: 0.99 }],
            supportsProviderSelection: true,
            recommendedProvider: 'anthropic',
            providerMetrics: { averageLatency: 100, reliability: 0.99, costPerToken: 0.25 },
          },
          {
            id: 'gemini-pro-1.5',
            name: 'Gemini Pro 1.5',
            description: "Google's balanced model with long context",
            pricing: { prompt: 1.25, completion: 5.0 },
            context_length: 1000000,
            providers: [{ id: 'google', name: 'Google', latency: 120, reliability: 0.99 }],
            supportsProviderSelection: true,
            recommendedProvider: 'google',
            providerMetrics: { averageLatency: 120, reliability: 0.99, costPerToken: 1.25 },
          },
          {
            id: 'claude-3.5-sonnet',
            name: 'Claude 3.5 Sonnet',
            description: "Anthropic's balanced performance model",
            pricing: { prompt: 3.0, completion: 15.0 },
            context_length: 200000,
            providers: [{ id: 'anthropic', name: 'Anthropic', latency: 150, reliability: 0.98 }],
            supportsProviderSelection: true,
            recommendedProvider: 'anthropic',
            providerMetrics: { averageLatency: 150, reliability: 0.98, costPerToken: 3.0 },
          },
          {
            id: 'gpt-4o',
            name: 'GPT-4o',
            description: "OpenAI's flagship multimodal model",
            pricing: { prompt: 5.0, completion: 15.0 },
            context_length: 128000,
            providers: [{ id: 'openai', name: 'OpenAI', latency: 180, reliability: 0.99 }],
            supportsProviderSelection: true,
            recommendedProvider: 'openai',
            providerMetrics: { averageLatency: 180, reliability: 0.99, costPerToken: 5.0 },
          },
        ]

        setAvailableModels(fallbackModels)
        setSelectedModel(fallbackModels[0].id)
        setSelectedProvider(fallbackModels[0].recommendedProvider || 'auto')
        console.log(`Loaded ${fallbackModels.length} hardcoded fallback models`)
      }
    } catch (error) {
      console.error('Failed to load models:', error)
      // Use hardcoded models as final fallback
      const fallbackModels = [
        {
          id: 'mistral-7b-instruct',
          name: 'Mistral 7B Instruct',
          description: 'Ultra-efficient small model for quick tasks',
          pricing: { prompt: 0.2, completion: 0.2 },
          context_length: 32000,
          providers: [{ id: 'mistral', name: 'Mistral', latency: 80, reliability: 0.97 }],
          supportsProviderSelection: true,
          recommendedProvider: 'mistral',
          providerMetrics: { averageLatency: 80, reliability: 0.97, costPerToken: 0.2 },
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: "OpenAI's most cost-effective model",
          pricing: { prompt: 0.15, completion: 0.6 },
          context_length: 128000,
          providers: [{ id: 'openai', name: 'OpenAI', latency: 120, reliability: 0.99 }],
          supportsProviderSelection: true,
          recommendedProvider: 'openai',
          providerMetrics: { averageLatency: 120, reliability: 0.99, costPerToken: 0.15 },
        },
        {
          id: 'llama-3.2-3b',
          name: 'Llama 3.2 3B',
          description: "Meta's ultra-lightweight model",
          pricing: { prompt: 0.3, completion: 0.3 },
          context_length: 128000,
          providers: [{ id: 'meta', name: 'Meta', latency: 60, reliability: 0.96 }],
          supportsProviderSelection: true,
          recommendedProvider: 'meta',
          providerMetrics: { averageLatency: 60, reliability: 0.96, costPerToken: 0.3 },
        },
        {
          id: 'claude-3-haiku',
          name: 'Claude 3 Haiku',
          description: "Anthropic's fastest and cheapest model",
          pricing: { prompt: 0.25, completion: 1.25 },
          context_length: 200000,
          providers: [{ id: 'anthropic', name: 'Anthropic', latency: 100, reliability: 0.99 }],
          supportsProviderSelection: true,
          recommendedProvider: 'anthropic',
          providerMetrics: { averageLatency: 100, reliability: 0.99, costPerToken: 0.25 },
        },
      ]

      setAvailableModels(fallbackModels)
      setSelectedModel(fallbackModels[0].id)
      setSelectedProvider(fallbackModels[0].recommendedProvider || 'auto')
      console.log('Using emergency fallback models')
    }
  }

  const handleUnifiedProcess = async () => {
    if (!prompt.trim() || !task.trim()) {
      alert('Please enter both a prompt and task description')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      // Single unified API call
      setCurrentStep('Processing with AI...')
      setProgress(50)

      // Try main process endpoint first, then fallback
      let response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          task,
          model: selectedModel,
          provider: selectedProvider,
        }),
      })

      // If main endpoint fails, try simple fallback
      if (!response.ok) {
        console.log('Main process API failed, trying simple fallback...')
        response = await fetch('/api/process-simple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            task,
            model: selectedModel,
          }),
        })
      }

      // If simple fallback also fails, try emergency fallback
      if (!response.ok) {
        console.log('Simple fallback failed, trying emergency fallback...')
        response = await fetch('/api/emergency-fallback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            task,
            model: selectedModel,
          }),
        })
      }

      let data
      try {
        const responseText = await response.text()
        if (!responseText) {
          throw new Error('Empty response from server')
        }
        data = JSON.parse(responseText)
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError)
        throw new Error('Invalid response format from server')
      }

      if (!data.success) {
        throw new Error(data.error || 'Process failed')
      }

      // Step 2: Use the complete result from the API
      setCurrentStep('Calculating results...')
      setProgress(75)

      const finalResult: UnifiedResult = data

      setProgress(100)
      setCurrentStep('Complete!')
      setResult(finalResult)
    } catch (error) {
      console.error('Unified process failed:', error)
      alert('Process failed: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setProgress(0)
        setCurrentStep('')
      }, 2000)
    }
  }

  const getModelDisplayName = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId)
    return model ? model.name : modelId
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Unified AI System</h1>
        </div>
        <p className="text-gray-600">One system for optimization, AI generation, and cost management</p>
        <div className="flex justify-center">
          <GitHubAuthButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Input & Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-gray-500">
                          $
                          {typeof model.pricing?.prompt === 'string'
                            ? parseFloat(model.pricing.prompt)
                            : model.pricing?.prompt}
                          /1M tokens
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider Selection */}
            {availableModels.find((m) => m.id === selectedModel)?.supportsProviderSelection && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider</label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex flex-col">
                        <span className="font-medium">Auto (Recommended)</span>
                        <span className="text-xs text-gray-500">Best balance of speed and cost</span>
                      </div>
                    </SelectItem>
                    {availableModels
                      .find((m) => m.id === selectedModel)
                      ?.providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{provider.name}</span>
                            <span className="text-xs text-gray-500">
                              {provider.latency}ms • {Math.round(provider.reliability * 100)}% reliable
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Prompt</label>
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            {/* Task Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Description</label>
              <Input
                placeholder="Describe what you want to achieve..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
            </div>

            {/* Process Button */}
            <Button
              onClick={handleUnifiedProcess}
              disabled={isProcessing || !prompt.trim() || !task.trim()}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Process with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Results & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentStep}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto text-green-600 mb-1" />
                    <div className="text-lg font-bold text-green-600">{result.summary.costSavings.percentage}%</div>
                    <div className="text-xs text-gray-600">Cost Saved</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                    <div className="text-lg font-bold text-blue-600">{result.summary.tokenSavings.percentage}%</div>
                    <div className="text-xs text-gray-600">Tokens Saved</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Zap className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                    <div className="text-lg font-bold text-purple-600">{result.summary.performanceScore || 90}%</div>
                    <div className="text-xs text-gray-600">Quality</div>
                  </div>
                </div>

                {/* Optimized Prompt */}
                {result.summary.optimizedPrompt && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Optimized Prompt</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">{result.summary.optimizedPrompt}</div>
                  </div>
                )}

                {/* AI Response */}
                {result.summary.aiResponse && (
                  <div className="space-y-2">
                    <h4 className="font-medium">AI Response</h4>
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">{result.summary.aiResponse}</div>
                  </div>
                )}

                {/* Advanced Optimizer Results */}
                {result.summary.optimizationEngines && (
                  <div className="space-y-3">
                    <h4 className="font-medium">🚀 Advanced Optimization Engines</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {result.summary.optimizationEngines.map((engine: string) => (
                        <Badge
                          key={engine}
                          variant={result.summary.selectedEngine === engine ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {engine.toUpperCase()}
                          {result.summary.selectedEngine === engine && ' ⭐'}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Selected: <span className="font-medium">{result.summary.selectedEngine}</span> engine
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {result.performanceMetrics && (
                  <div className="space-y-3">
                    <h4 className="font-medium">📊 Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-sm font-medium text-blue-600">
                          {result.performanceMetrics.qualityScore}%
                        </div>
                        <div className="text-xs text-gray-600">Quality Score</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-sm font-medium text-green-600">
                          {result.performanceMetrics.costEfficiency}%
                        </div>
                        <div className="text-xs text-gray-600">Cost Efficiency</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-sm font-medium text-purple-600">
                          {result.performanceMetrics.optimizationSpeed}%
                        </div>
                        <div className="text-xs text-gray-600">Speed</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-sm font-medium text-orange-600">
                          {result.performanceMetrics.reliabilityScore}%
                        </div>
                        <div className="text-xs text-gray-600">Reliability</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model & Provider Info */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Model: {getModelDisplayName(result.summary.model)}</Badge>
                  <Badge variant="outline">Provider: {result.summary.provider}</Badge>
                  <Badge variant="outline">Cost: ${result.summary.costSavings.optimized.toFixed(6)}</Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Fine-tune
                  </Button>
                </div>
              </div>
            )}

            {!isProcessing && !result && (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter a prompt and task, then click "Process with AI" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${result.summary.costSavings.reduction.toFixed(6)}
                </div>
                <div className="text-sm text-gray-600">Cost Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.summary.tokenSavings.reduction}</div>
                <div className="text-sm text-gray-600">Tokens Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.performanceMetrics?.optimizationSpeed || 95}%
                </div>
                <div className="text-sm text-gray-600">Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {result.performanceMetrics?.reliabilityScore || 98}%
                </div>
                <div className="text-sm text-gray-600">Reliability</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
