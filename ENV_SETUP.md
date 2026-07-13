# Environment Variables Setup Guide

## Overview

This guide explains how to configure environment variables for the Maharaja store application, including admin authentication and feature flags.

## Quick Start

1. Copy `.env.example` to `.env.development.local`:
```bash
cp .env.example .env.development.local
```

2. Update the values with your configuration

3. Restart your development server for changes to take effect

## Admin Authentication

### Environment Variables

```bash
VITE_ADMIN_ID=admin
VITE_ADMIN_PASSWORD=admin123
```

### Accessing Admin Panel

1. Navigate to `http://localhost:5173/admin`
2. Enter your admin credentials
3. Access the management dashboard

### Important Security Notes

- **Development**: Use simple credentials like `admin/admin123`
- **Production**: Use strong, randomly generated credentials
- **Never commit credentials** to version control
- Store production credentials in Vercel project settings or secure secret management tools

## Feature Flags

Feature flags control which features are available in the store. They can be configured in two ways:

### 1. Environment Variables (Initial Setup)

Set environment variables to enable/disable features at startup:

```bash
# Payment Methods
VITE_FEATURE_COD_PAYMENT=true
VITE_FEATURE_RAZORPAY_PAYMENT=true
VITE_FEATURE_UPI_PAYMENT=true

# Shopping Features
VITE_FEATURE_REVIEWS=true
VITE_FEATURE_WISHLIST=true
VITE_FEATURE_TRY_ON=true
VITE_FEATURE_GIFT_WRAP=true

# Display Options
VITE_FEATURE_BANNERS=true
VITE_FEATURE_POPUPS=true
VITE_FEATURE_CAROUSEL=true
VITE_FEATURE_VIDEO_SECTIONS=true

# Logistics & Orders
VITE_FEATURE_ORDER_TRACKING=true
VITE_FEATURE_MULTI_CHANNEL=true
VITE_FEATURE_BULK_ORDERS=true

# Advanced Features
VITE_FEATURE_AI_ASSISTANT=true
VITE_FEATURE_BILL_CUSTOMIZER=true
VITE_FEATURE_TAX_CALCULATOR=true
```

### 2. Admin Panel (Runtime Changes)

1. Go to Admin Panel → "Change Business" tab
2. Click on feature categories (Payment Methods, Shopping Features, etc.)
3. Toggle features on/off
4. Click "Save Changes"

Features modified in the admin panel are saved to browser localStorage and override environment variables.

## Feature Categories

### Payment Methods (3 features)
- `codPayment` - Cash on Delivery
- `razorpayPayment` - Razorpay online payment
- `upiPayment` - UPI payment gateway

### Shopping Features (4 features)
- `reviewsEnabled` - Customer product reviews
- `wishlistEnabled` - Wishlist functionality
- `tryOnEnabled` - Virtual try-on (AR/VR)
- `giftWrapEnabled` - Gift wrapping options

### Display Options (4 features)
- `bannersEnabled` - Welcome banners
- `popupsEnabled` - Promotional popups
- `carouselEnabled` - Product carousel
- `videoSectionsEnabled` - Video display sections

### Logistics & Orders (3 features)
- `trackingEnabled` - Order tracking
- `multiChannelEnabled` - Multi-channel orders
- `bulkOrdersEnabled` - Bulk order support

### Advanced Features (3 features)
- `aiAssistantEnabled` - AI chat assistant
- `billCustomizerEnabled` - Bill customization
- `taxCalculatorEnabled` - Tax calculation

## Other Required Environment Variables

### Firebase
```bash
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Razorpay Payment
```bash
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Supabase
```bash
JWT=your_jwt_token
```

### Analytics
```bash
VERCEL_WEB_ANALYTICS_ID=your_analytics_id
```

### AI Gateway
```bash
AI_GATEWAY_API_KEY=your_api_key
```

## Development vs Production

### Development (.env.development.local)
- Use test credentials and keys
- Enable all features for testing
- Store variables locally (not in Git)

### Production
- Use strong credentials
- Carefully select which features to enable
- Store in Vercel project environment settings
- Never expose API keys in client code

## Vercel Deployment

1. Go to Vercel Project Settings
2. Navigate to "Environment Variables"
3. Add all required variables for production
4. Select the environment (Production, Preview, Development)
5. Deploy

### Recommended Production Setup

```
VITE_ADMIN_ID=<strong-random-username>
VITE_ADMIN_PASSWORD=<strong-random-password>

VITE_FEATURE_COD_PAYMENT=true
VITE_FEATURE_RAZORPAY_PAYMENT=true
VITE_FEATURE_UPI_PAYMENT=true

VITE_FEATURE_REVIEWS=true
VITE_FEATURE_WISHLIST=true

VITE_FEATURE_BANNERS=true
VITE_FEATURE_POPUPS=true
VITE_FEATURE_CAROUSEL=true

# ... other features based on your store needs
```

## Feature Toggle Priority

Features are evaluated in this order:

1. **Admin Panel Changes** (localStorage) - Highest priority
2. **Environment Variables** - Used as defaults if no admin changes exist
3. **Hardcoded Defaults** - Fallback if nothing is set

This means admin panel changes always override environment variables.

## Troubleshooting

### Features Not Loading?

1. Check if environment variables are set correctly
2. Clear browser localStorage: `localStorage.clear()`
3. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
4. Restart dev server: `npm run dev`

### Admin Login Not Working?

1. Verify `VITE_ADMIN_ID` and `VITE_ADMIN_PASSWORD` are set in `.env.development.local`
2. Ensure dev server was restarted after changing env vars
3. Check browser console for errors

### Features Not Saving?

1. Check browser's localStorage is not disabled
2. Verify localStorage quota is not exceeded
3. Check browser console for errors

## Best Practices

1. **Never commit `.env.development.local`** to Git
2. **Use `.env.example`** as a template for other developers
3. **Rotate credentials regularly** in production
4. **Use strong passwords** for admin access
5. **Test features thoroughly** after enabling/disabling
6. **Document which features are enabled** in your deployment
7. **Monitor feature usage** to optimize performance

## Support

For issues or questions:
1. Check `ENV_FEATURES_GUIDE.md` for detailed feature documentation
2. Review error messages in browser console
3. Check Vercel deployment logs
4. Contact your development team

## References

- Feature Management: `ENV_FEATURES_GUIDE.md`
- Admin Panel: `/admin`
- Change Business: `/admin` → "Change Business" tab
- Features Tab: `/admin` → "Features" tab
