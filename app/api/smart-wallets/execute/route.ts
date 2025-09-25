import { NextRequest, NextResponse } from 'next/server'
import { erc4337AgentWallet } from '@/lib/smart-wallets/erc4337-agent-wallet'
import { getPrivyUser } from '@/lib/auth/privy-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, to, value, data, gasLimit, description, metadata, isDemo = false } = body

    // For demo wallets, allow without authentication
    if (!isDemo) {
      const privyUser = await getPrivyUser(request)
      if (!privyUser) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
      }
    }

    if (!agentId || !to || value === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID, recipient address, and value are required',
        },
        { status: 400 },
      )
    }

    // Convert value to USDC wei (6 decimals)
    const valueWei = Math.floor(value * 1000000)

    // Create transaction request
    const transactionRequest = {
      agentId,
      to,
      value: valueWei,
      data: data || '0x',
      gasLimit: gasLimit || 100000,
      description: description || `Payment to ${to}`,
      metadata: {
        serviceProvider: to,
        serviceType: 'api_call' as const,
        priority: 'medium' as const,
        estimatedCost: value,
        ...metadata,
      },
    }

    console.log(`🤖 Executing smart transaction for agent: ${agentId}`)
    console.log(`📊 Transaction:`, transactionRequest)

    // Execute the smart transaction
    const result = await erc4337AgentWallet.executeSmartTransaction(transactionRequest)

    console.log(`✅ Smart transaction result:`, result)

    return NextResponse.json({
      success: result.success,
      transaction: result,
      message: result.success
        ? `Smart transaction executed successfully: ${result.transactionHash}`
        : `Smart transaction failed: ${result.error}`,
    })
  } catch (error) {
    console.error('Smart transaction execution error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to execute smart transaction',
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, agentId, maxDailySpend, maxSingleTransaction, allowedServices, isDemo = false } = body

    // For demo wallets, allow without authentication
    if (!isDemo) {
      const privyUser = await getPrivyUser(request)
      if (!privyUser) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
      }
    }

    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 })
    }

    switch (action) {
      case 'update_spending_rules':
        if (maxDailySpend === undefined || maxSingleTransaction === undefined || !allowedServices) {
          return NextResponse.json(
            {
              success: false,
              error: 'maxDailySpend, maxSingleTransaction, and allowedServices are required',
            },
            { status: 400 },
          )
        }

        // Convert amounts to USDC wei (6 decimals)
        const maxDailySpendWei = Math.floor(maxDailySpend * 1000000)
        const maxSingleTransactionWei = Math.floor(maxSingleTransaction * 1000000)

        const success = await erc4337AgentWallet.updateSpendingRules(
          agentId,
          maxDailySpendWei,
          maxSingleTransactionWei,
          allowedServices,
        )

        return NextResponse.json({
          success,
          message: success ? 'Spending rules updated successfully' : 'Failed to update spending rules',
        })

      case 'emergency_pause':
        const pauseSuccess = await erc4337AgentWallet.emergencyPauseWallet(agentId)
        return NextResponse.json({
          success: pauseSuccess,
          message: pauseSuccess ? 'Wallet paused successfully' : 'Failed to pause wallet',
        })

      case 'emergency_unpause':
        const unpauseSuccess = await erc4337AgentWallet.emergencyUnpauseWallet(agentId)
        return NextResponse.json({
          success: unpauseSuccess,
          message: unpauseSuccess ? 'Wallet unpaused successfully' : 'Failed to unpause wallet',
        })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Smart wallet update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to update smart wallet',
      },
      { status: 500 },
    )
  }
}
