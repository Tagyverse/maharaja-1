# Order Channels - Quick Start (5 Minutes)

## Three Order Methods Now Available

### 1️⃣ WhatsApp Orders
```
SuperAdmin → Rebrand Tool → Order Channels Tab
↓
Enable "WhatsApp Orders" 
↓
Enter your WhatsApp number (e.g., 919876543210)
↓
Save → Publish
```
**Result:** Customers redirected to WhatsApp after cart

---

### 2️⃣ Telegram Admin Notifications
```
Create Telegram Bot:
1. Chat @BotFather on Telegram
2. Type /newbot and follow steps
3. Copy Bot Token

Get Chat ID:
1. Send message to your bot
2. Visit: https://api.telegram.org/bot<TOKEN>/getUpdates
3. Copy your Chat ID (negative number)

Configure:
1. SuperAdmin → Rebrand Tool → Order Channels Tab
2. Enable "Telegram Admin Notifications"
3. Paste Bot Token & Chat ID
4. Enable "Send admin notifications"
5. Save → Publish
```
**Result:** Admin gets instant order notifications via Telegram

---

### 3️⃣ Prepayment Orders
```
SuperAdmin → Rebrand Tool → Order Channels Tab
↓
Enable "Prepayment Orders"
↓
Select Payment Gateway (Razorpay/PayPal/Stripe)
↓
Save → Publish
```
**Result:** Payment required before order confirmation

---

## Configuration Priority

If multiple channels enabled, this order is used:

1. **Prepayment** ← Try first (payment required)
2. **WhatsApp** ← Try second (if prepay disabled)
3. **Telegram** ← Try third (if both disabled)
4. **None** ← Default Firebase

---

## What Happens When Enabled

### WhatsApp Enabled:
```
Customer adds items
        ↓
Clicks Checkout
        ↓
Redirected to WhatsApp chat
        ↓
Confirms order via message
        ↓
Order created in Firebase
```

### Telegram Enabled:
```
Customer places order
        ↓
Admin receives Telegram notification
        ↓
Admin reviews order details
        ↓
Order processing starts
```

### Prepayment Enabled:
```
Customer adds items
        ↓
Clicks Checkout
        ↓
Payment gateway appears
        ↓
Customer pays securely
        ↓
Order auto-created
        ↓
Confirmation email sent
```

---

## Testing Each Channel

### Test WhatsApp
1. Enable in Rebrand Tool
2. Add item to cart
3. Checkout
4. Should open WhatsApp

### Test Telegram
1. Enable in Rebrand Tool  
2. Place test order
3. Check your Telegram
4. Should receive notification

### Test Prepayment
1. Enable in Rebrand Tool
2. Add item to cart
3. Checkout
4. Payment form should appear
5. Complete test payment

---

## Deployment Checklist

- [ ] Enable desired order channels in Rebrand Tool
- [ ] Enter all required credentials
- [ ] Save to Firebase
- [ ] Publish to Cloudflare
- [ ] Test WhatsApp redirect (if enabled)
- [ ] Test Telegram notification (if enabled)
- [ ] Test payment gateway (if enabled)
- [ ] Deploy: `npm run build && wrangler pages deploy dist`

---

## Environment Variables to Set

In `.env.production`:

```env
# WhatsApp
WHATSAPP_NUMBER=919876543210

# Telegram (optional, also in Rebrand Tool)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=-1001234567890

# Razorpay (if prepayment enabled)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

---

## Support

**WhatsApp not working?**
- Format should be: 91 + 10 digits (for India)
- User must have WhatsApp installed
- Test: `https://wa.me/919876543210`

**Telegram not receiving notifications?**
- Verify bot token: `https://api.telegram.org/bot<TOKEN>/getMe`
- Verify chat ID is correct (should be negative)
- Check bot has permission to send messages

**Prepayment failing?**
- Verify gateway keys are correct in env
- Ensure payment gateway account is active
- Check browser console for errors

---

## What's Stored Where

**Local:** Firebase Realtime Database
**Production:** Cloudflare R2 in `site-data.json`

Both sync automatically when you Save & Publish.

---

## Done! 🎉

Your store now supports:
- ✓ WhatsApp orders
- ✓ Telegram notifications
- ✓ Prepayment orders

All configurable from one Rebrand Tool!
