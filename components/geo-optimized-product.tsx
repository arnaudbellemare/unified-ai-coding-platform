/**
 * GEO Optimized Product Component
 * AI-optimized product display for maximum visibility
 */

'use client'

import React, { useState, useEffect } from 'react'
import { GEOSchemaGenerator } from '@/lib/geo/schema-generator'
import { GEOAIContentOptimizer } from '@/lib/geo/ai-content-optimizer'
import { GEOAuthorityTracker } from '@/lib/geo/authority-tracker'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  brand: string
  category: string
  rating?: number
  reviewCount?: number
  features: string[]
  specifications: Record<string, string>
  useCases: string[]
  pros: string[]
  cons: string[]
}

interface GEOOptimizedProductProps {
  product: Product
  showAIOptimization?: boolean
}

export function GEOOptimizedProduct({ product, showAIOptimization = false }: GEOOptimizedProductProps) {
  const [optimizedContent, setOptimizedContent] = useState<any>(null)
  const [schemaData, setSchemaData] = useState<any>(null)
  const [aiMetrics, setAiMetrics] = useState<any>(null)

  const schemaGenerator = new GEOSchemaGenerator()
  const contentOptimizer = new GEOAIContentOptimizer()
  const authorityTracker = new GEOAuthorityTracker()

  useEffect(() => {
    // Generate optimized content
    const optimized = contentOptimizer.generateOptimizedContent(product)
    setOptimizedContent(optimized)

    // Generate schema data
    const schema = schemaGenerator.generateProductSchema(product)
    setSchemaData(schema)

    // Get AI metrics
    const metrics = authorityTracker.getGEOMetrics()
    setAiMetrics(metrics)
  }, [product])

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* AI-Optimized Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Product Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-lg text-gray-600 mb-4">{product.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-blue-600">${product.price}</span>
            {product.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-medium">{product.rating}</span>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* AI-Optimized Content Sections */}
        <div className="p-6">
          {/* Quick Answer Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Answer</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-gray-800">
                {product.name} is a {product.category} priced at ${product.price}. {product.features.slice(0, 2).join(' and ')} make it ideal for {product.useCases[0] || 'various applications'}.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          {Object.keys(product.specifications).length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Specifications</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="font-medium text-gray-700">{key}:</dt>
                      <dd className="text-gray-600">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Pros and Cons */}
          {(product.pros.length > 0 || product.cons.length > 0) && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pros and Cons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.pros.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-green-700 mb-3">Pros</h3>
                    <ul className="space-y-2">
                      {product.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-gray-700">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.cons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-red-700 mb-3">Cons</h3>
                    <ul className="space-y-2">
                      {product.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">✗</span>
                          <span className="text-gray-700">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Best For */}
          {product.useCases.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Best For</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.useCases.map((useCase, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-blue-500">→</span>
                    <span className="text-gray-700">{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing and Availability */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pricing and Availability</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">Price: ${product.price}</p>
                  <p className="text-gray-600">Availability: In Stock</p>
                  <p className="text-gray-600">Shipping: Free shipping on orders over $50</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Why Choose This Product */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose This Product</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                {product.name} offers excellent value with {product.features[0]} and {product.features[1] || 'quality construction'}, making it ideal for {product.useCases[0] || 'professional use'}.
              </p>
            </div>
          </div>
        </div>

        {/* AI Optimization Metrics */}
        {showAIOptimization && aiMetrics && (
          <div className="bg-gray-100 p-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Optimization Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{aiMetrics.total_citations}</div>
                <div className="text-sm text-gray-600">AI Citations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{aiMetrics.authority_score}</div>
                <div className="text-sm text-gray-600">Authority Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{aiMetrics.ai_visibility_score}</div>
                <div className="text-sm text-gray-600">AI Visibility</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{(aiMetrics.conversion_rate * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
