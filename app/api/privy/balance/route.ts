import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { address, network } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    // Fetch real balance from blockchain
    try {
      const { RealX402PaymentService } = await import('@/lib/x402/real-x402-payments')
      const paymentService = new RealX402PaymentService()
      const walletBalance = await paymentService.getWalletBalance(address)

      // Log balance request for analytics
      console.log('Wallet balance fetched:', {
        address,
        network: network || 'base-sepolia',
        ethBalance: walletBalance.eth,
        usdcBalance: walletBalance.usdc,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        address,
        network: network || 'base-sepolia',
        balance: walletBalance.usdc,
        ethBalance: walletBalance.eth,
        currency: 'USDC',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to fetch real wallet balance:', error)
      return NextResponse.json({
        error: 'Failed to fetch wallet balance',
        message: 'Please ensure wallet is connected and has sufficient funds',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Privy balance error:', error)
    return NextResponse.json({ error: 'Failed to fetch wallet balance' }, { status: 500 })
  }
}
