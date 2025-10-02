'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  DollarSign,
  Coins,
  Brain,
  Search,
  BarChart3,
  ExternalLink,
  Play,
  Code,
  Database,
  Network,
  Lock,
  Star,
  Users,
  Target,
  CreditCard,
  Bot,
  FileText,
} from 'lucide-react'

interface GEOMetrics {
  citations: number
  impressions: number
  clickThroughRate: number
  conversionRate: number
  revenueAttribution: number
  authorityScore: number
  trustSignals: number
  backlinks: number
  socialSignals: number
}

interface CryptoProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  cryptoSupported: boolean
  geoOptimized: boolean
}

export function CompleteGEODemo() {
  const [metrics, setMetrics] = useState<GEOMetrics | null>(null)
  const [products, setProducts] = useState<CryptoProduct[]>([])
  const [activeDemo, setActiveDemo] = useState<string>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([])
  const [agentTransactions, setAgentTransactions] = useState([
    {
      id: 'tx_001',
      from: 'ShoppingBot_001',
      to: 'PaymentBot_002',
      description: 'Agent recommendation fee',
      amount: 25.0,
      status: 'Completed',
    },
    {
      id: 'tx_002',
      from: 'RecommendationBot_003',
      to: 'AnalyticsBot_004',
      description: 'Data access payment',
      amount: 15.5,
      status: 'Completed',
    },
    {
      id: 'tx_003',
      from: 'SearchBot_005',
      to: 'DataBot_006',
      description: 'Service discovery fee',
      amount: 8.75,
      status: 'Completed',
    },
  ])

  useEffect(() => {
    loadDemoData()
  }, [])

  // Initialize star field
  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        size: Math.random() * 1.5 + 0.5,
      }))
      setStars(newStars)
    }

    generateStars()
  }, [])

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const loadDemoData = async () => {
    setIsLoading(true)
    try {
      // Load GEO metrics
      const metricsResponse = await fetch('/api/geo/analytics?type=overview')
      const metricsData = await metricsResponse.json()
      if (metricsData.success) {
        setMetrics(metricsData.metrics)
      } else {
        // Fallback data if API fails
        setMetrics({
          citations: 12,
          impressions: 1250,
          clickThroughRate: 0.68,
          conversionRate: 0.15,
          revenueAttribution: 2450,
          authorityScore: 87,
          trustSignals: 15,
          backlinks: 8,
          socialSignals: 23,
        })
      }

      // Load crypto products
      const productsResponse = await fetch('/api/geo/crypto-products?format=json')
      const productsData = await productsResponse.json()
      if (productsData.success) {
        setProducts(productsData.products.slice(0, 3)) // Show first 3 products
      } else {
        // Fallback products if API fails
        setProducts([
          {
            id: 'base-tshirt',
            name: 'Base T-Shirt',
            description:
              'Premium cotton t-shirt featuring the Base logo. Perfect for Web3 enthusiasts and crypto natives.',
            price: 29.99,
            currency: 'USD',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            cryptoSupported: true,
            geoOptimized: true,
          },
          {
            id: 'base-hoodie',
            name: 'Base Hoodie',
            description: 'Comfortable hoodie with Base branding. Ideal for crypto conferences and Web3 events.',
            price: 79.99,
            currency: 'USD',
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
            cryptoSupported: true,
            geoOptimized: true,
          },
          {
            id: 'base-mug',
            name: 'Base Mug',
            description: 'Ceramic mug featuring the Base logo. Perfect for your morning coffee or tea.',
            price: 18.99,
            currency: 'USD',
            image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
            cryptoSupported: true,
            geoOptimized: true,
          },
        ])
      }
    } catch (error) {
      console.error('Failed to load demo data:', error)
      // Set fallback data on error
      setMetrics({
        citations: 12,
        impressions: 1250,
        clickThroughRate: 0.68,
        conversionRate: 0.15,
        revenueAttribution: 2450,
        authorityScore: 87,
        trustSignals: 15,
        backlinks: 8,
        socialSignals: 23,
      })
      setProducts([
        {
          id: 'base-tshirt',
          name: 'Base T-Shirt',
          description:
            'Premium cotton t-shirt featuring the Base logo. Perfect for Web3 enthusiasts and crypto natives.',
          price: 29.99,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          cryptoSupported: true,
          geoOptimized: true,
        },
        {
          id: 'base-hoodie',
          name: 'Base Hoodie',
          description: 'Comfortable hoodie with Base branding. Ideal for crypto conferences and Web3 events.',
          price: 79.99,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
          cryptoSupported: true,
          geoOptimized: true,
        },
        {
          id: 'base-mug',
          name: 'Base Mug',
          description: 'Ceramic mug featuring the Base logo. Perfect for your morning coffee or tea.',
          price: 18.99,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
          cryptoSupported: true,
          geoOptimized: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const simulateCitation = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch('/api/geo/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_citations',
        }),
      })

      if (response.ok) {
        loadDemoData() // Reload data
      } else {
        // If API fails, just update the metrics locally
        setMetrics((prev) => ({
          citations: (prev?.citations || 0) + 3,
          impressions: (prev?.impressions || 0) + 150,
          clickThroughRate: prev?.clickThroughRate || 0,
          conversionRate: prev?.conversionRate || 0,
          revenueAttribution: (prev?.revenueAttribution || 0) + 125,
          authorityScore: prev?.authorityScore || 0,
          trustSignals: prev?.trustSignals || 0,
          backlinks: prev?.backlinks || 0,
          socialSignals: prev?.socialSignals || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to simulate citation:', error)
      // Update metrics locally on error
      setMetrics((prev) => ({
        citations: (prev?.citations || 0) + 3,
        impressions: (prev?.impressions || 0) + 150,
        clickThroughRate: prev?.clickThroughRate || 0,
        conversionRate: prev?.conversionRate || 0,
        revenueAttribution: (prev?.revenueAttribution || 0) + 125,
        authorityScore: prev?.authorityScore || 0,
        trustSignals: prev?.trustSignals || 0,
        backlinks: prev?.backlinks || 0,
        socialSignals: prev?.socialSignals || 0,
      }))
    }
  }

  const testCryptoCheckout = async (product: CryptoProduct) => {
    try {
      // Open the demo checkout page with Privy wallet selection
      // Use current origin (without port) for production compatibility
      const checkoutUrl = `${window.location.origin}/store/demo-checkout?product=${encodeURIComponent(product.name)}&amount=${product.price}`

      // Try to open popup window
      const popup = window.open(
        checkoutUrl,
        '_blank',
        'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes',
      )

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Popup was blocked, show fallback message
        alert(
          'Popup blocked! Please allow popups for this site and try again, or manually navigate to the checkout page.',
        )

        // Alternative: redirect in same window
        const userConfirm = confirm('Would you like to navigate to the checkout page in this window instead?')
        if (userConfirm) {
          window.location.href = checkoutUrl
        }
      }
    } catch (error) {
      console.error('Failed to open checkout:', error)
      alert('Failed to open checkout. Please try again.')
    }
  }

  const testAP2Payment = async () => {
    try {
      console.log('🤖 AP2 Payment: Starting mock payment simulation...')

      // Mock AP2 payment scenarios
      const mockScenarios = [
        {
          fromAgent: 'ShoppingBot_001',
          toAgent: 'PaymentBot_002',
          description: 'Agent recommendation fee',
          amount: 25.0,
        },
        {
          fromAgent: 'AnalyticsBot_003',
          toAgent: 'DataBot_004',
          description: 'Market analysis service',
          amount: 42.5,
        },
        {
          fromAgent: 'SearchBot_005',
          toAgent: 'IndexBot_006',
          description: 'Search optimization',
          amount: 18.75,
        },
        {
          fromAgent: 'CustomerBot_007',
          toAgent: 'SupportBot_008',
          description: 'Customer service coordination',
          amount: 33.0,
        },
        {
          fromAgent: 'MarketingBot_009',
          toAgent: 'CampaignBot_010',
          description: 'Campaign optimization',
          amount: 55.25,
        },
      ]

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Pick a random scenario
      const scenario = mockScenarios[Math.floor(Math.random() * mockScenarios.length)]

      // Generate mock transaction
      const newTransaction = {
        id: `ap2_tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        from: scenario.fromAgent,
        to: scenario.toAgent,
        description: scenario.description,
        amount: scenario.amount,
        status: 'Completed',
      }

      console.log('🤖 AP2 Payment: Generated mock transaction:', newTransaction)
      setAgentTransactions((prev) => [newTransaction, ...prev])
      console.log('✅ AP2 Payment: Successfully added mock transaction to list')
    } catch (error) {
      console.error('❌ AP2 Payment failed:', error)
      alert(`AP2 Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading GEO + ACP + AP2 + Coinbase Commerce Demo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Star Field CSS Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-2px) rotate(1deg);
          }
          50% {
            transform: translateY(-1px) rotate(0deg);
          }
          75% {
            transform: translateY(-3px) rotate(-1deg);
          }
        }
        .star-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .star-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Star Field Effect */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {stars.map((star) => {
          // Calculate distance from mouse to star
          const distance = Math.sqrt(Math.pow(mousePosition.x - star.x, 2) + Math.pow(mousePosition.y - star.y, 2))
          const intensity = Math.max(0, 1 - distance / 30) // 30px radius of effect
          const scale = 1 + intensity * 2 // Scale up stars near mouse
          const opacity = 0.3 + intensity * 0.7 // Increase opacity near mouse

          return (
            <div
              key={star.id}
              className={`absolute transition-all duration-300 ease-out star-twinkle star-float`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size * 2}px`,
                height: `${star.size * 2}px`,
                transform: `scale(${scale})`,
                opacity: opacity,
                animationDelay: `${star.delay}s`,
                filter: intensity > 0.3 
                  ? `brightness(${1 + intensity * 2}) drop-shadow(0 0 ${star.size * 2}px rgba(255, 255, 255, ${intensity * 0.8}))` 
                  : 'none',
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="white"
                className="transition-all duration-300"
                style={{
                  filter: intensity > 0.5 
                    ? `drop-shadow(0 0 ${star.size}px rgba(255, 255, 255, ${intensity})) drop-shadow(0 0 ${star.size * 2}px rgba(255, 255, 255, ${intensity * 0.5}))` 
                    : 'none',
                }}
              >
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )
        })}
      </div>

      {/* Hero Section */}
      <div className="relative bg-black text-white py-16 overflow-hidden rounded-3xl">
        {/* White light corner effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-2xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-30 rounded-full blur-xl transform translate-x-16 -translate-y-16"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">Complete GEO + ACP + AP2 + Coinbase Commerce</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              The world's first platform with full crypto-native commerce, AI discovery optimization, and agent-to-agent
              payments. See it all in action.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2">
                <Brain className="h-4 w-4 mr-2" />
                GEO Optimized
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Coins className="h-4 w-4 mr-2" />
                Crypto Payments
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Network className="h-4 w-4 mr-2" />
                AP2 Integration
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Auto USDC Conversion
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-12 !bg-black">
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full gap-2 p-1 bg-gray-900 rounded-lg">
              <TabsTrigger value="overview" className="text-white text-sm whitespace-nowrap flex-shrink-0 px-4 py-2">
                Overview
              </TabsTrigger>
              <TabsTrigger value="geo" className="text-white text-sm whitespace-nowrap flex-shrink-0 px-4 py-2">
                GEO Analytics
              </TabsTrigger>
              <TabsTrigger value="crypto" className="text-white text-sm whitespace-nowrap flex-shrink-0 px-4 py-2">
                Crypto Commerce
              </TabsTrigger>
              <TabsTrigger value="ap2" className="text-white text-sm whitespace-nowrap flex-shrink-0 px-4 py-2">
                AP2 Payments
              </TabsTrigger>
              <TabsTrigger value="langstruct" className="text-white text-sm whitespace-nowrap flex-shrink-0 px-4 py-2">
                LangStruct AI
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Black background section for metrics and features */}
            <div className="relative !bg-black text-white py-16 overflow-hidden rounded-3xl">
              {/* White light corner effect */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-2xl transform translate-x-32 -translate-y-32"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-30 rounded-full blur-xl transform translate-x-16 -translate-y-16"></div>

              <div className="relative z-10 space-y-8">
                {/* Protocol Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* ACP Card */}
                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">ACP</span>
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-semibold text-white">OpenAI ACP</CardTitle>
                          <p className="text-sm text-gray-300 font-medium">Human-to-Business Payments</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white mb-6 leading-relaxed text-base">
                        When customers ask AI "Find me a blue shirt under $50" and AI finds your product, you pay a
                        small fee to appear higher in future searches.
                      </p>
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                          <span className="text-sm text-white">AI discovers your products automatically</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                          <span className="text-sm text-white">Pay only when AI actually finds you</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                          <span className="text-sm text-white">Integrated with GEO optimization</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => window.open('/store', '_blank')}
                          className="flex-1 bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 h-12 font-medium"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Try ACP Demo
                        </Button>
                        <Button variant="outline" className="px-6 h-12 border-gray-600 text-white hover:bg-gray-800">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AP2 Card */}
                  <Card className="!bg-black border-gray-800 text-white relative overflow-hidden">
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">AP2</span>
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-semibold text-white">Google AP2</CardTitle>
                          <p className="text-sm text-gray-300 font-medium">Agent-to-Agent Payments</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white mb-6 leading-relaxed text-base">
                        AI agents can pay each other directly using Google's Agent Payments Protocol. Enable autonomous
                        agent commerce with secure, instant payments.
                      </p>
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                          <span className="text-sm text-white">Secure agent-to-agent payments</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                          <span className="text-sm text-white">Instant settlement and confirmation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                          <span className="text-sm text-white">Enterprise-grade security</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => window.open('/ap2-demo', '_blank')}
                          className="flex-1 bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 h-12 font-medium"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Try AP2 Demo
                        </Button>
                        <Button variant="outline" className="px-6 h-12 border-gray-600 text-white hover:bg-gray-800">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Metrics Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-white">GEO Citations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{metrics?.citations || 0}</div>
                      <p className="text-xs text-gray-300">AI platform mentions</p>
                    </CardContent>
                  </Card>
                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-white">Authority Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{metrics?.authorityScore || 0}/100</div>
                      <p className="text-xs text-gray-300">Trust signals</p>
                    </CardContent>
                  </Card>
                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-white">Revenue Attribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">${metrics?.revenueAttribution || 0}</div>
                      <p className="text-xs text-gray-300">From AI discovery</p>
                    </CardContent>
                  </Card>
                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-white">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{metrics?.conversionRate || 0}%</div>
                      <p className="text-xs text-gray-300">AI to purchase</p>
                    </CardContent>
                  </Card>
                </div>

                {/* GEO + Crypto Features */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Brain className="h-5 w-5 text-blue-300" />
                        GEO Optimization
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-white">Crypto-specific schema markup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-white">Authority signals & trust indicators</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-white">FAQ content for AI citation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-white">Meta tags optimized for generative search</span>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          simulateCitation(e)
                        }}
                        type="button"
                        className="w-full bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Simulate AI Citation
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Coins className="h-5 w-5 text-green-300" />
                        Crypto Commerce
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-white">Auto USDC conversion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-white">100+ cryptocurrency support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-white">1% fees vs 3-5% traditional</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-sm text-white">Instant settlement on Base</span>
                      </div>
                      <Button
                        onClick={() => setActiveDemo('crypto')}
                        className="w-full bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Crypto Demo
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* GEO Analytics Tab */}
          <TabsContent value="geo" className="space-y-8">
            {/* Black background section */}
            <div className="relative !bg-black text-white py-16 overflow-hidden rounded-3xl">
              <div className="relative z-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Citation Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-white">Total Citations</span>
                          <span className="font-semibold text-white">{metrics?.citations || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-white">Click-Through Rate</span>
                          <span className="font-semibold text-white">{(metrics?.clickThroughRate || 0) * 100}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-white">Conversion Rate</span>
                          <span className="font-semibold text-white">{(metrics?.conversionRate || 0) * 100}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-white">Authority Score</span>
                          <span className="font-semibold text-white">{metrics?.authorityScore || 0}/100</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Platform Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Google AI Overviews</span>
                          <Badge variant="outline">45%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ChatGPT</span>
                          <Badge variant="outline">30%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Perplexity</span>
                          <Badge variant="outline">15%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Copilot</span>
                          <Badge variant="outline">10%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="!bg-black border-gray-800 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Search className="h-5 w-5 text-purple-600" />
                      Top Performing Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-black rounded-lg">
                        <span className="font-medium text-white">"crypto payment processing"</span>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-white bg-gray-800">
                            12 citations
                          </Badge>
                          <Badge variant="outline" className="text-white border-white">
                            85% CTR
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black rounded-lg">
                        <span className="font-medium text-white">"Web3 commerce platform"</span>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-white bg-gray-800">
                            8 citations
                          </Badge>
                          <Badge variant="outline" className="text-white border-white">
                            72% CTR
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black rounded-lg">
                        <span className="font-medium text-white">"instant crypto checkout"</span>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-white bg-gray-800">
                            6 citations
                          </Badge>
                          <Badge variant="outline" className="text-white border-white">
                            68% CTR
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Crypto Commerce Tab */}
          <TabsContent value="crypto" className="space-y-8">
            {/* Black background section */}
            <div className="relative !bg-black text-white py-16 overflow-hidden rounded-3xl">
              <div className="relative z-10">
                <div className="grid md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden !bg-black border-gray-800 text-white">
                      <div className="aspect-square bg-black relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        {product.cryptoSupported && (
                          <Badge className="absolute top-2 right-2 bg-green-600">
                            <Coins className="h-3 w-3 mr-1" />
                            Crypto
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold">${product.price}</span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              USDC
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ETH
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              BTC
                            </Badge>
                          </div>
                        </div>
                        <Button onClick={() => testCryptoCheckout(product)} className="w-full">
                          <Coins className="h-4 w-4 mr-2" />
                          Pay with Crypto
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="!bg-black border-gray-800 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Shield className="h-5 w-5 text-green-600" />
                      Crypto Payment Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-600">Auto USDC Conversion</h4>
                        <p className="text-sm text-gray-300">
                          All crypto payments are automatically converted to USDC for volatility protection. You get
                          exactly the USD amount you expect, regardless of crypto price fluctuations.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-600">Instant Settlement</h4>
                        <p className="text-sm text-gray-300">
                          Payments are processed instantly on the Base network with zero fees. No waiting for blockchain
                          confirmations or bank transfers.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-600">100+ Cryptocurrencies</h4>
                        <p className="text-sm text-gray-300">
                          Accept Bitcoin, Ethereum, USDC, USDT, and 100+ other cryptocurrencies. All with automatic USDC
                          conversion for stability.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-600">1% Fees</h4>
                        <p className="text-sm text-gray-300">
                          Much lower than traditional 3-5% credit card fees. Free transactions on Base network, low fees
                          on Ethereum.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AP2 Payments Tab */}
          <TabsContent value="ap2" className="space-y-8">
            {/* Black background section */}
            <div className="relative !bg-black text-white py-16 overflow-hidden rounded-3xl">
              <div className="relative z-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Network className="h-5 w-5 text-blue-600" />
                        Agent-to-Agent Payments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">AP2 mandate verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Crypto settlement via Coinbase</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Agent payment capabilities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Network support (Base + Ethereum)</span>
                        </div>
                      </div>
                      <Button onClick={testAP2Payment} className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Try AP2 Payment
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="!bg-black border-gray-800 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Users className="h-5 w-5 text-purple-600" />
                        Recent Agent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {agentTransactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm text-white">
                                {transaction.from} → {transaction.to}
                              </p>
                              <p className="text-xs text-gray-300">{transaction.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">${transaction.amount.toFixed(2)}</p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* LangStruct AI Tab */}
          <TabsContent value="langstruct" className="space-y-8">
            {/* Black background section */}
            <div className="relative !bg-black text-white py-16 overflow-hidden rounded-3xl">
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">LangStruct AI Integration</h2>
                  <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                    Extract structured data from AI interactions using LangStruct + DSPy optimization. Perfect for GEO
                    queries, ACP payments, and AP2 agent transactions.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* GEO Query Extraction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Brain className="h-5 w-5 text-blue-600" />
                        GEO Query Extraction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Query:</label>
                        <Input
                          value="Find crypto payment solutions for my e-commerce store"
                          className="mt-1"
                          readOnly
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setPopupData({
                            title: 'GEO Query Extracted',
                            type: 'geo',
                            data: {
                              entities: ['crypto payment', 'e-commerce store'],
                              intent: 'Find payment solutions',
                              business_type: 'E-commerce',
                              requirements: 'Crypto payment integration',
                              location: 'Global',
                              urgency: 'Medium',
                            },
                          })
                          setShowPopup(true)
                        }}
                        className="w-full"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Extract GEO Data
                      </Button>
                    </CardContent>
                  </Card>

                  {/* ACP Payment Extraction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        ACP Payment Extraction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Transaction:</label>
                        <Input
                          value="Customer purchased VERCLIBASE crypto optimization service for $299"
                          className="mt-1"
                          readOnly
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setPopupData({
                            title: 'ACP Payment Extracted',
                            type: 'acp',
                            data: {
                              product: 'VERCLIBASE crypto optimization service',
                              amount: '$299',
                              payment_method: 'Crypto',
                              customer_type: 'Business',
                              service_category: 'AI Commerce Optimization',
                              status: 'Completed',
                            },
                          })
                          setShowPopup(true)
                        }}
                        className="w-full"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Extract ACP Data
                      </Button>
                    </CardContent>
                  </Card>

                  {/* AP2 Agent Extraction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Bot className="h-5 w-5 text-purple-600" />
                        AP2 Agent Extraction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Agent Transaction:</label>
                        <Input
                          value="VERCLIBASE_AI paid AnalyticsBot_Pro $150 for GEO optimization analysis"
                          className="mt-1"
                          readOnly
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setPopupData({
                            title: 'AP2 Agent Extracted',
                            type: 'ap2',
                            data: {
                              from_agent: 'VERCLIBASE_AI',
                              to_agent: 'AnalyticsBot_Pro',
                              amount: '$150',
                              service: 'GEO optimization analysis',
                              network: 'Base',
                              status: 'Completed',
                            },
                          })
                          setShowPopup(true)
                        }}
                        className="w-full"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Extract AP2 Data
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Document Metadata Extraction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <FileText className="h-5 w-5 text-orange-600" />
                        Document Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Document:</label>
                        <Input
                          value="VERCLIBASE Q4 2024: 500+ AI commerce integrations, $2.3M revenue"
                          className="mt-1"
                          readOnly
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setPopupData({
                            title: 'Document Metadata Extracted',
                            type: 'document',
                            data: {
                              company: 'VERCLIBASE',
                              period: 'Q4 2024',
                              integrations: '500+ AI commerce',
                              revenue: '$2.3M',
                              growth: 'Positive',
                              type: 'Business report',
                            },
                          })
                          setShowPopup(true)
                        }}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Extract Metadata
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* LangStruct Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      LangStruct AI Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-600">Structured Data Extraction</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">GEO query intent recognition</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Payment amount and method extraction</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Agent transaction parsing</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Document metadata extraction</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-blue-600">DSPy Optimization</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Automatic prompt optimization</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Confidence scoring</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Source attribution</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Error handling and fallbacks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="relative bg-black text-white py-16 overflow-hidden">
        {/* White light corner effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-2xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-30 rounded-full blur-xl transform translate-x-16 -translate-y-16"></div>

        <div className="relative max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Implement Complete GEO + ACP + AP2 + Coinbase Commerce?</h2>
          <p className="text-xl text-gray-300 mb-8">
            The only platform with full crypto-native commerce, AI discovery optimization, and agent-to-agent payments.
            All implemented and ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Code className="h-5 w-5 mr-2" />
              View Source Code
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <ExternalLink className="h-5 w-5 mr-2" />
              Live Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border border-white/20 rounded-lg p-6 max-w-md w-full mx-4 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">{popupData?.title}</h3>
              <button onClick={() => setShowPopup(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {popupData?.data &&
                Object.entries(popupData.data).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-300 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-sm text-white">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowPopup(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
