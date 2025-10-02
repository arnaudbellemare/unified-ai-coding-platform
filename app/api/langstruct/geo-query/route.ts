import { NextRequest, NextResponse } from 'next/server'
import { langStructService } from '@/lib/langstruct/service'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    }

    const result = await langStructService.extractGEOQuery(query)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to extract GEO query' }, { status: 500 })
    }

    // Parse query for RAG system
    const ragData = await langStructService.parseQueryForRAG(query)

    return NextResponse.json({
      success: true,
      data: {
        entities: result.entities,
        confidence: result.confidence,
        sources: result.sources,
        ragData,
      },
    })
  } catch (error) {
    console.error('GEO query extraction error:', error)
    return NextResponse.json({ error: 'Failed to extract GEO query' }, { status: 500 })
  }
}
