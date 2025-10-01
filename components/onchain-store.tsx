'use client'

import React, { useState, useEffect } from 'react'
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  CreditCard,
  Coins,
  Zap,
  Search,
  Star,
  Truck,
  Shield,
  CheckCircle,
  ArrowRight,
  Plus,
  Minus,
  X,
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
  attributes: {
    color?: string
    size?: string
    material?: string
  }
}

interface CartItem {
  product: Product
  quantity: number
}

// Exact products from Coinbase template structure
const products: Product[] = [
  {
    id: 'base-cap',
    name: 'Base Cap',
    description: 'A sleek and comfortable cap featuring the Base logo.',
    price: 25.0,
    currency: 'USD',
    category: 'Apparel',
    inStock: true,
    attributes: { color: 'Black', size: 'One Size', material: 'Cotton' },
  },
  {
    id: 'base-hoodie',
    name: 'Base Hoodie',
    description: 'Stay warm and stylish with this premium Base hoodie.',
    price: 65.0,
    currency: 'USD',
    category: 'Apparel',
    inStock: true,
    attributes: { color: 'Gray', size: 'M', material: 'Cotton Blend' },
  },
  {
    id: 'base-mug',
    name: 'Base Mug',
    description: 'Start your day right with this Base-branded coffee mug.',
    price: 15.0,
    currency: 'USD',
    category: 'Accessories',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&crop=center',
    attributes: { color: 'White', size: '12oz', material: 'Ceramic' },
  },
  {
    id: 'base-sticker-pack',
    name: 'Base Sticker Pack',
    description: 'Show your Base love with this collection of stickers.',
    price: 8.0,
    currency: 'USD',
    category: 'Accessories',
    inStock: true,
    attributes: { color: 'Multi', size: 'Various', material: 'Vinyl' },
  },
]

export function OnchainStore() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'coinbase' | 'stripe' | 'x402' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Coinbase Commerce charge handler
  const chargeHandler = async (): Promise<string> => {
    try {
      const response = await fetch('/api/coinbase-commerce/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Onchain Store Purchase',
          description: `${cart.length} item(s) from Base Store`,
          local_price: {
            amount: getCartTotal().toFixed(2),
            currency: 'USD',
          },
          pricing_type: 'fixed_price',
          metadata: {
            items: cart.map((item) => ({
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
            total: getCartTotal(),
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
  const handleStatus = async (status: any) => {
    const { statusName, statusData } = status

    switch (statusName) {
      case 'success':
        setMessage(`Payment successful! Charge ID: ${statusData.chargeId}`)
        setCart([])
        setSelectedPaymentMethod(null)
        setIsCartOpen(false)
        break
      case 'pending':
        setMessage('Payment pending...')
        break
      case 'error':
        setMessage(`Payment failed: ${statusData.message || 'Unknown error'}`)
        setSelectedPaymentMethod(null)
        break
      default:
        console.log('Checkout status:', statusName, statusData)
    }
  }

  const handlePaymentMethodSelect = (method: 'coinbase' | 'stripe' | 'x402') => {
    setSelectedPaymentMethod(method)

    if (method === 'stripe') {
      setMessage('Stripe integration coming soon...')
      setSelectedPaymentMethod(null)
    } else if (method === 'x402') {
      setMessage('x402 integration coming soon...')
      setSelectedPaymentMethod(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header - Exact Coinbase Template Style */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-lg">B</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Base Store</h1>
                <p className="text-sm text-gray-600">Powered by VERCLIBASE</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setIsCartOpen(true)} className="relative">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">{getCartItemCount()}</Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Base Store</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Shop the latest Base merchandise with multiple payment options. Pay with cryptocurrency, traditional cards,
            or x402 protocol.
          </p>
        </div>

        {/* Products Grid - Exact Coinbase Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-6xl opacity-50">
                  {product.category === 'Apparel' && '👕'}
                  {product.category === 'Accessories' && '☕'}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  </div>

                  {/* Product Attributes */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="font-medium text-gray-700">{product.attributes.color}</div>
                      <div className="text-gray-500">Color</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="font-medium text-gray-700">{product.attributes.size}</div>
                      <div className="text-gray-500">Size</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="font-medium text-gray-700">{product.attributes.material}</div>
                      <div className="text-gray-500">Material</div>
                    </div>
                  </div>

                  {/* Price and Add to Cart */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">
                        {product.inStock ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            In Stock
                          </span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Multiple Payment Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-xl">
              <Coins className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Coinbase Commerce</h4>
              <p className="text-sm text-gray-600 mb-4">Pay with cryptocurrency using Coinbase Commerce</p>
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                Live
              </Badge>
            </div>

            <div className="text-center p-6 border rounded-xl">
              <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Stripe Payments</h4>
              <p className="text-sm text-gray-600 mb-4">Traditional card payments with Apple Pay, Google Pay</p>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                Coming Soon
              </Badge>
            </div>

            <div className="text-center p-6 border rounded-xl">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">x402 Protocol</h4>
              <p className="text-sm text-gray-600 mb-4">AI agent payments and micro-transactions</p>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                Coming Soon
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar - Exact Coinbase Template Style */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsCartOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-2xl">
                            {item.product.category === 'Apparel' && '👕'}
                            {item.product.category === 'Accessories' && '☕'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-xl text-gray-900">${getCartTotal().toFixed(2)}</span>
                  </div>

                  {/* Payment Method Selection */}
                  {!selectedPaymentMethod ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => handlePaymentMethodSelect('coinbase')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Pay with Coinbase Commerce
                      </Button>
                      <Button onClick={() => handlePaymentMethodSelect('stripe')} variant="outline" className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay with Stripe (Coming Soon)
                      </Button>
                      <Button onClick={() => handlePaymentMethodSelect('x402')} variant="outline" className="w-full">
                        <Zap className="h-4 w-4 mr-2" />
                        Pay with x402 (Coming Soon)
                      </Button>
                    </div>
                  ) : (
                    selectedPaymentMethod === 'coinbase' && (
                      <div className="space-y-4">
                        <Checkout chargeHandler={chargeHandler} onStatus={handleStatus}>
                          <CheckoutButton
                            coinbaseBranded
                            text={`Pay $${getCartTotal().toFixed(2)} USD`}
                            className="w-full"
                          />
                          <CheckoutStatus />
                        </Checkout>
                        <Button onClick={() => setSelectedPaymentMethod(null)} variant="outline" className="w-full">
                          Back to Payment Options
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-700">{message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnchainStore
