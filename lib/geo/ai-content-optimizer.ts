/**
 * GEO AI Content Optimizer
 * Generates AI-optimized content for maximum visibility
 */

export interface AIContentStrategy {
  type: 'direct_answer' | 'comparison' | 'how_to' | 'review' | 'specification'
  target_queries: string[]
  content_structure: string[]
  ai_signals: string[]
}

export interface OptimizedContent {
  title: string
  meta_description: string
  content: string
  faqs: Array<{ question: string; answer: string }>
  structured_data: any
  ai_optimization_score: number
  target_queries: string[]
}

export class GEOAIContentOptimizer {
  private contentStrategies: AIContentStrategy[] = [
    {
      type: 'direct_answer',
      target_queries: ['what is', 'how much', 'where to buy', 'best'],
      content_structure: ['quick_answer', 'key_features', 'specifications', 'pricing'],
      ai_signals: ['clear_definition', 'specific_details', 'actionable_info']
    },
    {
      type: 'comparison',
      target_queries: ['vs', 'compare', 'difference', 'better'],
      content_structure: ['comparison_table', 'pros_cons', 'recommendation', 'alternatives'],
      ai_signals: ['objective_analysis', 'specific_metrics', 'clear_recommendation']
    },
    {
      type: 'how_to',
      target_queries: ['how to', 'tutorial', 'guide', 'steps'],
      content_structure: ['overview', 'step_by_step', 'tips', 'troubleshooting'],
      ai_signals: ['sequential_steps', 'clear_instructions', 'practical_tips']
    },
    {
      type: 'review',
      target_queries: ['review', 'opinion', 'experience', 'rating'],
      content_structure: ['overview', 'pros_cons', 'personal_experience', 'verdict'],
      ai_signals: ['authentic_experience', 'balanced_opinion', 'specific_examples']
    },
    {
      type: 'specification',
      target_queries: ['specs', 'features', 'technical', 'details'],
      content_structure: ['technical_specs', 'compatibility', 'requirements', 'performance'],
      ai_signals: ['technical_accuracy', 'comprehensive_details', 'compatibility_info']
    }
  ]

  /**
   * Generate AI-optimized content for a product
   */
  generateOptimizedContent(product: {
    name: string
    category: string
    price: number
    description: string
    features: string[]
    specifications: Record<string, string>
    useCases: string[]
    pros: string[]
    cons: string[]
  }): OptimizedContent {
    const strategies = this.selectOptimalStrategies(product)
    const content = this.buildContentFromStrategies(product, strategies)
    const faqs = this.generateFAQs(product)
    const structuredData = this.generateStructuredData(product)
    
    const optimizationScore = this.calculateOptimizationScore(content, faqs)
    const targetQueries = this.extractTargetQueries(strategies)

    return {
      title: this.generateTitle(product),
      meta_description: this.generateMetaDescription(product),
      content,
      faqs,
      structured_data: structuredData,
      ai_optimization_score: optimizationScore,
      target_queries: targetQueries
    }
  }

  /**
   * Select optimal content strategies for the product
   */
  private selectOptimalStrategies(product: any): AIContentStrategy[] {
    const strategies = []
    
    // Always include direct answer for basic queries
    strategies.push(this.contentStrategies[0])
    
    // Add comparison if there are pros/cons
    if (product.pros && product.cons && product.pros.length > 0 && product.cons.length > 0) {
      strategies.push(this.contentStrategies[1])
    }
    
    // Add how-to if there are use cases
    if (product.useCases && product.useCases.length > 0) {
      strategies.push(this.contentStrategies[2])
    }
    
    // Add review if there are pros/cons
    if (product.pros && product.cons) {
      strategies.push(this.contentStrategies[3])
    }
    
    // Add specifications if there are technical specs
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      strategies.push(this.contentStrategies[4])
    }
    
    return strategies
  }

  /**
   * Build content from selected strategies
   */
  private buildContentFromStrategies(product: any, strategies: AIContentStrategy[]): string {
    let content = `# ${product.name}\n\n`
    
    // Direct Answer Section
    content += `## Quick Answer\n`
    content += `${product.name} is a ${product.category} priced at $${product.price}. `
    content += `${product.features.slice(0, 2).join(' and ')} make it ideal for ${product.useCases[0] || 'various applications'}.\n\n`
    
    // Key Features
    content += `## Key Features\n`
    product.features.forEach(feature => {
      content += `- ${feature}\n`
    })
    content += `\n`
    
    // Specifications
    if (Object.keys(product.specifications).length > 0) {
      content += `## Specifications\n`
      Object.entries(product.specifications).forEach(([key, value]) => {
        content += `- **${key}**: ${value}\n`
      })
      content += `\n`
    }
    
    // Pros and Cons (if available)
    if (product.pros && product.cons) {
      content += `## Pros and Cons\n\n`
      content += `### Pros\n`
      product.pros.forEach(pro => {
        content += `- ${pro}\n`
      })
      content += `\n### Cons\n`
      product.cons.forEach(con => {
        content += `- ${con}\n`
      })
      content += `\n`
    }
    
    // Use Cases
    if (product.useCases && product.useCases.length > 0) {
      content += `## Best For\n`
      product.useCases.forEach(useCase => {
        content += `- ${useCase}\n`
      })
      content += `\n`
    }
    
    // Pricing and Availability
    content += `## Pricing and Availability\n`
    content += `- **Price**: $${product.price}\n`
    content += `- **Availability**: In Stock\n`
    content += `- **Shipping**: Free shipping on orders over $50\n\n`
    
    // Why Choose This Product
    content += `## Why Choose This Product\n`
    content += `${product.name} offers excellent value with ${product.features[0]} and ${product.features[1] || 'quality construction'}, making it ideal for ${product.useCases[0] || 'professional use'}.\n`
    
    return content
  }

  /**
   * Generate FAQs for the product
   */
  private generateFAQs(product: any): Array<{ question: string; answer: string }> {
    const faqs = [
      {
        question: `What is ${product.name}?`,
        answer: `${product.name} is a ${product.category} that ${product.description.toLowerCase()}. It features ${product.features.slice(0, 2).join(' and ')} and is priced at $${product.price}.`
      },
      {
        question: `How much does ${product.name} cost?`,
        answer: `${product.name} is priced at $${product.price}. This includes the base product with standard features.`
      },
      {
        question: `Where can I buy ${product.name}?`,
        answer: `You can purchase ${product.name} directly from VERCLIBASE with free shipping on orders over $50.`
      }
    ]

    // Add category-specific FAQs
    if (product.category.toLowerCase().includes('shirt')) {
      faqs.push({
        question: `What sizes are available for ${product.name}?`,
        answer: `${product.name} is available in sizes S, M, L, XL, and XXL. Please refer to our size chart for accurate measurements.`
      })
    }

    if (product.category.toLowerCase().includes('mug')) {
      faqs.push({
        question: `Is ${product.name} dishwasher safe?`,
        answer: `Yes, ${product.name} is dishwasher safe and microwave safe for everyday use.`
      })
    }

    return faqs
  }

  /**
   * Generate structured data
   */
  private generateStructuredData(product: any): any {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      category: product.category,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      }
    }
  }

  /**
   * Generate SEO-optimized title
   */
  private generateTitle(product: any): string {
    return `${product.name} - ${product.category} | VERCLIBASE`
  }

  /**
   * Generate meta description
   */
  private generateMetaDescription(product: any): string {
    return `${product.name} - ${product.description}. Features ${product.features.slice(0, 2).join(' and ')}. $${product.price} with free shipping.`
  }

  /**
   * Calculate optimization score
   */
  private calculateOptimizationScore(content: string, faqs: any[]): number {
    let score = 0
    
    // Content length score (optimal: 800-1200 words)
    const wordCount = content.split(' ').length
    if (wordCount >= 800 && wordCount <= 1200) score += 25
    else if (wordCount >= 600 && wordCount <= 1500) score += 15
    
    // FAQ count score
    if (faqs.length >= 3) score += 20
    else if (faqs.length >= 2) score += 15
    
    // Structure score
    const hasHeadings = (content.match(/^##/gm) || []).length >= 3
    if (hasHeadings) score += 20
    
    // AI signal score
    const aiSignals = ['best', 'top', 'recommended', 'ideal', 'perfect']
    const signalCount = aiSignals.filter(signal => content.toLowerCase().includes(signal)).length
    score += Math.min(20, signalCount * 5)
    
    // Technical detail score
    const hasSpecs = content.includes('Specifications') || content.includes('**')
    if (hasSpecs) score += 15
    
    return Math.min(100, score)
  }

  /**
   * Extract target queries from strategies
   */
  private extractTargetQueries(strategies: AIContentStrategy[]): string[] {
    const queries = new Set<string>()
    strategies.forEach(strategy => {
      strategy.target_queries.forEach(query => queries.add(query))
    })
    return Array.from(queries)
  }
}
