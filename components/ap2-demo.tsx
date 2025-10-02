'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, ArrowRight, Clock, ShoppingCart } from 'lucide-react'

interface AP2Payment {
  paymentId: string
  status: 'pending' | 'completed' | 'failed'
  fromAgent: string
  toAgent: string
  amount: number
  currency: string
  timestamp: Date
}

export function AP2Demo() {
  const [payments, setPayments] = useState<AP2Payment[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalVolume: 0,
    successRate: 100,
  })
  const [formData, setFormData] = useState({
    fromAgent: 'ShoppingBot_001',
    toAgent: 'PaymentBot_002',
    amount: '10.50',
    currency: 'USD',
    description: 'Product recommendation fee',
  })

  // Update stats when payments change
  useEffect(() => {
    const totalPayments = payments.length
    const totalVolume = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const successfulPayments = payments.filter((p) => p.status === 'completed').length
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 100

    setStats({ totalPayments, totalVolume, successRate })
  }, [payments])

  const handleAP2Payment = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/ap2/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        const newPayment: AP2Payment = {
          paymentId: result.payment.paymentId,
          status: result.payment.status,
          fromAgent: formData.fromAgent,
          toAgent: formData.toAgent,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          timestamp: new Date(result.payment.timestamp),
        }

        setPayments((prev) => [newPayment, ...prev])
        setFormData({
          fromAgent: 'ShoppingBot_001',
          toAgent: 'PaymentBot_002',
          amount: '10.50',
          currency: 'USD',
          description: 'Product recommendation fee',
        })
      }
    } catch (error) {
      console.error('AP2 Payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Apple-style Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-thin text-white mb-8 tracking-tight">Agentic Commerce</h1>
            <h2 className="text-2xl md:text-3xl font-light text-gray-300 mb-4">Complete AI Shopping Ecosystem</h2>
            <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              The world's first platform integrating ACP (human-to-business), AP2 (agent-to-agent), and GEO optimization
              for complete agentic commerce coverage.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                Try Shopping Demo
              </button>
              <button className="border border-gray-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apple-style Stats Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-thin text-black mb-2">{stats.totalPayments}</div>
              <div className="text-lg text-gray-600 font-light">Total Payments</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-thin text-black mb-2">${stats.totalVolume.toFixed(2)}</div>
              <div className="text-lg text-gray-600 font-light">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-thin text-black mb-2">{stats.successRate.toFixed(1)}%</div>
              <div className="text-lg text-gray-600 font-light">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Shopping Experience */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-thin text-black mb-4">Complete Shopping Experience</h2>
            <p className="text-xl text-gray-600 font-light">ACP + AP2 + GEO = The Future of Commerce</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* ACP Demo */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors duration-300">
                  <span className="text-white font-bold text-lg">ACP</span>
                </div>
                <h3 className="text-2xl font-thin text-black mb-2 group-hover:text-blue-800 transition-colors duration-300">
                  Human-to-Business
                </h3>
                <p className="text-gray-600 font-light">
                  When customers ask AI "Find me a blue shirt under $50" and AI finds your product
                </p>
              </div>
              <button
                onClick={() => window.open('/store', '_blank')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 group-hover:shadow-lg"
              >
                Try ACP Shopping →
              </button>
            </div>

            {/* AP2 Demo */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors duration-300">
                  <span className="text-white font-bold text-lg">AP2</span>
                </div>
                <h3 className="text-2xl font-thin text-black mb-2 group-hover:text-blue-800 transition-colors duration-300">
                  Agent-to-Agent
                </h3>
                <p className="text-gray-600 font-light">
                  AI agents pay each other for services, recommendations, and data access
                </p>
              </div>
              <button
                onClick={async () => {
                  await handleAP2Payment()
                  // Scroll to payment history after processing
                  setTimeout(() => {
                    document.getElementById('payment-history')?.scrollIntoView({ behavior: 'smooth' })
                  }, 500)
                }}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 group-hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Try AP2 Payment →'}
              </button>
            </div>

            {/* GEO Demo */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors duration-300">
                  <span className="text-white font-bold text-lg">GEO</span>
                </div>
                <h3 className="text-2xl font-thin text-black mb-2 group-hover:text-blue-800 transition-colors duration-300">
                  GEO Services
                </h3>
                <p className="text-gray-600 font-light">
                  Complete ACP & AP2 integration services with our proprietary optimization
                </p>
              </div>
              <button
                onClick={() => {
                  // Scroll to GEO services section
                  document.getElementById('geo-services')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 group-hover:shadow-lg"
              >
                View GEO Services →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div id="payment-history" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-thin text-black mb-4">Recent Agent Transactions</h2>
            <p className="text-lg text-gray-600 font-light">Latest AP2 agent-to-agent payments</p>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-light text-gray-500 mb-2">No payments yet</h3>
              <p className="text-gray-400">Agent-to-agent payments will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {payments.slice(-3).map((payment) => (
                <div
                  key={payment.paymentId}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(payment.status)}
                    <div className="text-sm text-gray-500">{payment.timestamp.toLocaleTimeString()}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-lg font-medium text-black mb-1">
                      {payment.fromAgent} → {payment.toAgent}
                    </div>
                    <div className="text-sm text-gray-600">Agent payment</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-thin text-black">
                      ${payment.amount} {payment.currency}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{payment.paymentId.slice(-8)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GEO Services Section */}
      <div id="geo-services" className="bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-thin mb-4">How We Help You Win with AI</h2>
            <p className="text-xl text-gray-300 font-light">Make AI work for your business</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* AI Shopping */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-thin mb-2">AI Shopping</h3>
                <p className="text-gray-400">When customers ask AI "Find me a blue shirt under $50"</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">AI discovers your products automatically</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Customers can buy through AI assistants</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Pay only when AI actually finds you</span>
                </div>
              </div>
            </div>

            {/* AI Payments */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">💳</span>
                </div>
                <h3 className="text-2xl font-thin mb-2">AI Payments</h3>
                <p className="text-gray-400">AI agents can pay for services and recommendations</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Secure agent-to-agent payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">AI agents can monetize their services</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Enterprise-grade security</span>
                </div>
              </div>
            </div>

            {/* AI Ranking */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">📈</span>
                </div>
                <h3 className="text-2xl font-thin mb-2">AI Ranking</h3>
                <p className="text-gray-400">Proprietary technology to rank higher in AI results</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300">Optimize content for AI understanding</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300">Build authority signals AI recognizes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300">Track and measure AI visibility</span>
                </div>
              </div>
            </div>
          </div>

          {/* How We Help You Be Seen by AI */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-thin mb-4">How We Make You Visible to AI</h3>
              <p className="text-lg text-gray-400">
                We optimize your business to be discovered and recommended by AI research and AI agents
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-800/50 rounded-2xl p-6">
                <h4 className="text-xl font-medium mb-4 text-blue-400">AI Research Visibility</h4>
                <p className="text-gray-300 mb-4">
                  When researchers ask AI "What are the best e-commerce platforms?" or "Find me a payment processor,"
                  your business appears in the results because we optimize your content for AI understanding.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Structure your content so AI can extract key information</li>
                  <li>• Create AI-friendly product descriptions and specifications</li>
                  <li>• Build authority signals that AI recognizes as trustworthy</li>
                  <li>• Optimize for direct answers in ChatGPT, Gemini, Perplexity</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-6">
                <h4 className="text-xl font-medium mb-4 text-green-400">AI Agent Commerce</h4>
                <p className="text-gray-300 mb-4">
                  When AI agents help customers shop, they can find and purchase from your business because we implement
                  the protocols that AI agents use for commerce.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Enable AI agents to discover your products automatically</li>
                  <li>• Allow AI agents to complete purchases on behalf of customers</li>
                  <li>• Provide secure payment processing for agent transactions</li>
                  <li>• Create seamless AI-to-business commerce experiences</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-2xl p-6 border border-blue-500/20">
              <h4 className="text-xl font-medium mb-4 text-center">The Complete AI Commerce Stack</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">📈</span>
                  </div>
                  <h5 className="font-medium mb-2">AI Ranking</h5>
                  <p className="text-sm text-gray-400">Make your products appear when AI searches for solutions</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">🛒</span>
                  </div>
                  <h5 className="font-medium mb-2">AI Shopping</h5>
                  <p className="text-sm text-gray-400">Enable AI agents to complete purchases for customers</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">💳</span>
                  </div>
                  <h5 className="font-medium mb-2">AI Payments</h5>
                  <p className="text-sm text-gray-400">Process secure payments between AI agents</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-3xl font-thin mb-6">Ready to Win with AI?</h3>
            <p className="text-lg text-gray-400 mb-8">
              Complete AI Ranking + AI Shopping + AI Payments implementation to dominate AI search results and enable
              instant AI commerce
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                Start Implementation
              </button>
              <button className="border border-gray-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300">
                Schedule Technical Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Ecosystem Overview */}
      <div className="bg-black text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-thin mb-4">Complete AI Commerce Ecosystem</h2>
            <p className="text-xl text-gray-400 font-light">The only platform with full AI commerce coverage</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 mb-16">
            {/* AI Shopping Section */}
            <div className="bg-gray-900 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🛒</span>
                </div>
                <div>
                  <h3 className="text-2xl font-thin mb-2">AI Shopping</h3>
                  <p className="text-gray-400 font-light">Human-to-Business Payments</p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  AI finds your products when customers ask
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Pay-per-result ranking system
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Integrated with our AI ranking optimization
                </li>
              </ul>
            </div>

            {/* AI Payments Section */}
            <div className="bg-gray-900 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">💳</span>
                </div>
                <div>
                  <h3 className="text-2xl font-thin mb-2">AI Payments</h3>
                  <p className="text-gray-400 font-light">Agent-to-Agent Payments</p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  AI agents pay each other directly
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Instant settlement and confirmation
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Enterprise-grade security
                </li>
              </ul>
            </div>
          </div>

          {/* AI Ranking Section */}
          <div className="bg-gray-900 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📈</span>
              </div>
              <div>
                <h3 className="text-2xl font-thin mb-2">AI Ranking</h3>
                <p className="text-gray-400 font-light">Our Proprietary AI Ranking Technology</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-medium mb-3">Smart Optimization</h4>
                <p className="text-gray-400 text-sm">
                  Multi-objective optimization algorithms that race different strategies
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-3">Cost Optimization</h4>
                <p className="text-gray-400 text-sm">Dynamic switching based on performance and cost efficiency</p>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-3">Content Optimization</h4>
                <p className="text-gray-400 text-sm">Advanced content compression without losing effectiveness</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
