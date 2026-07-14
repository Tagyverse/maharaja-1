import { orderService } from './orderService';
import type { Order, OrderItem, OrderChannel } from '../types/orders';

export const multiChannelOrderHandler = {
  // WhatsApp order flow
  async handleWhatsAppOrder(
    customerName: string,
    customerPhone: string,
    customerEmail: string,
    shippingAddress: string,
    city: string,
    state: string,
    zipCode: string,
    items: OrderItem[],
    subtotal: number,
    tax: number,
    shipping: number,
    adminWhatsAppNumber: string
  ): Promise<Order> {
    try {
      // Calculate totals
      const total = subtotal + tax + shipping;

      // Create order object
      const orderNumber = orderService.generateOrderNumber();
      const order: Omit<Order, 'id'> = {
        orderNumber,
        timestamp: Date.now(),
        channel: 'whatsapp',
        status: 'pending',
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        state,
        zipCode,
        items,
        subtotal,
        tax,
        shipping,
        total,
        whatsappLink: orderService.generateWhatsAppLink(adminWhatsAppNumber, items),
      };

      // Save to Firebase
      const savedOrder = await orderService.createOrder(order);

      // Redirect to WhatsApp
      window.location.href = savedOrder.whatsappLink!;

      return savedOrder;
    } catch (error) {
      console.error('Error handling WhatsApp order:', error);
      throw error;
    }
  },

  // Telegram order flow
  async handleTelegramOrder(
    customerName: string,
    customerPhone: string,
    customerEmail: string,
    shippingAddress: string,
    city: string,
    state: string,
    zipCode: string,
    items: OrderItem[],
    subtotal: number,
    tax: number,
    shipping: number,
    adminBotToken?: string,
    adminChatId?: string
  ): Promise<Order> {
    try {
      // Calculate totals
      const total = subtotal + tax + shipping;

      // Create order object
      const orderNumber = orderService.generateOrderNumber();
      const order: Omit<Order, 'id'> = {
        orderNumber,
        timestamp: Date.now(),
        channel: 'telegram',
        status: 'pending',
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        state,
        zipCode,
        items,
        subtotal,
        tax,
        shipping,
        total,
        notes: 'Awaiting admin confirmation. You will be called back soon.',
      };

      // Save to Firebase
      const savedOrder = await orderService.createOrder(order);

      // Send notification to admin bot (if credentials provided)
      if (adminBotToken && adminChatId) {
        await this.sendTelegramNotification(
          adminBotToken,
          adminChatId,
          savedOrder
        );
      }

      return savedOrder;
    } catch (error) {
      console.error('Error handling Telegram order:', error);
      throw error;
    }
  },

  // Payment Gateway order flow
  async handlePaymentGatewayOrder(
    customerName: string,
    customerPhone: string,
    customerEmail: string,
    shippingAddress: string,
    city: string,
    state: string,
    zipCode: string,
    items: OrderItem[],
    subtotal: number,
    tax: number,
    shipping: number,
    paymentMethod: string,
    paymentId?: string,
    transactionId?: string
  ): Promise<Order> {
    try {
      // Calculate totals
      const total = subtotal + tax + shipping;

      // Create order object
      const orderNumber = orderService.generateOrderNumber();
      const order: Omit<Order, 'id'> = {
        orderNumber,
        timestamp: Date.now(),
        channel: 'payment-gateway',
        status: 'confirmed',
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        state,
        zipCode,
        items,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod,
        paymentId,
        transactionId,
        adminNotified: true,
      };

      // Save to Firebase
      const savedOrder = await orderService.createOrder(order);

      return savedOrder;
    } catch (error) {
      console.error('Error handling payment gateway order:', error);
      throw error;
    }
  },

  // Send Telegram notification to admin
  async sendTelegramNotification(botToken: string, chatId: string, order: Order): Promise<void> {
    try {
      const itemsList = order.items
        .map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');

      const message = `
📦 NEW ORDER RECEIVED

Order #: ${order.orderNumber}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail}

📍 Delivery Address:
${order.shippingAddress}
${order.city}, ${order.state} ${order.zipCode}

📋 Items:
${itemsList}

💰 Order Total: $${order.total.toFixed(2)}
Subtotal: $${order.subtotal.toFixed(2)}
Tax: $${order.tax.toFixed(2)}
Shipping: $${order.shipping.toFixed(2)}

Please confirm this order and call the customer to arrange delivery.
`;

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  },
};
