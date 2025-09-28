import { NextRequest, NextResponse } from 'next/server'
import { unifiedOptimizer, UnifiedOptimizationRequest } from '@/lib/unified-system/unified-optimizer'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'
import { DevAuth } from '@/lib/auth/dev-auth'

export async function POST(request: NextRequest) {
  try {
    // Check if development mode is enabled (when no API keys configured)
    if (DevAuth.isDevMode()) {
      const mockResult = {
        success: true,
        optimization: {
          strategy: 'unified-mock',
          originalPrompt: 'Test prompt for unified optimization',
          optimizedPrompt: 'Optimized prompt using unified system',
          tokenReduction: 35,
          costReduction: 0.0025,
          qualityImprovement: 0.18,
          executionTime: 1200,
          reliability: 0.95,
          score: 92
        },
        breakdown: {
          tokenSavings: {
            original: 100,
            optimized: 65,
            reduction: 35,
            percentage: 35.0
          },
          costSavings: {
            original: 0.002,
            optimized: 0.00075,
            reduction: 0.00125,
            percentage: 62.5,
            monthlyProjection: 375.0
          },
          qualityMetrics: {
            accuracy: 0.92,
            completeness: 0.95,
            efficiency: 0.88
          }
        },
        recommendations: {
          bestFor: ['High-volume API usage', 'Cost-sensitive applications', 'Quality-critical tasks'],
          avoidFor: [],
          nextSteps: ['Monitor performance metrics', 'Consider implementing cost alerts', 'Validate quality improvements']
        },
        metadata: {
          optimizer: 'unified-system',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          processingTime: 1200
        }
      }
      
      return NextResponse.json({
        success: true,
        user: DevAuth.getCurrentUser(),
        result: mockResult
      })
    }

    // Require authentication for production
    const user = await requireAuth(request)
    
    const body = await request.json()
    const optimizationRequest: UnifiedOptimizationRequest = {
      prompt: body.prompt,
      task: body.task,
      context: body.context,
      user: {
        id: user.id,
        preferences: body.preferences
      }
    }

    // Validate required fields
    if (!optimizationRequest.prompt || !optimizationRequest.task) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: prompt and task are required'
      }, { status: 400 })
    }

    // Execute unified optimization
    const result = await unifiedOptimizer.optimize(optimizationRequest)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url
      },
      result
    })

  } catch (error) {
    console.error('Unified optimization error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Optimization failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get system statistics
    const stats = unifiedOptimizer.getSystemStats()
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to get system stats:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve system statistics',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
