/**
 * GEO Schema Generator
 * Creates schema.org structured data for AI visibility
 */

export interface ProductSchema {
  '@context': 'https://schema.org'
  '@type': 'Product'
  name: string
  description: string
  image: string[]
  brand: {
    '@type': 'Brand'
    name: string
  }
  offers: {
    '@type': 'Offer'
    price: number
    priceCurrency: string
    availability: string
    url: string
    seller: {
      '@type': 'Organization'
      name: string
    }
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
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
    }
    reviewBody: string
  }>
  additionalProperty?: Array<{
    '@type': 'PropertyValue'
    name: string
    value: string
  }>
}

export interface FAQSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

export interface HowToSchema {
  '@context': 'https://schema.org'
  '@type': 'HowTo'
  name: string
  description: string
  step: Array<{
    '@type': 'HowToStep'
    name: string
    text: string
    image?: string
  }>
}

export class GEOSchemaGenerator {
  /**
   * Generate Product schema for AI visibility
   */
  generateProductSchema(product: {
    id: string
    name: string
    description: string
    price: number
    currency: string
    image: string
    brand: string
    rating?: number
    reviewCount?: number
    availability?: string
    specifications?: Record<string, string>
  }): ProductSchema {
    const schema: ProductSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: [product.image],
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: product.availability || 'https://schema.org/InStock',
        url: `https://verclibase.com/products/${product.id}`,
        seller: {
          '@type': 'Organization',
          name: 'VERCLIBASE',
        },
      },
    }

    // Add rating if available
    if (product.rating && product.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      }
    }

    // Add specifications as additional properties
    if (product.specifications) {
      schema.additionalProperty = Object.entries(product.specifications).map(([name, value]) => ({
        '@type': 'PropertyValue',
        name,
        value,
      }))
    }

    return schema
  }

  /**
   * Generate FAQ schema for AI answers
   */
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQSchema {
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
   * Generate HowTo schema for AI instructions
   */
  generateHowToSchema(howTo: {
    name: string
    description: string
    steps: Array<{ name: string; text: string; image?: string }>
  }): HowToSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: howTo.name,
      description: howTo.description,
      step: howTo.steps.map((step) => ({
        '@type': 'HowToStep',
        name: step.name,
        text: step.text,
        ...(step.image && { image: step.image }),
      })),
    }
  }

  /**
   * Generate AI-optimized content for direct answers
   */
  generateAIContent(product: {
    name: string
    category: string
    price: number
    keyFeatures: string[]
    useCases: string[]
    specifications: Record<string, string>
  }): string {
    return `
# ${product.name}

## Quick Answer
${product.name} is a ${product.category} priced at $${product.price}. ${product.keyFeatures.join(', ')}.

## Key Features
${product.keyFeatures.map((feature) => `- ${feature}`).join('\n')}

## Best For
${product.useCases.map((useCase) => `- ${useCase}`).join('\n')}

## Specifications
${Object.entries(product.specifications)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}

## Price & Availability
- **Price**: $${product.price}
- **Availability**: In Stock
- **Shipping**: Free shipping on orders over $50

## Why Choose This Product
${product.name} offers excellent value with ${product.keyFeatures[0]} and ${product.keyFeatures[1]}, making it ideal for ${product.useCases[0]}.
    `.trim()
  }
}
