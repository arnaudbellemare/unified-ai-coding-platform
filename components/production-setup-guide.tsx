'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Copy, Check, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react'

export function ProductionSetupGuide() {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => new Set([...prev, itemId]))
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const CopyButton = ({ text, itemId }: { text: string; itemId: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, itemId)}
      className="ml-2"
    >
      {copiedItems.has(itemId) ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )

  const environmentVariables = [
    {
      key: 'NEXT_PUBLIC_PRIVY_APP_ID',
      value: 'cmfow1b160026l60btyr8fjp5',
      description: 'Your Privy App ID for wallet integration'
    },
    {
      key: 'PRIVY_APP_SECRET',
      value: '65w5PQjrQasjEr3A4ffzbvrZMsj6Hve9bNxLR31yeXRoTAJrweTBeZLiqnGTGwLGzQjB3ezYDZ6MWv57dqUn83HF',
      description: 'Your Privy App Secret'
    },
    {
      key: 'OPENROUTER_API_KEY',
      value: 'your_openrouter_api_key_here',
      description: 'OpenRouter API key for AI model access'
    },
    {
      key: 'X402_PRODUCTION_PRIVATE_KEY',
      value: 'your_base_mainnet_wallet_private_key_here',
      description: 'Base mainnet wallet private key for x402 payments'
    },
    {
      key: 'NEXT_PUBLIC_X402_PRODUCTION_RECIPIENT_ADDRESS',
      value: 'your_base_mainnet_recipient_address_here',
      description: 'Your Base mainnet wallet address to receive payments'
    },
    {
      key: 'DATABASE_URL',
      value: 'your_supabase_database_url_here',
      description: 'Supabase PostgreSQL database connection string'
    },
    {
      key: 'GITHUB_CLIENT_ID',
      value: 'your_github_client_id',
      description: 'GitHub OAuth Client ID'
    },
    {
      key: 'GITHUB_CLIENT_SECRET',
      value: 'your_github_client_secret',
      description: 'GitHub OAuth Client Secret'
    },
    {
      key: 'NEXTAUTH_SECRET',
      value: 'your_nextauth_secret',
      description: 'NextAuth.js secret for session encryption'
    },
    {
      key: 'NEXTAUTH_URL',
      value: 'https://your-app-name.vercel.app',
      description: 'Your production Vercel app URL'
    }
  ]

  const deploymentSteps = [
    {
      title: '1. Set Up Environment Variables',
      description: 'Add all required environment variables to your Vercel project',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-900">
            Go to your Vercel dashboard → Project Settings → Environment Variables
          </p>
          {environmentVariables.map((env, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <code className="text-xs font-mono bg-gray-200 px-1 rounded text-gray-900">{env.key}</code>
                  <CopyButton text={`${env.key}=${env.value}`} itemId={`env-${index}`} />
                </div>
                <p className="text-xs text-gray-900 mt-1">{env.description}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: '2. Configure Base Mainnet',
      description: 'Set up Base mainnet for production payments',
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Base Mainnet Configuration</h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Chain ID: 8453</li>
              <li>• RPC URL: https://mainnet.base.org</li>
              <li>• USDC Contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913</li>
            </ul>
          </div>
          <p className="text-sm text-gray-900">
            Your app will automatically use Base mainnet for production deployments.
          </p>
        </div>
      )
    },
    {
      title: '3. Enable x402 Payment Protocol',
      description: 'Configure x402 for seamless payment processing',
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900">x402 Features</h4>
            <ul className="text-sm text-green-800 mt-2 space-y-1">
              <li>• Pay-per-use AI processing</li>
              <li>• Automatic cost optimization</li>
              <li>• Instant USDC settlements</li>
              <li>• No subscription fees</li>
            </ul>
          </div>
          <p className="text-sm text-gray-900">
            Users pay only for the AI processing they actually use, with automatic optimization to reduce costs.
          </p>
        </div>
      )
    },
    {
      title: '4. Deploy to Vercel',
      description: 'Deploy your application with one click',
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900">Deployment Features</h4>
            <ul className="text-sm text-purple-800 mt-2 space-y-1">
              <li>• One-click Vercel deployment</li>
              <li>• GitHub integration for code management</li>
              <li>• Automatic CI/CD pipeline</li>
              <li>• Custom domain support</li>
            </ul>
          </div>
          <Button className="w-full" asChild>
            <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer">
              Deploy to Vercel
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Production Deployment Guide
          </CardTitle>
          <CardDescription>
            Complete setup guide for deploying VERCLIBASE to production with Base mainnet and x402 payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Start */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Quick Start</h3>
            <p className="text-sm text-gray-900 mb-3">
              VERCLIBASE is production-ready with Base mainnet, x402 payments, and Vercel deployment.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Base Mainnet Ready</Badge>
              <Badge variant="secondary">x402 Payments</Badge>
              <Badge variant="secondary">Pay Per Use</Badge>
              <Badge variant="secondary">Auto Optimization</Badge>
              <Badge variant="secondary">Vercel Deploy</Badge>
            </div>
          </div>

          {/* Deployment Steps */}
          <div className="space-y-4">
            {deploymentSteps.map((step, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {step.content}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Important Notes</h4>
                <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                  <li>• Replace placeholder values with your actual API keys and wallet addresses</li>
                  <li>• Test on Base Sepolia first before deploying to mainnet</li>
                  <li>• Ensure you have sufficient USDC in your wallet for x402 payments</li>
                  <li>• Set up GitHub OAuth for sandbox deployment features</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cost Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-green-600">Free Tier</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Use free models (Mistral, Llama, Phi) with optimization
                  </p>
                  <Badge variant="outline" className="mt-2">$0.00</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-blue-600">Pay Per Use</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Premium models with automatic cost optimization
                  </p>
                  <Badge variant="outline" className="mt-2">$0.001-$0.05</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-600">Sandbox Deploy</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Deploy to Vercel sandbox for testing
                  </p>
                  <Badge variant="outline" className="mt-2">Included</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
