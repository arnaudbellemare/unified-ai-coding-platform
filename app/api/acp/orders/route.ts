import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/simple-auth'
import { ACPOrderManager } from '@/lib/acp/order-manager'

const orderManager = new ACPOrderManager()

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url = new URL(request.url)
    const orderId = url.searchParams.get('orderId')
    const status = url.searchParams.get('status')

    if (orderId) {
      const order = orderManager.getOrder(orderId)
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, order })
    }

    if (status) {
      const orders = orderManager.getOrdersByStatus(status as any)
      return NextResponse.json({ success: true, orders })
    }

    const orders = orderManager.getOrdersByCustomer(user.id)
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('ACP Orders API error:', error)
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { action, orderId, ...data } = body

    switch (action) {
      case 'cancel':
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
        }
        const cancelledOrder = await orderManager.cancelOrder(orderId, data.reason || 'Customer request')
        return NextResponse.json({ success: true, order: cancelledOrder })

      case 'refund':
        if (!orderId || !data.amount) {
          return NextResponse.json({ error: 'Order ID and amount required' }, { status: 400 })
        }
        const refundedOrder = await orderManager.processRefund(orderId, data.amount, data.reason || 'Customer request')
        return NextResponse.json({ success: true, order: refundedOrder })

      case 'update_shipping':
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
        }
        const updatedOrder = await orderManager.updateShipping(orderId, data.shipping)
        return NextResponse.json({ success: true, order: updatedOrder })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('ACP Orders API error:', error)
    return NextResponse.json({ error: 'Failed to process order action' }, { status: 500 })
  }
}
