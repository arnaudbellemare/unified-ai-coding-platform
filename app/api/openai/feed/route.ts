import { NextResponse } from 'next/server'
import { catalogService } from '@/lib/acp/catalog-service'
import { acpService } from '@/lib/acp/acp-service'

/**
 * OpenAI Agentic Commerce – Product Feed (JSON variant)
 * Maps our in‑memory catalog to the OpenAI Product Feed spec fields.
 * Spec reference: https://developers.openai.com/commerce/specs/feed
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  const products = catalogService.listProducts()
  const merchant = acpService.getMerchantConfig()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://verclibase.vercel.app'

  const feed = products.flatMap((p) => {
    return p.variants.map((v) => {
      const price = typeof v.price === 'number' ? Number(v.price.toFixed(2)) : v.price
      const availability = v.inStock ? 'in_stock' : 'out_of_stock'
      const inventoryQty = v.inStock ? Number((v.attributes as any)?.inventory_quantity) || 25 : 0
      const color = (v.attributes as any)?.color
      const size = (v.attributes as any)?.size

      return {
        // OpenAI Flags
        enable_search: true,
        enable_checkout: true,

        // Basic Product Data
        id: `${p.id}:${v.id}`,
        mpn: p.id,
        title: p.title,
        description: p.description || '',
        link: `${baseUrl}/product/${p.id}?variant=${v.id}`,

        // Item Information
        condition: 'new',
        product_category: p.category || 'Apparel & Accessories > Shirts',
        brand: p.brand || merchant.name,
        material: (p as any).material || 'cotton',
        weight: (p as any).weight || '1 lb',

        // Pricing & availability
        price: `${price} ${v.currency}`,
        availability,
        inventory_quantity: inventoryQty,

        // Optional media (placeholder)
        image_link: (p.images && p.images[0]) || `${baseUrl}/api/og/product?id=${p.id}`,
        additional_image_link: p.images && p.images.length > 1 ? p.images.slice(1) : undefined,

        // Merchant Info
        seller_name: merchant.name,
        seller_url: baseUrl,
        seller_privacy_policy: `${baseUrl}/privacy`,
        seller_tos: `${baseUrl}/terms`,
        return_policy: `${baseUrl}/returns`,
        return_window: p.returns?.windowDays || 30,

        // Fulfillment (coarse)
        shipping: p.shipping?.regions?.length
          ? p.shipping.regions.map((r) => `${r}:::${(p.shipping?.fixedCost || 0).toFixed(2)} ${v.currency}`).join(',')
          : undefined,
        delivery_estimate:
          typeof v.etaDays === 'number'
            ? new Date(Date.now() + v.etaDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            : undefined,

        // Reviews (optional, placeholder zeros keep spec valid)
        product_review_count: (v.attributes as any)?.review_count || 0,
        product_review_rating: (v.attributes as any)?.review_rating || 0,

        // Performance Signals (optional)
        return_rate: ((p.returns?.restockingFeePercent || 0) / 100) as any,

        // Variants
        item_group_id: p.id,
        item_group_title: p.title,
        color,
        size,
        offer_id: `${p.id}-${v.id}-${price}`,
      }
    })
  })

  // Handle different formats via query parameter
  if (format === 'csv') {
    return getCSVResponse(feed)
  } else if (format === 'tsv') {
    return getTSVResponse(feed)
  }

  return NextResponse.json({ success: true, format: 'json', items: feed })
}

// Helper functions for different output formats
function getCSVResponse(items: any[]) {
  const headers = [
    'enable_search',
    'enable_checkout',
    'id',
    'mpn',
    'title',
    'description',
    'link',
    'condition',
    'product_category',
    'brand',
    'material',
    'weight',
    'price',
    'availability',
    'inventory_quantity',
    'image_link',
    'additional_image_link',
    'seller_name',
    'seller_url',
    'seller_privacy_policy',
    'seller_tos',
    'return_policy',
    'return_window',
    'shipping',
    'delivery_estimate',
    'product_review_count',
    'product_review_rating',
    'return_rate',
    'item_group_id',
    'item_group_title',
    'color',
    'size',
    'offer_id',
  ]
  const lines = [headers.join(',')]
  for (const it of items) {
    const row = headers.map((h) => {
      const val = it[h]
      const cell = Array.isArray(val) ? JSON.stringify(val) : (val ?? '')
      const needsQuote = /[,"]/.test(String(cell))
      return needsQuote ? '"' + String(cell).replace(/"/g, '""') + '"' : String(cell)
    })
    lines.push(row.join(','))
  }
  return new NextResponse(lines.join('\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function getTSVResponse(items: any[]) {
  const headers = [
    'enable_search',
    'enable_checkout',
    'id',
    'mpn',
    'title',
    'description',
    'link',
    'condition',
    'product_category',
    'brand',
    'material',
    'weight',
    'price',
    'availability',
    'inventory_quantity',
    'image_link',
    'additional_image_link',
    'seller_name',
    'seller_url',
    'seller_privacy_policy',
    'seller_tos',
    'return_policy',
    'return_window',
    'shipping',
    'delivery_estimate',
    'product_review_count',
    'product_review_rating',
    'return_rate',
    'item_group_id',
    'item_group_title',
    'color',
    'size',
    'offer_id',
  ]
  const lines = [headers.join('\t')]
  for (const it of items) {
    const row = headers.map((h) => {
      const val = it[h]
      return Array.isArray(val) ? JSON.stringify(val) : (val ?? '')
    })
    lines.push(row.join('\t'))
  }
  return new NextResponse(lines.join('\n'), {
    headers: {
      'content-type': 'text/tab-separated-values; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
