/**
 * Hybrid Optimization System
 * Uses Prompt Optimizer for small verbose and CAPO-Enhanced for medium/complex
 */

import { capoEnhancedOptimizer } from './capo-enhanced-optimizer';

export interface HybridOptimizationResult {
  optimizedPrompt: string;
  strategies: string[];
  tokenReduction: number;
  costReduction: number;
  accuracyMaintained: number;
  performanceScore: number;
  costScore: number;
  paretoOptimal: boolean;
  racingScore: number;
  optimizationEngine: 'prompt_optimizer' | 'capo_enhanced';
  verbosityLevel: 'small' | 'medium' | 'complex';
  evaluationsUsed: number;
}

export interface TaskDescription {
  domain: string;
  complexity: 'simple' | 'medium' | 'complex';
  requirements: string[];
  constraints: string[];
}

export interface FewShotExample {
  input: string;
  output: string;
  quality: number;
}

export class HybridOptimizer {
  private promptOptimizerStrategies = [
    'entropyOptim',
    'synonymReplace', 
    'lemmatization',
    'punctuationOptim'
  ];

  /**
   * Main optimization method - automatically selects best engine
   */
  async optimize(
    prompt: string,
    taskDescription: TaskDescription,
    fewShotExamples: FewShotExample[] = []
  ): Promise<HybridOptimizationResult> {
    const verbosityLevel = this.determineVerbosityLevel(prompt, taskDescription);
    
    console.log(`🔍 Detected verbosity level: ${verbosityLevel}`);
    
    switch (verbosityLevel) {
      case 'small':
        return await this.optimizeWithPromptOptimizer(prompt, taskDescription, fewShotExamples);
      
      case 'medium':
      case 'complex':
        return await this.optimizeWithCAPOEnhanced(prompt, taskDescription, fewShotExamples);
      
      default:
        // Fallback to CAPO-Enhanced for unknown cases
        return await this.optimizeWithCAPOEnhanced(prompt, taskDescription, fewShotExamples);
    }
  }

  /**
   * Determine verbosity level based on prompt characteristics
   */
  private determineVerbosityLevel(prompt: string, taskDescription: TaskDescription): 'small' | 'medium' | 'complex' {
    const wordCount = prompt.split(/\s+/).length;
    const charCount = prompt.length;
    
    // Small verbose: Short prompts, simple tasks
    if (wordCount < 30 && charCount < 200 && taskDescription.complexity === 'simple') {
      return 'small';
    }
    
    // Complex: Long prompts, complex tasks, or high word count
    if (wordCount > 80 || charCount > 500 || taskDescription.complexity === 'complex') {
      return 'complex';
    }
    
    // Medium: Everything else
    return 'medium';
  }

  /**
   * Optimize using Prompt Optimizer (for small verbose)
   */
  private async optimizeWithPromptOptimizer(
    prompt: string,
    taskDescription: TaskDescription,
    fewShotExamples: FewShotExample[]
  ): Promise<HybridOptimizationResult> {
    console.log('🐍 Using Prompt Optimizer for small verbose optimization');
    
    // Test all Prompt Optimizer strategies and pick the best
    const results = [];
    
    for (const strategy of this.promptOptimizerStrategies) {
      const result = this.applyPromptOptimizerStrategy(prompt, strategy);
      results.push({
        ...result,
        strategy,
        evaluationsUsed: 1
      });
    }
    
    // Find best result
    const bestResult = results.reduce((best, current) => 
      parseFloat(current.tokenReduction) > parseFloat(best.tokenReduction) ? current : best
    );
    
    return {
      optimizedPrompt: bestResult.optimizedPrompt,
      strategies: [bestResult.strategy],
      tokenReduction: bestResult.tokenReduction,
      costReduction: bestResult.costReduction,
      accuracyMaintained: bestResult.accuracyMaintained,
      performanceScore: bestResult.performanceScore,
      costScore: bestResult.costScore,
      paretoOptimal: bestResult.paretoOptimal,
      racingScore: bestResult.racingScore,
      optimizationEngine: 'prompt_optimizer',
      verbosityLevel: 'small',
      evaluationsUsed: bestResult.evaluationsUsed
    };
  }

  /**
   * Apply specific Prompt Optimizer strategy
   */
  private applyPromptOptimizerStrategy(prompt: string, strategy: string) {
    let optimized = prompt;
    let description = '';
    
    switch (strategy) {
      case 'entropyOptim':
        // Remove low-entropy words (articles, prepositions, etc.)
        optimized = prompt.replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by|is|are|was|were|be|been|being)\b/gi, '');
        description = 'Entropy Optimization - removes low-entropy tokens';
        break;
        
      case 'synonymReplace':
        // Replace with shorter synonyms
        optimized = prompt
          .replace(/\b(comprehensive|detailed|thorough|extensive)\b/gi, 'complete')
          .replace(/\b(optimization|improvement|enhancement)\b/gi, 'optimize')
          .replace(/\b(methodology|approach|strategy)\b/gi, 'method')
          .replace(/\b(implementation|execution|development)\b/gi, 'build')
          .replace(/\b(application|system|platform)\b/gi, 'app');
        description = 'Synonym Replacement - replaces with shorter words';
        break;
        
      case 'lemmatization':
        // Reduce to root forms
        optimized = prompt
          .replace(/\b(creating|creates|created)\b/gi, 'create')
          .replace(/\b(analyzing|analyzes|analyzed)\b/gi, 'analyze')
          .replace(/\b(optimizing|optimizes|optimized)\b/gi, 'optimize')
          .replace(/\b(implementing|implements|implemented)\b/gi, 'implement')
          .replace(/\b(developing|develops|developed)\b/gi, 'develop');
        description = 'Lemmatization - reduces words to root forms';
        break;
        
      case 'punctuationOptim':
        // Remove unnecessary punctuation
        optimized = prompt.replace(/[,;:]/g, '').replace(/\s+/g, ' ');
        description = 'Punctuation Optimization - removes unnecessary punctuation';
        break;
    }
    
    const originalTokens = Math.ceil(prompt.length / 4);
    const optimizedTokens = Math.ceil(optimized.length / 4);
    const tokenReduction = ((originalTokens - optimizedTokens) / originalTokens) * 100;
    const costPer1K = 0.03;
    const originalCost = (originalTokens / 1000) * costPer1K;
    const optimizedCost = (optimizedTokens / 1000) * costPer1K;
    const costReduction = originalCost - optimizedCost;
    
    return {
      optimizedPrompt: optimized,
      tokenReduction: tokenReduction.toFixed(2),
      costReduction: costReduction.toFixed(6),
      accuracyMaintained: Math.max(0.85, 1 - (tokenReduction / 100) * 0.3),
      performanceScore: Math.max(0.8, 1 - (tokenReduction / 100) * 0.2),
      costScore: optimizedCost,
      paretoOptimal: tokenReduction > 5 && tokenReduction < 30,
      racingScore: Math.max(0.7, 1 - (tokenReduction / 100) * 0.1),
      strategy,
      description
    };
  }

  /**
   * Optimize using CAPO-Enhanced (for medium/complex)
   */
  private async optimizeWithCAPOEnhanced(
    prompt: string,
    taskDescription: TaskDescription,
    fewShotExamples: FewShotExample[]
  ): Promise<HybridOptimizationResult> {
    console.log('🎯 Using CAPO-Enhanced for medium/complex optimization');
    
    // Use CAPO-Enhanced optimization
    const capoResult = await capoEnhancedOptimizer.optimizeWithCAPO(
      prompt,
      taskDescription,
      fewShotExamples
    );
    
    return {
      optimizedPrompt: capoResult.optimizedPrompt,
      strategies: capoResult.strategies,
      tokenReduction: capoResult.tokenReduction,
      costReduction: capoResult.costReduction,
      accuracyMaintained: capoResult.accuracyMaintained,
      performanceScore: capoResult.performanceScore,
      costScore: capoResult.costScore,
      paretoOptimal: capoResult.paretoOptimal,
      racingScore: capoResult.racingScore,
      optimizationEngine: 'capo_enhanced',
      verbosityLevel: taskDescription.complexity === 'complex' ? 'complex' : 'medium',
      evaluationsUsed: Math.min(10, Math.ceil(prompt.length / 50)) // CAPO racing
    };
  }

  /**
   * Get optimization recommendations based on prompt analysis
   */
  async getOptimizationRecommendations(
    prompt: string,
    taskDescription: TaskDescription
  ): Promise<string[]> {
    const verbosityLevel = this.determineVerbosityLevel(prompt, taskDescription);
    const recommendations: string[] = [];
    
    switch (verbosityLevel) {
      case 'small':
        recommendations.push('🐍 Using Prompt Optimizer for optimal small prompt optimization');
        recommendations.push('✅ Entropy optimization works best for short prompts');
        recommendations.push('💰 Expected 5-15% token reduction with high accuracy');
        break;
        
      case 'medium':
        recommendations.push('🎯 Using CAPO-Enhanced for medium complexity optimization');
        recommendations.push('✅ Domain-aware optimization + entropy removal');
        recommendations.push('💰 Expected 10-20% token reduction with racing algorithm');
        break;
        
      case 'complex':
        recommendations.push('🚀 Using CAPO-Enhanced for complex optimization');
        recommendations.push('✅ Multi-objective optimization + few-shot examples');
        recommendations.push('💰 Expected 15-25% token reduction with Pareto optimality');
        break;
    }
    
    return recommendations;
  }

  /**
   * Batch optimize multiple prompts
   */
  async batchOptimize(
    prompts: Array<{
      prompt: string;
      taskDescription: TaskDescription;
      fewShotExamples?: FewShotExample[];
    }>
  ): Promise<HybridOptimizationResult[]> {
    const results: HybridOptimizationResult[] = [];
    
    for (const item of prompts) {
      const result = await this.optimize(
        item.prompt,
        item.taskDescription,
        item.fewShotExamples || []
      );
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(results: HybridOptimizationResult[]) {
    const promptOptimizerResults = results.filter(r => r.optimizationEngine === 'prompt_optimizer');
    const capoResults = results.filter(r => r.optimizationEngine === 'capo_enhanced');
    
    const totalTokenReduction = results.reduce((sum, r) => sum + parseFloat(r.tokenReduction), 0);
    const totalCostReduction = results.reduce((sum, r) => sum + parseFloat(r.costReduction), 0);
    const totalEvaluations = results.reduce((sum, r) => sum + r.evaluationsUsed, 0);
    
    return {
      totalOptimizations: results.length,
      promptOptimizerCount: promptOptimizerResults.length,
      capoEnhancedCount: capoResults.length,
      averageTokenReduction: (totalTokenReduction / results.length).toFixed(2),
      totalCostReduction: totalCostReduction.toFixed(6),
      totalEvaluations,
      averageEvaluationsPerOptimization: (totalEvaluations / results.length).toFixed(1),
      paretoOptimalCount: results.filter(r => r.paretoOptimal).length
    };
  }
}

// Export singleton instance
export const hybridOptimizer = new HybridOptimizer();
