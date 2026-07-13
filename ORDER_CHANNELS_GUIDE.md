# Order Channels - Complete Integration Guide

## Overview

The Order Channels feature allows you to enable multiple order methods for your customers:

1. **WhatsApp Orders** - Send customers to WhatsApp for checkout
2. **Telegram Orders** - Admin notifications via Telegram Bot
3. **Prepayment Orders** - Payment gateway integration (Razorpay, PayPal, Stripe)

---

## Setup Instructions

### 1. WhatsApp Orders

**What it does:** When enabled, after adding items to cart, customers are redirected to WhatsApp to complete the order.

**Setup:**
1. Go to SuperAdmin → Rebrand Tool → Order Channels
2. Enable "WhatsApp Orders"
3. Enter your WhatsApp number (format: 919876543210)
4. Save and Publish

**How it works:**
- User adds items to cart → Clicks checkout
- If WhatsApp is enabled, redirected to WhatsApp with pre-filled order details
- Customer confirms order via WhatsApp

**Environment Variable:**
```env
WHATSAPP_NUMBER=919876543210
```

---

### 2. Telegram Admin Notifications

**What it does:** Admin receives instant Telegram notifications for each new order.

**Setup:**
1. Create a Telegram Bot:
   - Chat with @BotFather on Telegram
   - Type `/newbot` and follow instructions
   - Copy the Bot Token (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

2. Get Your Chat ID:
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response (usually negative: `-1001234567890`)

3. Configure in Rebrand Tool:
   - Go to SuperAdmin → Rebrand Tool → Order Channels
   - Enable "Telegram Admin Notifications"
   - Paste Bot Token
   - Paste Chat ID
   - Check "Send admin notifications on new orders"
   - Save and Publish

**What admin receives:**
```
🎉 New Order Received!

👤 Customer: John Doe
📱 Phone: 9876543210
📧 Email: john@example.com

📦 Order ID: ORD-12345
💰 Total Amount: ₹5000

📍 Shipping Address:
123 Main St, City, State 12345

📋 Items:
• Product 1 x2 = ₹2000
• Product 2 x1 = ₹3000

⏰ Time: 13/07/2026, 2:30 PM
```

**Environment Variables:**
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=-1001234567890
```

---

### 3. Prepayment Orders

**What it does:** Customers make payment before order is confirmed.

**Supported Gateways:**
- Razorpay (recommended for India)
- PayPal
- Stripe

**Setup:**
1. Go to SuperAdmin → Rebrand Tool → Order Channels
2. Enable "Prepayment Orders"
3. Select Payment Gateway (default: Razorpay)
4. Ensure gateway credentials are in `.env.production`
5. Save and Publish

**How it works:**
- User adds items and goes to checkout
- Presented with payment gateway
- Payment is verified
- Order is automatically created after successful payment

**Environment Variables (Razorpay):**
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

---

## Configuration Priority

When multiple order channels are enabled, they work in this priority:

1. **Prepayment First** (Razorpay/PayPal/Stripe)
   - User must pay before order is confirmed
   
2. **WhatsApp Second** (if prepayment disabled)
   - User is redirected to WhatsApp to confirm
   
3. **Telegram Third** (if both above disabled)
   - Admin receives notification, admin confirms manually
   
4. **None** (if all disabled)
   - Default Firebase order creation

---

## API Integration

### OrderChannels Utility Functions

Located in `src/utils/orderChannels.ts`:

```typescript
// Send Telegram notification
await notifyTelegram(botToken, chatId, {
  orderId: 'ORD-12345',
  customerName: 'John Doe',
  customerPhone: '9876543210',
  customerEmail: 'john@example.com',
  totalAmount: 5000,
  items: [{ name: 'Product 1', quantity: 2, price: 2000 }],
  shippingAddress: '123 Main St, City'
});

// Generate WhatsApp checkout link
const waLink = generateWhatsAppLink('919876543210', order, 'Sri Maharaja');
window.location.href = waLink;

// Get active channels
const channels = await initializeOrderChannels(orderChannels);

// Determine checkout redirect
const redirect = handleCheckoutRedirect(
  channels,
  whatsappNumber,
  order,
  'Sri Maharaja'
);
```

---

## Database Storage

Order channels settings are stored in Cloudflare R2 in `site-data.json`:

```json
{
  "branding": { ... },
  "order_channels": {
    "whatsappOrders": {
      "enabled": true,
      "phoneNumber": "919876543210",
      "message": "Hi! I'd like to place an order."
    },
    "telegramOrders": {
      "enabled": true,
      "botToken": "123456:ABC-DEF...",
      "chatId": "-1001234567890",
      "notifyAdmin": true
    },
    "prepaymentOrders": {
      "enabled": true,
      "paymentGateway": "razorpay",
      "gatewayKey": "rzp_live_xxxxx"
    }
  }
}
```

---

## Testing

### Test WhatsApp Integration
```javascript
const orderChannels = {
  whatsappOrders: { enabled: true, phoneNumber: '919876543210' }
};
const link = generateWhatsAppLink('919876543210', mockOrder, 'Sri Maharaja');
console.log('WhatsApp Link:', link);
```

### Test Telegram Integration
```javascript
await notifyTelegram(
  botToken,
  chatId,
  {
    orderId: 'TEST-001',
    customerName: 'Test User',
    customerPhone: '9999999999',
    customerEmail: 'test@example.com',
    totalAmount: 1000,
    items: [{ name: 'Test Item', quantity: 1, price: 1000 }],
    shippingAddress: 'Test Address'
  }
);
```

---

## Troubleshooting

### WhatsApp not working
- Check phone number format (should be 91 + 10 digits for India)
- Ensure user has WhatsApp installed
- Test link manually: `https://wa.me/919876543210?text=Hello`

### Telegram notifications not received
- Verify Bot Token is correct: `https://api.telegram.org/bot<TOKEN>/getMe`
- Verify Chat ID is correct (should be negative for groups)
- Check bot has permission to send messages
- View Telegram logs: `https://api.telegram.org/bot<TOKEN>/getUpdates`

### Prepayment not processing
- Verify gateway keys are correct
- Check environment variables are set in Cloudflare
- Ensure payment gateway account is active
- Check browser console for errors

---

## Best Practices

1. **Test on staging** before enabling on production
2. **Keep secrets secure** - never commit bot tokens or keys
3. **Monitor notifications** - check Telegram logs regularly
4. **Have fallback** - always keep at least one payment method enabled
5. **Update phone numbers** - keep WhatsApp and support numbers current

---

## Security Notes

- Bot tokens are stored securely in Cloudflare environment
- Never share bot tokens or API keys in public repositories
- Telegram chat IDs should be kept private
- Payment gateway keys must use live environment only in production

