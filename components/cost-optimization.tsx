'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface CostOptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: string;
  originalTokens: number;
  optimizedTokens: number;
  apiCalls: number;
  realApiCost: number;
}

interface CostOptimizationProps {
  onOptimizationComplete?: (result: CostOptimizationResult) => void;
}

export function CostOptimization({ onOptimizationComplete }: CostOptimizationProps) {
  const [prompt, setPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<{
    originalPrompt: string;
    optimizedPrompt: string;
    costOptimization: CostOptimizationResult;
  } | null>(null);

  const handleOptimize = async () => {
    if (!prompt.trim()) return;

    setIsOptimizing(true);
    setResult(null);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        onOptimizationComplete?.(data.costOptimization);
      } else {
        console.error('Optimization failed:', data.error);
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Cost Optimization</CardTitle>
        <CardDescription>
          Optimize your prompts to reduce API costs while maintaining quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Prompt to Optimize</label>
          <Textarea
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>

        <Button 
          onClick={handleOptimize} 
          disabled={isOptimizing || !prompt.trim()}
          className="w-full"
        >
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
                  ${result.costOptimization.savings.toFixed(4)} ({result.costOptimization.savingsPercentage})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Badge variant="outline">
                {result.costOptimization.apiCalls} API calls made
              </Badge>
              <Badge variant="outline">
                Real cost: ${result.costOptimization.realApiCost.toFixed(4)}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
