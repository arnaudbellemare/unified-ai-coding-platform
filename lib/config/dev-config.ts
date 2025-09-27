/**
 * Development Configuration
 * Provides fallback values for development without full environment setup
 */

export const devConfig = {
  // Development mode flag
  isDevMode: process.env.NEXT_PUBLIC_DEV_MODE === 'true',

  // Mock database configuration
  database: {
    enabled: false,
    mockData: {
      tasks: [
        {
          id: 'dev-task-1',
          title: 'Sample Task 1',
          description: 'This is a sample task for development',
          prompt: 'Create a simple React component that displays user information',
          status: 'pending',
          createdAt: new Date().toISOString(),
          userId: 'dev-user-123',
          repoUrl: 'https://github.com/example/repo1',
          branchName: 'feature/sample-task-1',
        },
        {
          id: 'dev-task-2',
          title: 'Sample Task 2',
          description: 'Another sample task for testing',
          prompt: 'Implement a cost optimization algorithm for API calls',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          userId: 'dev-user-123',
          repoUrl: 'https://github.com/example/repo2',
          branchName: 'feature/sample-task-2',
        },
      ],
    },
  },

  // Mock AI configuration
  ai: {
    enabled: true,
    mockResponses: {
      optimization: {
        tokenReduction: 25,
        costReduction: 0.0015,
        accuracyImprovement: 0.12,
        strategies: ['dev_mock_optimization'],
      },
      gepa: {
        bestSolution: {
          prompt: 'Optimized prompt for development testing',
          tokens: 50,
          cost: 0.0001,
          quality: 0.85,
          fitness: 0.78,
        },
        costSavings: 0.0005,
        totalGenerations: 5,
      },
      research: {
        optimizedPrompt: 'Research-optimized prompt for development',
        tokenReduction: 30,
        costReduction: 0.002,
        performanceImprovement: 0.15,
        strategies: ['dev_research_optimization'],
      },
    },
  },

  // Development user
  user: {
    id: 'dev-user-123',
    username: 'developer',
    email: 'dev@example.com',
    name: 'Development User',
    image: 'https://avatars.githubusercontent.com/u/1?v=4',
  },
}

/**
 * Get mock tasks for development
 */
export function getMockTasks() {
  return devConfig.database.mockData.tasks
}

/**
 * Get mock optimization result
 */
export function getMockOptimizationResult(type: 'basic' | 'gepa' | 'research' | 'cloudflare') {
  const baseResult = {
    success: true,
    user: devConfig.user,
  }

  switch (type) {
    case 'basic':
      return {
        ...baseResult,
        results: {
          original: {
            prompt: 'Original prompt for testing',
            tokens: 100,
            cost: 0.002,
          },
          optimized: {
            prompt: 'Optimized prompt for testing',
            tokens: 75,
            cost: 0.0015,
          },
          savings: devConfig.ai.mockResponses.optimization,
        },
      }

    case 'gepa':
      return {
        ...baseResult,
        results: devConfig.ai.mockResponses.gepa,
      }

    case 'research':
      return {
        ...baseResult,
        results: devConfig.ai.mockResponses.research,
      }

    case 'cloudflare':
      return {
        ...baseResult,
        results: {
          optimizedCode:
            '// Mock TypeScript code for testing\nexport default {\n  async fetch() {\n    return new Response("Hello World")\n  }\n}',
          tokenReduction: 40,
          costReduction: 0.003,
          executionTimeReduction: 150,
          strategies: ['dev_cloudflare_optimization'],
        },
      }

    default:
      return baseResult
  }
}

/**
 * Get mock comparison result
 */
export function getMockComparisonResult() {
  return {
    success: true,
    results: [
      {
        originalPrompt: 'Test prompt for comparison',
        results: {
          capoHybrid: {
            optimizer: 'CAPO Hybrid Enhanced',
            score: 85.5,
            tokenReduction: 30,
            costReduction: 0.002,
            accuracyImprovement: 0.12,
            executionTime: 1200,
            reliability: 0.9,
          },
          gepaGenetic: {
            optimizer: 'GEPA Genetic Algorithm',
            score: 82.3,
            tokenReduction: 35,
            costReduction: 0.0025,
            accuracyImprovement: 0.15,
            executionTime: 2500,
            reliability: 0.85,
          },
          researchBacked: {
            optimizer: 'Research-Backed Optimization',
            score: 88.7,
            tokenReduction: 25,
            costReduction: 0.0015,
            accuracyImprovement: 0.18,
            executionTime: 800,
            reliability: 0.95,
          },
          cloudflareCodeMode: {
            optimizer: 'Cloudflare Code Mode',
            score: 79.2,
            tokenReduction: 40,
            costReduction: 0.003,
            accuracyImprovement: 0.1,
            executionTime: 600,
            reliability: 0.8,
          },
        },
        winner: {
          optimizer: 'Research-Backed Optimization',
          score: 88.7,
          reasoning: 'Excellent performance across all metrics',
        },
        performanceAnalysis: {
          bestTokenReduction: 'Cloudflare Code Mode',
          bestCostReduction: 'Research-Backed Optimization',
          bestAccuracyImprovement: 'GEPA Genetic Algorithm',
          bestSpeed: 'Cloudflare Code Mode',
          mostReliable: 'Research-Backed Optimization',
        },
        recommendations: {
          useFor: 'General-purpose optimization with proven methods',
          avoidFor: 'Avoid for tasks requiring cutting-edge technology',
          bestOverall: 'Research-Backed Optimization',
        },
      },
    ],
    overallStats: {
      overallWinner: 'Research-Backed Optimization',
      totalTests: 1,
    },
    user: devConfig.user,
  }
}
