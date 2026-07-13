async function verifyWebhookSignature(body, signature, secret) {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body)
    );
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return expectedSignature === signature;
  } catch (error) {
    console.error("[WEBHOOK] Signature verification error:", error);
    return false;
  }
}
async function findAndUpdateOrderInFirebase(firebaseUrl, razorpayOrderId, paymentId, status) {
  try {
    let orders = null;
    const indexedUrl = `${firebaseUrl}/orders.json?orderBy="razorpay_order_id"&equalTo="${razorpayOrderId}"`;
    const indexedResponse = await fetch(indexedUrl);
    if (indexedResponse.ok) {
      const result = await indexedResponse.json();
      if (result && Object.keys(result).length > 0) {
        orders = result;
      }
    } else {
      console.warn("[WEBHOOK] Indexed query failed, falling back to scan");
    }
    if (!orders) {
      const allOrdersUrl = `${firebaseUrl}/orders.json?limitToLast=100`;
      const allResponse = await fetch(allOrdersUrl);
      if (!allResponse.ok) {
        console.error("[WEBHOOK] Firebase fetch failed:", allResponse.status);
        return false;
      }
      const allOrders = await allResponse.json();
      if (!allOrders) {
        console.warn("[WEBHOOK] No orders in database");
        return false;
      }
      orders = {};
      for (const [key, value] of Object.entries(allOrders)) {
        if (value?.razorpay_order_id === razorpayOrderId) {
          orders[key] = value;
          break;
        }
      }
    }
    if (!orders || Object.keys(orders).length === 0) {
      console.warn("[WEBHOOK] No order found for:", razorpayOrderId);
      return false;
    }
    const orderId = Object.keys(orders)[0];
    const existingOrder = orders[orderId];
    if (existingOrder.payment_status === "completed") {
      console.log("[WEBHOOK] Already completed:", orderId);
      return true;
    }
    const updateData = {
      razorpay_payment_id: paymentId,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (status === "completed") {
      updateData.payment_status = "completed";
      updateData.order_status = "processing";
    } else {
      updateData.payment_status = "failed";
      updateData.order_status = "cancelled";
    }
    const updateUrl = `${firebaseUrl}/orders/${orderId}.json`;
    const updateResponse = await fetch(updateUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    });
    if (!updateResponse.ok) {
      console.error("[WEBHOOK] Update failed:", updateResponse.status, await updateResponse.text());
      return false;
    }
    console.log("[WEBHOOK] Updated order:", orderId, "status:", status);
    return true;
  } catch (error) {
    console.error("[WEBHOOK] Error:", error);
    return false;
  }
}
function extractPaymentInfo(webhookData) {
  if (webhookData?.payload?.payment?.entity) {
    const payment = webhookData.payload.payment.entity;
    return { orderId: payment.order_id, paymentId: payment.id };
  }
  if (webhookData?.payload?.order?.entity) {
    const order = webhookData.payload.order.entity;
    const paymentEntity = webhookData.payload?.payment?.entity;
    return {
      orderId: order.id,
      paymentId: paymentEntity?.id || ""
    };
  }
  return null;
}
const onRequestGet = async (context) => {
  return new Response(
    JSON.stringify({
      status: "active",
      message: "Payment webhook endpoint is working",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      hasSecret: !!context.env.RAZORPAY_WEBHOOK_SECRET,
      hasFirebaseUrl: !!context.env.FIREBASE_DATABASE_URL
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};
const onRequestPost = async (context) => {
  const { request, env } = context;
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const rawBody = await request.text();
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error("[WEBHOOK] Invalid signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const webhookData = JSON.parse(rawBody);
    const eventType = webhookData.event;
    console.log("[WEBHOOK] Event:", eventType);
    const paymentInfo = extractPaymentInfo(webhookData);
    if (!paymentInfo || !paymentInfo.orderId) {
      console.error("[WEBHOOK] No payment info in event:", eventType);
      return new Response(
        JSON.stringify({ status: "ok", note: "No payment info" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("[WEBHOOK] Order:", paymentInfo.orderId, "Payment:", paymentInfo.paymentId);
    const firebaseUrl = env.FIREBASE_DATABASE_URL;
    if (!firebaseUrl) {
      console.error("[WEBHOOK] FIREBASE_DATABASE_URL not configured");
      return new Response(
        JSON.stringify({ status: "ok", warning: "Firebase URL not configured" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    let status = "completed";
    switch (eventType) {
      case "payment.captured":
      case "order.paid":
        status = "completed";
        break;
      case "payment.failed":
        status = "failed";
        break;
      default:
        console.log("[WEBHOOK] Unhandled event:", eventType);
        return new Response(
          JSON.stringify({ status: "ok", note: "Event not handled" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
    }
    const updated = await findAndUpdateOrderInFirebase(
      firebaseUrl,
      paymentInfo.orderId,
      paymentInfo.paymentId,
      status
    );
    console.log("[WEBHOOK] Result:", { event: eventType, updated });
    return new Response(
      JSON.stringify({ status: "ok", updated }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
export {
  onRequestGet,
  onRequestPost
};
