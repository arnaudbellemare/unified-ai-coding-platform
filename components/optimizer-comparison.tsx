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
  Trophy,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Brain,
  Sparkles,
  CheckCircle,
  BarChart3,
  Clock,
  Shield,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'

interface OptimizerResult {
  optimizer: string
  optimizedPrompt: string
  tokenReduction: number
  costReduction: number
  accuracyImprovement: number
  executionTime: number
  reliability: number
  strategies: string[]
  score: number
  strengths: string[]
  weaknesses: string[]
}

interface ComparisonResult {
  originalPrompt: string
  results: {
    capoHybrid: OptimizerResult
    gepaGenetic: OptimizerResult
    researchBacked: OptimizerResult
    cloudflareCodeMode: OptimizerResult
  }
  winner: {
    optimizer: string
    score: number
    reasoning: string
  }
  performanceAnalysis: {
    bestTokenReduction: string
    bestCostReduction: string
    bestAccuracyImprovement: string
    bestSpeed: string
    mostReliable: string
  }
  recommendations: {
    useFor: string
    avoidFor: string
    bestOverall: string
  }
}

interface TestCase {
  id: string
  name: string
  prompt: string
  taskDescription: string
  targetModel: string
  expectedComplexity: 'simple' | 'medium' | 'complex'
  expectedDomain: 'coding' | 'analysis' | 'documentation' | 'general'
}

export function OptimizerComparison() {
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [customTaskDescription, setCustomTaskDescription] = useState('')
  const [targetModel, setTargetModel] = useState('gpt-4o-mini')
  const [isComparing, setIsComparing] = useState(false)
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [overallStats, setOverallStats] = useState<any>(null)
  const [comparisonProgress, setComparisonProgress] = useState(0)

  const testCases: TestCase[] = [
    {
      id: 'simple-coding',
      name: 'Simple Coding Task',
      prompt:
        'Write a function that takes two numbers and returns their sum. Make sure to handle edge cases and add proper error handling.',
      taskDescription: 'Create a simple addition function with error handling',
      targetModel: 'gpt-4o-mini',
      expectedComplexity: 'simple',
      expectedDomain: 'coding',
    },
    {
      id: 'complex-analysis',
      name: 'Complex Analysis Task',
      prompt:
        'Analyze the performance of our machine learning model across different datasets. Consider accuracy, precision, recall, F1-score, and provide recommendations for improvement. Include statistical significance testing and confidence intervals.',
      taskDescription: 'Comprehensive ML model performance analysis',
      targetModel: 'gpt-4o',
      expectedComplexity: 'complex',
      expectedDomain: 'analysis',
    },
    {
      id: 'medium-documentation',
      name: 'Medium Documentation Task',
      prompt:
        'Create comprehensive documentation for our API endpoints. Include request/response examples, error codes, authentication requirements, rate limiting, and usage guidelines for developers.',
      taskDescription: 'API documentation creation',
      targetModel: 'gpt-4o-mini',
      expectedComplexity: 'medium',
      expectedDomain: 'documentation',
    },
    {
      id: 'long-conversational',
      name: 'Long Conversational Task',
      prompt:
        'I need you to act as an expert software architect and help me design a scalable microservices architecture for an e-commerce platform. Please consider factors like data consistency, service communication, load balancing, monitoring, security, and deployment strategies. Provide detailed explanations and examples.',
      taskDescription: 'Software architecture consultation',
      targetModel: 'gpt-4o',
      expectedComplexity: 'complex',
      expectedDomain: 'general',
    },
  ]

  const handleCompare = async (runAllTests = false) => {
    setIsComparing(true)
    setComparisonProgress(0)
    setResults([])
    setOverallStats(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setComparisonProgress((prev) => Math.min(prev + 10, 90))
      }, 1000)

      const response = await fetch('/api/optimizers/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testCase: selectedTestCase || {
            id: 'custom',
            name: 'Custom Test',
            prompt: customPrompt,
            taskDescription: customTaskDescription,
            targetModel,
            expectedComplexity: 'medium',
            expectedDomain: 'general',
          },
          runAllTests,
        }),
      })

      clearInterval(progressInterval)
      setComparisonProgress(100)

      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
        setOverallStats(data.overallStats)
        toast.success('Optimizer comparison completed!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Comparison failed')
      }
    } catch (error) {
      console.error('Optimizer comparison error:', error)
      toast.error('Failed to compare optimizers')
    } finally {
      setIsComparing(false)
      setComparisonProgress(0)
    }
  }

  const getOptimizerColor = (optimizer: string) => {
    switch (optimizer) {
      case 'CAPO Hybrid Enhanced':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'GEPA Genetic Algorithm':
        return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'Research-Backed Optimization':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'Cloudflare Code Mode':
        return 'bg-orange-50 text-orange-600 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Optimizer Comparison System
          </CardTitle>
          <CardDescription>
            Compare all optimization approaches to find the best performer for your use case
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="test-cases" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
              <TabsTrigger value="custom">Custom Test</TabsTrigger>
              <TabsTrigger value="all-tests">Run All Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="test-cases" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testCases.map((testCase) => (
                  <Card
                    key={testCase.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTestCase?.id === testCase.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTestCase(testCase)}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{testCase.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {testCase.expectedDomain} • {testCase.expectedComplexity}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {testCase.prompt.substring(0, 100)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Prompt</label>
                  <Textarea
                    placeholder="Enter your custom prompt here..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Description</label>
                    <Input
                      value={customTaskDescription}
                      onChange={(e) => setCustomTaskDescription(e.target.value)}
                      placeholder="Describe the task..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Model</label>
                    <Input
                      value={targetModel}
                      onChange={(e) => setTargetModel(e.target.value)}
                      placeholder="gpt-4o-mini"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all-tests" className="space-y-4">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <BarChart3 className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Run All Test Cases</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Compare all optimizers across multiple test scenarios to find the overall best performer
                </p>
                <Button onClick={() => handleCompare(true)} disabled={isComparing} className="w-full">
                  {isComparing ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Running All Tests...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button
              onClick={() => handleCompare(false)}
              disabled={isComparing || (!selectedTestCase && !customPrompt.trim())}
              className="flex-1"
            >
              {isComparing ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Comparing Optimizers...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Compare Optimizers
                </>
              )}
            </Button>
          </div>

          {isComparing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Comparison Progress</span>
                <span>{comparisonProgress}%</span>
              </div>
              <Progress value={comparisonProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-6">
          {/* Overall Winner */}
          {overallStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Overall Winner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{overallStats.overallWinner}</div>
                  <div className="text-sm text-gray-600">Best average performance across all tests</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Results */}
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Test Result {index + 1}
                </CardTitle>
                <CardDescription>
                  Winner: {result.winner.optimizer} (Score: {result.winner.score.toFixed(2)})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="comparison" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="comparison" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(result.results).map(([key, optResult]: [string, any]) => (
                        <Card key={key} className={`${getOptimizerColor(optResult.optimizer)}`}>
                          <CardContent className="p-4">
                            <div className="font-medium mb-2">{optResult.optimizer}</div>
                            <div className={`text-2xl font-bold mb-2 ${getScoreColor(optResult.score)}`}>
                              {optResult.score.toFixed(1)}
                            </div>
                            <div className="text-xs space-y-1">
                              <div>Tokens: -{optResult.tokenReduction}</div>
                              <div>Cost: ${optResult.costReduction.toFixed(6)}</div>
                              <div>Accuracy: +{(optResult.accuracyImprovement * 100).toFixed(1)}%</div>
                              <div>Time: {optResult.executionTime}ms</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Performance Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Best Token Reduction:</span>
                            <Badge variant="outline">{result.performanceAnalysis.bestTokenReduction}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Best Cost Reduction:</span>
                            <Badge variant="outline">{result.performanceAnalysis.bestCostReduction}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Best Accuracy:</span>
                            <Badge variant="outline">{result.performanceAnalysis.bestAccuracyImprovement}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Fastest:</span>
                            <Badge variant="outline">{result.performanceAnalysis.bestSpeed}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Most Reliable:</span>
                            <Badge variant="outline">{result.performanceAnalysis.mostReliable}</Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Recommendations</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Use for:</span> {result.recommendations.useFor}
                          </div>
                          <div>
                            <span className="font-medium">Avoid for:</span> {result.recommendations.avoidFor}
                          </div>
                          <div>
                            <span className="font-medium">Best overall:</span> {result.recommendations.bestOverall}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
