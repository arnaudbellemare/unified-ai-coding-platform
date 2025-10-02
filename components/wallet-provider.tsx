'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseSepolia } from 'wagmi/chains'
import config from '@/lib/wagmi-config'

// Create a client for React Query
const queryClient = new QueryClient()

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmfow1b160026l60btyr8fjp5'

  // Temporary: Skip Privy provider if there are issues
  const skipPrivy = process.env.NODE_ENV === 'development' && process.env.SKIP_PRIVY === 'true'

  if (skipPrivy) {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ''}
            chain={base}
          >
            {children}
          </OnchainKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    )
  }

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
            loginMethods: ['email', 'wallet'],
            embeddedWallets: {
              ethereum: {
                createOnLogin: 'users-without-wallets',
              },
            },
            defaultChain: base,
            supportedChains: [base, baseSepolia],
            mfa: {
              noPromptOnMfaRequired: false,
            },
          }}
        >
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ''}
            chain={base}
          >
            {children}
          </OnchainKitProvider>
        </PrivyProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
