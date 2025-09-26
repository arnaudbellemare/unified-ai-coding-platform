'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Zap, DollarSign, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface OpenRouterModel {
  id: string
  name: string
  description: string
  pricing: {
    prompt: number
    completion: number
  }
  context_length: number
  architecture: {
    modality: string
    tokenizer: string
    instruct_type?: string
  }
}

interface ModelSelectorProps {
  onModelSelect: (model: OpenRouterModel) => void
  selectedModel?: OpenRouterModel
  isAuthenticated: boolean
  userCredits: number
}

export function OpenRouterModelSelector({
  onModelSelect,
  selectedModel,
  isAuthenticated,
  userCredits,
}: ModelSelectorProps) {
  const [models, setModels] = useState<OpenRouterModel[]>([])
  const [filteredModels, setFilteredModels] = useState<OpenRouterModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    filterModels()
  }, [models, searchQuery, selectedCategory, sortBy])

  const loadModels = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/openrouter/models')
      if (!response.ok) {
        throw new Error('Failed to load models')
      }
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Error loading models:', error)
      toast.error('Failed to load models')
    } finally {
      setIsLoading(false)
    }
  }

  const filterModels = () => {
    let filtered = [...models]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((model) => {
        switch (selectedCategory) {
          case 'gpt':
            return model.name.toLowerCase().includes('gpt')
          case 'claude':
            return model.name.toLowerCase().includes('claude')
          case 'llama':
            return model.name.toLowerCase().includes('llama')
          case 'gemini':
            return model.name.toLowerCase().includes('gemini')
          case 'mistral':
            return model.name.toLowerCase().includes('mistral')
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return a.pricing.prompt - b.pricing.prompt
        case 'context':
          return b.context_length - a.context_length
        default:
          return 0
      }
    })

    setFilteredModels(filtered)
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${(price * 1000).toFixed(2)}/1K tokens`
    }
    return `$${price.toFixed(2)}/1M tokens`
  }

  const getModelCategory = (model: OpenRouterModel) => {
    const name = model.name.toLowerCase()
    if (name.includes('gpt')) return 'GPT'
    if (name.includes('claude')) return 'Claude'
    if (name.includes('llama')) return 'Llama'
    if (name.includes('gemini')) return 'Gemini'
    if (name.includes('mistral')) return 'Mistral'
    return 'Other'
  }

  const getModelIcon = (model: OpenRouterModel) => {
    const category = getModelCategory(model)
    switch (category) {
      case 'GPT':
        return '🤖'
      case 'Claude':
        return '🧠'
      case 'Llama':
        return '🦙'
      case 'Gemini':
        return '💎'
      case 'Mistral':
        return '🌪️'
      default:
        return '🤖'
    }
  }

  const estimateCost = (model: OpenRouterModel, promptTokens: number, completionTokens: number) => {
    const promptCost = (promptTokens / 1000000) * model.pricing.prompt
    const completionCost = (completionTokens / 1000000) * model.pricing.completion
    return promptCost + completionCost
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Wallet Connection Required
          </CardTitle>
          <CardDescription>Connect your wallet to access OpenRouter AI models and pay per use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Connect your wallet to start using OpenRouter AI models</p>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  // Simulate wallet connection for demo
                  toast.success('Wallet connected! (Demo mode)')
                  // In real implementation, this would trigger Privy wallet connection
                }}
                className="w-full"
                size="lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>

              <div className="text-sm text-muted-foreground">
                <p>Supported wallets:</p>
                <div className="flex justify-center gap-4 mt-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">MetaMask</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">WalletConnect</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">Coinbase Wallet</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">What you'll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Access to 100+ OpenRouter AI models</li>
              <li>• Pay only for tokens you use</li>
              <li>• Generate and run code in secure sandbox</li>
              <li>• Create AI agents that work together</li>
              <li>• Real-time web search capabilities</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OpenRouter Model Selection</h2>
          <p className="text-muted-foreground">Choose your preferred LLM and pay only for what you use</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {userCredits} credits
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Search & Filter</CardTitle>
          <CardDescription>Find the perfect model for your needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="gpt">GPT Models</SelectItem>
                <SelectItem value="claude">Claude Models</SelectItem>
                <SelectItem value="llama">Llama Models</SelectItem>
                <SelectItem value="gemini">Gemini Models</SelectItem>
                <SelectItem value="mistral">Mistral Models</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="context">Context Length</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading models...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredModels.map((model) => (
            <Card
              key={model.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedModel?.id === model.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onModelSelect(model)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getModelIcon(model)}</span>
                      <h3 className="font-semibold text-lg">{model.name}</h3>
                      <Badge variant="outline">{getModelCategory(model)}</Badge>
                      {selectedModel?.id === model.id && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Prompt: {formatPrice(model.pricing.prompt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        <span>Completion: {formatPrice(model.pricing.completion)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        <span>Context: {model.context_length.toLocaleString()} tokens</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Est. cost for 1K prompt + 500 completion:</div>
                    <div className="font-semibold">${estimateCost(model, 1000, 500).toFixed(4)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredModels.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No models found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}
