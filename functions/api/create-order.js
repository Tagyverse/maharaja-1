import { db } from "../../src/lib/firebase";
import { ref, get } from "firebase/database";
import { createOrder } from "../../src/utils/clientCopyFirebase";
async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
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
      paymentId
    } = req.body;
    if (!clientId || !customerEmail || !items.length || !cartTotal) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const order = {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items,
      cartTotal,
      paymentMethod,
      paymentStatus: "pending",
      paymentId,
      orderStatus: "placed",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const orderId = await createOrder(clientId, order);
    await sendTelegramNotification(clientId, orderId, order);
    res.status(201).json({
      success: true,
      orderId,
      message: "Order created successfully"
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Failed to create order",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
async function sendTelegramNotification(clientId, orderId, order) {
  try {
    const telegramConfigSnapshot = await get(ref(db, `clients/${clientId}/notifications/telegram`));
    if (!telegramConfigSnapshot.exists()) {
      console.log("Telegram not configured for client:", clientId);
      return;
    }
    const telegramConfig = telegramConfigSnapshot.val();
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      return;
    }
    if (!telegramConfig.enabledEvents?.includes("new_order")) {
      return;
    }
    const botToken = atob(telegramConfig.botToken);
    const itemsList = order.items.map((item) => `\u2022 ${item.name} x${item.quantity} - \u20B9${item.price * item.quantity}`).join("\n");
    const message = `\u{1F195} <b>New Order Received!</b>

<b>Order ID:</b> ${orderId}
<b>Customer:</b> ${order.customerName}
<b>Email:</b> ${order.customerEmail}
<b>Phone:</b> ${order.customerPhone}

<b>Items:</b>
${itemsList}

<b>Total:</b> \u20B9${order.cartTotal}
<b>Payment Method:</b> ${order.paymentMethod}
<b>Status:</b> ${order.orderStatus}

<b>Shipping Address:</b>
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
${order.shippingAddress.country}

<i>Received at: ${new Date(order.createdAt).toLocaleString()}</i>`;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: message,
        parse_mode: "HTML"
      })
    });
    console.log("Telegram notification sent for order:", orderId);
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}
export {
  handler as default
};
