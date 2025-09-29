import { NextRequest, NextResponse } from 'next/server'
import { catalogService, Product } from '@/lib/acp/catalog-service'

// GET: list catalog
export async function GET() {
  const products = catalogService.listProducts()
  return NextResponse.json({ success: true, products })
}

// POST: upsert products (admin or merchant tool would protect this in prod)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items = (body?.products || []) as Product[]
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'products array required' }, { status: 400 })
    }
    catalogService.upsertProducts(items)
    return NextResponse.json({ success: true, count: items.length })
  } catch (e) {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
}
