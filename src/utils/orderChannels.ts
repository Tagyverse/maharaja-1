import type { OrderChannelSettings } from '../types/branding';

interface OrderNotification {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: string;
}

/**
 * Send order notification via Telegram Bot API
 */
export async function notifyTelegram(
  botToken: string,
  chatId: string,
  order: OrderNotification
): Promise<boolean> {
  try {
    const message = `
🎉 *New Order Received!*

👤 *Customer:* ${order.customerName}
📱 *Phone:* ${order.customerPhone}
📧 *Email:* ${order.customerEmail}

📦 *Order ID:* ${order.orderId}
💰 *Total Amount:* ₹${order.totalAmount}

📍 *Shipping Address:*
${order.shippingAddress}

📋 *Items:*
${order.items.map(item => `• ${item.name} x${item.quantity} = ₹${item.price}`).join('\n')}

⏰ *Time:* ${new Date().toLocaleString()}
    `;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    console.log('[TELEGRAM] Notification sent:', result);
    return result.ok || false;
  } catch (error) {
    console.error('[TELEGRAM] Failed to send notification:', error);
    return false;
  }
}

/**
 * Generate WhatsApp checkout link
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  order: OrderNotification,
  appName: string = 'Sri Maharaja'
): string {
  const message = `Hi! I'd like to place an order.

Order ID: ${order.orderId}
Total: ₹${order.totalAmount}

Items:
${order.items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}

Please confirm this order.`;

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Initialize order channels based on published branding settings
 */
export async function initializeOrderChannels(
  orderChannels?: OrderChannelSettings
): Promise<{ whatsapp: boolean; telegram: boolean; prepayment: boolean }> {
  return {
    whatsapp: orderChannels?.whatsappOrders?.enabled || false,
    telegram: orderChannels?.telegramOrders?.enabled || false,
    prepayment: orderChannels?.prepaymentOrders?.enabled || false,
  };
}

/**
 * Handle checkout redirection based on enabled channels
 */
export function handleCheckoutRedirect(
  channels: { whatsapp: boolean; telegram: boolean; prepayment: boolean },
  whatsappNumber?: string,
  order?: OrderNotification,
  appName?: string
): 'whatsapp' | 'telegram' | 'prepayment' | 'none' {
  // Priority order: prepayment > whatsapp > telegram > none
  if (channels.prepayment) {
    return 'prepayment';
  }
  if (channels.whatsapp && whatsappNumber && order) {
    return 'whatsapp';
  }
  if (channels.telegram) {
    return 'telegram';
  }
  return 'none';
}

export type { OrderChannelSettings, OrderNotification };
