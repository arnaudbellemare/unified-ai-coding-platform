/**
 * ACP Webhook Handler
 * Handles webhook events for order processing
 */

export interface WebhookEvent {
  id: string
  type:
    | 'order.created'
    | 'order.updated'
    | 'order.cancelled'
    | 'payment.processed'
    | 'payment.failed'
    | 'shipping.updated'
    | 'refund.processed'
  order_id: string
  timestamp: Date
  data: Record<string, any>
  signature: string
}

export interface WebhookConfig {
  endpoint: string
  secret: string
  events: string[]
  retry_count: number
  timeout: number
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event_id: string
  status: 'pending' | 'delivered' | 'failed' | 'retrying'
  attempts: number
  last_attempt: Date
  next_retry?: Date
  response_code?: number
  response_body?: string
  error?: string
}

export class ACPWebhookHandler {
  private webhookConfigs: Map<string, WebhookConfig> = new Map()
  private deliveries: Map<string, WebhookDelivery> = new Map()
  private eventHandlers: Map<string, (event: WebhookEvent) => Promise<void>> = new Map()

  /**
   * Register webhook endpoint
   */
  registerWebhook(webhookId: string, config: WebhookConfig): void {
    this.webhookConfigs.set(webhookId, config)
    console.log(`🔗 ACP Webhook registered: ${webhookId} → ${config.endpoint}`)
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: Omit<WebhookEvent, 'id' | 'timestamp'>): Promise<void> {
    const webhookEvent: WebhookEvent = {
      ...event,
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    console.log(`📡 ACP Webhook event: ${event.type} for order ${event.order_id}`)

    // Process event handlers
    await this.processEventHandlers(webhookEvent)

    // Deliver to registered webhooks
    await this.deliverToWebhooks(webhookEvent)
  }

  /**
   * Add event handler
   */
  addEventHandler(eventType: string, handler: (event: WebhookEvent) => Promise<void>): void {
    this.eventHandlers.set(eventType, handler)
  }

  /**
   * Process event handlers
   */
  private async processEventHandlers(event: WebhookEvent): Promise<void> {
    const handler = this.eventHandlers.get(event.type)
    if (handler) {
      try {
        await handler(event)
        console.log(`✅ ACP Event handler processed: ${event.type}`)
      } catch (error) {
        console.error(`❌ ACP Event handler failed: ${event.type}`, error)
      }
    }
  }

  /**
   * Deliver to webhooks
   */
  private async deliverToWebhooks(event: WebhookEvent): Promise<void> {
    for (const [webhookId, config] of this.webhookConfigs) {
      if (config.events.includes(event.type)) {
        await this.deliverToWebhook(webhookId, config, event)
      }
    }
  }

  /**
   * Deliver to specific webhook
   */
  private async deliverToWebhook(webhookId: string, config: WebhookConfig, event: WebhookEvent): Promise<void> {
    const deliveryId = `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhook_id: webhookId,
      event_id: event.id,
      status: 'pending',
      attempts: 0,
      last_attempt: new Date(),
    }

    this.deliveries.set(deliveryId, delivery)

    try {
      await this.attemptDelivery(delivery, config, event)
    } catch (error) {
      console.error(`❌ ACP Webhook delivery failed: ${webhookId}`, error)
    }
  }

  /**
   * Attempt webhook delivery
   */
  private async attemptDelivery(delivery: WebhookDelivery, config: WebhookConfig, event: WebhookEvent): Promise<void> {
    delivery.attempts++
    delivery.last_attempt = new Date()
    delivery.status = 'retrying'

    try {
      const payload = {
        id: event.id,
        type: event.type,
        order_id: event.order_id,
        timestamp: event.timestamp.toISOString(),
        data: event.data,
      }

      const signature = this.generateSignature(payload, config.secret)

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ACP-Signature': signature,
          'X-ACP-Event': event.type,
          'User-Agent': 'ACP-Webhook/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.timeout * 1000),
      })

      delivery.response_code = response.status
      delivery.response_body = await response.text()

      if (response.ok) {
        delivery.status = 'delivered'
        console.log(`✅ ACP Webhook delivered: ${config.endpoint}`)
      } else {
        throw new Error(`HTTP ${response.status}: ${delivery.response_body}`)
      }
    } catch (error) {
      delivery.status = 'failed'
      delivery.error = error instanceof Error ? error.message : 'Unknown error'

      if (delivery.attempts < config.retry_count) {
        // Schedule retry
        const retryDelay = Math.pow(2, delivery.attempts) * 1000 // Exponential backoff
        delivery.next_retry = new Date(Date.now() + retryDelay)
        delivery.status = 'retrying'

        console.log(
          `🔄 ACP Webhook retry scheduled: ${config.endpoint} (attempt ${delivery.attempts}/${config.retry_count})`,
        )

        // In a real implementation, you'd use a job queue here
        setTimeout(() => {
          this.attemptDelivery(delivery, config, event)
        }, retryDelay)
      } else {
        console.error(`❌ ACP Webhook failed permanently: ${config.endpoint}`, error)
      }
    }
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: any, secret: string): string {
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(JSON.stringify(payload))
    return `sha256=${hmac.digest('hex')}`
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(JSON.parse(payload), secret)
    return signature === expectedSignature
  }

  /**
   * Get webhook delivery status
   */
  getWebhookDelivery(deliveryId: string): WebhookDelivery | null {
    return this.deliveries.get(deliveryId) || null
  }

  /**
   * Get webhook statistics
   */
  getWebhookStatistics(): {
    total_webhooks: number
    total_deliveries: number
    successful_deliveries: number
    failed_deliveries: number
    pending_deliveries: number
  } {
    const deliveries = Array.from(this.deliveries.values())
    const totalDeliveries = deliveries.length
    const successfulDeliveries = deliveries.filter((d) => d.status === 'delivered').length
    const failedDeliveries = deliveries.filter((d) => d.status === 'failed').length
    const pendingDeliveries = deliveries.filter((d) => d.status === 'retrying').length

    return {
      total_webhooks: this.webhookConfigs.size,
      total_deliveries: totalDeliveries,
      successful_deliveries: successfulDeliveries,
      failed_deliveries: failedDeliveries,
      pending_deliveries: pendingDeliveries,
    }
  }

  /**
   * Retry failed deliveries
   */
  async retryFailedDeliveries(): Promise<void> {
    const failedDeliveries = Array.from(this.deliveries.values()).filter((d) => d.status === 'failed' && d.attempts < 3)

    for (const delivery of failedDeliveries) {
      const config = this.webhookConfigs.get(delivery.webhook_id)
      if (config) {
        // In a real implementation, you'd fetch the original event
        console.log(`🔄 Retrying failed delivery: ${delivery.id}`)
      }
    }
  }
}
