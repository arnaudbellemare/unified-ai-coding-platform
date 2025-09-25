'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { PrivyProvider as PrivySDKProvider } from '@privy-io/react-auth'

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

export function PrivyProvider({ children }: PrivyProviderProps) {
  const [user, setUser] = useState<PrivyUser | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializePrivy = async () => {
      try {
        // Check if Privy is available
        if (typeof window !== 'undefined' && (window as any).privy) {
          const connected = await (window as any).privy.isConnected()
          if (connected) {
            const privyUser = await (window as any).privy.getUser()
            setUser(privyUser)
            setIsConnected(true)
          }
        }
      } catch (error) {
        console.error('Failed to initialize Privy:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializePrivy()
  }, [])

  const login = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).privy) {
        const privyUser = await (window as any).privy.login()
        setUser(privyUser)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Privy login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).privy) {
        await (window as any).privy.logout()
        setUser(null)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Privy logout failed:', error)
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
    getBalance,
  }

  return <PrivyContext.Provider value={value}>{children}</PrivyContext.Provider>
}
