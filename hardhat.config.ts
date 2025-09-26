import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-ethers'
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Base Mainnet
    base: {
      url: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      accounts: process.env.BASE_PRIVATE_KEY ? [process.env.BASE_PRIVATE_KEY] : [],
      chainId: 8453,
      gasPrice: 'auto',
      type: 'http',
    },
    // Base Sepolia Testnet
    'base-sepolia': {
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts: process.env.BASE_PRIVATE_KEY ? [process.env.BASE_PRIVATE_KEY] : [],
      chainId: 84532,
      gasPrice: 'auto',
      type: 'http',
    },
  },
  // Etherscan verification disabled for now to avoid dependency issues
  // etherscan: {
  //   apiKey: {
  //     base: process.env.BASESCAN_API_KEY || '',
  //     baseSepolia: process.env.BASESCAN_API_KEY || '',
  //   },
  // },
}

export default config
