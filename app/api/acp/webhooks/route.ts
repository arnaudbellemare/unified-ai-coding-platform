import { NextRequest, NextResponse } from 'next/server'
import { ACPWebhookHandler } from '@/lib/acp/webhook-handler'

const webhookHandler = new ACPWebhookHandler()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('X-ACP-Signature')
    const eventType = request.headers.get('X-ACP-Event')

    if (!signature || !eventType) {
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 })
    }

    // Verify webhook signature (in production, use real secret)
    const secret = process.env.ACP_WEBHOOK_SECRET || 'dev_secret'
    const isValid = webhookHandler.verifyWebhookSignature(JSON.stringify(body), signature, secret)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Process webhook event
    await webhookHandler.processWebhookEvent({
      type: eventType as any,
      order_id: body.order_id,
      data: body.data || {},
      signature
    })

    return NextResponse.json({ success: true, message: 'Webhook processed' })
  } catch (error) {
    console.error('ACP Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'register':
        const webhookId = url.searchParams.get('webhookId')
        const endpoint = url.searchParams.get('endpoint')
        const events = url.searchParams.get('events')?.split(',') || []

        if (!webhookId || !endpoint) {
          return NextResponse.json({ error: 'webhookId and endpoint required' }, { status: 400 })
        }

        webhookHandler.registerWebhook(webhookId, {
          endpoint,
          secret: process.env.ACP_WEBHOOK_SECRET || 'dev_secret',
          events,
          retry_count: 3,
          timeout: 30
        })

        return NextResponse.json({ success: true, message: 'Webhook registered' })

      case 'stats':
        const stats = webhookHandler.getWebhookStatistics()
        return NextResponse.json({ success: true, stats })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('ACP Webhook API error:', error)
    return NextResponse.json({ error: 'Failed to process webhook request' }, { status: 500 })
  }
}
