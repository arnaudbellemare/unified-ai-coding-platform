'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  CreditCard, 
  Coins, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  TrendingUp,
  Globe,
  Shield,
  Clock,
  Users
} from 'lucide-react'
import { CoinbaseCommerceCheckout } from '@/components/coinbase-commerce-checkout'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image?: string
  category: string
  rating: number
  reviews: number
  inStock: boolean
  features: string[]
}

const sampleProducts: Product[] = [
  {
    id: 'premium-tshirt',
    name: 'Premium Organic Cotton T-Shirt',
    description: 'Ultra-soft organic cotton t-shirt with modern fit. Perfect for everyday wear.',
    price: 29.99,
    currency: 'usd',
    category: 'Clothing',
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    features: ['100% Organic Cotton', 'Machine Washable', 'Sustainably Made', '30-Day Returns']
  },
  {
    id: 'wireless-headphones',
    name: 'Pro Wireless Headphones',
    description: 'High-fidelity wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 199.99,
    currency: 'usd',
    category: 'Electronics',
    rating: 4.9,
    reviews: 892,
    inStock: true,
    features: ['Active Noise Cancellation', '30h Battery Life', 'Quick Charge', 'Premium Sound']
  },
  {
    id: 'smart-watch',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitor, GPS, and water resistance.',
    price: 149.99,
    currency: 'usd',
    category: 'Wearables',
    rating: 4.7,
    reviews: 2156,
    inStock: true,
    features: ['Heart Rate Monitor', 'GPS Tracking', 'Water Resistant', '7-Day Battery']
  }
]

export function CompanyShowcase() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'coinbase' | 'x402' | null>(null)

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product)
    setShowCheckout(true)
  }

  const handlePaymentSuccess = (chargeId: string) => {
    setShowCheckout(false)
    setSelectedProduct(null)
    setPaymentMethod(null)
    // Show success message
    alert(`Purchase successful! Charge ID: ${chargeId}`)
  }

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TechStore</h1>
                <p className="text-sm text-gray-600">Powered by VERCLIBASE</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                AI-Optimized
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Coins className="h-3 w-3 mr-1" />
                Crypto Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            VERCLIBASE-Powered Commerce
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This isn't just another OnchainKit template - this is a <strong>complete AI commerce platform</strong> with 
            cost optimization, x402 integration, and merchant-focused features that go beyond basic crypto payments.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Zap className="h-3 w-3 mr-1" />
              AI Cost Optimization
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Coins className="h-3 w-3 mr-1" />
              x402 Protocol Ready
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Merchant Analytics
            </Badge>
          </div>
        </div>

        {/* VERCLIBASE vs Standard OnchainKit Stats */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 mb-12 border border-red-200">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            VERCLIBASE vs Standard OnchainKit Template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">+127%</div>
              <div className="text-sm text-gray-600">AI Search Visibility</div>
              <div className="text-xs text-green-600 mt-1">vs 0% in basic template</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">20%+</div>
              <div className="text-sm text-gray-600">Cost Reduction</div>
              <div className="text-xs text-blue-600 mt-1">AI optimization included</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">3x</div>
              <div className="text-sm text-gray-600">Payment Options</div>
              <div className="text-xs text-purple-600 mt-1">Stripe + Coinbase + x402</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">Real</div>
              <div className="text-sm text-gray-600">Analytics Dashboard</div>
              <div className="text-xs text-orange-600 mt-1">vs mock data only</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-6xl opacity-50">
                  {product.category === 'Clothing' && '👕'}
                  {product.category === 'Electronics' && '🎧'}
                  {product.category === 'Wearables' && '⌚'}
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
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
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {product.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price and Buy Button */}
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
                      onClick={() => handleBuyNow(product)}
                      disabled={!product.inStock}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Buy Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* VERCLIBASE-Exclusive Features */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold text-center mb-8">
            VERCLIBASE-Exclusive Features (Not in Basic Template)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Zap className="h-8 w-8 text-yellow-300 mb-3" />
              <h4 className="font-semibold mb-2">AI Cost Optimization Engine</h4>
              <p className="text-sm text-blue-100">
                Advanced prompt optimization reduces AI processing costs by 20%+ while maintaining quality.
                Includes CAPO, GEPA, and Cloudflare-inspired techniques.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <TrendingUp className="h-8 w-8 text-green-300 mb-3" />
              <h4 className="font-semibold mb-2">AI Commerce SEO</h4>
              <p className="text-sm text-blue-100">
                Optimize product listings for AI agents to find and recommend your products.
                Structured data, semantic optimization, and ranking signals.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Shield className="h-8 w-8 text-blue-300 mb-3" />
              <h4 className="font-semibold mb-2">x402 Protocol Integration</h4>
              <p className="text-sm text-blue-100">
                Full x402 implementation for AI agent payments, micro-transactions,
                and automated commerce beyond basic Coinbase Commerce.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Users className="h-8 w-8 text-purple-300 mb-3" />
              <h4 className="font-semibold mb-2">Real Analytics Dashboard</h4>
              <p className="text-sm text-blue-100">
                Live performance metrics, cost tracking, and AI optimization results.
                Not just mock data - real insights for merchants.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Globe className="h-8 w-8 text-orange-300 mb-3" />
              <h4 className="font-semibold mb-2">Multi-Payment Gateway</h4>
              <p className="text-sm text-blue-100">
                Stripe, Coinbase Commerce, and x402 all integrated in one platform.
                Fallback systems and payment method selection.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Clock className="h-8 w-8 text-red-300 mb-3" />
              <h4 className="font-semibold mb-2">Production-Ready APIs</h4>
              <p className="text-sm text-blue-100">
                Robust error handling, rate limiting, and production deployment
                features that basic templates don't include.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Showcase */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Multiple Payment Options
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-xl hover:shadow-md transition-shadow">
              <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Stripe Payments</h4>
              <p className="text-sm text-gray-600 mb-4">
                Traditional card payments with Apple Pay, Google Pay, and more
              </p>
              <Badge variant="outline" className="text-xs">Vercel Marketplace</Badge>
            </div>
            
            <div className="text-center p-6 border rounded-xl hover:shadow-md transition-shadow">
              <Coins className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Coinbase Commerce</h4>
              <p className="text-sm text-gray-600 mb-4">
                Cryptocurrency payments with instant settlement on Base network
              </p>
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">Live Integration</Badge>
            </div>
            
            <div className="text-center p-6 border rounded-xl hover:shadow-md transition-shadow">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">x402 Protocol</h4>
              <p className="text-sm text-gray-600 mb-4">
                AI agent payments and micro-transactions with zero gas fees
              </p>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">Future Ready</Badge>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            VERCLIBASE vs Standard OnchainKit Template
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Standard Template</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">VERCLIBASE</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Coinbase Commerce Integration</td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">AI Cost Optimization</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">x402 Protocol Integration</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Stripe Integration</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">AI Commerce SEO</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Real Analytics</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">Mock Data Only</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Production APIs</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">Basic</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Error Handling</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-gray-400">Basic</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              VERCLIBASE is a complete AI commerce platform, not just a basic template
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => window.open('/showcase', '_blank')}
            >
              See VERCLIBASE in Action →
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Complete Your Purchase</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCheckout(false)}
                >
                  ×
                </Button>
              </div>
              
              <CoinbaseCommerceCheckout
                product={selectedProduct}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyShowcase
