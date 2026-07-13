import { Request, Response } from 'express';
import { db } from '../../src/lib/firebase';
import { ref, set, get } from 'firebase/database';
import { createOrder, OrderData } from '../../src/utils/clientCopyFirebase';

interface CreateOrderRequest {
  clientId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  cartTotal: number;
  paymentMethod: 'razorpay' | 'stripe' | 'paypal';
  paymentId: string;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      clientId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items,
      cartTotal,
      paymentMethod,
      paymentId,
    }: CreateOrderRequest = req.body;

    // Validate required fields
    if (!clientId || !customerEmail || !items.length || !cartTotal) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Create order in Firebase
    const order: Omit<OrderData, 'orderId'> = {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items,
      cartTotal,
      paymentMethod,
      paymentStatus: 'pending',
      paymentId,
      orderStatus: 'placed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderId = await createOrder(clientId, order);

    // Send Telegram notification if configured
    await sendTelegramNotification(clientId, orderId, order);

    res.status(201).json({
      success: true,
      orderId,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function sendTelegramNotification(
  clientId: string,
  orderId: string,
  order: Omit<OrderData, 'orderId'>
): Promise<void> {
  try {
    // Fetch Telegram config
    const telegramConfigSnapshot = await get(ref(db, `clients/${clientId}/notifications/telegram`));
    
    if (!telegramConfigSnapshot.exists()) {
      console.log('Telegram not configured for client:', clientId);
      return;
    }

    const telegramConfig = telegramConfigSnapshot.val();
    
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      return;
    }

    // Check if new_order event is enabled
    if (!telegramConfig.enabledEvents?.includes('new_order')) {
      return;
    }

    // Decrypt bot token
    const botToken = atob(telegramConfig.botToken);

    // Format order items
    const itemsList = order.items
      .map(item => `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`)
      .join('\n');

    const message = `🆕 <b>New Order Received!</b>

<b>Order ID:</b> ${orderId}
<b>Customer:</b> ${order.customerName}
<b>Email:</b> ${order.customerEmail}
<b>Phone:</b> ${order.customerPhone}

<b>Items:</b>
${itemsList}

<b>Total:</b> ₹${order.cartTotal}
<b>Payment Method:</b> ${order.paymentMethod}
<b>Status:</b> ${order.orderStatus}

<b>Shipping Address:</b>
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
${order.shippingAddress.country}

<i>Received at: ${new Date(order.createdAt).toLocaleString()}</i>`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    console.log('Telegram notification sent for order:', orderId);
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    // Don't throw - notification failure shouldn't block order creation
  }
}
