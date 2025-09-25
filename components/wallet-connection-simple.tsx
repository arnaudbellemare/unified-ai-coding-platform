'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Coins, CheckCircle, AlertCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react'

interface WalletConnectionProps {
  onWalletConnect?: (wallet: { address: string; balance: string; network: string }) => void
  onWalletDisconnect?: () => void
}

export function WalletConnection({ onWalletConnect, onWalletDisconnect }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')

  const connectWallet = async () => {
    setIsConnecting(true)
    setError('')

    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

        if (accounts.length > 0) {
          const address = accounts[0]

          // Get network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const network = chainId === '0x2105' ? 'base' : 'base-sepolia' // Base mainnet or testnet

          const walletData = {
            address,
            balance: '0', // Will be fetched separately
            network,
          }

          onWalletConnect?.(walletData)
        }
      } else {
        throw new Error('MetaMask not detected. Please install MetaMask or use a supported wallet.')
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>Connect your wallet for x402 payments and cost optimization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your wallet to use x402 payments and cost optimization
          </p>
        </div>

        <Button onClick={connectWallet} disabled={isConnecting} className="w-full" size="lg">
          {isConnecting ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5 mr-2" />
              Connect with MetaMask
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">Connect with MetaMask or other supported wallets</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Coins className="h-4 w-4" />
            <span className="text-sm font-medium">Ready for x402 payments</span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Your wallet will be connected and ready for cost optimization payments
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
