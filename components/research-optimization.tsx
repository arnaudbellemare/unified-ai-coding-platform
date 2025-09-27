'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Microscope,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Brain,
  Sparkles,
  CheckCircle,
  BookOpen,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'

interface ResearchOptimizationResults {
  original: {
    prompt: string
    tokens: number
    cost: number
  }
  optimized: {
    prompt: string
    tokens: number
    cost: number
    performanceImprovement: number
  }
  savings: {
    tokenReduction: number
    costReduction: number
    performanceImprovement: number
    tokenReductionPercentage: string
    costReductionPercentage: string
    estimatedMonthlySavings: number
  }
  researchInsights: {
    promptLengthOptimized: boolean
    zeroShotApplied: boolean
    temperatureOptimized: boolean
    rolePlayingRemoved: boolean
    userPromptPrioritized: boolean
    effectiveFormattingApplied: boolean
    metaPromptingUsed: boolean
    modelSizeMatched: boolean
    repeatedInstructionsCached: boolean
    inputChunked: boolean
  }
  costSavings: {
    tokenSavings: number
    apiCallReduction: number
    retryElimination: number
    cacheUtilization: number
    totalMonthlySavings: number
  }
  performanceMetrics: {
    accuracyImprovement: number
    firstPassSuccessRate: number
    taskCompletionRate: number
    factualAccuracy: number
  }
  strategies: string[]
}

export function ResearchOptimization() {
  const [prompt, setPrompt] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [targetModel, setTargetModel] = useState('gpt-4o-mini')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [results, setResults] = useState<ResearchOptimizationResults | null>(null)
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

      const response = await fetch('/api/research/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          taskDescription,
          targetModel,
        }),
      })

      clearInterval(progressInterval)
      setOptimizationProgress(100)

      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
        toast.success('Research-backed optimization completed!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Optimization failed')
      }
    } catch (error) {
      console.error('Research optimization error:', error)
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
            <Microscope className="h-5 w-5 text-blue-600" />
            Research-Backed Cost Optimization
          </CardTitle>
          <CardDescription>
            Optimize prompts using Stanford, MIT, Berkeley, Google, and OpenAI research findings
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
              <label className="text-sm font-medium">Task Description</label>
              <Input
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe the task..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Model</label>
              <Input value={targetModel} onChange={(e) => setTargetModel(e.target.value)} placeholder="gpt-4o-mini" />
            </div>
          </div>

          <Button onClick={handleOptimize} disabled={isOptimizing || !prompt.trim()} className="w-full">
            {isOptimizing ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Applying Research Insights...
              </>
            ) : (
              <>
                <Microscope className="h-4 w-4 mr-2" />
                Start Research Optimization
              </>
            )}
          </Button>

          {isOptimizing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Research Analysis Progress</span>
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
                Research Optimization Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{results.savings.tokenReductionPercentage}%</div>
                  <div className="text-sm text-gray-600">Token Reduction</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{results.savings.costReductionPercentage}%</div>
                  <div className="text-sm text-gray-600">Cost Reduction</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {(results.performanceMetrics.accuracyImprovement * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy Improvement</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Zap className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {(results.performanceMetrics.firstPassSuccessRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">First-Pass Success</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="research">Research Insights</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Original Prompt</CardTitle>
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
                    <CardTitle className="text-lg">Research-Optimized</CardTitle>
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
                  <CardTitle>Research-Based Savings Analysis</CardTitle>
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
                        {(results.performanceMetrics.accuracyImprovement * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy Gain</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${results.savings.estimatedMonthlySavings.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Monthly Savings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="research" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Research Insights Applied
                  </CardTitle>
                  <CardDescription>Research findings that were applied to optimize your prompt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={results.researchInsights.promptLengthOptimized ? 'default' : 'secondary'}>
                          Stanford
                        </Badge>
                        <span className="text-sm">Prompt length optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={results.researchInsights.zeroShotApplied ? 'default' : 'secondary'}>MIT</Badge>
                        <span className="text-sm">Zero-shot conversion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={results.researchInsights.rolePlayingRemoved ? 'default' : 'secondary'}>
                          Berkeley
                        </Badge>
                        <span className="text-sm">Role-playing removal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={results.researchInsights.userPromptPrioritized ? 'default' : 'secondary'}>
                          OpenAI
                        </Badge>
                        <span className="text-sm">User prompt prioritization</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={results.researchInsights.effectiveFormattingApplied ? 'default' : 'secondary'}>
                          Formatting
                        </Badge>
                        <span className="text-sm">XML/Markdown formatting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={results.researchInsights.metaPromptingUsed ? 'default' : 'secondary'}>
                          Google
                        </Badge>
                        <span className="text-sm">Meta-prompting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={results.researchInsights.modelSizeMatched ? 'default' : 'secondary'}>
                          Scaling
                        </Badge>
                        <span className="text-sm">Model size matching</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={results.researchInsights.repeatedInstructionsCached ? 'default' : 'secondary'}>
                          Caching
                        </Badge>
                        <span className="text-sm">Instruction caching</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Performance improvements based on research findings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Accuracy Improvement</span>
                        <span className="text-lg font-bold text-green-600">
                          {(results.performanceMetrics.accuracyImprovement * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">First-Pass Success Rate</span>
                        <span className="text-lg font-bold text-blue-600">
                          {(results.performanceMetrics.firstPassSuccessRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Task Completion Rate</span>
                        <span className="text-lg font-bold text-purple-600">
                          {(results.performanceMetrics.taskCompletionRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Factual Accuracy</span>
                        <span className="text-lg font-bold text-orange-600">
                          {(results.performanceMetrics.factualAccuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium mb-2">Cost Savings</div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${results.costSavings.totalMonthlySavings.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Monthly projection</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-600 font-medium mb-2">API Call Reduction</div>
                        <div className="text-2xl font-bold text-green-600">
                          {(results.costSavings.apiCallReduction * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Fewer API calls needed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Optimization Strategies Applied
                  </CardTitle>
                  <CardDescription>Research-backed strategies used to optimize your prompt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.strategies.map((strategy, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{strategy.replace(/_/g, ' ')}</span>
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
