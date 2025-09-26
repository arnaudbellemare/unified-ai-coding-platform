'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface CostOptimizationResult {
  originalCost: number
  optimizedCost: number
  savings: number
  savingsPercentage: string
  originalTokens: number
  optimizedTokens: number
  apiCalls: number
  realApiCost: number
  originalPrompt: string
  optimizedPrompt: string
  optimizationApplied: boolean
  estimatedMonthlySavings?: number
}

interface EnhancedOptimizationResult {
  optimizedPrompt: string
  strategies: string[]
  tokenReduction: number
  costReduction: number
  accuracyMaintained: number
  totalSavings: number
}

interface CostOptimizationProps {
  onOptimizationComplete?: (result: CostOptimizationResult) => void
}

export function CostOptimization({ onOptimizationComplete }: CostOptimizationProps) {
  const [prompt, setPrompt] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<{
    originalPrompt: string
    optimizedPrompt: string
    costOptimization: CostOptimizationResult
    enhancedOptimization?: EnhancedOptimizationResult
    optimizationEngine?: string
  } | null>(null)

  const handleOptimize = async () => {
    if (!prompt.trim()) return

    setIsOptimizing(true)
    setResult(null)

    try {
      // Use the new test optimizer API for enhanced optimization
      const response = await fetch('/api/test-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, testAllStrategies: false }),
      })

      const data = await response.json()

      if (data.success) {
        const resultData = {
          originalPrompt: data.originalPrompt,
          optimizedPrompt: data.enhancedOptimization.optimizedPrompt,
          costOptimization: data.costAnalysis,
          enhancedOptimization: data.enhancedOptimization,
        }
        setResult(resultData)
        onOptimizationComplete?.(data.costAnalysis)
      } else {
        console.error('Enhanced optimization failed:', data.error)

        // Fallback to original optimization
        const fallbackResponse = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })

        const fallbackData = await fallbackResponse.json()
        if (fallbackData.success) {
          setResult(fallbackData)
          onOptimizationComplete?.(fallbackData.costOptimization)
        }
      }
    } catch (error) {
      console.error('Optimization error:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>🚀 Advanced Cost Optimization</CardTitle>
            <CardDescription>
              ML-powered prompt optimization with hybrid algorithms to reduce API costs while maintaining quality
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Hybrid ML Engine
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Prompt to Optimize</label>
          <Textarea
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="mt-2 min-h-[200px] resize-none"
          />
        </div>

        <Button onClick={handleOptimize} disabled={isOptimizing || !prompt.trim()} className="w-full">
          {isOptimizing ? 'Optimizing...' : '🚀 Optimize for Cost'}
        </Button>

        {result && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Original Prompt</h4>
                <p className="text-sm text-muted-foreground bg-background p-2 rounded border">
                  {result.originalPrompt}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.originalPrompt.length} characters, {result.costOptimization.originalTokens} tokens
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Optimized Prompt</h4>
                <p className="text-sm text-muted-foreground bg-background p-2 rounded border">
                  {result.optimizedPrompt}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.optimizedPrompt.length} characters, {result.costOptimization.optimizedTokens} tokens
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Original Cost</p>
                <p className="text-lg font-semibold">${result.costOptimization.originalCost.toFixed(4)}</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Optimized Cost</p>
                <p className="text-lg font-semibold">${result.costOptimization.optimizedCost.toFixed(4)}</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Savings</p>
                <p className="text-lg font-semibold text-green-600">
                  ${(result.costOptimization.savings || 0).toFixed(4)} (
                  {result.costOptimization.savingsPercentage || '0%'})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Badge variant="outline">{result.costOptimization.apiCalls} API calls made</Badge>
              <Badge variant="outline">Real cost: ${(result.costOptimization.realApiCost || 0).toFixed(4)}</Badge>
              {result.optimizationEngine && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {result.optimizationEngine === 'prompt_optimizer'
                    ? 'Prompt Optimizer'
                    : result.optimizationEngine === 'capo_enhanced'
                      ? 'CAPO Enhanced'
                      : 'Hybrid Engine'}
                </Badge>
              )}
            </div>

            {/* Enhanced Optimization Details */}
            {result.enhancedOptimization && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">🚀 Enhanced Optimization Applied</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 dark:text-blue-300 font-medium">Strategies Used:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.enhancedOptimization.strategies.map((strategy, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {strategy.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-300 font-medium">Optimization Metrics:</p>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>Token Reduction:</span>
                        <span className="font-medium">
                          {(result.enhancedOptimization.tokenReduction * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accuracy Maintained:</span>
                        <span className="font-medium">
                          {(result.enhancedOptimization.accuracyMaintained * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Savings Estimate */}
            {result.costOptimization.estimatedMonthlySavings && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <span className="font-medium">💰 Estimated Monthly Savings:</span>
                  <span className="font-bold">${result.costOptimization.estimatedMonthlySavings.toFixed(2)}</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Based on 100 similar tasks per month</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
