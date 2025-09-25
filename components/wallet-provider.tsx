'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import { base, baseSepolia } from 'wagmi/chains'
import config from '@/lib/wagmi-config'

// Create a client for React Query
const queryClient = new QueryClient()

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmfow1b160026l60btyr8fjp5'

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <PrivyProvider
          appId={privyAppId}
          config={{
            appearance: {
              theme: 'light',
              accentColor: '#676FFF',
            },
            loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'],
            embeddedWallets: {
              ethereum: {
                createOnLogin: 'users-without-wallets',
              },
            },
            defaultChain: baseSepolia,
            supportedChains: [base, baseSepolia],
            mfa: {
              noPromptOnMfaRequired: false,
            },
          }}
        >
          {children}
        </PrivyProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
