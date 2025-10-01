'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Minus
} from 'lucide-react'
import { PaymentMethodSelector } from '@/components/payment-method-selector'
import { CoinbaseCommerceCheckout } from '@/components/coinbase-commerce-checkout'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  rating: number
  reviews: number
  inStock: boolean
  image?: string
  attributes: {
    color?: string
    size?: string
    material?: string
  }
  aiOptimized: boolean
  geoScore: number
}

interface CartItem {
  product: Product
  quantity: number
}

const sampleProducts: Product[] = [
  {
    id: 'premium-tshirt-blue',
    name: 'Premium Organic Cotton T-Shirt',
    description: 'Ultra-soft organic cotton t-shirt with modern fit. Perfect for everyday wear.',
    price: 29.99,
    currency: 'USD',
    category: 'Clothing',
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    attributes: { color: 'Blue', size: 'M', material: 'Organic Cotton' },
    aiOptimized: true,
    geoScore: 92
  },
  {
    id: 'wireless-headphones-pro',
    name: 'Pro Wireless Headphones',
    description: 'High-fidelity wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 199.99,
    currency: 'USD',
    category: 'Electronics',
    rating: 4.9,
    reviews: 892,
    inStock: true,
    attributes: { color: 'Black', size: 'One Size', material: 'Premium Materials' },
    aiOptimized: true,
    geoScore: 95
  },
  {
    id: 'smart-watch-fitness',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitor, GPS, and water resistance.',
    price: 149.99,
    currency: 'USD',
    category: 'Wearables',
    rating: 4.7,
    reviews: 2156,
    inStock: true,
    attributes: { color: 'Silver', size: '42mm', material: 'Aluminum' },
    aiOptimized: true,
    geoScore: 88
  },
  {
    id: 'eco-water-bottle',
    name: 'Eco-Friendly Water Bottle',
    description: 'Stainless steel insulated water bottle, keeps drinks cold for 24 hours.',
    price: 39.99,
    currency: 'USD',
    category: 'Accessories',
    rating: 4.6,
    reviews: 743,
    inStock: true,
    attributes: { color: 'Stainless Steel', size: '32oz', material: 'Stainless Steel' },
    aiOptimized: true,
    geoScore: 85
  }
]

export function AgenticCommerceStore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'x402' | 'coinbase' | undefined>()
  const [showPaymentSelector, setShowPaymentSelector] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Search and filter products
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(sampleProducts)
      return
    }

    const filtered = sampleProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.attributes.color?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [searchQuery])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      setMessage('Your cart is empty')
      return
    }
    setShowPaymentSelector(true)
  }

  const handlePaymentMethodSelect = async (method: 'stripe' | 'x402' | 'coinbase') => {
    setSelectedPaymentMethod(method)
    setShowPaymentSelector(false)

    if (method === 'stripe') {
      setMessage('Redirecting to Stripe checkout...')
      // Here you would integrate with Stripe
    } else if (method === 'x402') {
      setMessage('Initiating x402 payment...')
      // Here you would integrate with x402
    } else if (method === 'coinbase') {
      setMessage('Initializing Coinbase Commerce checkout...')
    }
  }

  const handleCoinbaseSuccess = (chargeId: string) => {
    setMessage(`Payment successful! Charge ID: ${chargeId}`)
    setCart([])
    setSelectedPaymentMethod(undefined)
  }

  const handleCoinbaseError = (error: string) => {
    setMessage(`Payment failed: ${error}`)
    setSelectedPaymentMethod(undefined)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Agentic Commerce Store
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-optimized product discovery with multi-payment integration. 
          Experience the future of commerce with Stripe, Coinbase Commerce, and x402 payments.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-6xl opacity-50">
                    {product.category === 'Clothing' && '👕'}
                    {product.category === 'Electronics' && '🎧'}
                    {product.category === 'Wearables' && '⌚'}
                    {product.category === 'Accessories' && '🍶'}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Product Header */}
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                        <div className="flex gap-2">
                          {product.aiOptimized && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <Zap className="h-3 w-3 mr-1" />
                              AI Optimized
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            GEO {product.geoScore}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
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

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </div>
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
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Shopping Cart Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-lg">
                          {item.product.category === 'Clothing' && '👕'}
                          {item.product.category === 'Electronics' && '🎧'}
                          {item.product.category === 'Wearables' && '⌚'}
                          {item.product.category === 'Accessories' && '🍶'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500">${item.product.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-lg">Total:</span>
                      <span className="font-bold text-xl text-gray-900">
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Method Selector Modal */}
      {showPaymentSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Choose Payment Method</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPaymentSelector(false)}
                >
                  ×
                </Button>
              </div>
              
              <PaymentMethodSelector
                onSelect={handlePaymentMethodSelect}
                selectedMethod={selectedPaymentMethod}
              />
            </div>
          </div>
        </div>
      )}

      {/* Coinbase Commerce Checkout */}
      {selectedPaymentMethod === 'coinbase' && cart.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Complete Your Purchase</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedPaymentMethod(undefined)}
                >
                  ×
                </Button>
              </div>
              
              <CoinbaseCommerceCheckout
                product={{
                  id: 'cart-total',
                  name: `${cart.length} Item${cart.length > 1 ? 's' : ''}`,
                  description: cart.map(item => `${item.quantity}x ${item.product.name}`).join(', '),
                  price: getCartTotal(),
                  currency: 'usd'
                }}
                onSuccess={handleCoinbaseSuccess}
                onError={handleCoinbaseError}
              />
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

      {/* Features Showcase */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Why Choose Our Agentic Commerce Platform?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">AI-Optimized Discovery</h4>
            <p className="text-sm text-gray-600">
              Products are optimized for AI agents to find and recommend to customers
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <CreditCard className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">Multiple Payment Options</h4>
            <p className="text-sm text-gray-600">
              Stripe, Coinbase Commerce, and x402 - choose what works best for your customers
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">Secure & Fast</h4>
            <p className="text-sm text-gray-600">
              Instant settlement, no chargebacks, and free gas fees on Base network
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgenticCommerceStore
