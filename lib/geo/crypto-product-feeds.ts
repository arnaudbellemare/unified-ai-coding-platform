/**
 * Crypto-Aware Product Feeds for AI Discovery
 * Optimizes product data for generative engine visibility
 */

import { CryptoProductSchemaGenerator } from './crypto-product-schema'
import { CryptoContentOptimizer } from './crypto-content-optimizer'

export interface CryptoProductFeed {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category: string
  brand: string
  availability: boolean
  cryptoSupported: boolean
  geoOptimized: {
    schema: any
    content: string
    faqs: Array<{ question: string; answer: string }>
    authoritySignals: string[]
    citations: string[]
  }
  paymentMethods: {
    crypto: string[]
    traditional: string[]
    autoUSDCConversion: boolean
    instantSettlement: boolean
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    metaTags: any
  }
}

export interface CryptoFeedConfig {
  baseUrl: string
  autoUSDCConversion: boolean
  supportedCurrencies: string[]
  networkSupport: string[]
  geoOptimization: boolean
  authorityBuilding: boolean
}

export class CryptoProductFeedManager {
  private config: CryptoFeedConfig

  constructor(config: CryptoFeedConfig) {
    this.config = config
  }

  /**
   * Generate crypto-optimized product feed
   */
  generateCryptoProductFeed(products: Array<{
    id: string
    name: string
    description: string
    price: number
    currency: string
    image: string
    category: string
    brand: string
    availability: boolean
    rating?: number
    reviewCount?: number
  }>): CryptoProductFeed[] {
    return products.map(product => {
      const geoOptimized = this.generateGEOOptimizedProduct(product)
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        image: product.image,
        category: product.category,
        brand: product.brand,
        availability: product.availability,
        cryptoSupported: true,
        geoOptimized: {
          schema: CryptoProductSchemaGenerator.generateProductSchema({
            ...product,
            cryptoSupported: true
          }),
          content: geoOptimized.cryptoContent.content,
          faqs: geoOptimized.faqs,
          authoritySignals: geoOptimized.authorityContent,
          citations: geoOptimized.citations
        },
        paymentMethods: {
          crypto: ['USDC', 'ETH', 'BTC', 'USDT'],
          traditional: ['Credit Card', 'PayPal', 'Bank Transfer'],
          autoUSDCConversion: this.config.autoUSDCConversion,
          instantSettlement: true
        },
        seo: CryptoContentOptimizer.generateCryptoMetaTags(product)
      }
    })
  }

  /**
   * Generate GEO-optimized product
   */
  private generateGEOOptimizedProduct(product: any) {
    return CryptoContentOptimizer.generateGEOOptimizedProduct({
      ...product,
      cryptoSupported: true
    })
  }

  /**
   * Generate XML sitemap for crypto products
   */
  generateCryptoSitemap(products: CryptoProductFeed[]): string {
    const baseUrl = this.config.baseUrl
    const currentDate = new Date().toISOString()

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:product="http://www.google.com/schemas/sitemap-product/1.0">
${products.map(product => `
  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${product.image}</image:loc>
      <image:title>${product.name} - Crypto Payment Supported</image:title>
      <image:caption>${product.description}</image:caption>
    </image:image>
    <product:product>
      <product:name>${product.name}</product:name>
      <product:description>${product.description}</product:description>
      <product:price>${product.price}</product:price>
      <product:currency>${product.currency}</product:currency>
      <product:availability>${product.availability ? 'in stock' : 'out of stock'}</product:availability>
      <product:condition>new</product:condition>
      <product:brand>${product.brand}</product:brand>
      <product:category>${product.category}</product:category>
      <product:payment_accepted>USDC,ETH,BTC,USDT,Credit Card</product:payment_accepted>
      <product:crypto_supported>true</product:crypto_supported>
      <product:auto_usdc_conversion>${this.config.autoUSDCConversion}</product:auto_usdc_conversion>
      <product:instant_settlement>true</product:instant_settlement>
    </product:product>
  </url>`).join('')}
</urlset>`

    return sitemap
  }

  /**
   * Generate JSON-LD structured data for all products
   */
  generateStructuredData(products: CryptoProductFeed[]): any {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "VERCLIBASE",
      "url": this.config.baseUrl,
      "description": "AI-powered crypto commerce platform with instant USDC conversion",
      "paymentAccepted": ["USDC", "ETH", "BTC", "USDT", "Credit Card", "PayPal"],
      "cryptoCapabilities": {
        "supportedCurrencies": this.config.supportedCurrencies,
        "autoUSDCConversion": this.config.autoUSDCConversion,
        "instantSettlement": true,
        "networkSupport": this.config.networkSupport,
        "feeStructure": "1% fee, free on Base network"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Crypto Commerce Products",
        "description": "Products with instant crypto payment support",
        "itemListElement": products.map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.image,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": product.currency,
              "acceptedPaymentMethod": [
                "CryptocurrencyPayment",
                "CreditCard"
              ],
              "priceSpecification": {
                "cryptoSupported": product.cryptoSupported,
                "autoConversion": this.config.autoUSDCConversion,
                "supportedCryptocurrencies": product.paymentMethods.crypto
              }
            }
          }
        }))
      }
    }
  }

  /**
   * Generate RSS feed for crypto products
   */
  generateCryptoRSSFeed(products: CryptoProductFeed[]): string {
    const baseUrl = this.config.baseUrl
    const currentDate = new Date().toUTCString()

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:product="http://www.google.com/schemas/sitemap-product/1.0">
  <channel>
    <title>VERCLIBASE Crypto Commerce Products</title>
    <description>Products with instant crypto payment support and auto USDC conversion</description>
    <link>${baseUrl}</link>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss/crypto-products" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <category>E-commerce</category>
    <category>Crypto Payments</category>
    <category>Web3 Commerce</category>
${products.map(product => `
    <item>
      <title>${product.name} - Crypto Payment Supported</title>
      <description>${product.description} - Instant crypto payments with auto USDC conversion</description>
      <link>${baseUrl}/products/${product.id}</link>
      <guid isPermaLink="true">${baseUrl}/products/${product.id}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>${product.category}</category>
      <category>Crypto Commerce</category>
      <product:price>${product.price}</product:price>
      <product:currency>${product.currency}</product:currency>
      <product:availability>${product.availability ? 'in stock' : 'out of stock'}</product:availability>
      <product:payment_accepted>USDC,ETH,BTC,USDT,Credit Card</product:payment_accepted>
      <product:crypto_supported>true</product:crypto_supported>
      <product:auto_usdc_conversion>${this.config.autoUSDCConversion}</product:auto_usdc_conversion>
    </item>`).join('')}
  </channel>
</rss>`

    return rss
  }

  /**
   * Generate Google Shopping feed for crypto products
   */
  generateGoogleShoppingFeed(products: CryptoProductFeed[]): string {
    const headers = [
      'id',
      'title',
      'description',
      'link',
      'image_link',
      'availability',
      'price',
      'currency',
      'brand',
      'category',
      'condition',
      'payment_accepted',
      'crypto_supported',
      'auto_usdc_conversion',
      'instant_settlement',
      'supported_cryptocurrencies',
      'network_support'
    ]

    const rows = products.map(product => [
      product.id,
      `${product.name} - Crypto Payment Supported`,
      `${product.description} - Instant crypto payments with auto USDC conversion`,
      `${this.config.baseUrl}/products/${product.id}`,
      product.image,
      product.availability ? 'in stock' : 'out of stock',
      product.price,
      product.currency,
      product.brand,
      product.category,
      'new',
      'USDC,ETH,BTC,USDT,Credit Card',
      'true',
      this.config.autoUSDCConversion.toString(),
      'true',
      product.paymentMethods.crypto.join(','),
      this.config.networkSupport.join(',')
    ])

    return [headers, ...rows].map(row => row.join('\t')).join('\n')
  }

  /**
   * Generate Meta (Facebook) catalog for crypto products
   */
  generateMetaCatalog(products: CryptoProductFeed[]): any {
    return {
      "catalog": {
        "name": "VERCLIBASE Crypto Commerce",
        "description": "Products with instant crypto payment support",
        "currency": "USD",
        "availability": "in stock",
        "condition": "new",
        "custom_data": {
          "crypto_supported": true,
          "auto_usdc_conversion": this.config.autoUSDCConversion,
          "instant_settlement": true,
          "supported_currencies": this.config.supportedCurrencies,
          "network_support": this.config.networkSupport
        },
        "items": products.map(product => ({
          "id": product.id,
          "title": `${product.name} - Crypto Payment Supported`,
          "description": `${product.description} - Instant crypto payments with auto USDC conversion`,
          "link": `${this.config.baseUrl}/products/${product.id}`,
          "image_url": product.image,
          "availability": product.availability ? "in stock" : "out of stock",
          "price": product.price,
          "currency": product.currency,
          "brand": product.brand,
          "category": product.category,
          "condition": "new",
          "custom_data": {
            "crypto_supported": product.cryptoSupported,
            "auto_usdc_conversion": product.paymentMethods.autoUSDCConversion,
            "instant_settlement": product.paymentMethods.instantSettlement,
            "supported_cryptocurrencies": product.paymentMethods.crypto,
            "payment_methods": [...product.paymentMethods.crypto, ...product.paymentMethods.traditional]
          }
        }))
      }
    }
  }

  /**
   * Generate TikTok catalog for crypto products
   */
  generateTikTokCatalog(products: CryptoProductFeed[]): any {
    return {
      "catalog": {
        "name": "VERCLIBASE Crypto Commerce",
        "description": "Products with instant crypto payment support",
        "currency": "USD",
        "items": products.map(product => ({
          "id": product.id,
          "title": `${product.name} - Crypto Payment Supported`,
          "description": `${product.description} - Instant crypto payments with auto USDC conversion`,
          "link": `${this.config.baseUrl}/products/${product.id}`,
          "image_url": product.image,
          "availability": product.availability ? "in stock" : "out of stock",
          "price": product.price,
          "currency": product.currency,
          "brand": product.brand,
          "category": product.category,
          "condition": "new",
          "custom_data": {
            "crypto_supported": product.cryptoSupported,
            "auto_usdc_conversion": product.paymentMethods.autoUSDCConversion,
            "instant_settlement": product.paymentMethods.instantSettlement,
            "supported_cryptocurrencies": product.paymentMethods.crypto
          }
        }))
      }
    }
  }

  /**
   * Generate comprehensive feed summary
   */
  generateFeedSummary(products: CryptoProductFeed[]): {
    totalProducts: number
    cryptoSupported: number
    averagePrice: number
    currencyDistribution: Record<string, number>
    categoryDistribution: Record<string, number>
    geoOptimized: number
    authoritySignals: number
    citations: number
  } {
    const cryptoSupported = products.filter(p => p.cryptoSupported).length
    const averagePrice = products.reduce((sum, p) => sum + p.price, 0) / products.length
    
    const currencyDistribution = products.reduce((acc, p) => {
      acc[p.currency] = (acc[p.currency] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categoryDistribution = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const geoOptimized = products.filter(p => p.geoOptimized).length
    const authoritySignals = products.reduce((sum, p) => sum + p.geoOptimized.authoritySignals.length, 0)
    const citations = products.reduce((sum, p) => sum + p.geoOptimized.citations.length, 0)

    return {
      totalProducts: products.length,
      cryptoSupported,
      averagePrice,
      currencyDistribution,
      categoryDistribution,
      geoOptimized,
      authoritySignals,
      citations
    }
  }
}
