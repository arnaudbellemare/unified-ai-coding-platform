import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Skip static optimization for API routes to avoid build-time errors
  skipTrailingSlashRedirect: true,
  // Enable Turbopack configuration
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle tiktoken WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    }

    // Copy WASM files to the build output
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[name].[hash][ext]',
      },
    })

    // Ignore React Native dependencies for MetaMask SDK
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      'react-native-get-random-values': false,
      'react-native-keychain': false,
      'react-native-secure-key-store': false,
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        // Handle React Native dependencies for MetaMask SDK
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
        'react-native-get-random-values': false,
        'react-native-keychain': false,
        'react-native-secure-key-store': false,
        // Additional fallbacks for MetaMask SDK
        'react-native-web': false,
        'react-native-svg': false,
        'react-native-vector-icons': false,
      }
    }

    // Exclude Coinbase packages from server-side rendering
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@coinbase/cdp-sdk': 'commonjs @coinbase/cdp-sdk',
        '@coinbase/x402': 'commonjs @coinbase/x402',
        '@coinbase/wallet-sdk': 'commonjs @coinbase/wallet-sdk',
        // Exclude MetaMask SDK from server-side rendering
        '@metamask/sdk': 'commonjs @metamask/sdk',
        '@metamask/sdk-communication-layer': 'commonjs @metamask/sdk-communication-layer',
        '@metamask/sdk-extension': 'commonjs @metamask/sdk-extension',
      })
    }

    return config
  },
}

export default nextConfig
