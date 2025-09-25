import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { perplexity } from '@ai-sdk/perplexity'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json()

    if (!provider || !apiKey || !model) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 })
    }

    // Test the API key with a simple request
    let result
    try {
      switch (provider) {
        case 'perplexity':
          result = await generateText({
            model: perplexity(model),
            prompt: 'Hello, this is a test. Please respond with "API key is valid".',
          })
          break

        case 'openai':
          result = await generateText({
            model: openai(model),
            prompt: 'Hello, this is a test. Please respond with "API key is valid".',
          })
          break

        case 'anthropic':
          result = await generateText({
            model: anthropic(model),
            prompt: 'Hello, this is a test. Please respond with "API key is valid".',
          })
          break

        default:
          return NextResponse.json({ success: false, error: 'Invalid provider' }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'API key validated successfully',
        provider,
        model,
        response: result.text,
      })
    } catch (error) {
      console.error('API key validation failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'API key validation failed. Please check your key and try again.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error('Validation endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    )
  }
}
