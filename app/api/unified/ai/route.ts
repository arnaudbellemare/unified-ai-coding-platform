import { NextRequest, NextResponse } from 'next/server'
import { unifiedAIRouter, UnifiedAIRequest } from '@/lib/unified-system/unified-ai-router'
import { getCurrentUser, requireAuth } from '@/lib/auth/simple-auth'
import { DevAuth } from '@/lib/auth/dev-auth'

export async function POST(request: NextRequest) {
  try {
    // Check if development mode is enabled (when no API keys configured)
    if (DevAuth.isDevMode()) {
      const mockResult = {
        success: true,
        response: {
          content: 'This is a mock AI response from the unified system. The prompt has been optimized and processed through our intelligent routing system.',
          model: 'openai/gpt-4o-mini',
          tokens: {
            prompt: 25,
            completion: 35,
            total: 60
          },
          cost: {
            prompt: 0.000375,
            completion: 0.00021,
            total: 0.000585
          }
        },
        optimization: {
          applied: true,
          strategy: 'research-backed-optimization',
          originalPrompt: 'Test prompt for unified AI system',
          optimizedPrompt: 'Optimized prompt using research-backed techniques',
          savings: {
            tokens: 15,
            cost: 0.000125,
            percentage: 17.6
          }
        },
        metadata: {
          provider: 'openrouter',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          processingTime: 850
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
    const aiRequest: UnifiedAIRequest = {
      prompt: body.prompt,
      task: body.task,
      model: body.model,
      context: body.context,
      optimization: body.optimization,
      user: {
        id: user.id,
        preferences: body.preferences
      }
    }

    // Validate required fields
    if (!aiRequest.prompt || !aiRequest.task) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: prompt and task are required'
      }, { status: 400 })
    }

    // Process unified AI request
    const result = await unifiedAIRouter.processRequest(aiRequest)

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
    console.error('Unified AI error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI request failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get available models or AI statistics
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'models') {
      const models = await unifiedAIRouter.getAvailableModels()
      return NextResponse.json({
        success: true,
        models,
        timestamp: new Date().toISOString()
      })
    } else {
      const stats = unifiedAIRouter.getAIStats()
      return NextResponse.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Failed to get AI data:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve AI data',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
