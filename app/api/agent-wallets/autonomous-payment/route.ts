import { NextRequest, NextResponse } from 'next/server'
import { autonomousAgentWallet } from '@/lib/agent-wallets/autonomous-agent-wallet'
import { getPrivyUser } from '@/lib/auth/privy-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    // Get user for authentication (optional for demo wallets)
    const privyUser = await getPrivyUser(request)

    // For demo wallet creation, allow without authentication
    if (action === 'create_wallet' && data.isDemo) {
      // Create demo wallet without authentication
      const { agentId, fundingSource, initialFunding } = data
      const wallet = await autonomousAgentWallet.createAgentWallet(agentId, fundingSource, initialFunding)
      return NextResponse.json({ success: true, wallet, isDemo: true })
    }

    // For other actions, require authentication
    if (!privyUser) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    switch (action) {
      case 'create_wallet': {
        const { agentId, fundingSource, initialFunding } = data
        const wallet = await autonomousAgentWallet.createAgentWallet(agentId, fundingSource, initialFunding)
        return NextResponse.json({ success: true, wallet })
      }

      case 'fund_wallet': {
        const { agentId, amount } = data
        const success = await autonomousAgentWallet.fundAgentWallet(agentId, amount)
        return NextResponse.json({ success, message: `Wallet funded with $${amount} USDC` })
      }

      case 'make_payment': {
        const { agentId, serviceProvider, amount, description, metadata } = data
        const paymentResponse = await autonomousAgentWallet.makeAutonomousPayment({
          agentId,
          serviceProvider,
          amount,
          currency: 'USDC',
          description,
          metadata,
        })
        return NextResponse.json({ success: true, paymentResponse })
      }

      case 'get_wallet': {
        const { agentId } = data
        const wallet = autonomousAgentWallet.getAgentWallet(agentId)
        if (!wallet) {
          return NextResponse.json({ success: false, error: 'Agent wallet not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, wallet })
      }

      case 'update_settings': {
        const { agentId, settings } = data
        const success = autonomousAgentWallet.updateAutonomousSettings(agentId, settings)
        return NextResponse.json({ success, message: 'Settings updated' })
      }

      case 'get_transaction_history': {
        const { agentId, limit } = data
        const history = autonomousAgentWallet.getAgentTransactionHistory(agentId, limit)
        return NextResponse.json({ success: true, history })
      }

      case 'simulate_api_call': {
        const { agentId, apiProvider, apiCost, description } = data
        const paymentResponse = await autonomousAgentWallet.simulateAgentAPICall(
          agentId,
          apiProvider,
          apiCost,
          description,
        )
        return NextResponse.json({ success: true, paymentResponse })
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Autonomous agent wallet error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const agentId = url.searchParams.get('agentId')

    switch (action) {
      case 'all_wallets':
        // For getting all wallets, no agentId is required
        const allWallets = autonomousAgentWallet.getAllAgentWallets()
        return NextResponse.json({ success: true, wallets: allWallets })

      case 'wallet':
        if (!agentId) {
          return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 })
        }
        const wallet = autonomousAgentWallet.getAgentWallet(agentId)
        return NextResponse.json({ success: true, wallet })

      case 'history':
        if (!agentId) {
          return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 })
        }
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const history = autonomousAgentWallet.getAgentTransactionHistory(agentId, limit)
        return NextResponse.json({ success: true, history })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Autonomous agent wallet GET error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
