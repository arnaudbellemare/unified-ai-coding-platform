/**
 * Crypto-Specific Product Schema for GEO Optimization
 * Implements structured data for AI discovery of crypto commerce
 */

export interface CryptoProductSchema {
  '@context': 'https://schema.org'
  '@type': 'Product'
  name: string
  description: string
  image: string[]
  brand: {
    '@type': 'Brand'
    name: string
    logo: string
  }
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: 'USD' | 'USDC' | 'ETH'
    acceptedPaymentMethod: string[]
    priceSpecification: {
      '@type': 'PriceSpecification'
      eligibleQuantity: {
        '@type': 'QuantitativeValue'
        minValue: number
      }
      cryptoSupported: boolean
      autoConversion: boolean
      supportedCryptocurrencies: string[]
    }
    availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock'
    seller: {
      '@type': 'Organization'
      name: string
      url: string
    }
    validFrom: string
    validThrough: string
  }
  paymentAccepted: string[]
  cryptoPaymentMethods: {
    supportedCurrencies: string[]
    autoUSDCConversion: boolean
    instantSettlement: boolean
    networkFees: string
    supportedNetworks: string[]
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
    bestRating: number
    worstRating: number
  }
  review?: Array<{
    '@type': 'Review'
    author: {
      '@type': 'Person'
      name: string
    }
    reviewRating: {
      '@type': 'Rating'
      ratingValue: number
      bestRating: number
    }
    reviewBody: string
    datePublished: string
  }>
  faq?: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
  additionalProperty?: Array<{
    '@type': 'PropertyValue'
    name: string
    value: string
  }>
}

export interface CryptoCommerceSchema {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  description: string
  paymentAccepted: string[]
  cryptoCapabilities: {
    supportedCurrencies: string[]
    autoUSDCConversion: boolean
    instantSettlement: boolean
    networkSupport: string[]
    feeStructure: string
  }
  sameAs: string[]
  contactPoint: {
    '@type': 'ContactPoint'
    telephone: string
    contactType: 'customer service'
    availableLanguage: string[]
  }
}

export class CryptoProductSchemaGenerator {
  /**
   * Generate crypto-optimized product schema for GEO
   */
  static generateProductSchema(product: {
    id: string
    name: string
    description: string
    price: number
    currency: string
    image: string
    brand: string
    availability: boolean
    rating?: number
    reviewCount?: number
    faqs?: Array<{ question: string; answer: string }>
    cryptoSupported?: boolean
  }): CryptoProductSchema {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verclibase.com'

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: [product.image],
      brand: {
        '@type': 'Brand',
        name: product.brand,
        logo: `${baseUrl}/logo.png`,
      },
      offers: {
        '@type': 'Offer',
        price: product.price.toString(),
        priceCurrency: product.currency as 'USD' | 'USDC' | 'ETH',
        acceptedPaymentMethod: ['CryptocurrencyPayment', 'CreditCard', 'DebitCard', 'PayPal'],
        priceSpecification: {
          '@type': 'PriceSpecification',
          eligibleQuantity: {
            '@type': 'QuantitativeValue',
            minValue: 1,
          },
          cryptoSupported: product.cryptoSupported || true,
          autoConversion: true,
          supportedCryptocurrencies: ['USDC', 'ETH', 'BTC', 'USDT'],
        },
        availability: product.availability ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'VERCLIBASE',
          url: baseUrl,
        },
        validFrom: new Date().toISOString(),
        validThrough: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      paymentAccepted: ['USDC', 'ETH', 'BTC', 'USDT', 'Credit Card', 'PayPal'],
      cryptoPaymentMethods: {
        supportedCurrencies: ['USDC', 'ETH', 'BTC', 'USDT'],
        autoUSDCConversion: true,
        instantSettlement: true,
        networkFees: 'Free on Base network',
        supportedNetworks: ['Base', 'Ethereum', 'Polygon'],
      },
      ...(product.rating &&
        product.reviewCount && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      ...(product.faqs && {
        faq: product.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }),
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Crypto Payment Support',
          value: 'Yes - USDC, ETH, BTC, USDT',
        },
        {
          '@type': 'PropertyValue',
          name: 'Auto USDC Conversion',
          value: 'Yes - Instant volatility protection',
        },
        {
          '@type': 'PropertyValue',
          name: 'Settlement Time',
          value: 'Instant on Base network',
        },
        {
          '@type': 'PropertyValue',
          name: 'Network Fees',
          value: 'Free on Base, low fees on Ethereum',
        },
      ],
    }
  }

  /**
   * Generate crypto commerce organization schema
   */
  static generateCommerceSchema(): CryptoCommerceSchema {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verclibase.com'

    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'VERCLIBASE',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: 'AI-powered crypto commerce platform with instant USDC conversion and agent-to-agent payments',
      paymentAccepted: ['USDC', 'ETH', 'BTC', 'USDT', 'Credit Card', 'PayPal'],
      cryptoCapabilities: {
        supportedCurrencies: ['USDC', 'ETH', 'BTC', 'USDT'],
        autoUSDCConversion: true,
        instantSettlement: true,
        networkSupport: ['Base', 'Ethereum', 'Polygon'],
        feeStructure: '1% fee, free on Base network',
      },
      sameAs: [
        'https://github.com/verclibase',
        'https://twitter.com/verclibase',
        'https://linkedin.com/company/verclibase',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-VERCLI',
        contactType: 'customer service',
        availableLanguage: ['English', 'Spanish'],
      },
    }
  }

  /**
   * Generate FAQ schema for crypto commerce
   */
  static generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }
  }

  /**
   * Generate HowTo schema for crypto payment process
   */
  static generateHowToSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Pay with Cryptocurrency',
      description: 'Step-by-step guide to paying with crypto on VERCLIBASE',
      totalTime: 'PT2M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0',
      },
      step: [
        {
          '@type': 'HowToStep',
          name: 'Select Crypto Payment',
          text: 'Choose your preferred cryptocurrency (USDC, ETH, BTC, USDT) at checkout',
          image: '/images/crypto-payment-step1.jpg',
        },
        {
          '@type': 'HowToStep',
          name: 'Connect Wallet',
          text: 'Connect your crypto wallet or use Coinbase account for instant payment',
          image: '/images/crypto-payment-step2.jpg',
        },
        {
          '@type': 'HowToStep',
          name: 'Confirm Transaction',
          text: 'Review payment details and confirm the transaction. USDC conversion happens automatically',
          image: '/images/crypto-payment-step3.jpg',
        },
        {
          '@type': 'HowToStep',
          name: 'Instant Settlement',
          text: 'Receive instant confirmation and product access. No waiting for blockchain confirmations',
          image: '/images/crypto-payment-step4.jpg',
        },
      ],
    }
  }
}
