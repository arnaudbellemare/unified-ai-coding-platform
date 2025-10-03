import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo purposes
// In production, this would be stored in a database
const storeCache = new Map<string, any>()

export async function GET(request: NextRequest, context: { params: Promise<{ storeId: string }> }) {
  try {
    const params = await context.params
    const { storeId } = params

    // Get store data from cache
    const storeData = storeCache.get(storeId)

    if (!storeData) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: storeData,
      message: 'Store data retrieved successfully',
    })
  } catch (error) {
    console.error('❌ Store retrieval error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ storeId: string }> }) {
  try {
    const params = await context.params
    const { storeId } = params
    const storeData = await request.json()

    // Store data in cache
    storeCache.set(storeId, storeData)

    return NextResponse.json({
      success: true,
      message: 'Store data stored successfully',
    })
  } catch (error) {
    console.error('❌ Store storage error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
