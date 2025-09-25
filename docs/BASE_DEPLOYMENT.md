# Base Network Deployment Guide

## 🚀 Deploying Smart Contract Wallets on Base

This guide covers deploying our state-of-the-art smart contract wallets on Base network, which is Coinbase's Layer 2 solution built on Optimism.

### Why Base Network?

- **Coinbase Integration**: Native support for Coinbase ecosystem
- **Low Fees**: Significantly cheaper than Ethereum mainnet
- **Fast Transactions**: Optimistic rollup technology
- **USDC Native**: Native USDC support for payments
- **x402 Foundation**: Base is the primary network for x402 protocol

### Prerequisites

1. **Base RPC URL**: `https://mainnet.base.org`
2. **Base Sepolia Testnet**: `https://sepolia.base.org` (for testing)
3. **Private Key**: For deployment wallet
4. **ETH for Gas**: On Base network

### Contract Addresses

#### Base Mainnet
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **ERC-4337 EntryPoint**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- **AgentWalletFactory**: `[TO BE DEPLOYED]`

#### Base Sepolia (Testnet)
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **ERC-4337 EntryPoint**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`

### Deployment Steps

1. **Compile Contracts**
```bash
npx hardhat compile
```

2. **Deploy to Base Sepolia (Testing)**
```bash
npx hardhat run scripts/deploy.js --network base-sepolia
```

3. **Deploy to Base Mainnet**
```bash
npx hardhat run scripts/deploy.js --network base-mainnet
```

### Environment Variables

Add to your `.env.local`:
```bash
# Base Network Configuration
BASE_RPC_URL=https://mainnet.base.org
AGENT_WALLET_FACTORY_ADDRESS=0x[YOUR_DEPLOYED_FACTORY_ADDRESS]
BASE_PRIVATE_KEY=0x[YOUR_DEPLOYMENT_KEY]
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### x402 Integration on Base

Base network is the primary infrastructure for x402 payments:

- **Native USDC**: Direct USDC transactions
- **Low Fees**: Perfect for micro-payments
- **Fast Settlement**: Sub-2 second finality
- **Coinbase Integration**: Seamless fiat on/off ramps

### Testing Smart Wallets

1. **Create Test Wallet**:
```typescript
const config = {
  agentId: "test-agent-1",
  maxDailySpend: 10 * 1000000, // 10 USDC (6 decimals)
  maxSingleTransaction: 2 * 1000000, // 2 USDC (6 decimals)
  allowedServices: ["0x..."], // Service provider addresses
  backupWallets: ["0x..."], // Backup wallet addresses
  requiredApprovals: 2,
  recoveryContacts: ["0x..."],
  recoveryDelay: 7 * 24 * 60 * 60, // 7 days
}
```

2. **Fund Wallet**:
```typescript
await erc4337AgentWallet.fundSmartAgentWallet("test-agent-1", 5.0)
```

3. **Execute Transaction**:
```typescript
await erc4337AgentWallet.executeSmartTransaction({
  agentId: "test-agent-1",
  to: "0x...",
  value: 1.0,
  description: "API payment"
})
```

### Security Considerations

- **Multi-signature**: Require 2 of N backup wallets for large transactions
- **Spending Limits**: Daily and per-transaction caps
- **Service Allowlists**: Only approved services can receive payments
- **Recovery System**: 7-day delay for wallet recovery
- **Emergency Pause**: Instant pause/unpause capabilities

### Monitoring & Analytics

- **Transaction History**: Full audit trail
- **Spending Analytics**: Daily/monthly spending reports
- **Security Events**: Pause/unpause, recovery attempts
- **Cost Optimization**: Gas usage and fee tracking

## 🔗 Resources

- [Base Network Documentation](https://docs.base.org/)
- [Base Bridge](https://bridge.base.org/)
- [Base Explorer](https://basescan.org/)
- [x402 Foundation](https://x402.foundation/)
- [Coinbase Wallet](https://www.coinbase.com/wallet)

## 📞 Support

For deployment issues:
- Base Discord: [discord.gg/buildonbase](https://discord.gg/buildonbase)
- Coinbase Developer Support: [developers.coinbase.com](https://developers.coinbase.com)
