/**
 * GEPA (Genetic Evolutionary Programming Algorithm) Cost Optimizer
 * Integrates with our existing cost optimization system for maximum efficiency
 */

import { TokenCounter } from './utils/token-counter'
import { getEnvironmentConfig } from './config/env'

export interface GEPAParameters {
  populationSize: number
  generations: number
  mutationRate: number
  crossoverRate: number
  eliteSize: number
  reflectionLM: {
    model: string
    temperature: number
    maxTokens: number
  }
}

export interface GEPASolution {
  id: string
  prompt: string
  tokens: number
  cost: number
  quality: number
  fitness: number
  generation: number
  parentIds?: string[]
  mutations?: string[]
}

export interface GEPAResults {
  bestSolution: GEPASolution
  population: GEPASolution[]
  totalGenerations: number
  totalCost: number
  costSavings: number
  optimizationHistory: {
    generation: number
    bestFitness: number
    averageCost: number
    costReduction: number
  }[]
}

export class GEPACostOptimizer {
  private parameters: GEPAParameters
  private logDir: string
  private checkpointDir: string
  private optimizationHistory: GEPAResults['optimizationHistory'] = []

  constructor(parameters: Partial<GEPAParameters> = {}) {
    this.parameters = {
      populationSize: 20,
      generations: 10,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      eliteSize: 4,
      reflectionLM: {
        model: 'gpt-4o-mini', // Use cost-effective model for reflection
        temperature: 1.0,
        maxTokens: 4000, // Reduced from 32000 for cost efficiency
      },
      ...parameters,
    }

    this.logDir = './gepa-optimization-logs'
    this.checkpointDir = `${this.logDir}/checkpoints`
  }

  /**
   * Main GEPA optimization process
   */
  async optimizePrompt(
    originalPrompt: string,
    targetModel: string,
    qualityThreshold: number = 0.8,
  ): Promise<GEPAResults> {
    console.log('🧬 Starting GEPA cost optimization...')

    const config = getEnvironmentConfig()
    if (!config.hasOpenAI && !config.hasAnthropic) {
      throw new Error('No AI provider available for GEPA optimization')
    }

    // Initialize population with variations of the original prompt
    let population = await this.initializePopulation(originalPrompt, targetModel)

    let bestSolution = population[0]
    let totalCost = 0

    for (let generation = 0; generation < this.parameters.generations; generation++) {
      console.log(`🧬 Generation ${generation + 1}/${this.parameters.generations}`)

      // Evaluate fitness for all solutions
      population = await this.evaluatePopulation(population, targetModel, qualityThreshold)

      // Sort by fitness (higher is better)
      population.sort((a, b) => b.fitness - a.fitness)

      // Update best solution
      if (population[0].fitness > bestSolution.fitness) {
        bestSolution = population[0]
      }

      // Calculate generation statistics
      const avgCost = population.reduce((sum, sol) => sum + sol.cost, 0) / population.length
      const costReduction = ((population[0].cost - avgCost) / population[0].cost) * 100

      this.optimizationHistory.push({
        generation: generation + 1,
        bestFitness: population[0].fitness,
        averageCost: avgCost,
        costReduction,
      })

      totalCost += population.reduce((sum, sol) => sum + sol.cost, 0)

      console.log(`📊 Best fitness: ${population[0].fitness.toFixed(3)}, Avg cost: $${avgCost.toFixed(4)}`)

      // Create next generation
      if (generation < this.parameters.generations - 1) {
        population = await this.createNextGeneration(population, targetModel)
      }
    }

    const costSavings =
      bestSolution.cost < ((await TokenCounter.countTokens(originalPrompt, targetModel)) * 0.002) / 1000
        ? ((await TokenCounter.countTokens(originalPrompt, targetModel)) * 0.002) / 1000 - bestSolution.cost
        : 0

    return {
      bestSolution,
      population,
      totalGenerations: this.parameters.generations,
      totalCost,
      costSavings,
      optimizationHistory: this.optimizationHistory,
    }
  }

  /**
   * Initialize population with prompt variations
   */
  private async initializePopulation(originalPrompt: string, targetModel: string): Promise<GEPASolution[]> {
    const population: GEPASolution[] = []

    // Add original prompt
    const originalTokens = await TokenCounter.countTokens(originalPrompt, targetModel)
    population.push({
      id: 'original',
      prompt: originalPrompt,
      tokens: originalTokens,
      cost: TokenCounter.calculateCost(originalTokens, targetModel, 'prompt'),
      quality: 1.0, // Original is baseline
      fitness: this.calculateFitness(originalTokens, 1.0, targetModel),
      generation: 0,
    })

    // Generate variations using reflection LM
    for (let i = 1; i < this.parameters.populationSize; i++) {
      const variation = await this.generatePromptVariation(originalPrompt, i)
      const tokens = await TokenCounter.countTokens(variation, targetModel)

      population.push({
        id: `variation_${i}`,
        prompt: variation,
        tokens,
        cost: TokenCounter.calculateCost(tokens, targetModel, 'prompt'),
        quality: 0.8, // Initial quality estimate
        fitness: this.calculateFitness(tokens, 0.8, targetModel),
        generation: 0,
      })
    }

    return population
  }

  /**
   * Generate prompt variation using reflection
   */
  private async generatePromptVariation(originalPrompt: string, variationIndex: number): Promise<string> {
    const reflectionPrompts = [
      `Rewrite this prompt to be more concise while maintaining effectiveness: ${originalPrompt}`,
      `Optimize this prompt for token efficiency: ${originalPrompt}`,
      `Create a shorter version that achieves the same goal: ${originalPrompt}`,
      `Refactor this prompt to use fewer words: ${originalPrompt}`,
    ]

    const reflectionPrompt = reflectionPrompts[variationIndex % reflectionPrompts.length]

    try {
      // Use cost-effective model for reflection
      const response = await fetch('/api/openrouter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: reflectionPrompt,
          model: this.parameters.reflectionLM.model,
          temperature: this.parameters.reflectionLM.temperature,
          maxTokens: this.parameters.reflectionLM.maxTokens,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.text || originalPrompt
      }
    } catch (error) {
      console.warn('Reflection generation failed:', error)
    }

    // Fallback: simple truncation
    return originalPrompt.length > 100
      ? originalPrompt.substring(0, Math.floor(originalPrompt.length * 0.8)) + '...'
      : originalPrompt
  }

  /**
   * Evaluate population fitness
   */
  private async evaluatePopulation(
    population: GEPASolution[],
    targetModel: string,
    qualityThreshold: number,
  ): Promise<GEPASolution[]> {
    const evaluated = await Promise.all(
      population.map(async (solution) => {
        // Recalculate tokens and cost
        const tokens = await TokenCounter.countTokens(solution.prompt, targetModel)
        const cost = TokenCounter.calculateCost(tokens, targetModel, 'prompt')

        // Evaluate quality using reflection
        const quality = await this.evaluateQuality(solution.prompt, targetModel)

        return {
          ...solution,
          tokens,
          cost,
          quality,
          fitness: this.calculateFitness(tokens, quality, targetModel),
        }
      }),
    )

    return evaluated
  }

  /**
   * Evaluate prompt quality using reflection
   */
  private async evaluateQuality(prompt: string, targetModel: string): Promise<number> {
    try {
      const qualityPrompt = `Rate the quality of this prompt on a scale of 0.0 to 1.0, considering clarity, specificity, and effectiveness. Respond with only a number between 0.0 and 1.0.\n\nPrompt: ${prompt}`

      const response = await fetch('/api/openrouter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: qualityPrompt,
          model: this.parameters.reflectionLM.model,
          temperature: 0.1, // Low temperature for consistent scoring
          maxTokens: 10,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const quality = parseFloat(data.text?.trim() || '0.5')
        return Math.max(0, Math.min(1, quality)) // Clamp between 0 and 1
      }
    } catch (error) {
      console.warn('Quality evaluation failed:', error)
    }

    return 0.5 // Default quality
  }

  /**
   * Calculate fitness score (higher is better)
   */
  private calculateFitness(tokens: number, quality: number, targetModel: string): number {
    const cost = TokenCounter.calculateCost(tokens, targetModel, 'prompt')
    const maxCost = 0.01 // Maximum acceptable cost

    // Fitness = quality * (1 - normalized_cost)
    const normalizedCost = Math.min(cost / maxCost, 1)
    return quality * (1 - normalizedCost)
  }

  /**
   * Create next generation using genetic operations
   */
  private async createNextGeneration(currentPopulation: GEPASolution[], targetModel: string): Promise<GEPASolution[]> {
    const nextGeneration: GEPASolution[] = []

    // Elitism: keep best solutions
    for (let i = 0; i < this.parameters.eliteSize; i++) {
      nextGeneration.push({
        ...currentPopulation[i],
        generation: currentPopulation[i].generation + 1,
      })
    }

    // Generate offspring through crossover and mutation
    while (nextGeneration.length < this.parameters.populationSize) {
      const parent1 = this.selectParent(currentPopulation)
      const parent2 = this.selectParent(currentPopulation)

      if (Math.random() < this.parameters.crossoverRate) {
        const offspring = await this.crossover(parent1, parent2, targetModel)
        nextGeneration.push(offspring)
      } else {
        // Direct mutation of parent
        const mutated = await this.mutate(parent1, targetModel)
        nextGeneration.push(mutated)
      }
    }

    return nextGeneration.slice(0, this.parameters.populationSize)
  }

  /**
   * Select parent using tournament selection
   */
  private selectParent(population: GEPASolution[]): GEPASolution {
    const tournamentSize = 3
    const tournament = []

    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(population[Math.floor(Math.random() * population.length)])
    }

    return tournament.reduce((best, current) => (current.fitness > best.fitness ? current : best))
  }

  /**
   * Crossover operation
   */
  private async crossover(parent1: GEPASolution, parent2: GEPASolution, targetModel: string): Promise<GEPASolution> {
    // Simple crossover: combine parts of both prompts
    const prompt1 = parent1.prompt
    const prompt2 = parent2.prompt

    const crossoverPoint = Math.floor(Math.random() * Math.min(prompt1.length, prompt2.length))
    const offspringPrompt = prompt1.substring(0, crossoverPoint) + prompt2.substring(crossoverPoint)

    const tokens = await TokenCounter.countTokens(offspringPrompt, targetModel)

    return {
      id: `crossover_${Date.now()}`,
      prompt: offspringPrompt,
      tokens,
      cost: TokenCounter.calculateCost(tokens, targetModel, 'prompt'),
      quality: 0.5, // Will be evaluated later
      fitness: 0, // Will be calculated later
      generation: parent1.generation + 1,
      parentIds: [parent1.id, parent2.id],
    }
  }

  /**
   * Mutation operation
   */
  private async mutate(solution: GEPASolution, targetModel: string): Promise<GEPASolution> {
    if (Math.random() > this.parameters.mutationRate) {
      return { ...solution, generation: solution.generation + 1 }
    }

    // Apply mutation using reflection
    const mutationPrompt = `Apply a small improvement to this prompt while keeping it concise: ${solution.prompt}`

    try {
      const response = await fetch('/api/openrouter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: mutationPrompt,
          model: this.parameters.reflectionLM.model,
          temperature: this.parameters.reflectionLM.temperature,
          maxTokens: Math.min(solution.tokens * 2, 1000),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const mutatedPrompt = data.text || solution.prompt
        const tokens = await TokenCounter.countTokens(mutatedPrompt, targetModel)

        return {
          id: `mutation_${Date.now()}`,
          prompt: mutatedPrompt,
          tokens,
          cost: TokenCounter.calculateCost(tokens, targetModel, 'prompt'),
          quality: 0.5, // Will be evaluated later
          fitness: 0, // Will be calculated later
          generation: solution.generation + 1,
          parentIds: [solution.id],
          mutations: ['reflection_mutation'],
        }
      }
    } catch (error) {
      console.warn('Mutation failed:', error)
    }

    // Fallback: return original with generation increment
    return { ...solution, generation: solution.generation + 1 }
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(): {
    totalGenerations: number
    bestFitness: number
    averageCostReduction: number
    totalCostSavings: number
  } {
    const bestFitness = Math.max(...this.optimizationHistory.map((h) => h.bestFitness))
    const avgCostReduction =
      this.optimizationHistory.length > 0
        ? this.optimizationHistory.reduce((sum, h) => sum + h.costReduction, 0) / this.optimizationHistory.length
        : 0

    return {
      totalGenerations: this.parameters.generations,
      bestFitness,
      averageCostReduction: avgCostReduction,
      totalCostSavings: 0, // Will be calculated based on actual usage
    }
  }
}

// Export singleton instance
export const gepaOptimizer = new GEPACostOptimizer()
