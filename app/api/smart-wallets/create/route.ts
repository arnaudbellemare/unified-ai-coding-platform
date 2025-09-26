import { NextRequest, NextResponse } from 'next/server'
import { erc4337AgentWallet } from '@/lib/smart-wallets/erc4337-agent-wallet'
import { getPrivyUser } from '@/lib/auth/privy-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      agentId,
      maxDailySpend = 10, // Default 10 USDC
      maxSingleTransaction = 2, // Default 2 USDC
      allowedServices = [],
      backupWallets = [],
      recoveryContacts = [],
    } = body

    // Require authentication for all wallet creation
    const privyUser = await getPrivyUser(request)
    if (!privyUser) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 })
    }

    // Convert amounts to USDC decimals (6 decimals)
    const maxDailySpendWei = Math.floor(maxDailySpend * 1000000) // Convert to USDC wei
    const maxSingleTransactionWei = Math.floor(maxSingleTransaction * 1000000) // Convert to USDC wei

    // Default allowed services if none provided
    const defaultAllowedServices =
      allowedServices.length > 0
        ? allowedServices
        : [
            '0x0000000000000000000000000000000000000001', // OpenAI placeholder
            '0x0000000000000000000000000000000000000002', // Anthropic placeholder
            '0x0000000000000000000000000000000000000003', // Perplexity placeholder
            '0x0000000000000000000000000000000000000004', // Vercel placeholder
          ]

    // Require backup wallets to be provided
    if (backupWallets.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Backup wallets are required for security' 
      }, { status: 400 })
    }

    // Require recovery contacts to be provided
    if (recoveryContacts.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Recovery contacts are required for security' 
      }, { status: 400 })
    }

    // Create smart contract wallet configuration
    const walletConfig = {
      agentId,
      maxDailySpend: maxDailySpendWei,
      maxSingleTransaction: maxSingleTransactionWei,
      allowedServices: defaultAllowedServices,
      backupWallets: backupWallets,
      requiredApprovals: 2, // Require 2 of N backup wallets to approve
      recoveryContacts: recoveryContacts,
      recoveryDelay: 7 * 24 * 60 * 60, // 7 days in seconds
    }

    console.log(`🚀 Creating smart contract wallet for agent: ${agentId}`)
    console.log(`📊 Config:`, walletConfig)

    // Create the smart contract wallet
    const smartWallet = await erc4337AgentWallet.createSmartAgentWallet(walletConfig)

    console.log(`✅ Smart contract wallet created: ${smartWallet.walletAddress}`)

    return NextResponse.json({
      success: true,
      wallet: smartWallet,
      message: `Smart contract wallet created for agent: ${agentId}`,
    })
  } catch (error) {
    console.error('Smart wallet creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to create smart contract wallet',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const agentId = url.searchParams.get('agentId')
    const action = url.searchParams.get('action')

    switch (action) {
      case 'all_wallets':
        // Get all smart agent wallets
        const allWallets = erc4337AgentWallet.getAllSmartAgentWallets()
        return NextResponse.json({ success: true, wallets: allWallets })

      case 'wallet':
        if (!agentId) {
          return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 })
        }
        const wallet = erc4337AgentWallet.getSmartAgentWallet(agentId)
        if (!wallet) {
          return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, wallet })

      case 'history':
        if (!agentId) {
          return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 })
        }
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const history = erc4337AgentWallet.getSmartAgentTransactionHistory(agentId, limit)
        return NextResponse.json({ success: true, history })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Smart wallet GET error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
