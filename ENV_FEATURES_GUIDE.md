# Feature Flags and Environment Variables Guide

## Overview

This guide explains how to configure feature toggles and environment variables for the store application. Features can be managed globally through the admin panel's "Change Business" section.

## Feature Categories

### Payment Methods
- `codPayment` - Cash on Delivery (COD) payments
- `razorpayPayment` - Razorpay payment integration
- `upiPayment` - UPI payment support

### Shopping Features
- `reviewsEnabled` - Customer product reviews
- `wishlistEnabled` - Customer wishlist functionality
- `tryOnEnabled` - Virtual try-on feature (AR/VR)
- `giftWrapEnabled` - Gift wrapping options

### Display Options
- `bannersEnabled` - Welcome and promotional banners
- `popupsEnabled` - Promotional popups and modals
- `carouselEnabled` - Product carousel sections
- `videoSectionsEnabled` - Video display sections

### Logistics & Orders
- `trackingEnabled` - Order tracking functionality
- `multiChannelEnabled` - Multi-channel order management
- `bulkOrdersEnabled` - Bulk order support

### Advanced Features
- `aiAssistantEnabled` - AI assistant chatbot
- `billCustomizerEnabled` - Custom bill generation
- `taxCalculatorEnabled` - Tax calculation engine

## Environment Variables

### Adding Environment Variables

Environment variables are managed in the `.env.local` or project environment settings:

```bash
# Example environment variables
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_WISHLIST=true
VITE_ENABLE_PAYMENTS=true
```

## Managing Features via Admin Panel

### Steps to Configure Features:

1. **Navigate to Admin Panel**
   - Go to `/admin` in your browser
   - Login with admin credentials

2. **Access Change Business Section**
   - Click on "Change Business" tab in the admin panel
   - Update business information (Name, Email, Phone)

3. **Enable/Disable Features**
   - Select feature category (Payment, Shopping, Display, etc.)
   - Toggle features on/off using the switch buttons
   - View real-time counts of enabled/disabled features

4. **Save Changes**
   - Click "Save Changes" button
   - Changes are persisted globally across the store

## Feature Storage

Features are stored in multiple locations:

1. **LocalStorage** - Client-side caching for quick access
   - Key: `features-config`
   - Format: JSON object with feature flags

2. **Context API** - Global state management
   - Provider: `FeaturesProvider`
   - Hook: `useFeatures()`
   - Usage in components:
     ```tsx
     import { useFeatures } from '@/contexts/FeaturesContext';
     
     function MyComponent() {
       const { features, updateFeatures } = useFeatures();
       
       if (features.reviewsEnabled) {
         // Show reviews component
       }
     }
     ```

## Using Features in Components

### Checking Feature Status

```tsx
import { useFeatures } from '@/contexts/FeaturesContext';

export function ProductCard() {
  const { features } = useFeatures();
  
  return (
    <div>
      {features.wishlistEnabled && <WishlistButton />}
      {features.tryOnEnabled && <VirtualTryOnButton />}
      {features.reviewsEnabled && <ReviewsSection />}
    </div>
  );
}
```

### Updating Features Programmatically

```tsx
import { useFeatures } from '@/contexts/FeaturesContext';

export function AdminFeatureControl() {
  const { updateFeatures } = useFeatures();
  
  const handleToggle = (feature: string) => {
    updateFeatures({
      [feature]: !features[feature]
    });
  };
  
  return <button onClick={() => handleToggle('reviewsEnabled')}>Toggle Reviews</button>;
}
```

## Default Feature States

By default, all features are enabled when the store loads for the first time:

```json
{
  "codPayment": true,
  "razorpayPayment": true,
  "upiPayment": true,
  "reviewsEnabled": true,
  "wishlistEnabled": true,
  "tryOnEnabled": true,
  "giftWrapEnabled": true,
  "bannersEnabled": true,
  "popupsEnabled": true,
  "carouselEnabled": true,
  "videoSectionsEnabled": true,
  "trackingEnabled": true,
  "multiChannelEnabled": true,
  "bulkOrdersEnabled": true,
  "aiAssistantEnabled": true,
  "billCustomizerEnabled": true,
  "taxCalculatorEnabled": true
}
```

## Feature Management Dashboard Statistics

The Change Business panel displays:

- **Total Features** - Sum of all available features
- **Enabled** - Count of currently active features
- **Disabled** - Count of currently inactive features
- **Active %** - Percentage of enabled features

## Admin Access

The admin panel is accessible at `/admin` route and includes:

1. **Business Information Section**
   - Business Name
   - Business Email
   - Business Phone

2. **Feature Management Section**
   - 5 feature categories
   - Individual toggle controls
   - Real-time statistics
   - Save functionality with success/error feedback

## Security Considerations

- Feature configurations are stored client-side and should be validated server-side
- Never rely solely on client-side feature flags for security-sensitive features
- Always validate user permissions server-side before performing restricted actions
- Store sensitive feature information in environment variables, not in localStorage

## Best Practices

1. **Organizing Features** - Group related features by category
2. **Testing** - Test each feature independently before deploying
3. **Monitoring** - Track which features are enabled per business
4. **Documentation** - Keep feature requirements documented
5. **Backwards Compatibility** - Ensure disabling features doesn't break core functionality

## Troubleshooting

### Features Not Persisting
- Check browser's localStorage is enabled
- Verify `FeaturesProvider` wraps the app in `App.tsx`
- Check browser console for errors

### Admin Panel Not Accessible
- Verify you're on `/admin` route
- Ensure you have admin credentials
- Check network requests in browser DevTools

### Feature Changes Not Reflecting
- Clear browser cache and localStorage
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Verify `useFeatures()` hook is used correctly in components

## Support

For issues or questions about feature configuration, contact your development team or refer to the main project documentation.
