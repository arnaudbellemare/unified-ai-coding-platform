import { NextRequest, NextResponse } from 'next/server'
import { catalogService } from '@/lib/acp/catalog-service'

export async function POST(request: NextRequest) {
  try {
    const { query, filters } = await request.json()
    const q = typeof query === 'string' ? query : ''
    const ranked = catalogService.searchAndRank(q, filters || {})
    const products = catalogService.listProducts()
    const idToImage: Record<string, string | undefined> = {}
    for (const p of products) {
      idToImage[p.id] = p.images?.[0]
    }

    // Label sponsored in results explicitly
    const results = ranked.map((r) => ({
      ...r,
      image: idToImage[r.productId],
      label: r.sponsored ? 'Sponsored' : undefined,
    }))

    return NextResponse.json({ success: true, results })
  } catch (e) {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
}
