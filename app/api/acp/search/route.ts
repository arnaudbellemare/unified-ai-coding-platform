import { NextRequest, NextResponse } from 'next/server'
import { catalogService } from '@/lib/acp/catalog-service'

// Support both GET and POST methods
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const query = url.searchParams.get('query') || ''
  const maxPrice = url.searchParams.get('maxPrice') || '200'
  
  try {
    const ranked = catalogService.searchAndRank(query, { 
      currency: 'USD', 
      maxPrice: parseInt(maxPrice) 
    })
    const products = catalogService.listProducts()
    const idToImage: Record<string, string | undefined> = {}
    for (const p of products) {
      idToImage[p.id] = p.images?.[0]
    }

    const results = ranked.map((r) => ({
      ...r,
      image: idToImage[r.productId],
      label: r.sponsored ? 'Sponsored' : undefined,
    }))

    return NextResponse.json({ success: true, results })
  } catch (e) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

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
