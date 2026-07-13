# ClientCopy System Integration Guide

## Overview
The ClientCopy system has been successfully created with a complete client-facing setup interface. This guide explains how to integrate it with the existing homepage and remove the rebrand functionality from SuperAdmin.

## Architecture

### New Components Created
- **ClientCopy Page** (`src/pages/ClientCopy.tsx`) - Main client setup interface
- **RebrandEditor** (`src/components/clientcopy/RebrandEditor.tsx`) - Rebrand configuration
- **PaymentConfig** (`src/components/clientcopy/PaymentConfig.tsx`) - Payment gateway setup
- **WhatsAppConfig** (`src/components/clientcopy/WhatsAppConfig.tsx`) - WhatsApp integration
- **TelegramConfig** (`src/components/clientcopy/TelegramConfig.tsx`) - Telegram bot setup
- **DataPublish** (`src/components/clientcopy/DataPublish.tsx`) - R2 publishing control
- **OrdersManager** (`src/components/clientcopy/OrdersManager.tsx`) - Order management

### API Endpoints Created
- `POST /api/process-payment` - Payment gateway handler (Razorpay, Stripe, PayPal)
- `POST /api/create-order` - Order creation with Firebase storage
- `POST /api/payment-webhook` - Webhook handler for payment updates
- `POST /api/send-telegram-notification` - Telegram message sender
- `POST /api/publish-client-config` - R2/Blob publishing

### Firebase Schema
```
/clients/{clientId}/
├── rebrand/
│   ├── logo, favicon, colors, typography, navigation, termsAndConditions, visibleSections
├── payments/
│   ├── primaryGateway, testMode, gateways (razorpay, stripe, paypal)
├── notifications/
│   ├── whatsapp/ (businessNumber, prePaymentEnabled, postPaymentEnabled)
│   └── telegram/ (botToken, chatId, enabledEvents)
├── publishConfig/
│   ├── lastPublished, r2Url
└── orders/
    └── {orderId}/ (order records)
```

## Integration Steps

### 1. Homepage Integration with R2 Config Loading

Add this to `src/pages/Home.tsx`:

```tsx
// In imports
import { useClientConfig } from '../hooks/useClientConfig';

// In component
const { rebrand, payment, whatsapp, loading: configLoading } = useClientConfig(clientId);

// Show setup required screen if rebrand not complete
if (appReady && rebrand?.status === 'incomplete') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Site Under Setup</h1>
        <p className="text-gray-600 mb-6">
          The store is currently being set up. Please check back soon!
        </p>
        <a href="/clientcopy" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          Go to Setup
        </a>
      </div>
    </div>
  );
}

// Apply rebrand colors if available
if (rebrand?.colors) {
  document.documentElement.style.setProperty('--color-primary', rebrand.colors.primary);
  document.documentElement.style.setProperty('--color-accent', rebrand.colors.accent);
}
```

### 2. Post-Payment Flow Integration

In `src/pages/Checkout.tsx`, integrate the PostPaymentFlow:

```tsx
import PostPaymentFlow from '../components/PostPaymentFlow';

// After successful payment
if (paymentSuccessful) {
  return (
    <PostPaymentFlow
      clientId={clientId}
      orderId={orderId}
      customerName={formData.name}
      customerEmail={formData.email}
      cartTotal={total}
      itemsCount={items.length}
      onClose={() => handleNavigate('home')}
    />
  );
}
```

### 3. Remove Rebrand from SuperAdmin

In `src/pages/SuperAdmin.tsx`:

```tsx
// REMOVE: The RebrandTool component and its import
// REMOVE: The rebrand tab/section from the UI
// REMOVE: Any rebrand-related state and handlers

// Replace with note pointing to /clientcopy
<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
  <p className="text-sm text-blue-900">
    Rebrand functionality has moved to the <a href="/clientcopy" className="font-semibold underline">Client Setup page</a>.
    Please use that interface for all store customization.
  </p>
</div>
```

### 4. Navigation Updates

Ensure navigation includes link to /clientcopy for authenticated admin users:

```tsx
// In Navigation component
{user && isAdmin && (
  <button onClick={() => navigate('/clientcopy')} className="...">
    Store Setup
  </button>
)}
```

## Environment Variables Required

```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Payment Gateways
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Storage (choose one)
BLOB_READ_WRITE_TOKEN=  # For Vercel Blob
# OR
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=

# Telegram
TELEGRAM_BOT_TOKEN=  # Optional - set by clients
```

## Data Flow

### Order Creation Flow
1. Customer completes checkout with Razorpay/Stripe/PayPal payment
2. Payment gateway returns success
3. `POST /api/create-order` called with customer data
4. Order saved to Firebase: `/clients/{clientId}/orders/{orderId}`
5. Telegram notification sent to admin (if configured)
6. PostPaymentFlow component shows WhatsApp option
7. Customer can contact via WhatsApp or close

### Rebrand Publishing Flow
1. Admin edits rebrand in /clientcopy
2. Clicks "Publish to R2"
3. `POST /api/publish-client-config` uploads to R2/Blob
4. Config stored in Firebase at `/clients/{clientId}/publishConfig`
5. R2 URL saved for homepage reference
6. Homepage loads config on next load
7. Logo, colors, navigation, visibility settings applied dynamically

## Security Considerations

- ✅ Payment credentials encrypted before Firebase storage
- ✅ Telegram bot tokens encrypted
- ✅ Firebase Security Rules restrict access by clientId
- ✅ R2 URLs are public but only contain non-sensitive config
- ✅ All server-side endpoints validate clientId
- ✅ Webhook signatures verified (Razorpay, Stripe)

## Testing Checklist

- [ ] Create new client in /clientcopy
- [ ] Complete rebrand configuration (all fields)
- [ ] Configure payment gateway (test mode)
- [ ] Set WhatsApp number and toggle options
- [ ] Configure Telegram bot and events
- [ ] Publish to R2
- [ ] Verify homepage loads rebrand config
- [ ] Test checkout with test payment
- [ ] Verify order created in Firebase
- [ ] Verify Telegram notification received
- [ ] Test WhatsApp post-payment flow
- [ ] Verify order appears in Orders tab

## Migration from SuperAdmin

If you have existing rebrand data in SuperAdmin:

1. Extract current rebrand config from `super_admin_config/branding`
2. Migrate to new Firebase schema: `/clients/{clientId}/rebrand`
3. Update payment config location if needed
4. Publish new config to R2
5. Test homepage loads new config
6. Disable SuperAdmin rebrand UI

## Future Enhancements

- [ ] Multi-language support
- [ ] A/B testing for rebrand options
- [ ] Analytics for order sources
- [ ] Automated email notifications
- [ ] SMS notifications
- [ ] Inventory management
- [ ] Customer communication dashboard
- [ ] Advanced order tracking

## Support

For integration issues:
1. Check Firebase Security Rules are configured
2. Verify all env vars are set
3. Check browser console for errors
4. Review server logs for API errors
5. Ensure payment gateway credentials are in test mode
