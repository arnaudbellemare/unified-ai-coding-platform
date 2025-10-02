/**
 * ACP Order Manager
 * Handles order state management and lifecycle
 */

export interface OrderState {
  id: string
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  items: OrderItem[]
  total: number
  currency: string
  customer: CustomerInfo
  payment: PaymentInfo
  shipping: ShippingInfo
  metadata: Record<string, any>
  created_at: Date
  updated_at: Date
  timeline: OrderEvent[]
}

export interface OrderItem {
  product_id: string
  name: string
  quantity: number
  price: number
  total: number
}

export interface CustomerInfo {
  id: string
  email: string
  name: string
  phone?: string
  address: Address
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface PaymentInfo {
  method: string
  transaction_id: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  currency: string
}

export interface ShippingInfo {
  method: string
  tracking_number?: string
  carrier?: string
  estimated_delivery?: Date
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered'
}

export interface OrderEvent {
  id: string
  type: 'created' | 'payment_processed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  timestamp: Date
  description: string
  metadata?: Record<string, any>
}

export class ACPOrderManager {
  private orders: Map<string, OrderState> = new Map()
  private eventHandlers: Map<string, (order: OrderState, event: OrderEvent) => Promise<void>> = new Map()

  /**
   * Create a new order
   */
  async createOrder(orderData: {
    items: OrderItem[]
    customer: CustomerInfo
    payment: PaymentInfo
    shipping: ShippingInfo
    metadata?: Record<string, any>
  }): Promise<OrderState> {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const total = orderData.items.reduce((sum, item) => sum + item.total, 0)

    const order: OrderState = {
      id: orderId,
      status: 'pending',
      items: orderData.items,
      total,
      currency: 'USD',
      customer: orderData.customer,
      payment: orderData.payment,
      shipping: orderData.shipping,
      metadata: orderData.metadata || {},
      created_at: new Date(),
      updated_at: new Date(),
      timeline: []
    }

    // Add creation event
    this.addOrderEvent(order, 'created', 'Order created successfully')

    this.orders.set(orderId, order)
    console.log(`📦 ACP Order created: ${orderId}`)

    return order
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderState['status'], description?: string): Promise<OrderState | null> {
    const order = this.orders.get(orderId)
    if (!order) {
      throw new Error(`Order ${orderId} not found`)
    }

    const oldStatus = order.status
    order.status = status
    order.updated_at = new Date()

    // Add status change event
    this.addOrderEvent(order, this.getEventTypeFromStatus(status), description || `Order status changed to ${status}`)

    // Trigger event handlers
    await this.triggerEventHandlers(order)

    console.log(`📦 ACP Order ${orderId} status: ${oldStatus} → ${status}`)
    return order
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): OrderState | null {
    return this.orders.get(orderId) || null
  }

  /**
   * Get orders by customer
   */
  getOrdersByCustomer(customerId: string): OrderState[] {
    return Array.from(this.orders.values()).filter(order => order.customer.id === customerId)
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: OrderState['status']): OrderState[] {
    return Array.from(this.orders.values()).filter(order => order.status === status)
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason: string): Promise<OrderState | null> {
    const order = this.orders.get(orderId)
    if (!order) {
      throw new Error(`Order ${orderId} not found`)
    }

    if (order.status === 'delivered' || order.status === 'shipped') {
      throw new Error(`Cannot cancel order in ${order.status} status`)
    }

    order.status = 'cancelled'
    order.updated_at = new Date()
    this.addOrderEvent(order, 'cancelled', `Order cancelled: ${reason}`)

    await this.triggerEventHandlers(order)
    console.log(`❌ ACP Order ${orderId} cancelled: ${reason}`)

    return order
  }

  /**
   * Process refund
   */
  async processRefund(orderId: string, amount: number, reason: string): Promise<OrderState | null> {
    const order = this.orders.get(orderId)
    if (!order) {
      throw new Error(`Order ${orderId} not found`)
    }

    if (order.status !== 'delivered' && order.status !== 'shipped') {
      throw new Error(`Cannot refund order in ${order.status} status`)
    }

    order.status = 'refunded'
    order.updated_at = new Date()
    this.addOrderEvent(order, 'refunded', `Refund processed: $${amount} - ${reason}`)

    await this.triggerEventHandlers(order)
    console.log(`💰 ACP Order ${orderId} refunded: $${amount}`)

    return order
  }

  /**
   * Update shipping information
   */
  async updateShipping(orderId: string, shippingUpdate: Partial<ShippingInfo>): Promise<OrderState | null> {
    const order = this.orders.get(orderId)
    if (!order) {
      throw new Error(`Order ${orderId} not found`)
    }

    Object.assign(order.shipping, shippingUpdate)
    order.updated_at = new Date()

    if (shippingUpdate.tracking_number) {
      this.addOrderEvent(order, 'shipped', `Order shipped with tracking: ${shippingUpdate.tracking_number}`)
      order.shipping.status = 'shipped'
    }

    if (shippingUpdate.status === 'delivered') {
      this.addOrderEvent(order, 'delivered', 'Order delivered successfully')
      order.status = 'delivered'
    }

    await this.triggerEventHandlers(order)
    console.log(`🚚 ACP Order ${orderId} shipping updated`)

    return order
  }

  /**
   * Add event handler
   */
  addEventHandler(eventType: string, handler: (order: OrderState, event: OrderEvent) => Promise<void>): void {
    this.eventHandlers.set(eventType, handler)
  }

  /**
   * Add order event
   */
  private addOrderEvent(order: OrderState, type: OrderEvent['type'], description: string, metadata?: Record<string, any>): void {
    const event: OrderEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      description,
      metadata
    }

    order.timeline.push(event)
  }

  /**
   * Get event type from status
   */
  private getEventTypeFromStatus(status: OrderState['status']): OrderEvent['type'] {
    const statusToEvent: Record<OrderState['status'], OrderEvent['type']> = {
      'pending': 'created',
      'processing': 'payment_processed',
      'confirmed': 'payment_processed',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'refunded': 'refunded'
    }

    return statusToEvent[status] || 'created'
  }

  /**
   * Trigger event handlers
   */
  private async triggerEventHandlers(order: OrderState): Promise<void> {
    const latestEvent = order.timeline[order.timeline.length - 1]
    if (!latestEvent) return

    const handler = this.eventHandlers.get(latestEvent.type)
    if (handler) {
      try {
        await handler(order, latestEvent)
      } catch (error) {
        console.error(`❌ Event handler failed for order ${order.id}:`, error)
      }
    }
  }

  /**
   * Get order statistics
   */
  getOrderStatistics(): {
    total_orders: number
    orders_by_status: Record<string, number>
    total_revenue: number
    average_order_value: number
  } {
    const orders = Array.from(this.orders.values())
    const totalOrders = orders.length
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const totalRevenue = orders
      .filter(order => order.status === 'delivered' || order.status === 'shipped')
      .reduce((sum, order) => sum + order.total, 0)
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      total_orders: totalOrders,
      orders_by_status: ordersByStatus,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue
    }
  }
}
