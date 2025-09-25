'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Wallet,
  Coins,
  Link,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
} from 'lucide-react'

interface PrivyWallet {
  address: string
  balance: string
  network: 'base-sepolia' | 'base'
  isConnected: boolean
  privyUserId?: string
}

interface PrivyWalletConnectionProps {
  onWalletConnect?: (wallet: PrivyWallet) => void
  onWalletDisconnect?: () => void
  onPaymentReady?: (wallet: PrivyWallet) => void
}

export function PrivyWalletConnection({ 
  onWalletConnect, 
  onWalletDisconnect, 
  onPaymentReady 
}: PrivyWalletConnectionProps) {
  const [wallet, setWallet] = useState<PrivyWallet | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [privyAppId, setPrivyAppId] = useState('')

  // Initialize Privy connection
  useEffect(() => {
    const initializePrivy = async () => {
      try {
        // Check if Privy is available
        if (typeof window !== 'undefined' && window.privy) {
          const isConnected = await window.privy.isConnected()
          if (isConnected) {
            const user = await window.privy.getUser()
            const walletAddress = user.wallet?.address
            if (walletAddress) {
              const walletData: PrivyWallet = {
                address: walletAddress,
                balance: '0', // Will be fetched separately
                network: process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia',
                isConnected: true,
                privyUserId: user.id,
              }
              setWallet(walletData)
              onWalletConnect?.(walletData)
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize Privy:', error)
        setError('Failed to initialize wallet connection')
      }
    }

    initializePrivy()
  }, [onWalletConnect])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError('')

    try {
      if (typeof window !== 'undefined' && window.privy) {
        // Connect to Privy
        const user = await window.privy.login()
        
        if (user && user.wallet?.address) {
          const walletData: PrivyWallet = {
            address: user.wallet.address,
            balance: '0', // Will be fetched separately
            network: process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia',
            isConnected: true,
            privyUserId: user.id,
          }
          
          setWallet(walletData)
          onWalletConnect?.(walletData)
          
          // Fetch wallet balance
          await fetchWalletBalance(walletData.address)
        }
      } else {
        throw new Error('Privy not available')
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      setError('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.privy) {
        await window.privy.logout()
        setWallet(null)
        onWalletDisconnect?.()
      }
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
      setError('Failed to disconnect wallet')
    }
  }

  const fetchWalletBalance = async (address: string) => {
    setIsLoading(true)
    try {
      // Fetch balance from our API
      const response = await fetch('/api/privy/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, network: wallet?.network || 'base-sepolia' }),
      })

      if (response.ok) {
        const data = await response.json()
        setWallet(prev => prev ? { ...prev, balance: data.balance } : null)
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
    }
  }

  const openExplorer = () => {
    if (wallet?.address) {
      const explorerUrl = wallet.network === 'base' 
        ? `https://basescan.org/address/${wallet.address}`
        : `https://sepolia.basescan.org/address/${wallet.address}`
      window.open(explorerUrl, '_blank')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Privy Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your wallet for x402 payments and cost optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!wallet ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="privy-app-id">Privy App ID (Optional)</Label>
              <Input
                id="privy-app-id"
                placeholder="Enter your Privy App ID"
                value={privyAppId}
                onChange={(e) => setPrivyAppId(e.target.value)}
              />
            </div>

            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Connect with Privy
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Wallet Status */}
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900 dark:text-green-100">
                  Wallet Connected
                </span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                    <Button size="sm" variant="ghost" onClick={copyAddress}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Balance:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {isLoading ? '...' : `${wallet.balance} USDC`}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => fetchWalletBalance(wallet.address)}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network:</span>
                  <Badge variant="outline" className="text-xs">
                    {wallet.network}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Wallet Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openExplorer}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnectWallet}
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>

            {/* Payment Ready Status */}
            {wallet.isConnected && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Ready for x402 payments
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Your wallet is connected and ready for cost optimization payments
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
