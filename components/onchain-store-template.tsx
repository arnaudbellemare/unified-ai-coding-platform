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
  List
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
    description: 'A sleek and comfortable cap featuring the Base logo. Perfect for showing your support for the Base ecosystem.',
    price: 25.00,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop&crop=center',
    category: 'Accessories',
    inStock: true,
    rating: 4.8,
    reviewCount: 124
  },
  {
    id: 'base-hoodie',
    name: 'Base Hoodie',
    description: 'Premium quality hoodie with the Base logo. Made from 100% organic cotton for ultimate comfort.',
    price: 65.00,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop&crop=center',
    category: 'Clothing',
    inStock: true,
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: 'base-sticker-pack',
    name: 'Base Sticker Pack',
    description: 'Collection of Base-themed stickers perfect for laptops, phones, and other surfaces.',
    price: 12.00,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
    category: 'Accessories',
    inStock: true,
    rating: 4.7,
    reviewCount: 203
  },
  {
    id: 'base-mug',
    name: 'Base Mug',
    description: 'Ceramic mug featuring the Base logo. Perfect for your morning coffee or tea.',
    price: 18.00,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop&crop=center',
    category: 'Accessories',
    inStock: true,
    rating: 4.6,
    reviewCount: 156
  },
  {
    id: 'base-t-shirt',
    name: 'Base T-Shirt',
    description: 'Comfortable cotton t-shirt with the Base logo. Available in multiple sizes.',
    price: 28.00,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop&crop=center',
    category: 'Clothing',
    inStock: true,
    rating: 4.8,
    reviewCount: 167
  },
  {
    id: 'base-notebook',
    name: 'Base Notebook',
    description: 'Premium notebook with the Base logo. Perfect for developers and crypto enthusiasts.',
    price: 22.00,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center',
    category: 'Accessories',
    inStock: true,
    rating: 4.9,
    reviewCount: 78
  }
]

export function OnchainStoreTemplate() {
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [quantity, setQuantity] = useState(1)

  const getTotalPrice = () => {
    return selectedProduct.price * quantity
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
          description: `${quantity}x ${selectedProduct.name} from VERCLIBASE Store`,
          local_price: {
            amount: getTotalPrice().toFixed(2),
            currency: 'USD'
          },
          pricing_type: 'fixed_price',
          metadata: {
            product_id: selectedProduct.id,
            quantity: quantity,
            price: selectedProduct.price,
            timestamp: new Date().toISOString()
          }
        })
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
        console.log('Checkout successful:', statusData)
        alert('Payment successful! Your order has been placed.')
        break
      case 'pending':
        console.log('Payment pending:', statusData)
        break
      case 'error':
        console.error('Checkout error:', statusData)
        alert('Payment failed. Please try again.')
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
        return (
          <Star
            key={i}
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
          />
        )
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
        return (
          <Star
            key={i}
            className="h-4 w-4 text-gray-300"
          />
        )
      }
    })
  }

  const renderProduct = (product: Product) => (
    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 bg-white border border-gray-200">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
              <div className="text-6xl text-blue-400">🛍️</div>
            </div>
          )}
          {!product.inStock && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">Out of Stock</Badge>
          )}
          <Badge className="absolute top-2 left-2 bg-gray-800 text-white text-xs">
            {product.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{product.description}</p>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <div className="text-2xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </div>
          <Button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            size="sm"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white border-0 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Demo Banner */}
      <div className="bg-gray-900 text-white text-center py-2 text-sm">
        This is a demo site. These products are not for sale.
      </div>

      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">VERCLIBASE Store</h1>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
              Template
            </div>
            <Button variant="ghost" size="sm">
              <div className="flex flex-col gap-1">
                <div className="w-4 h-0.5 bg-black"></div>
                <div className="w-4 h-0.5 bg-black"></div>
                <div className="w-4 h-0.5 bg-black"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8">
        {/* Hero Text */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            The future of commerce is less fee. More creativity.
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              People and businesses lose tens of billions of dollars in transaction fees and countless hours in delays to the current system that they wouldn't with onchain payments.
            </p>
            <p>
              We're updating the system so it's cheaper and faster.
            </p>
          </div>
        </div>

        {/* GEO Advantage */}
        <div className="mb-12">
          <h3 className="text-lg font-bold uppercase text-black mb-4">
            AI SEARCH OPTIMIZATION
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>
              Your products are optimized for AI agent discovery and ranking. When customers ask AI assistants like ChatGPT to find products, yours appear first with GEO (Generative Engine Optimization) technology.
            </p>
            <div className="flex items-center gap-2 text-blue-600">
              <span className="text-sm font-medium">Powered by Base Network</span>
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Product Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-black">'{selectedProduct.name.toUpperCase()}'</h4>
            <div className="flex gap-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedProduct.id === product.id ? 'bg-black' : 'bg-gray-300 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* AI Shopping Optimization */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">AI Shopping Ready</span>
              </div>
              <div className="text-sm text-gray-600">AI Search Rank: #{selectedProduct.id === 'base-cap' ? '1' : selectedProduct.id === 'base-hoodie' ? '2' : '3'}</div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>AI Discovery Score: {selectedProduct.id === 'base-cap' ? '94' : selectedProduct.id === 'base-hoodie' ? '91' : selectedProduct.id === 'base-mug' ? '88' : '85'}/100</span>
              <span>Sponsored Listing Active</span>
            </div>
          </div>

          {/* Product Image with Navigation */}
          <div className="mb-6 relative">
            {/* Left Arrow */}
            <button
              onClick={() => {
                const currentIndex = products.findIndex(p => p.id === selectedProduct.id)
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : products.length - 1
                setSelectedProduct(products[prevIndex])
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <ArrowRight className="h-5 w-5 text-white rotate-180" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => {
                const currentIndex = products.findIndex(p => p.id === selectedProduct.id)
                const nextIndex = currentIndex < products.length - 1 ? currentIndex + 1 : 0
                setSelectedProduct(products[nextIndex])
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <ArrowRight className="h-5 w-5 text-white" />
            </button>

            {/* Product Image Container */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-w-full max-h-64 object-contain rounded-lg"
                />
              ) : (
                <div className="text-6xl text-gray-400">🛍️</div>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-black font-medium">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="border-gray-800 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-bold text-black text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="border-gray-800 text-gray-800 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Checkout Section */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{selectedProduct.name}</span>
              <span className="font-medium">${selectedProduct.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity: {quantity}</span>
              <span className="font-medium">×{quantity}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-black">TOTAL</span>
                <span className="text-lg font-bold text-black">
                  {getTotalPrice().toFixed(2)} USDC
                </span>
              </div>
            </div>
          </div>

          {/* Payment Benefits */}
          <div className="bg-green-50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Free gas fees on Base Network</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Instant settlement</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>No chargebacks</span>
            </div>
          </div>

          {/* Payment Button */}
          <div className="w-full">
            <Checkout
              chargeHandler={chargeHandler}
              onStatus={handleCheckoutStatus}
            >
              <CheckoutButton
                text={`Pay ${getTotalPrice().toFixed(2)} USDC`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium rounded-lg flex items-center justify-center gap-3 transition-all duration-200"
              />
              <CheckoutStatus />
            </Checkout>
          </div>

          {/* Base Network Branding */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span>Powered by Base Network</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default OnchainStoreTemplate
