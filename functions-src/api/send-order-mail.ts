interface Env {
  RESEND_API_KEY: string;
  FIREBASE_DATABASE_URL: string;
}

interface OrderItem {
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  selected_size?: string | null;
  selected_color?: string | null;
  product_image?: string | null;
}

interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress | string;
  total_amount: number;
  subtotal: number;
  shipping_charge: number;
  tax_amount: number;
  discount?: number;
  razorpay_payment_id?: string;
  payment_id?: string;
  order_items?: OrderItem[];
  items?: OrderItem[];
}

const LOGO_URL = '';

function formatShippingAddress(addr: ShippingAddress | string): string {
  if (typeof addr === 'string') return addr;
  const parts = [];
  if (addr.address) parts.push(addr.address);
  if (addr.city) parts.push(addr.city);
  if (addr.state) parts.push(addr.state);
  if (addr.pincode) parts.push(addr.pincode);
  return parts.join(', ');
}

function generateEmailHTML(order: OrderData, orderId: string): string {
  const orderItems = order.order_items || order.items || [];

  const itemsHTML = orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 16px 12px; border-bottom: 1px solid #f3f0eb;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="vertical-align: top; padding-right: 12px;">
            ${
              item.product_image
                ? `<img src="${item.product_image}" alt="${item.product_name}" width="56" height="56" style="width: 56px; height: 56px; object-fit: cover; border-radius: 10px; border: 1px solid #e8e4df; display: block;" />`
                : `<div style="width: 56px; height: 56px; background: #f9f6f2; border-radius: 10px;"></div>`
            }
          </td>
          <td style="vertical-align: top;">
            <p style="margin: 0; font-weight: 500; color: #2d2a26; font-size: 14px;">${item.product_name}</p>
            ${item.selected_size ? `<p style="margin: 2px 0 0; color: #8a857e; font-size: 12px;">Size: ${item.selected_size}</p>` : ""}
            ${item.selected_color ? `<p style="margin: 2px 0 0; color: #8a857e; font-size: 12px;">Color: ${item.selected_color}</p>` : ""}
            <p style="margin: 4px 0 0; color: #8a857e; font-size: 12px;">Qty: ${item.quantity}</p>
          </td>
        </tr></table>
      </td>
      <td style="padding: 16px 12px; border-bottom: 1px solid #f3f0eb; text-align: right; font-weight: 500; color: #2d2a26; font-size: 14px; vertical-align: top;">
        &#8377;${(item.subtotal || item.product_price * item.quantity).toLocaleString("en-IN")}
      </td>
    </tr>`
    )
    .join("");

  const shippingFormatted = formatShippingAddress(order.shipping_address);
  const discount = order.discount || 0;
  const paymentId = order.razorpay_payment_id || order.payment_id || 'N/A';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">

    <!-- Header -->
    <div style="text-align: center; padding: 32px 24px; background: linear-gradient(135deg, #f0fdf4 0%, #fef9ec 100%); border-radius: 20px 20px 0 0;">
      <img src="${LOGO_URL}" alt="Sri Maharaja" width="64" height="64" style="width: 64px; height: 64px; object-fit: contain; border-radius: 16px; margin-bottom: 12px; display: inline-block;" />
      <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">
        Thank you, ${order.customer_name}!
      </h1>
      <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
        Your order has been confirmed
      </p>
      <div style="margin-top: 16px; display: inline-block; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 16px;">
        <span style="color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</span><br/>
        <span style="color: #1a1a1a; font-weight: 600; font-size: 14px;">#${orderId.slice(-8).toUpperCase()}</span>
      </div>
    </div>

    <!-- Items -->
    <div style="background: #ffffff; padding: 24px; border-left: 1px solid #f0ede8; border-right: 1px solid #f0ede8;">
      <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
        Your Items
      </h2>
      ${orderItems.length > 0 ? `
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      ` : `<p style="color: #8a857e; font-size: 14px;">No items found in order data</p>`}

      <!-- Totals -->
      <div style="margin-top: 20px; padding-top: 16px; border-top: 2px dashed #f0ede8;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 13px;">Subtotal</td>
            <td style="padding: 4px 0; text-align: right; color: #2d2a26; font-size: 13px;">&#8377;${(order.subtotal || 0).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 13px;">Shipping</td>
            <td style="padding: 4px 0; text-align: right; color: #2d2a26; font-size: 13px;">${(order.shipping_charge || 0) > 0 ? `&#8377;${order.shipping_charge.toLocaleString("en-IN")}` : "Free"}</td>
          </tr>
          ${(order.tax_amount || 0) > 0 ? `<tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 13px;">Tax</td>
            <td style="padding: 4px 0; text-align: right; color: #2d2a26; font-size: 13px;">&#8377;${order.tax_amount.toLocaleString("en-IN")}</td>
          </tr>` : ""}
          ${discount > 0 ? `<tr>
            <td style="padding: 4px 0; color: #059669; font-size: 13px;">Discount</td>
            <td style="padding: 4px 0; text-align: right; color: #059669; font-size: 13px;">-&#8377;${discount.toLocaleString("en-IN")}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 12px 0 4px; font-weight: 700; color: #1a1a1a; font-size: 16px; border-top: 1px solid #f0ede8;">Total</td>
            <td style="padding: 12px 0 4px; text-align: right; font-weight: 700; color: #1a1a1a; font-size: 16px; border-top: 1px solid #f0ede8;">&#8377;${(order.total_amount || 0).toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Shipping Address -->
    <div style="background: #ffffff; padding: 24px; border-left: 1px solid #f0ede8; border-right: 1px solid #f0ede8; border-top: 1px solid #f0ede8;">
      <h2 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
        Shipping To
      </h2>
      <p style="margin: 0; color: #2d2a26; font-size: 14px; line-height: 1.6;">
        ${order.customer_name}<br/>
        ${shippingFormatted}<br/>
        Phone: ${order.customer_phone || 'N/A'}
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 28px 24px; background: linear-gradient(135deg, #f0fdf4 0%, #fef9ec 100%); border-radius: 0 0 20px 20px; border-top: 1px solid #f0ede8;">
      <img src="${LOGO_URL}" alt="Sri Maharaja" width="32" height="32" style="width: 32px; height: 32px; object-fit: contain; display: inline-block; margin-bottom: 8px;" />
      <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #2d2a26;">
        Sri Maharaja
      </p>
      <p style="margin: 0; color: #8a857e; font-size: 12px;">
        Handcrafted with love, just for you
      </p>
      <p style="margin: 16px 0 0; color: #b0aaa3; font-size: 11px;">
        Payment ID: ${paymentId}
      </p>
    </div>

  </div>
</body>
</html>`;
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
    const { email, orderId } = await request.json() as { email: string; orderId: string };

    if (!email || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Email and Order ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!env.RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firebaseUrl = env.FIREBASE_DATABASE_URL || 'https://maharajagroups-29c74-default-rtdb.firebaseio.com';
    const orderResponse = await fetch(`${firebaseUrl}/orders/${orderId}.json`);

    if (!orderResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order from Firebase' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderData = await orderResponse.json() as OrderData | null;

    if (!orderData) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailHTML = generateEmailHTML(orderData, orderId);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Sri Maharaja <orders@srimaharaja.com>',
        to: [email],
        subject: `Order Confirmed! #${orderId.slice(-8).toUpperCase()} - Sri Maharaja`,
        html: emailHTML,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Internal error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
