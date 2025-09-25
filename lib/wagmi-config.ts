import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'

// Base network configuration
export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

// Export the config for use in components
export default config
