import { NextRequest, NextResponse } from 'next/server'
import { CompleteCoinbaseCommerceIntegration } from '@/lib/coinbase-commerce/complete-integration'
import { AP2CoinbaseIntegration } from '@/lib/ap2/coinbase-integration'

// Initialize Coinbase Commerce integration
const coinbaseCommerce = new CompleteCoinbaseCommerceIntegration({
  apiKey: process.env.COINBASE_COMMERCE_API_KEY || '',
  webhookSecret: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || '',
  autoUSDCConversion: true,
  supportedCurrencies: ['USDC', 'ETH', 'BTC', 'USDT'],
  baseNetwork: true
})

// Initialize AP2 + Coinbase integration
const ap2CoinbaseIntegration = new AP2CoinbaseIntegration(
  {
    apiKey: process.env.COINBASE_COMMERCE_API_KEY || '',
    webhookSecret: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || '',
    autoUSDCConversion: true,
    supportedCurrencies: ['USDC', 'ETH', 'BTC', 'USDT'],
    baseNetwork: true
  },
  {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || '',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'global',
    apiKey: process.env.GOOGLE_API_KEY || '',
    vertexAIKey: process.env.VERTEX_AI_API_KEY,
    useVertexAI: process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true'
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-cc-webhook-signature') || ''
    
    // Verify webhook signature
    if (!coinbaseCommerce.verifyWebhookSignature(body, signature)) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const webhookEvent = JSON.parse(body)
    console.log(`📨 Coinbase Commerce webhook received: ${webhookEvent.type}`)

    // Process webhook event
    const result = await coinbaseCommerce.processWebhookEvent(webhookEvent)
    
    if (result.success) {
      console.log(`✅ Webhook processed successfully: ${result.action}`)
      
      // Handle AP2 payments if applicable
      if (result.chargeId) {
        const ap2Result = await ap2CoinbaseIntegration.handleCoinbaseWebhook(webhookEvent)
        if (ap2Result.success) {
          console.log(`🤖 AP2 payment updated: ${ap2Result.ap2PaymentId}`)
        }
      }

      // Handle different webhook types
      switch (result.action) {
        case 'charge_created':
          console.log(`💰 Charge created: ${result.chargeId}`)
          break

        case 'payment_confirmed':
          console.log(`✅ Payment confirmed: ${result.chargeId}`)
          console.log(`💵 Amount: ${result.amount} ${result.currency}`)
          
          // Handle order fulfillment
          await handleOrderFulfillment(result.chargeId, result.amount, result.currency)
          break

        case 'payment_failed':
          console.log(`❌ Payment failed: ${result.chargeId}`)
          await handlePaymentFailure(result.chargeId)
          break

        case 'payment_delayed':
          console.log(`⏳ Payment delayed: ${result.chargeId}`)
          await handlePaymentDelay(result.chargeId)
          break

        default:
          console.log(`ℹ️ Unknown webhook action: ${result.action}`)
      }

      return NextResponse.json({
        success: true,
        action: result.action,
        chargeId: result.chargeId,
        status: result.status
      })
    } else {
      console.error(`❌ Webhook processing failed: ${result.status}`)
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Coinbase Commerce webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Handle order fulfillment after successful payment
 */
async function handleOrderFulfillment(chargeId: string, amount: number, currency: string) {
  try {
    console.log(`📦 Processing order fulfillment for charge: ${chargeId}`)
    
    // Get charge details
    const chargeStatus = await coinbaseCommerce.getChargeStatus(chargeId)
    console.log(`📊 Charge status: ${chargeStatus.status}`)
    console.log(`💰 Amount: ${chargeStatus.amount} ${chargeStatus.currency}`)
    console.log(`🔄 Auto-converted: ${chargeStatus.autoConverted}`)

    // Update order status in database
    await updateOrderStatus(chargeId, 'completed', {
      amount: chargeStatus.amount,
      currency: chargeStatus.currency,
      autoConverted: chargeStatus.autoConverted,
      confirmedAt: new Date().toISOString()
    })

    // Send confirmation email
    await sendOrderConfirmation(chargeId, chargeStatus)

    // Update inventory
    await updateInventory(chargeId)

    // Track conversion for analytics
    await trackConversion(chargeId, amount, currency)

    console.log(`✅ Order fulfillment completed for charge: ${chargeId}`)
  } catch (error) {
    console.error('❌ Order fulfillment failed:', error)
    throw error
  }
}

/**
 * Handle payment failure
 */
async function handlePaymentFailure(chargeId: string) {
  try {
    console.log(`❌ Handling payment failure for charge: ${chargeId}`)
    
    // Update order status
    await updateOrderStatus(chargeId, 'failed', {
      failedAt: new Date().toISOString(),
      reason: 'Payment failed'
    })

    // Send failure notification
    await sendPaymentFailureNotification(chargeId)

    // Restore inventory
    await restoreInventory(chargeId)

    console.log(`✅ Payment failure handled for charge: ${chargeId}`)
  } catch (error) {
    console.error('❌ Payment failure handling failed:', error)
    throw error
  }
}

/**
 * Handle payment delay
 */
async function handlePaymentDelay(chargeId: string) {
  try {
    console.log(`⏳ Handling payment delay for charge: ${chargeId}`)
    
    // Update order status
    await updateOrderStatus(chargeId, 'pending', {
      delayedAt: new Date().toISOString(),
      reason: 'Payment delayed'
    })

    // Send delay notification
    await sendPaymentDelayNotification(chargeId)

    console.log(`✅ Payment delay handled for charge: ${chargeId}`)
  } catch (error) {
    console.error('❌ Payment delay handling failed:', error)
    throw error
  }
}

/**
 * Update order status in database
 */
async function updateOrderStatus(chargeId: string, status: string, metadata: any) {
  try {
    console.log(`📝 Updating order status: ${chargeId} → ${status}`)
    // In a real implementation, this would update the database
    console.log(`📊 Order metadata:`, metadata)
  } catch (error) {
    console.error('❌ Failed to update order status:', error)
    throw error
  }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(chargeId: string, chargeStatus: any) {
  try {
    console.log(`📧 Sending order confirmation for charge: ${chargeId}`)
    // In a real implementation, this would send an email
    console.log(`📊 Charge details:`, chargeStatus)
  } catch (error) {
    console.error('❌ Failed to send order confirmation:', error)
    throw error
  }
}

/**
 * Update inventory
 */
async function updateInventory(chargeId: string) {
  try {
    console.log(`📦 Updating inventory for charge: ${chargeId}`)
    // In a real implementation, this would update inventory
  } catch (error) {
    console.error('❌ Failed to update inventory:', error)
    throw error
  }
}

/**
 * Track conversion for analytics
 */
async function trackConversion(chargeId: string, amount: number, currency: string) {
  try {
    console.log(`📊 Tracking conversion: ${chargeId} - ${amount} ${currency}`)
    // In a real implementation, this would track conversion analytics
  } catch (error) {
    console.error('❌ Failed to track conversion:', error)
    throw error
  }
}

/**
 * Send payment failure notification
 */
async function sendPaymentFailureNotification(chargeId: string) {
  try {
    console.log(`📧 Sending payment failure notification for charge: ${chargeId}`)
    // In a real implementation, this would send a notification
  } catch (error) {
    console.error('❌ Failed to send payment failure notification:', error)
    throw error
  }
}

/**
 * Restore inventory
 */
async function restoreInventory(chargeId: string) {
  try {
    console.log(`📦 Restoring inventory for charge: ${chargeId}`)
    // In a real implementation, this would restore inventory
  } catch (error) {
    console.error('❌ Failed to restore inventory:', error)
    throw error
  }
}

/**
 * Send payment delay notification
 */
async function sendPaymentDelayNotification(chargeId: string) {
  try {
    console.log(`📧 Sending payment delay notification for charge: ${chargeId}`)
    // In a real implementation, this would send a notification
  } catch (error) {
    console.error('❌ Failed to send payment delay notification:', error)
    throw error
  }
}
