'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { PrivyProvider as PrivySDKProvider, usePrivy as usePrivySDK, useLoginWithEmail } from '@privy-io/react-auth'

interface PrivyUser {
  id: string
  wallet?: {
    address: string
    chainId: string
  }
  email?: {
    address: string
  }
  createdAt: string
}

interface PrivyContextType {
  user: PrivyUser | null
  isConnected: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  verifyEmailCode: (code: string) => Promise<void>
  getBalance: (address: string) => Promise<string>
}

const PrivyContext = createContext<PrivyContextType | null>(null)

export function usePrivy() {
  const context = useContext(PrivyContext)
  if (!context) {
    throw new Error('usePrivy must be used within a PrivyProvider')
  }
  return context
}

interface PrivyProviderProps {
  children: React.ReactNode
}

// Inner component that uses the Privy SDK
function PrivyProviderInner({ children }: PrivyProviderProps) {
  const { user: privyUser, ready, authenticated, login: privyLogin, logout: privyLogout } = usePrivySDK()
  const { sendCode, loginWithCode } = useLoginWithEmail()
  const [user, setUser] = useState<PrivyUser | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (ready) {
      setIsLoading(false)
      if (authenticated && privyUser) {
        setUser(privyUser as unknown as PrivyUser)
        setIsConnected(true)
      } else {
        setUser(null)
        setIsConnected(false)
      }
    }
  }, [ready, authenticated, privyUser])

  const login = async () => {
    try {
      await privyLogin()
    } catch (error) {
      console.error('Privy login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await privyLogout()
    } catch (error) {
      console.error('Privy logout failed:', error)
      throw error
    }
  }

  const loginWithEmail = async (email: string) => {
    try {
      await sendCode({ email })
    } catch (error) {
      console.error('Failed to send email code:', error)
      throw error
    }
  }

  const verifyEmailCode = async (code: string) => {
    try {
      await loginWithCode({ code })
    } catch (error) {
      console.error('Failed to verify email code:', error)
      throw error
    }
  }

  const getBalance = async (address: string): Promise<string> => {
    try {
      const response = await fetch('/api/privy/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          network: process.env.NODE_ENV === 'production' ? 'base' : 'base-sepolia',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.balance
      }
      return '0'
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      return '0'
    }
  }

  const value: PrivyContextType = {
    user,
    isConnected,
    isLoading,
    login,
    logout,
    loginWithEmail,
    verifyEmailCode,
    getBalance,
  }

  return <PrivyContext.Provider value={value}>{children}</PrivyContext.Provider>
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  // If no valid Privy App ID, render children without Privy
  if (!appId || appId === 'demo-app-id') {
    return <>{children}</>
  }

  return (
    <PrivySDKProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'google', 'twitter', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          // createOnLogin: 'users-without-wallets', // Removed due to type incompatibility
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <PrivyProviderInner>{children}</PrivyProviderInner>
    </PrivySDKProvider>
  )
}
