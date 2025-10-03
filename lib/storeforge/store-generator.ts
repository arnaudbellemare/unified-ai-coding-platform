/**
 * StoreForge Store Generator - Creates real deployable stores based on agent demand
 *
 * This generates actual Next.js components, pages, and configurations
 * instead of mock data, making stores that can be deployed immediately.
 */

import { z } from 'zod'

// Schema for real store generation
export const RealStoreConfigSchema = z.object({
  storeId: z.string(),
  storeName: z.string(),
  description: z.string(),
  theme: z.enum(['minimal', 'luxury', 'streetwear', 'tech', 'eco', 'vintage']),
  location: z.object({
    city: z.string(),
    country: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      currency: z.string(),
      category: z.string(),
      image: z.string().optional(),
      inStock: z.boolean(),
      rating: z.number().min(0).max(5),
      reviewCount: z.number(),
      geoAttributes: z.object({
        pickupAvailable: z.boolean(),
        deliveryRadius: z.number(),
      }),
    }),
  ),
  paymentMethods: z.array(z.enum(['usdc', 'eth', 'credit_card', 'apple_pay', 'google_pay'])),
  features: z.array(z.enum(['local_pickup', 'instant_delivery', 'ar_tryon', 'ai_recommendations', 'loyalty_program'])),
  branding: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    logo: z.string().optional(),
    font: z.string(),
  }),
})

export type RealStoreConfig = z.infer<typeof RealStoreConfigSchema>

/**
 * Generate actual Next.js store components based on agent demand
 */
export class RealStoreGenerator {
  /**
   * Generate the main store page component
   */
  generateStorePage(config: RealStoreConfig): string {
    const { storeName, theme, products, paymentMethods, features, branding } = config

    return `'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ShoppingCart,
  Search,
  Star,
  Truck,
  Shield,
  CheckCircle,
  ArrowRight,
  Plus,
  Minus,
  MapPin,
  Clock,
  Heart,
  Share2,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  image?: string
  inStock: boolean
  rating: number
  reviewCount: number
  geoAttributes: {
    pickupAvailable: boolean
    deliveryRadius: number
  }
}

const products: Product[] = ${JSON.stringify(products, null, 2)}

export default function ${this.sanitizeComponentName(storeName)}() {
  const [cart, setCart] = useState<{[key: string]: number}>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] > 1) {
        newCart[productId]--
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId)
      return total + (product?.price || 0) * quantity
    }, 0)
  }

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br ${this.getThemeGradient(theme)}">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold" style={{ color: '${branding.primaryColor}' }}>
                ${storeName}
              </h1>
              {features.includes('local_pickup') && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Local Pickup
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button className="relative" style={{ backgroundColor: branding.primaryColor }}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({getCartItemCount()})
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-white mb-6">
            Welcome to ${storeName}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            ${config.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {paymentMethods.map((method, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2">
                {method.toUpperCase().replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      {features.length > 0 && (
        <section className="py-16 bg-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/20 backdrop-blur-sm border-white/30">
                  <CardContent className="p-6 text-center">
                    <div dangerouslySetInnerHTML={{ __html: this.getFeatureIcon(feature) }} />
                    <h3 className="text-lg font-semibold text-white mt-4">
                      {this.formatFeatureName(feature)}
                    </h3>
                    <p className="text-white/80 text-sm mt-2">
                      {this.getFeatureDescription(feature)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white">Our Products</h3>
            <div className="flex gap-2">
              {['all', ...new Set(products.map((p) => p.category))].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="text-white"
                >
                  {category === 'all' ? 'All' : this.formatCategoryName(category)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-white ml-1">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-2">{product.name}</h4>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-white">
                      {product.currency} {product.price}
                    </span>
                    {product.inStock ? (
                      <Badge className="bg-green-500">In Stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>

                  {product.geoAttributes.pickupAvailable && (
                    <div className="flex items-center text-green-400 text-sm mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      Local pickup available
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => addToCart(product.id)}
                      disabled={!product.inStock}
                      className="flex-1"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-4 right-4">
          <Card className="bg-white/90 backdrop-blur-sm max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cart ({getCartItemCount()})</span>
                <Button variant="ghost" size="sm" onClick={() => setCart({})}>
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(cart).map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId)
                  if (!product) return null
                  
                  return (
                    <div key={productId} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-gray-500 text-xs">{product.currency} {product.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(productId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCart(productId)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold">{products[0]?.currency || 'USD'} {getCartTotal().toFixed(2)}</span>
                </div>
                <Button className="w-full" style={{ backgroundColor: branding.primaryColor }}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}`
  }

  /**
   * Generate package.json for the store
   */
  generatePackageJson(config: RealStoreConfig): string {
    return JSON.stringify(
      {
        name: this.sanitizePackageName(config.storeName),
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          '@radix-ui/react-slot': '^1.0.0',
          'class-variance-authority': '^0.7.0',
          clsx: '^2.0.0',
          'lucide-react': '^0.294.0',
          'tailwind-merge': '^2.0.0',
          'tailwindcss-animate': '^1.0.7',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          autoprefixer: '^10.0.0',
          eslint: '^8.0.0',
          'eslint-config-next': '^14.0.0',
          postcss: '^8.0.0',
          tailwindcss: '^3.0.0',
          typescript: '^5.0.0',
        },
      },
      null,
      2,
    )
  }

  /**
   * Generate deployment configuration
   */
  generateDeploymentConfig(config: RealStoreConfig): string {
    return JSON.stringify(
      {
        storeId: config.storeId,
        storeName: config.storeName,
        description: config.description,
        theme: config.theme,
        location: config.location,
        deployment: {
          platform: 'vercel',
          domain: `${this.sanitizePackageName(config.storeName)}.vercel.app`,
          buildCommand: 'npm run build',
          outputDirectory: '.next',
          installCommand: 'npm install',
        },
        features: config.features,
        paymentMethods: config.paymentMethods,
        analytics: {
          enabled: true,
          provider: 'vercel-analytics',
        },
      },
      null,
      2,
    )
  }

  // Helper methods
  private sanitizeComponentName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, 'Store$&')
  }

  private sanitizePackageName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  private getThemeGradient(theme: string): string {
    const gradients = {
      minimal: 'from-gray-50 to-gray-100',
      luxury: 'from-purple-900 via-blue-900 to-indigo-900',
      streetwear: 'from-black via-gray-900 to-gray-800',
      tech: 'from-blue-600 via-purple-600 to-blue-800',
      eco: 'from-green-400 via-blue-500 to-purple-600',
      vintage: 'from-amber-200 via-orange-200 to-yellow-200',
    }
    return gradients[theme as keyof typeof gradients] || gradients.minimal
  }

  private getFeatureIcon(feature: string): string {
    const icons = {
      local_pickup: '<MapPin className="h-8 w-8 text-blue-400 mx-auto" />',
      instant_delivery: '<Truck className="h-8 w-8 text-green-400 mx-auto" />',
      ar_tryon: '<Sparkles className="h-8 w-8 text-purple-400 mx-auto" />',
      ai_recommendations: '<Brain className="h-8 w-8 text-pink-400 mx-auto" />',
      loyalty_program: '<Star className="h-8 w-8 text-yellow-400 mx-auto" />',
    }
    return icons[feature as keyof typeof icons] || '<CheckCircle className="h-8 w-8 text-blue-400 mx-auto" />'
  }

  private formatFeatureName(feature: string): string {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  private getFeatureDescription(feature: string): string {
    const descriptions = {
      local_pickup: 'Pick up your order from our local store',
      instant_delivery: 'Get your items delivered within 30 minutes',
      ar_tryon: 'Try products in augmented reality before buying',
      ai_recommendations: 'Get personalized product recommendations',
      loyalty_program: 'Earn points and unlock exclusive rewards',
    }
    return descriptions[feature as keyof typeof descriptions] || 'Enhanced shopping experience'
  }

  private formatCategoryName(category: string): string {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
}
