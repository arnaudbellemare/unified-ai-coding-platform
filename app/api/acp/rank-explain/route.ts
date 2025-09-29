import { NextRequest, NextResponse } from 'next/server'
import { catalogService } from '@/lib/acp/catalog-service'

export async function POST(request: NextRequest) {
  try {
    const { query, filters } = await request.json()
    const q = typeof query === 'string' ? query : ''
    const ranked = catalogService.searchAndRank(q, filters || {})
    return NextResponse.json({ success: true, ranked })
  } catch (e) {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
}


