'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wallet, Coins, CheckCircle, AlertCircle, ExternalLink, Copy, RefreshCw, Mail, Shield } from 'lucide-react'
import { usePrivy } from './privy-provider-fixed'

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
  onPaymentReady?: (ready: boolean) => void
}

export function PrivyWalletConnection({ 
  onWalletConnect, 
  onWalletDisconnect, 
  onPaymentReady 
}: PrivyWalletConnectionProps) {
  const { user, isConnected, isLoading, login, logout, loginWithEmail, verifyEmailCode, getBalance } = usePrivy()
  const [wallet, setWallet] = useState<PrivyWallet | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [error, setError] = useState<string>('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showCodeForm, setShowCodeForm] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Update wallet when user connects
  useEffect(() => {
    if (isConnected && user) {
      const walletData: PrivyWallet = {
        address: user.wallet?.address || '',
        balance: '0', // Will be fetched
        network: process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia',
        isConnected: true,
        privyUserId: user.id,
      }
      setWallet(walletData)
      onWalletConnect?.(walletData)
      onPaymentReady?.(true)
      
      // Fetch balance
      if (user.wallet?.address) {
        fetchBalance(user.wallet.address)
      }
    } else {
      setWallet(null)
      onWalletDisconnect?.()
      onPaymentReady?.(false)
    }
  }, [isConnected, user, onWalletConnect, onWalletDisconnect, onPaymentReady])

  const fetchBalance = async (address: string) => {
    setIsLoadingBalance(true)
    try {
      const balance = await getBalance(address)
      setWallet(prev => prev ? { ...prev, balance } : null)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError('')

    try {
      await login()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await logout()
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
      await loginWithEmail(email)
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
      await verifyEmailCode(code)
      setShowEmailForm(false)
      setShowCodeForm(false)
      setError('')
    } catch (error) {
      console.error('Code verification failed:', error)
      setError(error instanceof Error ? error.message : 'Invalid verification code')
    }
  }

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isConnected && wallet) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your wallet is connected and ready for x402 payments
          </CardDescription>
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
              {wallet.address}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant="outline">{wallet.network}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Balance:</span>
              {isLoadingBalance ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-sm">{wallet.balance} ETH</span>
              )}
            </div>
          </div>

          {wallet.privyUserId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Privy User ID:</span>
                <span className="text-xs text-muted-foreground">{wallet.privyUserId}</span>
              </div>
            </div>
          )}

          <Button onClick={disconnectWallet} variant="outline" className="w-full">
            Disconnect Wallet
          </Button>
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
        <CardDescription>
          Connect your wallet for x402 payments and cost optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showEmailForm && !showCodeForm && (
          <>
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="w-full" 
              size="lg"
            >
              {isConnecting ? (
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
              <Button 
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full"
              >
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
              <p className="text-xs text-muted-foreground mt-1">
                Check your email for the verification code
              </p>
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
            <span className="text-sm font-medium">
              Ready for x402 payments
            </span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Your wallet will be connected and ready for cost optimization payments
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
