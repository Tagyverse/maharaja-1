import { ref, push, set, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';
import type { Order, OrderStats } from '../types/orders';

const ORDERS_PATH = 'orders';

export const orderService = {
  // Create a new order
  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    try {
      const ordersRef = ref(db, ORDERS_PATH);
      const newOrderRef = push(ordersRef);
      const orderId = newOrderRef.key || Date.now().toString();
      
      const fullOrder: Order = {
        ...order,
        id: orderId,
      };

      await set(newOrderRef, fullOrder);
      return fullOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    try {
      const ordersRef = ref(db, ORDERS_PATH);
      const snapshot = await get(ordersRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const orders: Order[] = [];
      snapshot.forEach((childSnapshot) => {
        orders.push(childSnapshot.val());
      });

      return orders.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = ref(db, `${ORDERS_PATH}/${orderId}`);
      const snapshot = await get(orderRef);
      
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const orderRef = ref(db, `${ORDERS_PATH}/${orderId}`);
      await update(orderRef, { status });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Update order
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      const orderRef = ref(db, `${ORDERS_PATH}/${orderId}`);
      await update(orderRef, updates);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Get orders by channel
  async getOrdersByChannel(channel: string): Promise<Order[]> {
    try {
      const orders = await this.getAllOrders();
      return orders.filter(order => order.channel === channel);
    } catch (error) {
      console.error('Error fetching orders by channel:', error);
      throw error;
    }
  },

  // Get orders by status
  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      const orders = await this.getAllOrders();
      return orders.filter(order => order.status === status);
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  },

  // Calculate order statistics
  async getOrderStats(): Promise<OrderStats> {
    try {
      const orders = await this.getAllOrders();
      
      const stats: OrderStats = {
        total: orders.length,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
        byChannel: {
          whatsapp: 0,
          telegram: 0,
          paymentGateway: 0,
        },
      };

      orders.forEach(order => {
        // Count by status
        if (order.status === 'pending') stats.pending++;
        else if (order.status === 'confirmed') stats.confirmed++;
        else if (order.status === 'processing') stats.processing++;
        else if (order.status === 'shipped') stats.shipped++;
        else if (order.status === 'delivered') stats.delivered++;
        else if (order.status === 'cancelled') stats.cancelled++;

        // Count by channel
        if (order.channel === 'whatsapp') stats.byChannel.whatsapp++;
        else if (order.channel === 'telegram') stats.byChannel.telegram++;
        else if (order.channel === 'payment-gateway') stats.byChannel.paymentGateway++;

        // Sum revenue (only from completed/shipped orders)
        if (['delivered', 'shipped', 'confirmed'].includes(order.status)) {
          stats.totalRevenue += order.total;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error calculating order stats:', error);
      throw error;
    }
  },

  // Generate order number
  generateOrderNumber(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  // Generate WhatsApp link
  generateWhatsAppLink(phoneNumber: string, items: Order['items']): string {
    const text = this.generateOrderMessage(items);
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${phoneNumber}?text=${encodedText}`;
  },

  // Generate order message for sharing
  generateOrderMessage(items: any[]): string {
    let message = 'Hello! I would like to place an order:\n\n';
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Price: $${item.price}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Total: $${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `Total Order Value: $${total.toFixed(2)}\n\n`;
    message += 'Please confirm availability and delivery time. Thank you!';

    return message;
  },
};
