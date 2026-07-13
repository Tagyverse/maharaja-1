# ClientCopy System - Deployment & Testing Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] All environment variables set in `.env.local` and `.env.production`
- [ ] Firebase credentials validated and keys set correctly
- [ ] Payment gateway test keys configured (Razorpay, Stripe, PayPal)
- [ ] Webhook URLs registered in payment platforms
- [ ] R2/Blob storage configured and tested
- [ ] Telegram bot token obtained and configured

### 2. Firebase Setup
```bash
# Verify Firebase Security Rules
firebase rules:publish

# Rules for /clients/{clientId}/** should allow:
# - Read/Write for authenticated users owning the client
# - Admin access to /admin/**
# - Public read for published configs at /publishConfig/**

# Verify Firebase indexes for queries
firebase firestore:indexes
```

### 3. Database Schema Initialization
```bash
# Initialize Firebase with required structure
node scripts/init-firebase-schema.js

# Expected structure:
# /clients/{clientId}/
#   - rebrand/
#   - payments/
#   - notifications/
#   - publishConfig/
#   - orders/
```

## Deployment Steps

### Step 1: Local Build & Testing
```bash
# Install dependencies
pnpm install

# Run type check
pnpm type-check

# Run linter
pnpm lint

# Build for production
pnpm build

# Test local build
pnpm start
```

### Step 2: Function Deployment (if using serverless)
```bash
# Deploy to Vercel Functions
vercel deploy --prod

# Or deploy to Cloudflare Workers
wrangler publish

# Or deploy to AWS Lambda (if configured)
sam build && sam deploy
```

### Step 3: Verify API Endpoints
```bash
# Test each endpoint with curl or Postman

# Test Payment Processing
curl -X POST https://your-domain.com/api/process-payment \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-client",
    "gateway": "razorpay",
    "amount": 999,
    "currency": "INR"
  }'

# Test Order Creation
curl -X POST https://your-domain.com/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-client",
    "customerId": "test-user",
    "customerName": "Test User",
    "customerPhone": "9999999999",
    "customerEmail": "test@example.com"
  }'

# Test Telegram Notification
curl -X POST https://your-domain.com/api/send-telegram-notification \
  -H "Content-Type: application/json" \
  -d '{
    "botToken": "YOUR_BOT_TOKEN",
    "chatId": "YOUR_CHAT_ID",
    "message": "Test notification"
  }'

# Test R2 Publishing
curl -X POST https://your-domain.com/api/publish-client-config \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-client",
    "data": {"config": "test"}
  }'
```

### Step 4: Deploy Frontend
```bash
# Deploy to Vercel
vercel deploy --prod

# Verify deployment
vercel list deployments
```

## End-to-End Testing

### Test 1: Client Setup & Rebrand
```
1. Navigate to /clientcopy
2. Fill in all rebrand fields:
   - Logo (upload or URL)
   - Brand colors (primary, accent, neutral)
   - Typography (fonts and sizes)
   - Navigation settings
   - Visibility toggles
3. Click "Preview" - verify all changes appear
4. Click "Save Configuration"
5. Verify data saved to Firebase at /clients/{clientId}/rebrand
6. Click "Publish to R2"
7. Verify URL returned and saved to /clients/{clientId}/publishConfig
```

### Test 2: Payment Gateway Setup
```
1. In /clientcopy, go to "Payments" tab
2. Select Razorpay as primary gateway
3. Toggle "Test Mode" on
4. Enter test keys from Razorpay dashboard
5. Click "Verify Keys"
6. Verify connection success
7. Add Stripe as secondary gateway
8. Repeat for PayPal
9. Save configuration
10. Verify all saved to /clients/{clientId}/payments
```

### Test 3: WhatsApp Configuration
```
1. In /clientcopy, go to "WhatsApp" tab
2. Enter business WhatsApp number (with country code)
3. Configure message templates
4. Toggle "Pre-Payment Engagement" and "Post-Payment Engagement"
5. Save and verify in Firebase
```

### Test 4: Telegram Bot Setup
```
1. Create bot with @BotFather on Telegram
2. Copy bot token to /clientcopy "Telegram" tab
3. Add yourself as admin and get chat ID
4. Enter chat ID
5. Configure enabled events (new_order, payment_received, etc.)
6. Click "Test Connection"
7. Verify test message received
8. Save configuration
```

### Test 5: Complete Checkout Flow
```
1. Browse to /shop
2. Add items to cart
3. Click checkout
4. Fill in shipping details
5. Select payment method (Razorpay in test mode)
6. Complete payment with test card:
   - Card: 4111111111111111
   - Expiry: Any future date
   - CVV: Any 3 digits
7. After payment:
   - Verify order created in Firebase (/clients/{clientId}/orders/{orderId})
   - Verify Telegram notification received
   - Verify WhatsApp button appears and links correctly
8. Test WhatsApp link - should open with pre-filled message
```

### Test 6: Order Management
```
1. In /clientcopy, go to "Orders" tab
2. Verify recent order appears with:
   - Order ID
   - Customer name and email
   - Total amount
   - Payment status
   - Order status
3. Click on order - verify details modal shows
4. Test status updates:
   - Update "processing" status to "shipped"
   - Verify update saved
   - Verify Telegram notification sent (if configured)
```

### Test 7: Multi-Client Isolation
```
1. Create new client config:
   - Navigate to /clientcopy?clientId=client2
   - Fill in different rebrand settings
   - Save and publish
2. Switch between clients:
   - Verify each has their own colors/branding
   - Verify data doesn't leak between clients
3. Check Firebase structure:
   - Verify separate /clients/client1/ and /clients/client2/ branches
```

### Test 8: Responsive Design
```
For each major screen:
- Mobile (375px)
- Tablet (768px)
- Desktop (1024px+)

Test:
1. Homepage loads correctly
2. Navigation responsive
3. Product grid responsive
4. Checkout form functional
5. /clientcopy editor usable on mobile
```

### Test 9: Error Handling
```
1. Payment Error:
   - Attempt payment with insufficient funds
   - Verify error message displayed
   - Verify order not created
   
2. Network Error:
   - Disable internet during checkout
   - Verify graceful error handling
   - Verify retry option available
   
3. Invalid Config:
   - Try to save incomplete rebrand config
   - Verify validation errors shown
   
4. Firebase Error:
   - Disable Firebase connection
   - Verify app shows error state
   - Verify recovery when connection restored
```

### Test 10: Security
```
1. Authentication:
   - Verify only authenticated users access /clientcopy
   - Verify redirect to login for unauthorized users
   
2. Data Privacy:
   - Verify clientId required for all operations
   - Verify one client can't access another's data
   - Verify payment credentials encrypted
   
3. Webhook Verification:
   - Verify payment webhook signatures validated
   - Attempt to send fake webhook
   - Verify rejected with security error
   
4. XSS Prevention:
   - Test HTML injection in rebrand fields
   - Verify properly escaped/sanitized
```

## Performance Benchmarks

### Target Metrics
- Page Load: < 3s (homepage)
- Checkout: < 2s (load to payment)
- API Response: < 1s (average)
- Firebase Query: < 500ms
- R2 Upload: < 3s (for 1MB config)

### Monitoring
```bash
# Setup Vercel Analytics
vercel analytics enable

# Monitor Firebase performance
- Go to Firebase Console > Performance
- Monitor query latencies
- Check function execution times
```

## Rollback Procedures

### If Issues Found

1. **Frontend Issues**
   ```bash
   vercel rollback
   # Or deploy previous version
   vercel deploy --prod --prebuilt
   ```

2. **API Issues**
   ```bash
   # Revert function deployment
   vercel env pull  # Get last working env
   vercel deploy --prod
   ```

3. **Database Issues**
   ```bash
   # Restore Firebase backup
   firebase database:get /clients > backup.json
   # Manual restore if needed
   ```

## Post-Deployment Verification

### Day 1
- [ ] Monitoring alerts configured
- [ ] Error logs reviewed (should be minimal)
- [ ] At least 1 test order completed successfully
- [ ] Webhook events processed correctly
- [ ] Telegram/WhatsApp notifications working

### Day 7
- [ ] Performance metrics reviewed
- [ ] No critical errors in logs
- [ ] Multiple clients tested
- [ ] Payment processing tested with multiple gateways
- [ ] R2 publishing tested

### Month 1
- [ ] All features used by clients
- [ ] Performance optimized if needed
- [ ] Security audit completed
- [ ] Backup procedures tested
- [ ] Disaster recovery plan validated

## Monitoring & Maintenance

### Daily Checks
- [ ] Check error logs (Vercel, Firebase)
- [ ] Verify payment webhook processing
- [ ] Confirm orders being created
- [ ] Check Telegram notifications

### Weekly Checks
- [ ] Review performance metrics
- [ ] Verify database backups
- [ ] Check API response times
- [ ] Review user feedback

### Monthly Tasks
- [ ] Security patches applied
- [ ] Dependencies updated
- [ ] Performance optimization
- [ ] Capacity planning review

## Support Resources

### Documentation
- Firebase: https://firebase.google.com/docs
- Razorpay: https://razorpay.com/docs
- Stripe: https://stripe.com/docs
- Telegram Bot API: https://core.telegram.org/bots/api

### Debugging
- Firebase Console: https://console.firebase.google.com
- Vercel Dashboard: https://vercel.com/dashboard
- Payment Dashboard: Respective payment platform dashboard

### Emergency Contacts
- Firebase Support: support@firebase.google.com
- Payment Provider Support: See respective docs
- Team Slack: #clientcopy-support
