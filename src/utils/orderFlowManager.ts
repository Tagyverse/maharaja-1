import { OrderFlowMode, PublishedConfig } from '../contexts/ClientConfigContext';

export interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  cartItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  flowMode: OrderFlowMode;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'placed' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

/**
 * Get the next step in the order flow based on the selected mode
 */
export function getOrderFlowSteps(mode: OrderFlowMode): string[] {
  switch (mode) {
    case 'whatsapp-only':
      return ['cart-review', 'customer-info', 'whatsapp-redirect', 'order-confirmation'];
    case 'telegram-only':
      return ['cart-review', 'customer-info', 'order-placed', 'admin-notified'];
    case 'payment':
      return ['cart-review', 'customer-info', 'payment', 'order-confirmation'];
    default:
      return [];
  }
}

/**
 * Get checkout fields required for each flow mode
 */
export function getRequiredCheckoutFields(mode: OrderFlowMode): Array<'name' | 'email' | 'phone' | 'address'> {
  switch (mode) {
    case 'whatsapp-only':
      return ['name', 'phone'];
    case 'telegram-only':
      return ['name', 'email'];
    case 'payment':
      return ['name', 'email', 'phone', 'address'];
    default:
      return [];
  }
}

/**
 * Handle WhatsApp-only order flow
 */
export function handleWhatsAppFlow(
  order: OrderData,
  whatsappNumber: string
): { redirectUrl: string; message: string } {
  const orderSummary = order.cartItems
    .map(item => `${item.name} x${item.quantity} = Rs.${item.price * item.quantity}`)
    .join('\n');

  const message = `Hello! I would like to place an order:\n\n${orderSummary}\n\nTotal: Rs.${order.totalAmount}\n\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}`;

  const encodedMessage = encodeURIComponent(message);
  const redirectUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return { redirectUrl, message };
}

/**
 * Handle Telegram-only order flow (notify admin)
 */
export async function handleTelegramFlow(
  order: OrderData,
  botToken: string,
  chatId: string
): Promise<boolean> {
  const orderSummary = order.cartItems
    .map(item => `${item.name} x${item.quantity} = Rs.${item.price * item.quantity}`)
    .join('\n');

  const message = `📦 New Order Placed!\n\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\n\nOrder Details:\n${orderSummary}\n\nTotal: Rs.${order.totalAmount}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[v0] Telegram notification failed:', error);
    return false;
  }
}

/**
 * Get UI configuration for checkout based on flow mode
 */
export function getCheckoutUIConfig(mode: OrderFlowMode) {
  switch (mode) {
    case 'whatsapp-only':
      return {
        showPaymentFields: false,
        showShippingFields: false,
        submitButtonText: 'Send Order via WhatsApp',
        subtitle: 'Complete the order details and we\'ll connect via WhatsApp',
        redirectMessage: 'Redirecting to WhatsApp...',
      };
    case 'telegram-only':
      return {
        showPaymentFields: false,
        showShippingFields: true,
        submitButtonText: 'Place Order',
        subtitle: 'We\'ll confirm your order via Telegram',
        redirectMessage: 'Order placed! Check your email for confirmation.',
      };
    case 'payment':
      return {
        showPaymentFields: true,
        showShippingFields: true,
        submitButtonText: 'Pay Now',
        subtitle: 'Complete payment to confirm your order',
        redirectMessage: 'Processing payment...',
      };
    default:
      return {};
  }
}

/**
 * Validate order data based on flow mode requirements
 */
export function validateOrderForFlow(order: Partial<OrderData>, mode: OrderFlowMode): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredFields = getRequiredCheckoutFields(mode);

  if (requiredFields.includes('name') && !order.customerName) {
    errors.push('Customer name is required');
  }
  if (requiredFields.includes('email') && !order.customerEmail) {
    errors.push('Email is required');
  }
  if (requiredFields.includes('phone') && !order.customerPhone) {
    errors.push('Phone number is required');
  }
  if (requiredFields.includes('address') && !order.shippingAddress) {
    errors.push('Shipping address is required');
  }

  if (!order.cartItems || order.cartItems.length === 0) {
    errors.push('Cart is empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
