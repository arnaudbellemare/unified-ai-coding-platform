'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Coins, CheckCircle, ExternalLink, ArrowLeft, Sparkles, Wallet, Shield, Zap } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { LogoVerclibase } from '@/components/logo-verclibase'
import { GEOOptimizedCheckout } from '@/components/geo-optimized-checkout'

export default function DemoCheckoutPage() {
  const searchParams = useSearchParams()
  const product = searchParams?.get('product') || 'Demo Product'
  const amount = searchParams?.get('amount') || '29.99'

  const { user, authenticated, ready, login, logout } = usePrivy()
  const [selectedWallet, setSelectedWallet] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<any>(null)
  const [aiSessionId, setAiSessionId] = useState<string>('')
  const [isAIAgent, setIsAIAgent] = useState(false)
  const [showGeoCheckout, setShowGeoCheckout] = useState(false)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  // AI Agent Detection and Tracking
  useEffect(() => {
    // Detect if traffic is from AI agents
    const detectAIAgent = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const referrer = document.referrer.toLowerCase()
      const urlParams = new URLSearchParams(window.location.search)
      
      const aiIndicators = [
        userAgent.includes('ai'),
        userAgent.includes('bot'),
        userAgent.includes('crawler'),
        referrer.includes('chatgpt'),
        referrer.includes('perplexity'),
        referrer.includes('claude'),
        referrer.includes('gemini'),
        urlParams.has('ai_agent'),
        urlParams.has('geo_optimized')
      ]
      
      return aiIndicators.some(indicator => indicator)
    }

    const isAgent = detectAIAgent()
    setIsAIAgent(isAgent)
    
    if (isAgent) {
      const sessionId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setAiSessionId(sessionId)
      
      // Track AI agent interaction
      trackAIAgentInteraction('page_load', {
        product,
        amount,
        sessionId,
        timestamp: new Date().toISOString()
      })
    }
  }, [product, amount])

  // AI Agent Interaction Tracking
  const trackAIAgentInteraction = async (eventType: string, data: any) => {
    if (!isAIAgent) return
    
    try {
      await fetch('/api/track-ai-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          sessionId: aiSessionId,
          agentSource: detectAgentSource(),
          checkoutData: data,
          geoOptimized: true,
          url: window.location.href
        })
      })
    } catch (error) {
      console.error('AI tracking error:', error)
    }
  }

  // Detect AI agent source
  const detectAgentSource = () => {
    const referrer = document.referrer.toLowerCase()
    if (referrer.includes('chatgpt')) return 'chatgpt'
    if (referrer.includes('perplexity')) return 'perplexity'
    if (referrer.includes('claude')) return 'claude'
    if (referrer.includes('gemini')) return 'gemini'
    if (navigator.userAgent.toLowerCase().includes('ai')) return 'ai_agent'
    return 'unknown'
  }

  // Handle Privy authentication state
  useEffect(() => {
    if (authenticated && user && user.wallet) {
      const walletData = {
        type: 'privy',
        address: user.wallet.address,
        balance: '0', // Will be fetched separately
        network: 'base',
        privyUserId: user.id,
        isConnected: true,
      }
      setConnectedWallet(walletData)
      setIsConnecting(false)
      
      // Track wallet connection for AI agents
      if (isAIAgent) {
        trackAIAgentInteraction('wallet_connected', {
          walletType: 'privy',
          address: user.wallet.address,
          sessionId: aiSessionId
        })
      }
    } else if (!authenticated && connectedWallet) {
      setConnectedWallet(null)
    }
  }, [authenticated, user, connectedWallet, isAIAgent, aiSessionId])

  return (
    <>
      {/* GEO-Optimized Structured Data for AI Agents */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CheckoutPage",
            "name": `VERCLIBASE Crypto Checkout - ${product}`,
            "description": "Secure cryptocurrency payment processing with instant settlement on Base network",
            "url": typeof window !== 'undefined' ? window.location.href : 'http://localhost:3001/store/demo-checkout',
            "offers": {
              "@type": "Offer",
              "price": amount,
              "priceCurrency": "USDC",
              "availability": "https://schema.org/InStock",
              "validFrom": new Date().toISOString(),
              "seller": {
                "@type": "Organization",
                "name": "VERCLIBASE",
                "url": "https://verclibase.com",
                "logo": "https://verclibase.com/logo.png"
              }
            },
            "paymentAccepted": ["USDC", "ETH", "BTC"],
            "paymentMethod": ["Cryptocurrency", "Digital Wallet", "Base Network"],
            "merchant": {
              "@type": "Organization",
              "name": "VERCLIBASE",
              "url": "https://verclibase.com",
              "description": "AI-powered commerce optimization and agentic commerce platform",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              }
            },
          "potentialAction": {
            "@type": "BuyAction",
            "target": typeof window !== 'undefined' ? window.location.href : 'http://localhost:3001/store/demo-checkout',
              "price": amount,
              "priceCurrency": "USDC"
            },
            "geoOptimized": true,
            "aiAgentCompatible": true,
            "supportedNetworks": ["Base", "Ethereum"],
            "features": [
              "Instant settlement",
              "Low fees (1% vs 3-5% traditional)",
              "Auto USDC conversion",
              "100+ cryptocurrency support"
            ]
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <LogoVerclibase color="#0000FF" />
                <span className="text-xl font-semibold text-gray-900">•</span>
                <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
              </div>
              <p className="text-sm text-gray-500 ml-2">Secure crypto payment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
            {/* VERCLIBASE Logo */}
            <div className="flex items-center justify-center mb-6">
              <LogoVerclibase color="#0000FF" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crypto Payment</h2>
            <p className="text-gray-600">Pay securely with cryptocurrency</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700 font-medium">{product}</span>
                <span className="text-gray-900 font-semibold text-lg">${amount}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-700 font-medium">Total</span>
                <span className="text-gray-900 font-bold text-xl">${amount}</span>
              </div>
            </div>

            {/* Privy-style Wallet Selection */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect your wallet</h3>
                <p className="text-gray-500 text-sm">Choose how you'd like to connect</p>
              </div>

              <div className="space-y-3">
                {/* MetaMask - Privy Style */}
                <button
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedWallet === 'metamask'
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedWallet('metamask')}
                >
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🦊</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">MetaMask</p>
                    <p className="text-gray-500 text-sm">Connect using MetaMask browser extension</p>
                  </div>
                  {selectedWallet === 'metamask' && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                {/* Phantom - Privy Style */}
                <button
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedWallet === 'phantom'
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedWallet('phantom')}
                >
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👻</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Phantom</p>
                    <p className="text-gray-500 text-sm">Connect using Phantom browser extension</p>
                  </div>
                  {selectedWallet === 'phantom' && (
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                {/* Coinbase Wallet - Privy Style */}
                <button
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedWallet === 'coinbase'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedWallet('coinbase')}
                >
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔷</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Coinbase Wallet</p>
                    <p className="text-gray-500 text-sm">Connect using Coinbase Wallet browser extension</p>
                  </div>
                  {selectedWallet === 'coinbase' && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                {/* Email - Privy Style */}
                <button
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedWallet === 'email'
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedWallet('email')}
                >
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-500 text-sm">Sign in with your email address</p>
                  </div>
                  {selectedWallet === 'email' && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                {/* Phone - Privy Style */}
                <button
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedWallet === 'phone'
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedWallet('phone')}
                >
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-500 text-sm">Sign in with your phone number</p>
                  </div>
                  {selectedWallet === 'phone' && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              </div>

              {/* Privy-style Connect Button */}
              {selectedWallet && (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-[#676FFF] hover:bg-[#5a5ce6] text-white h-12 rounded-lg font-semibold"
                    onClick={async () => {
                      setIsConnecting(true)
                      try {
                        await login()
                      } catch (error) {
                        console.error('Connection failed:', error)
                        alert('Failed to connect. Please try again.')
                      } finally {
                        setIsConnecting(false)
                      }
                    }}
                    disabled={isConnecting || !ready}
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>Continue</>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By connecting, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              )}
            </div>

            {/* Payment Options - Only show after wallet connection */}
            {connectedWallet && (
              <div className="space-y-6">
                {/* Privy-style Connected State */}
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Connected!</h3>
                  <p className="text-gray-600 text-sm mb-3">You're ready to make your payment</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>

                <div className="space-y-3">
                  {/* USDC Option - Privy Style */}
                  <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">USDC</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">USDC on Base</p>
                        <p className="text-gray-500 text-sm">Instant settlement • No fees</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Recommended</div>
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </button>

                  {/* ETH Option - Privy Style */}
                  <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">ETH</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Ethereum</p>
                        <p className="text-gray-500 text-sm">Auto-converted to USDC</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 font-mono text-sm">
                        {(parseFloat(amount) / 3000).toFixed(6)} ETH
                      </span>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    </div>
                  </button>

                  {/* BTC Option - Privy Style */}
                  <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">BTC</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Bitcoin</p>
                        <p className="text-gray-500 text-sm">Auto-converted to USDC</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 font-mono text-sm">
                        {(parseFloat(amount) / 45000).toFixed(8)} BTC
                      </span>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-green-800 font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Why Choose Crypto Payments
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 text-sm">Lower Fees</p>
                    <p className="text-green-600 text-xs">1% vs 3-5% traditional</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 text-sm">Instant Settlement</p>
                    <p className="text-green-600 text-xs">No waiting periods</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 text-sm">Auto Conversion</p>
                    <p className="text-green-600 text-xs">Stable USDC pricing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 text-sm">Global Access</p>
                    <p className="text-green-600 text-xs">100+ currencies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-amber-800 font-medium text-sm mb-1">Demo Mode</p>
                  <p className="text-amber-700 text-sm">
                    This is a demonstration. In production, this would connect to your wallet and process a real
                    transaction on Base network.
                  </p>
                </div>
              </div>
            </div>

            {/* GEO-Optimized Checkout Toggle */}
            {!showGeoCheckout && !paymentCompleted && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Enhanced AI-Optimized Checkout
                  </h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Experience our GEO-optimized checkout with Coinbase branding, dynamic pricing, and AI agent compatibility.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-600 mb-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Coinbase Branding</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Dynamic Charges</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>AI Agent Tracking</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Structured Data</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowGeoCheckout(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg font-medium"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Use GEO-Optimized Checkout
                  </Button>
                </div>

                {/* Traditional Payment Options */}
                <div className="space-y-3">
                  {connectedWallet ? (
                    <div className="space-y-3">
                      <Button
                        className="w-full bg-[#676FFF] hover:bg-[#5a5ce6] text-white h-12 rounded-lg font-semibold"
                        onClick={async () => {
                          // Track payment attempt for AI agents
                          if (isAIAgent) {
                            await trackAIAgentInteraction('payment_attempt', {
                              product,
                              amount,
                              walletType: connectedWallet.type,
                              address: connectedWallet.address,
                              sessionId: aiSessionId
                            })
                          }
                          
                          alert(
                            `Payment processed!\nWallet: ${connectedWallet.type}\nAmount: $${amount} USDC\nAddress: ${connectedWallet.address}`,
                          )
                          
                          // Track successful payment for AI agents
                          if (isAIAgent) {
                            await trackAIAgentInteraction('payment_success', {
                              product,
                              amount,
                              walletType: connectedWallet.type,
                              address: connectedWallet.address,
                              sessionId: aiSessionId,
                              timestamp: new Date().toISOString()
                            })
                          }
                        }}
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Pay ${amount} USDC
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 h-10 rounded-lg font-medium"
                        onClick={() => {
                          logout()
                          setConnectedWallet(null)
                        }}
                      >
                        Use different wallet
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full bg-gray-400 text-white h-12 rounded-lg font-semibold" disabled>
                      <Wallet className="h-5 w-5 mr-2" />
                      Connect Wallet to Pay ${amount}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-gray-700 h-10 rounded-lg font-medium"
                    onClick={() => window.close()}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* GEO-Optimized Checkout Component */}
            {showGeoCheckout && !paymentCompleted && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowGeoCheckout(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back to traditional checkout
                </Button>
                
                <GEOOptimizedCheckout
                  product={product}
                  amount={amount}
                  aiSessionId={aiSessionId}
                  isAIAgent={isAIAgent}
                  onPaymentSuccess={(transactionId) => {
                    setPaymentCompleted(true)
                    console.log('Payment completed with transaction:', transactionId)
                  }}
                />
              </div>
            )}

            {/* Payment Completed State */}
            {paymentCompleted && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Payment Successful!</h3>
                <p className="text-gray-600">Your {product} purchase has been completed.</p>
                <Button
                  onClick={() => window.close()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Close
                </Button>
              </div>
            )}

            {/* Back to Demo */}
            <div className="text-center pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => window.open('/complete-demo', '_self')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Back to Complete Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* AI Agent Indicator (only visible to AI agents) */}
      {isAIAgent && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium z-50">
          AI Agent Detected: {detectAgentSource()}
        </div>
      )}
    </>
  )
}
