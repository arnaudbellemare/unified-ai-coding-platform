'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Heart,
  Share2,
  Star,
  CheckCircle,
  Truck,
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  category: string
  inStock: boolean
  rating: number
  reviewCount: number
  aiScore?: number
  aiRank?: number
  attributes: {
    color?: string
    size?: string
    material?: string
  }
  features: string[]
}

interface AppleProductPageProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => void
  onQuantityChange?: (quantity: number) => void
  initialQuantity?: number
}

export function AppleProductPage({
  product,
  onAddToCart,
  onQuantityChange,
  initialQuantity = 1,
}: AppleProductPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(initialQuantity)
  const [isLiked, setIsLiked] = useState(false)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantity(newQuantity)
    onQuantityChange?.(newQuantity)
  }

  const handleAddToCart = () => {
    onAddToCart?.(product, quantity)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const totalPrice = product.price * quantity

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-sm text-gray-500">
                {product.category} / {product.name}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">{product.name}</h1>
                {product.aiScore && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Ready
                  </Badge>
                )}
              </div>

              <p className="text-xl text-gray-600 leading-relaxed">{product.description}</p>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* AI Features */}
            {product.aiScore && (
              <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Brain className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Shopping Ready</h3>
                      <p className="text-sm text-gray-600">Optimized for AI discovery</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">AI Discovery Score</div>
                      <div className="text-2xl font-bold text-emerald-600">{product.aiScore}/100</div>
                    </div>
                    {product.aiRank && (
                      <div>
                        <div className="text-sm text-gray-600">AI Search Rank</div>
                        <div className="text-2xl font-bold text-blue-600">#{product.aiRank}</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full inline-block">
                    Sponsored Listing Active
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Attributes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {product.attributes.color && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Color</div>
                    <div className="font-medium text-gray-900">{product.attributes.color}</div>
                  </div>
                )}
                {product.attributes.size && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Size</div>
                    <div className="font-medium text-gray-900">{product.attributes.size}</div>
                  </div>
                )}
                {product.attributes.material && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Material</div>
                    <div className="font-medium text-gray-900">{product.attributes.material}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price and Quantity */}
            <div className="space-y-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                <span className="text-lg text-gray-600">{product.currency}</span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {product.inStock ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">In Stock</span>
                  </>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-full text-center border-0 bg-transparent text-lg font-medium focus:outline-none"
                      min="1"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Total Price */}
              {quantity > 1 && (
                <div className="flex items-center justify-between py-4 border-t border-gray-200">
                  <span className="text-lg font-medium text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${totalPrice.toFixed(2)} {product.currency}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-lg font-medium"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                Add to Cart
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-12">
                  <Heart className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
                <Button variant="outline" size="lg" className="h-12">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Free shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Secure payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Example usage with sample data
export function AppleProductPageDemo() {
  const sampleProduct: Product = {
    id: 'base-tshirt',
    name: 'BASE T-SHIRT',
    description: 'Premium quality cotton t-shirt featuring the Base logo. Comfortable fit with modern design.',
    price: 28.0,
    currency: 'USDC',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1576566588028-43ea585fd83a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Apparel',
    inStock: true,
    rating: 4.8,
    reviewCount: 127,
    aiScore: 85,
    aiRank: 3,
    attributes: {
      color: 'White',
      size: 'M',
      material: '100% Cotton',
    },
    features: [
      'Premium cotton blend',
      'Machine washable',
      'Pre-shrunk fabric',
      'Modern fit design',
      'Base logo embroidery',
    ],
  }

  const handleAddToCart = (product: Product, quantity: number) => {
    console.log(`Added ${quantity} x ${product.name} to cart`)
  }

  return <AppleProductPage product={sampleProduct} onAddToCart={handleAddToCart} />
}
