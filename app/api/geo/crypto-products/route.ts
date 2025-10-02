import { NextRequest, NextResponse } from 'next/server'
import { CryptoProductFeedManager } from '@/lib/geo/crypto-product-feeds'
import { CryptoProductSchemaGenerator } from '@/lib/geo/crypto-product-schema'
import { CryptoContentOptimizer } from '@/lib/geo/crypto-content-optimizer'

const feedManager = new CryptoProductFeedManager({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://verclibase.com',
  autoUSDCConversion: true,
  supportedCurrencies: ['USDC', 'ETH', 'BTC', 'USDT'],
  networkSupport: ['Base', 'Ethereum'],
  geoOptimization: true,
  authorityBuilding: true,
})

// Sample products for demonstration
const sampleProducts = [
  {
    id: 'base-tshirt',
    name: 'Base T-Shirt',
    description: 'Premium cotton t-shirt featuring the Base logo. Perfect for Web3 enthusiasts and crypto natives.',
    price: 29.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    category: 'Apparel',
    brand: 'VERCLIBASE',
    availability: true,
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: 'base-hoodie',
    name: 'Base Hoodie',
    description: 'Comfortable hoodie with Base branding. Ideal for crypto conferences and Web3 events.',
    price: 79.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    category: 'Apparel',
    brand: 'VERCLIBASE',
    availability: true,
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: 'base-mug',
    name: 'Base Mug',
    description: 'Ceramic mug featuring the Base logo. Perfect for your morning coffee or tea.',
    price: 18.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
    category: 'Accessories',
    brand: 'VERCLIBASE',
    availability: true,
    rating: 4.6,
    reviewCount: 203,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const feedType = searchParams.get('feed') || 'crypto'

    // Generate crypto-optimized product feed
    const cryptoProducts = feedManager.generateCryptoProductFeed(sampleProducts)

    switch (format) {
      case 'json':
        return NextResponse.json({
          success: true,
          products: cryptoProducts,
          feedSummary: feedManager.generateFeedSummary(cryptoProducts),
          geoOptimized: true,
          cryptoSupported: true,
          autoUSDCConversion: true,
          instantSettlement: true,
        })

      case 'xml':
        const sitemap = feedManager.generateCryptoSitemap(cryptoProducts)
        return new NextResponse(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })

      case 'rss':
        const rss = feedManager.generateCryptoRSSFeed(cryptoProducts)
        return new NextResponse(rss, {
          headers: {
            'Content-Type': 'application/rss+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })

      case 'google-shopping':
        const googleFeed = feedManager.generateGoogleShoppingFeed(cryptoProducts)
        return new NextResponse(googleFeed, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600',
          },
        })

      case 'meta':
        const metaCatalog = feedManager.generateMetaCatalog(cryptoProducts)
        return NextResponse.json(metaCatalog)

      case 'tiktok':
        const tiktokCatalog = feedManager.generateTikTokCatalog(cryptoProducts)
        return NextResponse.json(tiktokCatalog)

      case 'structured-data':
        const structuredData = feedManager.generateStructuredData(cryptoProducts)
        return NextResponse.json(structuredData)

      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ GEO crypto products API error:', error)
    return NextResponse.json({ error: 'Failed to generate crypto product feed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, productId, query, platform } = body

    switch (action) {
      case 'track_citation':
        // Track GEO citation
        const citationId = `geo_citation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        console.log(`📊 GEO Citation tracked: ${platform} - "${query}" for product ${productId}`)

        return NextResponse.json({
          success: true,
          citationId,
          message: 'Citation tracked successfully',
        })

      case 'get_product_schema':
        const product = sampleProducts.find((p) => p.id === productId)
        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        const schema = CryptoProductSchemaGenerator.generateProductSchema({
          ...product,
          cryptoSupported: true,
        })

        return NextResponse.json({
          success: true,
          schema,
          geoOptimized: true,
        })

      case 'get_geo_content':
        const geoProduct = sampleProducts.find((p) => p.id === productId)
        if (!geoProduct) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        const geoContent = CryptoContentOptimizer.generateGEOOptimizedProduct({
          ...geoProduct,
          cryptoSupported: true,
        })

        return NextResponse.json({
          success: true,
          content: geoContent,
          geoOptimized: true,
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ GEO crypto products POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
