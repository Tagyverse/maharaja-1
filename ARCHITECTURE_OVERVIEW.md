# Admin Panel & Business Management Architecture

## Current Structure

### Admin Panel (`/src/pages/Admin.tsx`)
**Purpose**: Core store management and product operations

#### Tabs in Admin:
1. **Products** - Manage product inventory
2. **Categories** - Organize products
3. **Offers** - Create promotional offers
4. **Carousel** - Homepage carousel management
5. **Marquee** - Scrolling text banner
6. **Video Sections** - Add video content
7. **Sections** - Custom page sections
8. **Card Design** - Product card styling
9. **Banner Social** - Social media banners
10. **Navigation** - Menu customization
11. **Coupons** - Discount codes
12. **Bulk Operations** - Mass product updates
13. **Try-On Models** - AR/VR model management
14. **Tax Settings** - Tax configuration
15. **Order Channels** ← **ORDER MANAGEMENT** ⭐
16. **Footer** - Website footer
17. **AI Assistant** - AI agent config
18. **Gallery** - Image management
19. **Bill Customizer** - Invoice design
20. **Settings** - General settings
21. **Publish** - Push to Cloudflare R2

---

## Feature Categorization

### ADMIN & OPERATIONS (Already in Admin.tsx)
✅ Products, Categories, Offers, Carousel, Marquee, Video Sections
✅ Sections, Card Design, Banner Social, Navigation, Coupons
✅ Bulk Operations, Try-On Models, Tax Settings
✅ Footer, AI Assistant, Gallery, Bill Customizer, Settings, Publish

### ORDER MANAGEMENT (In Admin.tsx - Order Channels Tab)
✅ **Order Channels Manager** - Configure notification methods
  - WhatsApp: Send order details via message
  - Telegram: Admin receives notifications
  - Payment Gateway: Standard checkout (default)
  - **Only ONE channel active at a time**

### BUSINESS INFORMATION (Optional - Standalone Component)
❌ NOT in Admin.tsx
🔄 Can be created separately as `/src/pages/ChangeBusiness.tsx`
🔄 Includes: Company info, contact details, social links

---

## Order Channels Tab (Admin Panel)

### Location
```
Admin Panel → Order Channels Tab → Configure Notification Gateway
```

### Three Options (Select ONE):

#### 1. WhatsApp Channel
```
Purpose: Send order details to customer via WhatsApp message
When: After order placement
What: Order ID, Total Amount, Status, Product Details
Configuration:
  - API Key (from WhatsApp Business API)
  - Business Phone Number
  - Message Template with variables
```

#### 2. Telegram Channel
```
Purpose: Notify admin of new orders via Telegram bot
When: Immediately after order placed
What: Order ID, Customer Name, Total, Products
Configuration:
  - Telegram Bot Token
  - Chat ID (where notifications go)
  - Notification Template with variables
```

#### 3. Payment Gateway (Default)
```
Purpose: Traditional checkout flow
When: Always available
What: Standard email confirmation
Configuration: None (built-in)
Status: Default if no other channel selected
```

### Radio Button Selection (Only ONE Active)
```
⦿ WhatsApp Channel      (Active)
⚫ Telegram Channel     (Inactive)
⚫ Payment Gateway      (Inactive)

↓ Display only WhatsApp configuration below
```

---

## Data Storage

### Firebase Location
```
admin_config/
└── order_channels/
    ├── activeChannel: "whatsapp" | "telegram" | "payment"
    ├── whatsapp: {
    │   enabled: boolean
    │   apiKey: string
    │   phoneNumber: string
    │   messageTemplate: string
    │ }
    ├── telegram: {
    │   enabled: boolean
    │   botToken: string
    │   chatId: string
    │   notificationTemplate: string
    │ }
    └── payment: {
        enabled: boolean
        gatewayType: "standard"
      }
```

---

## Component Files

### In Admin Panel
```
src/components/admin/
├── OrderChannelsManager.tsx ← Order management (364 lines)
├── ProductManager.tsx ← Product management
├── CategoryManager.tsx ← Category management
├── ...other admin components...
└── [All manage store operations]
```

### Optional Standalone
```
src/pages/
├── Admin.tsx ← Core admin operations + Order Channels
└── ChangeBusiness.tsx ← OPTIONAL: Business info (if created)
```

---

## Which Features Go Where?

| Feature | Location | Purpose |
|---------|----------|---------|
| Products | Admin → Products Tab | Inventory management |
| Categories | Admin → Categories Tab | Product organization |
| Orders Notifications | Admin → Order Channels Tab | **Customer notification setup** |
| WhatsApp Messages | Admin → Order Channels Tab | Send order via WhatsApp |
| Telegram Alerts | Admin → Order Channels Tab | Admin notifications |
| Coupons | Admin → Coupons Tab | Discounts & promotions |
| Tax | Admin → Tax Settings Tab | Tax configuration |
| Footer | Admin → Footer Tab | Website footer |
| Business Info | Optional (Standalone) | Company details |
| Social Links | Optional (Standalone) | Social media URLs |

---

## Current Implementation Status

✅ **COMPLETE**
- Order Channels added to Admin panel
- WhatsApp configuration section
- Telegram configuration section
- Payment Gateway option
- Single-select radio button (only ONE active)
- Firebase storage integrated
- Form validation implemented
- Error handling complete

❌ **NOT IN ADMIN**
- ChangeBusiness is NOT in Admin.tsx (removed)
- Can be created as separate page if needed

---

## How to Use

### Admin User: Configure Order Channel
1. Go to **Admin Panel**
2. Click **Order Channels** tab (Send icon)
3. Select ONE option:
   - ⦿ WhatsApp
   - ⚫ Telegram
   - ⚫ Payment Gateway
4. Fill configuration fields
5. Click **Save Order Channel Configuration**
6. Configuration saved to Firebase

### Customer: Order Placed
- System checks `activeChannel` in Firebase
- **If WhatsApp**: Sends order details via message
- **If Telegram**: Sends notification to admin
- **If Payment**: Standard email (default)

---

## Future Enhancements

To create standalone **ChangeBusiness** page:
```typescript
// src/pages/ChangeBusiness.tsx
- Company Name & Description
- Contact Information (Email, Phone, Address)
- Social Media Links (Instagram, Facebook, LinkedIn, etc.)
- Business Hours
- Copyright Text
- Save to Firebase site_settings

// Add to App.tsx routing
<Route path="/change-business" element={<ChangeBusiness />} />

// Add to navigation menu
```

---

## Summary

**Admin Panel** manages:
- ✅ Product operations (products, categories, offers, etc.)
- ✅ Store configuration (navigation, footer, tax, etc.)
- ✅ **Order Management** (Order Channels, notifications)
- ✅ Publishing & deployment

**ChangeBusiness** (Optional):
- Company information
- Business details
- Social links
- Standalone if needed

**Order Channels Tab** (In Admin):
- Configure order notifications
- Select ONE gateway (WhatsApp, Telegram, or Standard)
- Save credentials securely
- Templates for customization
