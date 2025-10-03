import { NextRequest, NextResponse } from 'next/server'
import { storeForgeOrchestrator } from '@/src/agents/storeforge'
import { z } from 'zod'

// Request validation schema
const BuildRequestSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  vibe: z.string().optional(),
  location: z.string().optional(),
  productType: z.string().optional(),
  paymentMethods: z.array(z.string()).optional(),
  targetAgents: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validatedData = BuildRequestSchema.parse(body)
    
    console.log('🚀 StoreForge build request received:', validatedData)
    
    // Start the swarm build process
    const result = await storeForgeOrchestrator.buildStore(
      validatedData.prompt,
      {
        vibe: validatedData.vibe,
        location: validatedData.location,
        productType: validatedData.productType,
        paymentMethods: validatedData.paymentMethods,
        targetAgents: validatedData.targetAgents,
      }
    )
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'StoreForge build completed successfully'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    
  } catch (error) {
    console.error('❌ StoreForge build error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = storeForgeOrchestrator.getStatus()
    
    return NextResponse.json({
      success: true,
      data: status,
      message: 'StoreForge status retrieved successfully'
    })
    
  } catch (error) {
    console.error('❌ StoreForge status error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
