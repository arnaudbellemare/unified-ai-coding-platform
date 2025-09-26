'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dna, TrendingDown, DollarSign, Target, Zap, BarChart3, Sparkles, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface GEPAResults {
  original: {
    prompt: string
    tokens: number
    cost: number
  }
  optimized: {
    prompt: string
    tokens: number
    cost: number
    quality: number
    fitness: number
  }
  savings: {
    tokenReduction: number
    costReduction: number
    tokenReductionPercentage: number
    costReductionPercentage: number
    estimatedMonthlySavings: number
  }
  optimization: {
    totalGenerations: number
    totalCost: number
    costSavings: number
    history: Array<{
      generation: number
      bestFitness: number
      averageCost: number
      costReduction: number
    }>
  }
  population: Array<{
    id: string
    prompt: string
    tokens: number
    cost: number
    quality: number
    fitness: number
  }>
}

export function GEPAOptimization() {
  const [prompt, setPrompt] = useState('')
  const [targetModel, setTargetModel] = useState('gpt-4o-mini')
  const [qualityThreshold, setQualityThreshold] = useState(0.8)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [results, setResults] = useState<GEPAResults | null>(null)
  const [optimizationProgress, setOptimizationProgress] = useState(0)

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to optimize')
      return
    }

    setIsOptimizing(true)
    setOptimizationProgress(0)
    setResults(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setOptimizationProgress((prev) => Math.min(prev + 10, 90))
      }, 1000)

      const response = await fetch('/api/gepa/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          targetModel,
          qualityThreshold,
        }),
      })

      clearInterval(progressInterval)
      setOptimizationProgress(100)

      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
        toast.success('GEPA optimization completed!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Optimization failed')
      }
    } catch (error) {
      console.error('GEPA optimization error:', error)
      toast.error('Failed to optimize prompt')
    } finally {
      setIsOptimizing(false)
      setOptimizationProgress(0)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-purple-600" />
            GEPA Cost Optimization
          </CardTitle>
          <CardDescription>
            Use Genetic Evolutionary Programming Algorithm to optimize prompts for maximum cost efficiency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt to Optimize</label>
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Model</label>
              <Input value={targetModel} onChange={(e) => setTargetModel(e.target.value)} placeholder="gpt-4o-mini" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality Threshold (0.0 - 1.0)</label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={qualityThreshold}
                onChange={(e) => setQualityThreshold(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <Button onClick={handleOptimize} disabled={isOptimizing || !prompt.trim()} className="w-full">
            {isOptimizing ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Optimizing with GEPA...
              </>
            ) : (
              <>
                <Dna className="h-4 w-4 mr-2" />
                Start GEPA Optimization
              </>
            )}
          </Button>

          {isOptimizing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Optimization Progress</span>
                <span>{optimizationProgress}%</span>
              </div>
              <Progress value={optimizationProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          {/* Results Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Optimization Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingDown className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {results.savings.tokenReductionPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Token Reduction</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {results.savings.costReductionPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Cost Reduction</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{results.optimized.quality.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Quality Score</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Zap className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{results.optimized.fitness.toFixed(3)}</div>
                  <div className="text-sm text-gray-600">Fitness Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="optimized">Optimized Prompt</TabsTrigger>
              <TabsTrigger value="population">Population</TabsTrigger>
              <TabsTrigger value="history">Evolution History</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Original</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Prompt:</div>
                      <div className="p-3 bg-gray-50 rounded text-sm">{results.original.prompt}</div>
                      <div className="flex justify-between">
                        <span>Tokens: {results.original.tokens}</span>
                        <span>Cost: ${results.original.cost.toFixed(6)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimized</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Prompt:</div>
                      <div className="p-3 bg-green-50 rounded text-sm">{results.optimized.prompt}</div>
                      <div className="flex justify-between">
                        <span>Tokens: {results.optimized.tokens}</span>
                        <span>Cost: ${results.optimized.cost.toFixed(6)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Savings Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{results.savings.tokenReduction}</div>
                      <div className="text-sm text-gray-600">Tokens Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${results.savings.costReduction.toFixed(6)}
                      </div>
                      <div className="text-sm text-gray-600">Cost Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ${results.savings.estimatedMonthlySavings.toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-600">Monthly Savings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{results.optimization.totalGenerations}</div>
                      <div className="text-sm text-gray-600">Generations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="optimized" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Optimized Prompt</CardTitle>
                  <CardDescription>This is the best solution found by GEPA optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{results.optimized.prompt}</pre>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => navigator.clipboard.writeText(results.optimized.prompt)}
                      variant="outline"
                      size="sm"
                    >
                      Copy Prompt
                    </Button>
                    <Badge variant="secondary">Quality: {results.optimized.quality.toFixed(2)}</Badge>
                    <Badge variant="secondary">Fitness: {results.optimized.fitness.toFixed(3)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="population" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Solutions</CardTitle>
                  <CardDescription>Best solutions from the final population</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.population.map((solution, index) => (
                      <div key={solution.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Solution #{index + 1}</div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{solution.tokens} tokens</Badge>
                            <Badge variant="outline">${solution.cost.toFixed(6)}</Badge>
                            <Badge variant="outline">Q: {solution.quality.toFixed(2)}</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{solution.prompt}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolution History</CardTitle>
                  <CardDescription>How the optimization progressed through generations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.optimization.history.map((gen, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="font-medium">Generation {gen.generation}</div>
                          <div className="text-sm text-gray-600">Best Fitness: {gen.bestFitness.toFixed(3)}</div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div>Avg Cost: ${gen.averageCost.toFixed(6)}</div>
                          <div className="text-green-600">Reduction: {gen.costReduction.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
