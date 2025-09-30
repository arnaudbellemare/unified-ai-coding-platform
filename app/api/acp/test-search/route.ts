import { NextRequest, NextResponse } from 'next/server'
import { catalogService } from '@/lib/acp/catalog-service'

export async function GET() {
  try {
    // Test basic catalog functionality
    const products = catalogService.listProducts()
    const testSearch = catalogService.searchAndRank('shirt', { currency: 'USD', maxPrice: 200 })
    
    return NextResponse.json({ 
      success: true, 
      message: 'ACP search test successful',
      productCount: products.length,
      testSearchResults: testSearch.length,
      products: products.slice(0, 3) // First 3 products for debugging
    })
  } catch (e) {
    console.error('ACP Test Search Error:', e)
    return NextResponse.json({ 
      success: false, 
      error: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined
    }, { status: 500 })
  }
}
