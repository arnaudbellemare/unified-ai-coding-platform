/**
 * Integrated Optimizer Comparison System
 * Tests and compares all optimization approaches to find the best performer
 */

import { TokenCounter } from './utils/token-counter'
import { hybridOptimizer } from './hybrid-optimizer'
import { gepaOptimizer } from './gepa-optimizer'
import { researchBackedOptimizer } from './research-backed-optimizer'
import { cloudflareCodeModeOptimizer } from './cloudflare-code-mode-optimizer'

export interface OptimizationComparisonResult {
  originalPrompt: string
  results: {
    capoHybrid: OptimizationResult
    gepaGenetic: OptimizationResult
    researchBacked: OptimizationResult
    cloudflareCodeMode: OptimizationResult
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

export interface OptimizationResult {
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

export interface TestCase {
  id: string
  name: string
  prompt: string
  taskDescription: string
  targetModel: string
  expectedComplexity: 'simple' | 'medium' | 'complex'
  expectedDomain: 'coding' | 'analysis' | 'documentation' | 'general'
}

export class IntegratedOptimizerComparison {
  private testCases: TestCase[] = [
    {
      id: 'simple-coding',
      name: 'Simple Coding Task',
      prompt: 'Write a function that takes two numbers and returns their sum. Make sure to handle edge cases and add proper error handling.',
      taskDescription: 'Create a simple addition function with error handling',
      targetModel: 'gpt-4o-mini',
      expectedComplexity: 'simple',
      expectedDomain: 'coding',
    },
    {
      id: 'complex-analysis',
      name: 'Complex Analysis Task',
      prompt: 'Analyze the performance of our machine learning model across different datasets. Consider accuracy, precision, recall, F1-score, and provide recommendations for improvement. Include statistical significance testing and confidence intervals.',
      taskDescription: 'Comprehensive ML model performance analysis',
      targetModel: 'gpt-4o',
      expectedComplexity: 'complex',
      expectedDomain: 'analysis',
    },
    {
      id: 'medium-documentation',
      name: 'Medium Documentation Task',
      prompt: 'Create comprehensive documentation for our API endpoints. Include request/response examples, error codes, authentication requirements, rate limiting, and usage guidelines for developers.',
      taskDescription: 'API documentation creation',
      targetModel: 'gpt-4o-mini',
      expectedComplexity: 'medium',
      expectedDomain: 'documentation',
    },
    {
      id: 'long-conversational',
      name: 'Long Conversational Task',
      prompt: 'I need you to act as an expert software architect and help me design a scalable microservices architecture for an e-commerce platform. Please consider factors like data consistency, service communication, load balancing, monitoring, security, and deployment strategies. Provide detailed explanations and examples.',
      taskDescription: 'Software architecture consultation',
      targetModel: 'gpt-4o',
      expectedComplexity: 'complex',
      expectedDomain: 'general',
    },
    {
      id: 'few-shot-example',
      name: 'Few-Shot Example Task',
      prompt: 'Example 1: Convert "hello world" to uppercase -> "HELLO WORLD"\nExample 2: Convert "test case" to uppercase -> "TEST CASE"\nNow convert "optimization test" to uppercase.',
      taskDescription: 'String conversion with examples',
      targetModel: 'gpt-3.5-turbo',
      expectedComplexity: 'simple',
      expectedDomain: 'general',
    },
  ]

  /**
   * Run comprehensive comparison of all optimizers
   */
  async runComprehensiveComparison(): Promise<OptimizationComparisonResult[]> {
    console.log('🔬 Starting comprehensive optimizer comparison...')
    
    const results: OptimizationComparisonResult[] = []

    for (const testCase of this.testCases) {
      console.log(`\n📊 Testing: ${testCase.name}`)
      console.log(`Domain: ${testCase.expectedDomain}, Complexity: ${testCase.expectedComplexity}`)
      
      const comparisonResult = await this.compareOptimizers(testCase)
      results.push(comparisonResult)
      
      console.log(`🏆 Winner: ${comparisonResult.winner.optimizer} (Score: ${comparisonResult.winner.score.toFixed(2)})`)
    }

    return results
  }

  /**
   * Compare all optimizers on a single test case
   */
  async compareOptimizers(testCase: TestCase): Promise<OptimizationComparisonResult> {
    const startTime = Date.now()
    
    // Run all optimizers in parallel
    const [capoResult, gepaResult, researchResult, cloudflareResult] = await Promise.all([
      this.runCAPOHybrid(testCase),
      this.runGEPAGenetic(testCase),
      this.runResearchBacked(testCase),
      this.runCloudflareCodeMode(testCase),
    ])

    const executionTime = Date.now() - startTime

    // Calculate scores and determine winner
    const results = {
      capoHybrid: capoResult,
      gepaGenetic: gepaResult,
      researchBacked: researchResult,
      cloudflareCodeMode: cloudflareResult,
    }

    const winner = this.determineWinner(results)
    const performanceAnalysis = this.analyzePerformance(results)
    const recommendations = this.generateRecommendations(results, testCase)

    return {
      originalPrompt: testCase.prompt,
      results,
      winner,
      performanceAnalysis,
      recommendations,
    }
  }

  /**
   * Run CAPO Hybrid Enhanced optimization
   */
  private async runCAPOHybrid(testCase: TestCase): Promise<OptimizationResult> {
    const startTime = Date.now()
    
    try {
      const result = await hybridOptimizer.optimize(
        testCase.prompt,
        {
          domain: testCase.expectedDomain,
          complexity: testCase.expectedComplexity,
          requirements: ['accuracy', 'cost-efficiency'],
          constraints: ['token-limit', 'response-time'],
        },
        []
      )

      const executionTime = Date.now() - startTime
      const originalTokens = await TokenCounter.countTokens(testCase.prompt, testCase.targetModel)
      const optimizedTokens = await TokenCounter.countTokens(result.optimizedPrompt, testCase.targetModel)
      
      return {
        optimizer: 'CAPO Hybrid Enhanced',
        optimizedPrompt: result.optimizedPrompt,
        tokenReduction: originalTokens - optimizedTokens,
        costReduction: result.costReduction,
        accuracyImprovement: result.accuracyMaintained,
        executionTime,
        reliability: 0.9, // High reliability for hybrid approach
        strategies: result.strategies,
        score: this.calculateScore(originalTokens, optimizedTokens, result.costReduction, executionTime, 0.9),
        strengths: [
          'Smart engine selection',
          'Racing algorithms for performance',
          'Multi-objective optimization',
          'High reliability',
        ],
        weaknesses: [
          'May be slower for simple tasks',
          'Complex setup required',
        ],
      }
    } catch (error) {
      console.error('CAPO Hybrid optimization failed:', error)
      return this.createFallbackResult('CAPO Hybrid Enhanced', testCase.prompt, startTime)
    }
  }

  /**
   * Run GEPA Genetic Algorithm optimization
   */
  private async runGEPAGenetic(testCase: TestCase): Promise<OptimizationResult> {
    const startTime = Date.now()
    
    try {
      const result = await gepaOptimizer.optimizePrompt(
        testCase.prompt,
        testCase.targetModel,
        0.8
      )

      const executionTime = Date.now() - startTime
      const originalTokens = await TokenCounter.countTokens(testCase.prompt, testCase.targetModel)
      
      return {
        optimizer: 'GEPA Genetic Algorithm',
        optimizedPrompt: result.bestSolution.prompt,
        tokenReduction: originalTokens - result.bestSolution.tokens,
        costReduction: result.costSavings,
        accuracyImprovement: result.bestSolution.quality,
        executionTime,
        reliability: 0.85, // Good reliability with evolutionary approach
        strategies: ['genetic_evolution', 'population_optimization', 'fitness_scoring'],
        score: this.calculateScore(originalTokens, result.bestSolution.tokens, result.costSavings, executionTime, 0.85),
        strengths: [
          'Evolutionary learning',
          'Quality preservation',
          'Adaptive optimization',
          'Scalable approach',
        ],
        weaknesses: [
          'Slower for simple tasks',
          'Requires multiple generations',
          'Higher computational cost',
        ],
      }
    } catch (error) {
      console.error('GEPA Genetic optimization failed:', error)
      return this.createFallbackResult('GEPA Genetic Algorithm', testCase.prompt, startTime)
    }
  }

  /**
   * Run Research-Backed optimization
   */
  private async runResearchBacked(testCase: TestCase): Promise<OptimizationResult> {
    const startTime = Date.now()
    
    try {
      const result = await researchBackedOptimizer.optimizeWithResearch(
        testCase.prompt,
        testCase.taskDescription,
        testCase.targetModel
      )

      const executionTime = Date.now() - startTime
      
      return {
        optimizer: 'Research-Backed Optimization',
        optimizedPrompt: result.optimizedPrompt,
        tokenReduction: result.tokenReduction,
        costReduction: result.costReduction,
        accuracyImprovement: result.performanceImprovement,
        executionTime,
        reliability: 0.95, // Very high reliability based on research
        strategies: result.strategies,
        score: this.calculateScore(
          result.tokenReduction + Math.floor(result.optimizedPrompt.length / 4),
          Math.floor(result.optimizedPrompt.length / 4),
          result.costReduction,
          executionTime,
          0.95
        ),
        strengths: [
          'Based on academic research',
          'High reliability',
          'Fast execution',
          'Proven effectiveness',
        ],
        weaknesses: [
          'May not adapt to new patterns',
          'Limited to research findings',
        ],
      }
    } catch (error) {
      console.error('Research-Backed optimization failed:', error)
      return this.createFallbackResult('Research-Backed Optimization', testCase.prompt, startTime)
    }
  }

  /**
   * Run Cloudflare Code Mode optimization
   */
  private async runCloudflareCodeMode(testCase: TestCase): Promise<OptimizationResult> {
    const startTime = Date.now()
    
    try {
      const result = await cloudflareCodeModeOptimizer.optimizeWithCodeMode(
        testCase.prompt,
        testCase.taskDescription,
        testCase.targetModel
      )

      const executionTime = Date.now() - startTime
      
      return {
        optimizer: 'Cloudflare Code Mode',
        optimizedPrompt: result.optimizedCode,
        tokenReduction: result.tokenReduction,
        costReduction: result.costReduction,
        accuracyImprovement: result.codeModeBenefits.llmAccuracyImprovement,
        executionTime,
        reliability: 0.8, // Good reliability with cutting-edge approach
        strategies: result.strategies,
        score: this.calculateScore(
          result.tokenReduction + Math.floor(result.optimizedCode.length / 4),
          Math.floor(result.optimizedCode.length / 4),
          result.costReduction,
          executionTime,
          0.8
        ),
        strengths: [
          'Cutting-edge technology',
          'High performance',
          'Cost-effective execution',
          'Modern architecture',
        ],
        weaknesses: [
          'Newer technology',
          'May have compatibility issues',
          'Requires Cloudflare infrastructure',
        ],
      }
    } catch (error) {
      console.error('Cloudflare Code Mode optimization failed:', error)
      return this.createFallbackResult('Cloudflare Code Mode', testCase.prompt, startTime)
    }
  }

  /**
   * Calculate optimization score
   */
  private calculateScore(
    originalTokens: number,
    optimizedTokens: number,
    costReduction: number,
    executionTime: number,
    reliability: number
  ): number {
    const tokenEfficiency = (originalTokens - optimizedTokens) / originalTokens
    const costEfficiency = costReduction
    const speedEfficiency = Math.max(0, 1 - executionTime / 10000) // Normalize to 10s max
    const reliabilityScore = reliability

    // Weighted score: 40% token efficiency, 30% cost efficiency, 20% speed, 10% reliability
    return (tokenEfficiency * 0.4 + costEfficiency * 0.3 + speedEfficiency * 0.2 + reliabilityScore * 0.1) * 100
  }

  /**
   * Determine the winner based on scores
   */
  private determineWinner(results: any): { optimizer: string; score: number; reasoning: string } {
    const scores = Object.entries(results).map(([key, result]: [string, any]) => ({
      optimizer: result.optimizer,
      score: result.score,
    }))

    const winner = scores.reduce((best, current) => (current.score > best.score ? current : best))
    
    let reasoning = ''
    if (winner.score > 80) {
      reasoning = 'Excellent performance across all metrics'
    } else if (winner.score > 70) {
      reasoning = 'Good performance with strong optimization'
    } else if (winner.score > 60) {
      reasoning = 'Decent performance with room for improvement'
    } else {
      reasoning = 'Below average performance, needs optimization'
    }

    return {
      optimizer: winner.optimizer,
      score: winner.score,
      reasoning,
    }
  }

  /**
   * Analyze performance across all optimizers
   */
  private analyzePerformance(results: any): any {
    const metrics = Object.values(results) as OptimizationResult[]
    
    const bestTokenReduction = metrics.reduce((best, current) => 
      current.tokenReduction > best.tokenReduction ? current : best
    )
    
    const bestCostReduction = metrics.reduce((best, current) => 
      current.costReduction > best.costReduction ? current : best
    )
    
    const bestAccuracyImprovement = metrics.reduce((best, current) => 
      current.accuracyImprovement > best.accuracyImprovement ? current : best
    )
    
    const bestSpeed = metrics.reduce((best, current) => 
      current.executionTime < best.executionTime ? current : best
    )
    
    const mostReliable = metrics.reduce((best, current) => 
      current.reliability > best.reliability ? current : best
    )

    return {
      bestTokenReduction: bestTokenReduction.optimizer,
      bestCostReduction: bestCostReduction.optimizer,
      bestAccuracyImprovement: bestAccuracyImprovement.optimizer,
      bestSpeed: bestSpeed.optimizer,
      mostReliable: mostReliable.optimizer,
    }
  }

  /**
   * Generate recommendations based on results
   */
  private generateRecommendations(results: any, testCase: TestCase): any {
    const winner = this.determineWinner(results)
    const performanceAnalysis = this.analyzePerformance(results)
    
    let useFor = ''
    let avoidFor = ''
    let bestOverall = winner.optimizer

    // Generate specific recommendations based on test case characteristics
    if (testCase.expectedComplexity === 'simple') {
      useFor = 'Simple tasks benefit from Research-Backed optimization due to speed and reliability'
      avoidFor = 'Avoid GEPA Genetic for simple tasks due to overhead'
    } else if (testCase.expectedComplexity === 'complex') {
      useFor = 'Complex tasks benefit from CAPO Hybrid or GEPA Genetic for thorough optimization'
      avoidFor = 'Avoid basic optimizers for complex tasks'
    }

    return {
      useFor,
      avoidFor,
      bestOverall,
    }
  }

  /**
   * Create fallback result for failed optimizations
   */
  private createFallbackResult(optimizer: string, prompt: string, startTime: number): OptimizationResult {
    return {
      optimizer,
      optimizedPrompt: prompt,
      tokenReduction: 0,
      costReduction: 0,
      accuracyImprovement: 0,
      executionTime: Date.now() - startTime,
      reliability: 0.1,
      strategies: ['fallback'],
      score: 0,
      strengths: ['Fallback available'],
      weaknesses: ['Optimization failed'],
    }
  }

  /**
   * Get test cases for manual testing
   */
  getTestCases(): TestCase[] {
    return this.testCases
  }

  /**
   * Add custom test case
   */
  addTestCase(testCase: TestCase): void {
    this.testCases.push(testCase)
  }
}

// Export singleton instance
export const integratedOptimizerComparison = new IntegratedOptimizerComparison()
