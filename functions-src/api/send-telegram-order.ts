interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

interface OrderNotification {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  paymentId: string;
  items: Array<{
    product_name: string;
    quantity: number;
    subtotal: number;
    selected_size?: string | null;
    selected_color?: string | null;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  telegram_bot_token?: string;
  telegram_chat_id?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const order: OrderNotification = await request.json();

    const botToken = order.telegram_bot_token || env.TELEGRAM_BOT_TOKEN;
    const chatId = order.telegram_chat_id || env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return new Response(
        JSON.stringify({ error: 'Telegram not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const itemsList = order.items
      .map(item => {
        let line = `  - ${item.product_name} x${item.quantity} = Rs.${item.subtotal}`;
        if (item.selected_size) line += ` [Size: ${item.selected_size}]`;
        if (item.selected_color) line += ` [Color: ${item.selected_color}]`;
        return line;
      })
      .join('\n');

    const message = [
      `NEW ORDER RECEIVED`,
      ``,
      `Order ID: ${order.orderId}`,
      `Total: Rs.${order.totalAmount}`,
      `Payment ID: ${order.paymentId}`,
      ``,
      `Customer:`,
      `  Name: ${order.customerName}`,
      `  Phone: ${order.customerPhone}`,
      `  Email: ${order.customerEmail}`,
      ``,
      `Items:`,
      itemsList,
      ``,
      `Shipping Address:`,
      `  ${order.shippingAddress.address}`,
      `  ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      ``,
      `Payment Verified Successfully`
    ].join('\n');

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const telegramResult = await telegramResponse.json() as any;

    if (!telegramResponse.ok) {
      console.error('[TELEGRAM] Failed to send:', telegramResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send Telegram notification', details: telegramResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[TELEGRAM] Exception:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};
