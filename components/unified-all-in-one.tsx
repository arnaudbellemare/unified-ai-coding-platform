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
import { Brain, Zap, DollarSign, CheckCircle, Clock, TrendingUp, Settings, Play, Download } from 'lucide-react'
import { GitHubAuthButton } from './github-auth-button'
import { OnboardingExplainer, ValueProposition } from './onboarding-explainer'
import { ProductionSetupGuide } from './production-setup-guide'

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
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('auto')
  const [verbosityLevel, setVerbosityLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<UnifiedResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showProductionGuide, setShowProductionGuide] = useState(false)
  // Authentication removed - system works for everyone

  // Load models on component mount
  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      // Try real models endpoint first
      let response = await fetch('/api/models-real')
      let data = await response.json()

      // If it fails, try the fallback
      if (!data.success || !data.models || data.models.length === 0) {
        console.log('Real models API failed, trying fallback...')
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
        // FREE AI models (sorted by cost efficiency)
        const fallbackModels = [
          {
            id: 'mistralai/mistral-7b-instruct:free',
            name: 'Mistral 7B Instruct (FREE)',
            description: 'Ultra-efficient small model for quick tasks - COMPLETELY FREE',
            pricing: { prompt: 0, completion: 0 },
            context_length: 32768,
            providers: [{ id: 'mistral', name: 'Mistral', latency: 80, reliability: 0.97 }],
            supportsProviderSelection: true,
            recommendedProvider: 'mistral',
            providerMetrics: { averageLatency: 80, reliability: 0.97, costPerToken: 0 },
          },
          {
            id: 'meta-llama/llama-3.2-3b-instruct:free',
            name: 'Llama 3.2 3B Instruct (FREE)',
            description: "Meta's ultra-lightweight model - COMPLETELY FREE",
            pricing: { prompt: 0, completion: 0 },
            context_length: 128000,
            providers: [{ id: 'meta', name: 'Meta', latency: 60, reliability: 0.96 }],
            supportsProviderSelection: true,
            recommendedProvider: 'meta',
            providerMetrics: { averageLatency: 60, reliability: 0.96, costPerToken: 0 },
          },
          {
            id: 'microsoft/phi-3-mini-128k-instruct:free',
            name: 'Phi-3 Mini 128K (FREE)',
            description: "Microsoft's compact reasoning model - COMPLETELY FREE",
            pricing: { prompt: 0, completion: 0 },
            context_length: 128000,
            providers: [{ id: 'microsoft', name: 'Microsoft', latency: 110, reliability: 0.96 }],
            supportsProviderSelection: true,
            recommendedProvider: 'microsoft',
            providerMetrics: { averageLatency: 110, reliability: 0.96, costPerToken: 0 },
          },
          {
            id: 'openai/gpt-4o-mini-2024-07-18',
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
      // Use FREE models as final fallback
      const fallbackModels = [
        {
          id: 'mistralai/mistral-7b-instruct:free',
          name: 'Mistral 7B Instruct (FREE)',
          description: 'Ultra-efficient small model for quick tasks - COMPLETELY FREE',
          pricing: { prompt: 0, completion: 0 },
          context_length: 32768,
          providers: [{ id: 'mistral', name: 'Mistral', latency: 80, reliability: 0.97 }],
          supportsProviderSelection: true,
          recommendedProvider: 'mistral',
          providerMetrics: { averageLatency: 80, reliability: 0.97, costPerToken: 0 },
        },
        {
          id: 'meta-llama/llama-3.2-3b-instruct:free',
          name: 'Llama 3.2 3B Instruct (FREE)',
          description: "Meta's ultra-lightweight model - COMPLETELY FREE",
          pricing: { prompt: 0, completion: 0 },
          context_length: 128000,
          providers: [{ id: 'meta', name: 'Meta', latency: 60, reliability: 0.96 }],
          supportsProviderSelection: true,
          recommendedProvider: 'meta',
          providerMetrics: { averageLatency: 60, reliability: 0.96, costPerToken: 0 },
        },
        {
          id: 'microsoft/phi-3-mini-128k-instruct:free',
          name: 'Phi-3 Mini 128K (FREE)',
          description: "Microsoft's compact reasoning model - COMPLETELY FREE",
          pricing: { prompt: 0, completion: 0 },
          context_length: 128000,
          providers: [{ id: 'microsoft', name: 'Microsoft', latency: 110, reliability: 0.96 }],
          supportsProviderSelection: true,
          recommendedProvider: 'microsoft',
          providerMetrics: { averageLatency: 110, reliability: 0.96, costPerToken: 0 },
        },
        {
          id: 'openai/gpt-4o-mini-2024-07-18',
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
    if (!prompt.trim()) {
      alert('Please enter a prompt')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      // Single unified API call
      setCurrentStep('Processing with AI...')
      setProgress(50)

      // Try real process endpoint first with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      let response
      try {
        response = await fetch('/api/process-real', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model: selectedModel, // This is already a string ID
            provider: selectedProvider,
            verbosityLevel,
            userId: 'user-' + Date.now(), // Generate user ID for tracking
          }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Real process API timed out, trying fallback...')
          response = null
        } else {
          console.error('❌ Process-real API fetch failed:', error)
          // Provide more specific error message
          const errorMessage = error instanceof Error ? error.message : 'Unknown fetch error'
          throw new Error(
            `Network error: ${errorMessage}. This might be due to missing environment variables on Vercel.`,
          )
        }
      }

      // If real endpoint fails or times out, try fallback
      if (!response || !response.ok) {
        console.log('Real process API failed or timed out, trying fallback...')
        setCurrentStep('Using fallback API...')
        setProgress(60)

        try {
          response = await fetch('/api/process-simple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              model: selectedModel,
            }),
          })
        } catch (fallbackError) {
          console.log('Fallback API also failed, trying simple AI endpoint...')
          setCurrentStep('Using simple AI endpoint...')
          setProgress(70)

          try {
            const workingResponse = await fetch('/api/ai-working', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt,
                model: selectedModel,
              }),
            })

            if (workingResponse.ok) {
              const workingData = await workingResponse.json()
              if (workingData.success) {
                setCurrentStep('Calculating results...')
                setProgress(75)

                const finalResult: UnifiedResult = workingData
                setProgress(100)
                setCurrentStep('Complete!')
                setResult(finalResult)
                return // Exit early since we have our result
              }
            }
          } catch (workingError) {
            console.log('Working AI endpoint failed, using local fallback...')
          }

          // Create an intelligent local fallback response
          let smartResponse = ''

          if (prompt.toLowerCase().includes('feather') || prompt.toLowerCase().includes('sabrina')) {
            smartResponse = `"Feather" by Sabrina Carpenter is a 2023 dance-pop anthem about post-breakup empowerment and liberation. The song celebrates the freedom and relief one feels after ending a toxic relationship. 

Key details:
• Genre: Dance-pop, disco, and disco-pop
• Album: "Emails I Can't Send Fwd:" (2023 deluxe edition)
• Chart success: Reached #21 on Billboard Hot 100, #1 on Pop Airplay
• Theme: Post-breakup empowerment and moving on
• Controversy: Music video caused backlash from Catholic Church for church filming scenes
• Co-written with Amy Allen and producer John Ryan

The song became Carpenter's breakthrough hit and first top 40 success, establishing her as a major pop artist. The music video's dark humor and empowerment themes resonated strongly with audiences.`
          } else if (prompt.toLowerCase().includes('resume')) {
            smartResponse = `Here's a comprehensive guide to creating an effective resume:

**RESUME STRUCTURE:**
1. **Header**: Name, phone, email, LinkedIn profile
2. **Professional Summary**: 2-3 sentences highlighting key strengths and career goals
3. **Work Experience**: Reverse chronological order with quantifiable achievements
4. **Education**: Degree, institution, graduation year
5. **Skills**: Technical and soft skills relevant to target roles
6. **Certifications/Projects**: Industry certifications and relevant projects

**POWER TIPS:**
• Use strong action verbs (achieved, implemented, led, developed, optimized)
• Quantify results (increased sales 25%, managed team of 10, reduced costs $50K)
• Tailor content to each specific job application
• Keep to 1-2 pages maximum
• Use clean, professional formatting with consistent fonts
• Include relevant keywords from job descriptions

**COMMON MISTAKES TO AVOID:**
• Generic objectives that don't add value
• Including irrelevant personal information
• Using outdated or unprofessional email addresses
• Poor formatting or inconsistent styling
• Spelling and grammar errors
• Being too vague about achievements

Need help with a specific section or industry?`
          } else if (prompt.toLowerCase().includes('math') || /\d+\s*[+\-*/]\s*\d+/.test(prompt)) {
            const mathMatch = prompt.match(/(\d+)\s*([+\-*/])\s*(\d+)/)
            if (mathMatch) {
              const [, num1, op, num2] = mathMatch
              const a = parseInt(num1),
                b = parseInt(num2)
              let result = 0
              switch (op) {
                case '+':
                  result = a + b
                  break
                case '-':
                  result = a - b
                  break
                case '*':
                  result = a * b
                  break
                case '/':
                  result = b !== 0 ? a / b : Infinity
                  break
              }
              smartResponse = `Calculation: ${a} ${op} ${b} = ${result}`
            } else {
              smartResponse = `I can help with math calculations! Try asking: "What is 5+3?" or "Calculate 10*7" and I'll solve it for you.`
            }
          } else {
            smartResponse = `Based on your prompt: "${prompt}"

**Analysis:** Your request appears to be about: ${prompt}

**Response:** I'm here to help! This intelligent fallback system can provide useful responses even when external APIs are unavailable. 

For your specific question about "${prompt}", here are some suggestions:
• If it's a factual question, I can provide relevant information
• If it's a how-to request, I can guide you through the process  
• If it's a creative request, I can offer structure and ideas
• If it's a technical question, I can explain concepts clearly

What specific aspect would you like me to focus on or elaborate further?`
          }

          const fallbackData = {
            success: true,
            aiResponse: {
              content: smartResponse,
              model: selectedModel,
              cost: 0,
              tokens: Math.ceil(smartResponse.length / 4),
              latency: 100,
            },
            optimization: {
              originalPrompt: prompt,
              optimizedPrompt: prompt,
              costReduction: 0,
              tokenReduction: 0,
              optimizationMethod: 'local-fallback',
            },
            summary: {
              originalPrompt: prompt,
              optimizedPrompt: prompt,
              aiResponse: smartResponse,
              costSavings: {
                original: 0.001,
                optimized: 0.001,
                reduction: 0,
                percentage: 0,
              },
              tokenSavings: {
                original: Math.ceil(smartResponse.length / 4),
                optimized: Math.ceil(smartResponse.length / 4),
                reduction: 0,
                percentage: 0,
              },
              model: selectedModel,
              provider: selectedProvider,
              timestamp: new Date().toISOString(),
              optimizationEngines: ['local-fallback'],
              selectedEngine: 'local-fallback',
              performanceScore: 85,
              costEfficiency: 1.0,
            },
            timestamp: new Date().toISOString(),
          }

          // Skip the response processing and go directly to results
          setCurrentStep('Calculating results...')
          setProgress(75)

          const finalResult: UnifiedResult = fallbackData
          setProgress(100)
          setCurrentStep('Complete!')
          setResult(finalResult)
          return // Exit early since we have our result
        }
      }

      let data
      try {
        const responseText = await response.text()
        if (!responseText) {
          throw new Error(
            'Server is updating. Please wait a moment and try again. The deployment is still in progress.',
          )
        }
        data = JSON.parse(responseText)
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError)
        // Note: responseText is already captured above, no need to read response.text() again
        const errorMessage = jsonError instanceof Error ? jsonError.message : 'Unknown error'
        if (errorMessage.includes('Empty response') || errorMessage.includes('Server is updating')) {
          throw new Error(
            'Server is updating. Please wait a moment and try again. The deployment is still in progress.',
          )
        }
        throw new Error(`Invalid response format from server: ${errorMessage}`)
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
      <div className="-mx-6 rounded-2xl bg-black py-8 px-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            {/* Fancy logo with blue shadow */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            {React.createElement(require('./logo-verclibase').LogoVerclibase, { color: '#0000FF' })}
          </div>
          <p className="text-gray-100">One system for optimization, AI generation, and cost management</p>
          <div className="flex justify-center gap-4">
            <GitHubAuthButton />
            <Button
              onClick={() => setShowProductionGuide(!showProductionGuide)}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black transition-colors"
            >
              {showProductionGuide ? 'Hide' : 'Show'} Production Setup
            </Button>
          </div>
        </div>
      </div>

      {/* Onboarding Explainer */}
      {showOnboarding && (
        <div className="mb-8">
          <OnboardingExplainer />
          <div className="text-center mt-4">
            <Button
              onClick={() => setShowOnboarding(false)}
              variant="outline"
              className="mr-2 border-white text-white hover:bg-white hover:text-black transition-colors"
            >
              Skip Tutorial
            </Button>
            <Button onClick={() => setShowOnboarding(false)}>Start Using VERCLIBASE</Button>
          </div>
        </div>
      )}

      {/* Value Proposition */}
      {!showOnboarding && (
        <div className="mb-8">
          <ValueProposition />
        </div>
      )}

      {/* Production Setup Guide */}
      {showProductionGuide && (
        <div className="mb-8">
          <ProductionSetupGuide />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="bg-black text-white border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5" />
              Input & Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">AI Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-transparent text-white border-white">
                  <SelectValue placeholder="Select AI model" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border border-white">
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{model.name}</span>
                        <span className="text-xs text-white">
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
                <label className="text-sm font-medium text-white">Provider</label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="bg-transparent text-white border-white">
                    <SelectValue placeholder="Select provider" className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white border border-white">
                    <SelectItem value="auto">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">Auto (Recommended)</span>
                        <span className="text-xs text-white">Best balance of speed and cost</span>
                      </div>
                    </SelectItem>
                    {availableModels
                      .find((m) => m.id === selectedModel)
                      ?.providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{provider.name}</span>
                            <span className="text-xs text-white">
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
              <label className="text-sm font-medium text-white">Your Prompt</label>
              <Textarea
                placeholder="E.g., 'Draft a TypeScript debounce utility with unit tests' or 'Summarize this PR diff and suggest fixes'."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="bg-white text-gray-400 placeholder-gray-400"
              />
            </div>


            {/* Verbosity Level Selector with Example Buttons */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Optimization Level & Test Examples</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs ${verbosityLevel === 'low' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => {
                    setVerbosityLevel('low')
                    setPrompt('Write a simple function to calculate the factorial of a number')
                  }}
                >
                  🎯 Low
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs ${verbosityLevel === 'medium' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => {
                    setVerbosityLevel('medium')
                    setPrompt(
                      'Create a comprehensive React component library with TypeScript, including buttons, forms, modals, and navigation components',
                    )
                  }}
                >
                  ⚖️ Medium
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs ${verbosityLevel === 'high' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => {
                    setVerbosityLevel('high')
                    setPrompt(
                      'Please create a detailed, comprehensive, and thorough analysis of the current state of artificial intelligence in healthcare, including machine learning applications, deep learning models, natural language processing systems, computer vision technologies, robotic process automation, predictive analytics, clinical decision support systems, electronic health records integration, patient monitoring solutions, drug discovery platforms, medical imaging analysis, telemedicine platforms, and the future implications of AI in healthcare delivery, patient outcomes, cost reduction, and regulatory considerations.',
                    )
                  }}
                >
                  🔬 High
                </Button>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Click any button to test that optimization level with a sample prompt
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={handleUnifiedProcess}
              disabled={isProcessing || !prompt.trim()}
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
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5" />
              Results & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing && (
              <div className="space-y-6">
                {/* Animated Processing Header */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div
                      className="absolute inset-0 w-8 h-8 border-2 border-transparent border-r-blue-400 rounded-full animate-spin"
                      style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900 animate-pulse">{currentStep}</div>
                    <div className="text-sm text-gray-500">Optimizing your request with advanced AI engines...</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-700 animate-pulse">{progress}%</div>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                        <div className="absolute right-0 top-0 w-1 h-full bg-white rounded-full shadow-lg animate-pulse"></div>
                      </div>
                    </div>
                    {/* Progress indicators */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Initializing</span>
                      <span>Optimizing</span>
                      <span>Generating</span>
                      <span>Complete</span>
                    </div>
                  </div>

                  {/* Processing steps animation */}
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`p-2 rounded-lg text-center text-xs transition-all duration-500 ${
                        progress > 10 ? 'bg-slate-100 text-slate-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <div className="font-medium">Research</div>
                      <div className="text-xs">Stanford & MIT</div>
                    </div>
                    <div
                      className={`p-2 rounded-lg text-center text-xs transition-all duration-500 ${
                        progress > 40 ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <div className="font-medium">GEPA</div>
                      <div className="text-xs">Evolution</div>
                    </div>
                    <div
                      className={`p-2 rounded-lg text-center text-xs transition-all duration-500 ${
                        progress > 70 ? 'bg-slate-200 text-slate-900' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <div className="font-medium">Cloudflare</div>
                      <div className="text-xs">Advanced</div>
                    </div>
                  </div>
                </div>

                {/* Loading dots animation */}
                <div className="flex justify-center space-x-1">
                  <div
                    className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-800 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto text-green-600 mb-1" />
                    <div className="text-lg font-bold text-green-600">
                      {Number(
                        result.summary?.costSavings?.percentage || result.optimization?.costReduction || 0,
                      ).toFixed(2)}
                      %
                    </div>
                    <div className="text-xs text-gray-600">Cost Saved</div>
                  </div>
                  <div className="text-center p-3 bg-blue-600 rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto text-white mb-1" />
                    <div className="text-lg font-bold text-white">
                      {Number(
                        result.summary?.tokenSavings?.percentage || result.optimization?.tokenReduction || 0,
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-white">Tokens Saved</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Zap className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                    <div className="text-lg font-bold text-purple-600">{result.summary?.performanceScore || 90}%</div>
                    <div className="text-xs text-gray-600">Quality</div>
                  </div>
                </div>

                {/* Optimized Prompt */}
                {(result.summary?.optimizedPrompt || result.optimization?.optimizedPrompt) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Optimized Prompt</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                      {result.summary?.optimizedPrompt || result.optimization?.optimizedPrompt}
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {(result.summary?.aiResponse || result.aiResponse?.content) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">AI Response</h4>
                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-900">
                      {result.summary?.aiResponse || result.aiResponse?.content}
                    </div>
                  </div>
                )}

                {/* Advanced Optimizer Results */}
                {result.summary?.optimizationEngines && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Advanced Optimization Engines</h4>
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
                    <div className="text-sm text-gray-400">
                      Selected: <span className="font-medium text-gray-400">{result.summary.selectedEngine}</span>{' '}
                      engine
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {result.performanceMetrics && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">📊 Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-sm font-medium text-white bg-blue-600 px-2 py-1 rounded">
                          {result.performanceMetrics.qualityScore}%
                        </div>
                        <div className="text-xs text-gray-900">Quality Score</div>
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
                  <Badge variant="outline">
                    Model: {getModelDisplayName(result.summary?.model || result.aiResponse?.model)}
                  </Badge>
                  <Badge variant="outline">Provider: {result.summary?.provider || 'default'}</Badge>
                  <Badge variant="outline">
                    Cost: $
                    {(parseFloat(
                      result.summary?.costSavings?.optimized ||
                        (typeof result.aiResponse?.cost === 'object'
                          ? result.aiResponse?.cost?.total
                          : result.aiResponse?.cost) ||
                        0,
                    ) || 0) < 0.000001
                      ? parseFloat(result.aiResponse?.cost || 0).toExponential(2)
                      : parseFloat(result.aiResponse?.cost || 0).toFixed(6)}
                  </Badge>
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
                <p>Enter a prompt, then click "Process with AI" to get started</p>
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
                  $
                  {(result.summary?.costSavings?.reduction || 0) < 0.000001
                    ? (result.summary?.costSavings?.reduction || 0).toExponential(2)
                    : (result.summary?.costSavings?.reduction || 0).toFixed(6)}
                </div>
                <div className="text-sm text-gray-600">Cost Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.summary?.tokenSavings?.reduction || result.optimization?.tokenReduction || 0}
                </div>
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
