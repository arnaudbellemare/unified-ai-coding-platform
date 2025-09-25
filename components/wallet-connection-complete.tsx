'use client'

import React, { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Wallet,
  Coins,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Mail,
  Shield,
  ExternalLink,
  LogOut,
} from 'lucide-react'

interface WalletConnectionProps {
  onWalletConnect?: (wallet: { address: string; balance: string; network: string }) => void
  onWalletDisconnect?: () => void
  onPaymentReady?: (ready: boolean) => void
}

export function WalletConnectionComplete({
  onWalletConnect,
  onWalletDisconnect,
  onPaymentReady,
}: WalletConnectionProps) {
  const { user, authenticated, ready, login, logout } = usePrivy()
  const { address, isConnected: wagmiConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showCodeForm, setShowCodeForm] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string>('')

  // Update wallet when user connects
  useEffect(() => {
    if (authenticated && user && address) {
      const walletData = {
        address,
        balance: balance?.formatted || '0',
        network: 'base-sepolia', // Default to testnet
      }
      onWalletConnect?.(walletData)
      onPaymentReady?.(true)
    } else {
      onWalletDisconnect?.()
      onPaymentReady?.(false)
    }
  }, [authenticated, user, address, balance, onWalletConnect, onWalletDisconnect, onPaymentReady])

  const connectWallet = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
    }
  }

  const disconnectWallet = async () => {
    try {
      await logout()
      disconnect()
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet')
    }
  }

  const handleEmailLogin = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    try {
      // Email login not available
      throw new Error('Email login not available')
      setEmailSent(true)
      setShowCodeForm(true)
      setError('')
    } catch (error) {
      console.error('Email login failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to send email code')
    }
  }

  const handleCodeVerification = async () => {
    if (!code) {
      setError('Please enter the verification code')
      return
    }

    try {
      // Email verification not available
      throw new Error('Email verification not available')
      setShowEmailForm(false)
      setShowCodeForm(false)
      setError('')
    } catch (error) {
      console.error('Code verification failed:', error)
      setError(error instanceof Error ? error.message : 'Invalid verification code')
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!ready) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span>Loading wallet...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (authenticated && user && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Wallet Connected
          </CardTitle>
          <CardDescription>Your wallet is connected and ready for x402 payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Address:</span>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono break-all">
              {formatAddress(address)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant="outline">Base Sepolia</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Balance:</span>
              <span className="text-sm font-mono">
                {balance ? `${balance.formatted} ${balance.symbol}` : 'Loading...'}
              </span>
            </div>
          </div>

          {user.id && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Privy User ID:</span>
                <span className="text-xs text-muted-foreground">{user.id}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={disconnectWallet} variant="outline" className="flex-1">
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
            <Button
              onClick={() => window.open(`https://sepolia.basescan.org/address/${address}`, '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
        {!showEmailForm && !showCodeForm && (
          <>
            <Button onClick={connectWallet} disabled={!ready} className="w-full" size="lg">
              {!ready ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect with Privy
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Or</p>
              <Button onClick={() => setShowEmailForm(true)} variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Connect with Email
              </Button>
            </div>
          </>
        )}

        {showEmailForm && !showCodeForm && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEmailLogin} className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Send Code
              </Button>
              <Button onClick={() => setShowEmailForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showCodeForm && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter verification code"
              />
              <p className="text-xs text-muted-foreground mt-1">Check your email for the verification code</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCodeVerification} className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Verify Code
              </Button>
              <Button onClick={() => setShowCodeForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

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
