import { NextRequest, NextResponse } from 'next/server'
import { langStructService } from '@/lib/langstruct/service'
import { ExtractorType } from '@/lib/langstruct/types'

export async function POST(request: NextRequest) {
  try {
    const { extractorType, text } = await request.json()

    if (!extractorType || !text) {
      return NextResponse.json(
        { error: 'Missing extractorType or text' }, 
        { status: 400 }
      )
    }

    if (!['geo_query', 'acp_payment', 'ap2_agent', 'document_metadata'].includes(extractorType)) {
      return NextResponse.json(
        { error: 'Invalid extractorType' }, 
        { status: 400 }
      )
    }

    const result = await langStructService.extract(
      extractorType as ExtractorType, 
      text
    )

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('LangStruct extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract structured data' }, 
      { status: 500 }
    )
  }
}
