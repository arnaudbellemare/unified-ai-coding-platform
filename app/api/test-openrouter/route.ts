import { NextRequest, NextResponse } from 'next/server'
import { OpenRouterClient } from '@/lib/openrouter/openrouter-client'

export async function GET() {
  try {
    // Check environment variables
    const hasApiKey = !!process.env.OPENROUTER_API_KEY
    const keyLength = process.env.OPENROUTER_API_KEY?.length || 0
    const keyPrefix = process.env.OPENROUTER_API_KEY?.substring(0, 10) || 'none'
    
    console.log('🔍 OpenRouter API Key Check:', {
      hasApiKey,
      keyLength,
      keyPrefix,
      fullKey: process.env.OPENROUTER_API_KEY
    })

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'No OpenRouter API key found',
        hasApiKey,
        keyLength,
        keyPrefix
      })
    }

    // Test OpenRouter client
    const client = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })

    // Test models endpoint
    const models = await client.getModels()
    const freeModels = models.filter(m => 
      m.id.includes('free') || 
      m.pricing.prompt === 0 || 
      m.pricing.completion === 0
    )

    return NextResponse.json({
      success: true,
      hasApiKey,
      keyLength,
      keyPrefix,
      totalModels: models.length,
      freeModels: freeModels.length,
      sampleFreeModels: freeModels.slice(0, 5).map(m => ({
        id: m.id,
        name: m.name,
        pricing: m.pricing
      })),
      testMessage: 'OpenRouter API key is working!'
    })

  } catch (error) {
    console.error('OpenRouter test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.OPENROUTER_API_KEY,
      keyLength: process.env.OPENROUTER_API_KEY?.length || 0,
      keyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10) || 'none'
    }, { status: 500 })
  }
}
