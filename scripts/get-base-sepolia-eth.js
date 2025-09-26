/**
 * Get Base Sepolia Testnet ETH for Development
 * This script helps you get testnet ETH from Base Sepolia faucet
 */

const { ethers } = require('hardhat')

async function main() {
  console.log('🚰 Getting Base Sepolia testnet ETH for development...')
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners()
  console.log('Your wallet address:', deployer.address)
  
  // Check current balance
  const balance = await deployer.provider.getBalance(deployer.address)
  console.log('Current balance:', ethers.formatEther(balance), 'ETH')
  
  if (balance < ethers.parseEther('0.01')) {
    console.log('⚠️  Low balance detected!')
    console.log('')
    console.log('🔗 Get testnet ETH from Base Sepolia faucet:')
    console.log('1. Go to: https://bridge.base.org/deposit')
    console.log('2. Connect your wallet')
    console.log('3. Bridge ETH from Sepolia testnet to Base Sepolia')
    console.log('')
    console.log('Or use the Base Sepolia faucet:')
    console.log('1. Go to: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet')
    console.log('2. Enter your address:', deployer.address)
    console.log('3. Request testnet ETH')
    console.log('')
    console.log('📝 You can also get Sepolia ETH from:')
    console.log('- https://sepoliafaucet.com/')
    console.log('- https://faucet.sepolia.io/')
    console.log('- https://sepolia-faucet.pk910.de/')
  } else {
    console.log('✅ You have sufficient testnet ETH for development!')
  }
  
  console.log('')
  console.log('🔧 Environment variables needed:')
  console.log(`BASE_SEPOLIA_RPC_URL=https://sepolia.base.org`)
  console.log(`BASE_PRIVATE_KEY=your-private-key`)
  console.log(`COINBASE_CDP_API_KEY_ID=your-api-key-id`)
  console.log(`COINBASE_CDP_API_KEY_SECRET=your-api-key-secret`)
  console.log(`COINBASE_CDP_WALLET_SECRET=your-wallet-secret`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
