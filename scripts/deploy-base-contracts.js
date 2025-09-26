/**
 * Deploy Real Smart Contracts to Base Network
 * This script deploys actual smart contracts to Base mainnet/testnet
 */

const { ethers } = require('hardhat')

async function main() {
  console.log('🚀 Deploying real smart contracts to Base network...')

  // Get the deployer account
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with account:', deployer.address)

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address)
  console.log('Account balance:', ethers.formatEther(balance), 'ETH')

  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Insufficient balance for deployment. Need at least 0.01 ETH for gas.')
  }

  // Deploy AgentWalletFactory
  console.log('📦 Deploying AgentWalletFactory...')
  const AgentWalletFactory = await ethers.getContractFactory('AgentWalletFactory')
  const agentWalletFactory = await AgentWalletFactory.deploy()
  await agentWalletFactory.waitForDeployment()

  const factoryAddress = await agentWalletFactory.getAddress()
  console.log('✅ AgentWalletFactory deployed to:', factoryAddress)

  // Deploy AgentWallet implementation
  console.log('📦 Deploying AgentWallet implementation...')
  const AgentWallet = await ethers.getContractFactory('AgentWallet')
  const agentWallet = await AgentWallet.deploy()
  await agentWallet.waitForDeployment()

  const walletAddress = await agentWallet.getAddress()
  console.log('✅ AgentWallet deployed to:', walletAddress)

  // Deploy x402 Payment Gateway
  console.log('📦 Deploying x402 Payment Gateway...')
  const X402PaymentGateway = await ethers.getContractFactory('X402PaymentGateway')
  const x402Gateway = await X402PaymentGateway.deploy()
  await x402Gateway.waitForDeployment()

  const gatewayAddress = await x402Gateway.getAddress()
  console.log('✅ x402 Payment Gateway deployed to:', gatewayAddress)

  // Verify contracts on BaseScan
  console.log('🔍 Verifying contracts on BaseScan...')
  try {
    await hre.run('verify:verify', {
      address: factoryAddress,
      constructorArguments: [],
    })
    console.log('✅ AgentWalletFactory verified on BaseScan')
  } catch (error) {
    console.log('⚠️  AgentWalletFactory verification failed:', error.message)
  }

  try {
    await hre.run('verify:verify', {
      address: walletAddress,
      constructorArguments: [],
    })
    console.log('✅ AgentWallet verified on BaseScan')
  } catch (error) {
    console.log('⚠️  AgentWallet verification failed:', error.message)
  }

  try {
    await hre.run('verify:verify', {
      address: gatewayAddress,
      constructorArguments: [],
    })
    console.log('✅ x402 Payment Gateway verified on BaseScan')
  } catch (error) {
    console.log('⚠️  x402 Payment Gateway verification failed:', error.message)
  }

  // Save deployment info
  const deploymentInfo = {
    network: 'base',
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      AgentWalletFactory: factoryAddress,
      AgentWallet: walletAddress,
      X402PaymentGateway: gatewayAddress,
    },
    gasUsed: {
      AgentWalletFactory: (await agentWalletFactory.deploymentTransaction()?.wait())?.gasUsed.toString(),
      AgentWallet: (await agentWallet.deploymentTransaction()?.wait())?.gasUsed.toString(),
      X402PaymentGateway: (await x402Gateway.deploymentTransaction()?.wait())?.gasUsed.toString(),
    },
  }

  console.log('📋 Deployment Summary:')
  console.log(JSON.stringify(deploymentInfo, null, 2))

  // Update environment variables
  console.log('🔧 Update your environment variables:')
  console.log(`AGENT_WALLET_FACTORY_ADDRESS=${factoryAddress}`)
  console.log(`AGENT_WALLET_ADDRESS=${walletAddress}`)
  console.log(`X402_PAYMENT_GATEWAY_ADDRESS=${gatewayAddress}`)

  console.log('🎉 Real smart contracts deployed to Base network!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
