'use client'

import React, { useState, useEffect } from 'react'
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout'
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
  X,
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Sparkles,
  Brain,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image?: string
  category: string
  inStock: boolean
  rating: number
  reviewCount: number
}

interface CartItem {
  product: Product
  quantity: number
}

// Products matching Coinbase template structure
const products: Product[] = [
  {
    id: 'base-cap',
    name: 'Base Cap',
    description:
      'A sleek and comfortable cap featuring the Base logo. Perfect for showing your support for the Base ecosystem.',
    price: 25.0,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop&crop=center',
    category: 'Accessories',
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'base-hoodie',
    name: 'Base Hoodie',
    description: 'Premium quality hoodie with the Base logo. Made from 100% organic cotton for ultimate comfort.',
    price: 65.0,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop&crop=center',
    category: 'Clothing',
    inStock: true,
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: 'base-sticker-pack',
    name: 'Base Sticker Pack',
    description: 'Collection of Base-themed stickers perfect for laptops, phones, and other surfaces.',
    price: 12.0,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
    category: 'Accessories',
    inStock: true,
    rating: 4.7,
    reviewCount: 203,
  },
  {
    id: 'base-mug',
    name: 'Base Mug',
    description: 'Ceramic mug featuring the Base logo. Perfect for your morning coffee or tea.',
    price: 18.0,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&crop=center',
    category: 'Accessories',
    inStock: true,
    rating: 4.6,
    reviewCount: 156,
  },
  {
    id: 'base-t-shirt',
    name: 'Base T-Shirt',
    description: 'Comfortable cotton t-shirt with the Base logo. Available in multiple sizes.',
    price: 28.0,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop&crop=center',
    category: 'Clothing',
    inStock: true,
    rating: 4.8,
    reviewCount: 167,
  },
  {
    id: 'base-notebook',
    name: 'Base Notebook',
    description: 'Premium notebook with the Base logo. Perfect for developers and crypto enthusiasts.',
    price: 22.0,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center',
    category: 'Accessories',
    inStock: true,
    rating: 4.9,
    reviewCount: 78,
  },
]

export function AppleStoreTemplate() {
  const [selectedProduct, setSelectedProduct] = useState(products[1]) // Start with Base Hoodie
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)

  const getTotalPrice = () => {
    return selectedProduct.price * quantity
  }

  const addToCart = (product: Product) => {
    // Simple cart functionality - you can enhance this later
    console.log('Added to cart:', product.name)
    // For now, just log the action
  }

  // Charge handler for OnchainKit Checkout
  const chargeHandler = async (): Promise<string> => {
    try {
      const response = await fetch('/api/coinbase-commerce/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${selectedProduct.name} - VERCLIBASE Store`,
          description: selectedProduct.description,
          local_price: {
            amount: getTotalPrice().toFixed(2),
            currency: 'USD',
          },
          pricing_type: 'fixed_price',
          metadata: {
            product_id: selectedProduct.id,
            quantity: quantity,
            total: getTotalPrice(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create charge')
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Error creating charge:', error)
      throw error
    }
  }

  // Handle checkout status
  const handleCheckoutStatus = async (status: any) => {
    const { statusName, statusData } = status

    switch (statusName) {
      case 'success':
        console.log('Payment successful!', statusData)
        break
      case 'pending':
        console.log('Payment pending...')
        break
      case 'error':
        console.log('Payment failed:', statusData.message || 'Unknown error')
        break
      default:
        console.log('Checkout status:', statusName, statusData)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      const hasHalfStar = rating % 1 !== 0 && Math.floor(rating) === i

      if (starValue <= Math.floor(rating)) {
        // Full star
        return <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      } else if (hasHalfStar) {
        // Half star
        return (
          <div key={i} className="relative">
            <Star className="h-4 w-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )
      } else {
        // Empty star
        return <Star key={i} className="h-4 w-4 text-gray-300" />
      }
    })
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🛍️</div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
                  {selectedProduct.name}
                </h1>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Ready
                </Badge>
              </div>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(selectedProduct.rating)}
                  <span className="text-sm text-gray-600 ml-2">
                    {selectedProduct.rating} ({selectedProduct.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* AI Features */}
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
                    <div className="text-2xl font-bold text-emerald-600">91/100</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">AI Search Rank</div>
                    <div className="text-2xl font-bold text-blue-600">#2</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full inline-block">
                  Sponsored Listing Active
                </div>
              </CardContent>
            </Card>

            {/* Product Attributes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Category</div>
                  <div className="font-medium text-gray-900">{selectedProduct.category}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Availability</div>
                  <div className="font-medium text-gray-900">
                    {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Quantity */}
            <div className="space-y-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${selectedProduct.price.toFixed(2)}
                </span>
                <span className="text-lg text-gray-600">USDC</span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {selectedProduct.inStock ? (
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
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full text-center border-0 bg-transparent text-lg font-medium focus:outline-none"
                      min="1"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={() => setQuantity(quantity + 1)}
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
                    ${getTotalPrice().toFixed(2)} USDC
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="w-full">
                <Checkout chargeHandler={chargeHandler} onStatus={handleCheckoutStatus}>
                  <CheckoutButton
                    text={`Pay ${getTotalPrice().toFixed(2)} USDC`}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-lg font-medium rounded-xl"
                  />
                  <CheckoutStatus />
                </Checkout>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-12 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white">
                  <Heart className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
                <Button variant="outline" size="lg" className="h-12 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white">
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

export default AppleStoreTemplate
