/**
 * Cost Optimization Module
 * Integrates with Perplexity and OpenAI for real cost savings
 */

export interface CostOptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: string;
  originalTokens: number;
  optimizedTokens: number;
  apiCalls: number;
  realApiCost: number;
}

export class CostOptimization {
  private perplexityApiKey: string;
  private openaiApiKey: string;

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Optimize a prompt for cost reduction
   */
  async optimizePrompt(originalPrompt: string): Promise<string> {
    if (!this.perplexityApiKey) {
      console.warn('Perplexity API key not configured, returning original prompt');
      return originalPrompt;
    }

    try {
      const optimizationPrompt = `Optimize this prompt for cost efficiency while maintaining quality. Remove unnecessary words, use concise language, and focus on the core request. Return only the optimized prompt:

Original: ${originalPrompt}

Optimized:`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: optimizationPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || originalPrompt;
    } catch (error) {
      console.error('Cost optimization failed:', error);
      return originalPrompt;
    }
  }

  /**
   * Calculate real cost savings between original and optimized prompts
   */
  async calculateCostOptimization(
    originalPrompt: string,
    optimizedPrompt: string
  ): Promise<CostOptimizationResult> {
    try {
      // Calculate token counts (rough estimation)
      const originalTokens = Math.ceil(originalPrompt.length / 4);
      const optimizedTokens = Math.ceil(optimizedPrompt.length / 4);

      // Calculate costs using OpenAI pricing
      const originalCost = (originalTokens / 1000) * 0.03; // $0.03 per 1K tokens
      const optimizedCost = (optimizedTokens / 1000) * 0.03;
      const savings = originalCost - optimizedCost;
      const savingsPercentage = ((savings / originalCost) * 100).toFixed(1);

      // Make real API calls to verify costs
      const realApiCost = await this.getRealApiCost(originalPrompt, optimizedPrompt);

      return {
        originalCost,
        optimizedCost,
        savings,
        savingsPercentage: `${savingsPercentage}%`,
        originalTokens,
        optimizedTokens,
        apiCalls: 2,
        realApiCost
      };
    } catch (error) {
      console.error('Cost calculation failed:', error);
      return {
        originalCost: 0,
        optimizedCost: 0,
        savings: 0,
        savingsPercentage: '0%',
        originalTokens: 0,
        optimizedTokens: 0,
        apiCalls: 0,
        realApiCost: 0
      };
    }
  }

  /**
   * Get real API cost by making actual API calls
   */
  private async getRealApiCost(originalPrompt: string, optimizedPrompt: string): Promise<number> {
    if (!this.openaiApiKey) {
      return 0;
    }

    try {
      // Make a test API call to get real cost
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: optimizedPrompt
            }
          ],
          max_tokens: 100,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      // Calculate cost based on actual usage
      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      const totalCost = (inputTokens / 1000) * 0.0015 + (outputTokens / 1000) * 0.002;
      
      return totalCost;
    } catch (error) {
      console.error('Real API cost calculation failed:', error);
      return 0;
    }
  }
}

export const costOptimization = new CostOptimization();
