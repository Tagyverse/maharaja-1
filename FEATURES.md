# New Features: Business Configuration & Order Management

## Overview

This document describes the complete admin workflow for managing your **entire website** and orders:

1. **Full Website Editor** (`/changebusiness`) - Unified editor to manage ALL website sections:
   - Business configuration, branding, SEO, policies
   - Navigation, hero section, carousel, footer
   - Sections, cards design, video sections, banners
   - Coupons, shipping, tax, order channels
   - All website editing in one location!
   
2. **8 Professional Theme Presets** - One-click theme application:
   - Modern, Minimal, Luxury, Vibrant, Ocean, Forest, Sunset, Cyberpunk
   - Each preset includes colors, fonts, button styles, and mood
   - Instantly apply complete themes without manual configuration

3. **Live Theme Preview** - See changes in real-time:
   - Visual preview of your site with current theme
   - Shows product cards, buttons, colors, fonts
   - Update and watch changes instantly

4. **Advanced Theme Editor** - Fine-tune every detail:
   - Color pickers with hex inputs
   - Font family selection (Sans-serif, Serif, Monospace)
   - Button style (Rounded or Square)
   - Color mode (Light, Dark, Auto)
   - Full theme customization

5. **Publish to Production** - Push ALL changes to R2 CDN for live updates

6. **Dynamic Branding System** - Entire app updates automatically based on config

7. **Order Management** - Configure WhatsApp and Telegram for order notifications

## Admin Workflow: Save → Publish → Live

```
Your /changebusiness Admin Panel
        ↓
    [Configure Settings]
    - Company name, colors, SEO, policies
        ↓
    [Save Changes] ← Saved to Firebase
        ↓
    [Publish to Live] ← Pushed to R2 CDN
        ↓
    All Users See Updated Branding Immediately
    - Colors apply to all pages
    - Company name in title & header
    - Policies load dynamically
    - Logo & images update
    - Theme/dark mode settings apply
```

---

## Theme Presets & Live Preview

### Available Presets

The Business tab includes 8 carefully designed theme presets you can apply with one click:

| Preset | Feel | Best For |
|--------|------|----------|
| **Modern** | Contemporary, clean | Tech companies, startups |
| **Minimal** | Simple, elegant | Design-focused, luxury goods |
| **Luxury** | Premium, sophisticated | High-end fashion, jewelry |
| **Vibrant** | Bold, energetic | Entertainment, gaming |
| **Ocean** | Cool, calming | Travel, wellness, beauty |
| **Forest** | Natural, organic | Eco-friendly, organic products |
| **Sunset** | Warm, inviting | Food, hospitality, lifestyle |
| **Cyberpunk** | Futuristic, edgy | Tech, gaming, innovation |

### Using Theme Presets

1. Go to `/changebusiness` → Business tab
2. Scroll to "Theme Presets" section
3. Click any preset card to instantly apply it
   - All colors, fonts, button styles update immediately
   - Preset tag shows as "selected" (cyan border)
   - Your entire site reflects the new theme

### Live Preview Feature

The **Live Preview** shows exactly how your website will look:

- Click "Show Preview" button in Theme Presets section
- See product cards, buttons, colors, fonts in action
- Preview updates in real-time as you adjust settings
- Helps you make theme decisions before publishing

### Advanced Theme Customization

After applying a preset, fine-tune any aspect:

**Color Customization**
- Click color pickers to change Primary, Secondary, Accent colors
- Enter hex codes directly (e.g., `#FF5733`)
- See color opacity variations (100%, 80%, 40%, 20%)
- Copy colors to clipboard

**Typography**
- Select font: Sans-serif (modern), Serif (classic), Monospace (tech)
- Font applies to all text across your site

**Button & Component Style**
- Choose Rounded or Square button styles
- Affects all buttons, cards, and components site-wide

**Color Mode**
- Light: Bright, clean appearance
- Dark: Easy on the eyes, modern feel
- Auto: Respects user's system preference

### Live Reflection on Client Side

All theme changes are instantly reflected across your entire website:

**What Updates in Real-Time:**
- ✓ All button colors and styles
- ✓ Link colors and hover states
- ✓ Header and footer styling
- ✓ Card backgrounds and borders
- ✓ Product display colors
- ✓ Text colors for readability
- ✓ Dark mode appearance
- ✓ Font family throughout

**When Changes Take Effect:**
- After clicking "Save Changes" → Saved to Firebase (your instance loads)
- After clicking "Publish to Live" → All users see changes immediately

---

## 1. Business Configuration Portal (`/changebusiness`)

### Accessing the Portal

Navigate to `http://yoursite.com/changebusiness` in your browser. You'll be prompted to authenticate with your admin credentials.

**Authentication:**
- Admin ID: Use the same credentials as your admin panel (from environment variables `VITE_ADMIN_ID` and `VITE_ADMIN_PASSWORD`)
- Session persists in localStorage for convenience

### All Available Editing Tabs

The `/changebusiness` editor has 15 major sections, all in one place:

| Tab | Purpose |
|-----|---------|
| 🏢 **Business** | Company info, colors, SEO, policies, theme settings |
| 📱 **Navigation** | Edit header menu items, structure, links |
| ✨ **Hero** | Hero section, banner, social links |
| 🎠 **Carousel** | Image carousel, slides, animations |
| 📦 **Sections** | Custom content sections, layouts |
| 👣 **Footer** | Footer content, links, information |
| 📢 **Marquee** | Scrolling announcements, promotions |
| 🎨 **Card Design** | Product card styling, appearance |
| 🎬 **Videos** | Video sections, overlays, layouts |
| 📣 **Banner** | Promotional banners, social integration |
| 🎟️ **Coupons** | Discount codes, offers management |
| 📦 **Shipping** | Shipping settings, rates, policies |
| 💰 **Tax** | Tax configuration, rates |
| 🛒 **Orders** | WhatsApp/Telegram channel setup, order management |
| 🚀 **Publish** | Publish all changes to production |

---

### Configuration Sections

#### A. Business Tab - Business Information

**Company Details:**
- **Company Name**: Your business's primary name
- **Tagline**: Short promotional text (e.g., "Premium Quality, Best Price")
- **Legal Business Name**: Official registered business name
- **Logo URL**: Link to your company logo image

**Contact Information:**
- **Primary Email**: Main business email for customer inquiries
- **Primary Phone**: Business phone number with country code

**Business Address:**
- Street address, city, state/province, country, ZIP code
- This information appears in your policies and checkout

#### B. Website Section Managers

**Navigation Customizer** (📱 Tab)
- Edit header menu items and structure
- Customize navigation bar appearance
- Add/remove menu links

**Carousel Manager** (🎠 Tab)
- Manage image carousel on homepage
- Upload carousel images
- Set carousel timing and animations

**Footer Manager** (👣 Tab)
- Edit footer content and links
- Configure footer sections
- Add social media links

**Section Manager** (📦 Tab)
- Create and edit custom content sections
- Manage text, images, layouts
- Organize section order

**Card Design Manager** (🎨 Tab)
- Customize product card appearance
- Edit card styling and layout
- Configure product display

**Coupon Manager** (🎟️ Tab)
- Create discount codes
- Set coupon rules and restrictions
- Manage active promotions

**Shipping Manager** (📦 Tab)
- Configure shipping rates
- Set shipping policies
- Manage delivery options

**Tax Manager** (💰 Tab)
- Set tax rates by region
- Configure tax rules
- Manage tax calculations

**Order Channel Manager** (🛒 Tab)
- Configure WhatsApp integration for orders
- Setup Telegram bot for notifications
- Test and manage order channels

**Publish Manager** (🚀 Tab)
- Publish all changes to production
- View publish history
- Rollback if needed

---

#### C. Branding Tab - Color Customization

**Color Configuration:**
- **Primary Color**: Main brand color (e.g., cyan: `#06b6d4`)
- **Secondary Color**: Secondary brand color (e.g., dark slate: `#0f172a`)
- **Accent Color**: Highlight color for buttons and important elements

Each color has:
- A color picker widget for visual selection
- A hex code input field for precise values
- Real-time preview capability

**Use Cases:**
- Match your brand identity
- Create consistent visual experience across the website
- Highlight important CTAs and features

#### C. SEO Tab - Search Engine Optimization

**Meta Information:**
- **Meta Title** (55-60 characters): How your site appears in search results
- **Meta Description** (150-160 characters): Summary shown under search results
- **OG Image URL**: Preview image when sharing on social media
- **Keywords**: Important search terms (comma-separated)

**Optimization Tips:**
- Keep titles concise and descriptive
- Use clear, benefit-focused descriptions
- Include your main product/service keywords
- Use high-quality images for OG meta

#### D. Policies Tab - Business Policies

**Editable Policies:**
- **Terms of Service**: Legal terms for your store
- **Return Policy**: How customers can return products
- **Warranty Information**: Product warranty details

**Usage:**
- Text appears in your website's policy pages
- Accessible to customers for transparency
- Update anytime from the admin panel

#### E. Theme Tab - Visual Settings

**Theme Configuration:**
- **Font Family**: Choose between System UI, Sans Serif, Serif, or Monospace
- **Color Scheme**: Light, Dark, or Auto (follow system settings)
- **Button Style**: Rounded or square button shapes
- **Dark Mode Toggle**: Enable/disable dark mode support

**Recommendations:**
- Use "Auto" for color scheme to respect user preferences
- Rounded buttons for modern aesthetic
- System UI font for best performance

### Data Persistence

All settings are saved to Firebase Realtime Database under `business_config/default` collection. Settings persist across sessions and are used throughout the application.

### Saving & Publishing Changes

#### Step 1: Save Changes (to Firebase)
Click the **"Save Changes"** button (floating button in bottom-right corner). You'll see:
- ✓ Green success message if save succeeds
- ✗ Red error message if save fails (check connection)

**What happens:**
- Changes saved to Firebase Realtime Database
- Your app loads these settings on next page refresh
- Changes are persistent but only visible to you

#### Step 2: Publish to Live (to R2 CDN)
Click the **"Publish to Live"** button to push changes to production. You'll see:
- ✓ Green success message when published
- ✗ Red error message if publishing fails
- **App auto-refreshes** after successful publish

**What happens:**
- Business config sent to R2 CDN
- All users see updated branding immediately
- No downtime or page reload required
- Changes are live globally

### Dynamic Branding System

Once published, your entire web app updates automatically:

#### Colors & Styling
- **Primary Color**: Updates all primary buttons, links, and highlights
- **Secondary Color**: Background colors, secondary elements
- **Accent Color**: CTAs, badges, special elements
- Applied globally using CSS variables: `var(--primary-color)`, `var(--secondary-color)`, etc.

#### Page Title & Meta
- **Browser Tab Title**: Updated with your company name
- **Meta Description**: Updated in page source
- Helps with SEO and bookmarks

#### Theme Settings
- **Dark Mode**: Toggle applies to entire app
- **Font Family**: Changes typography across all pages
- **Button Style**: Rounded or square buttons everywhere
- **Color Scheme**: Light, Dark, or Auto (respects user's system preference)

#### Company Branding
- **Company Name**: Appears in:
  - Page title
  - Header section
  - Footer
  - All customer-facing areas
- **Logo**: Displays in header and checkout
- **Tagline**: Shows in marketing sections
- **Business Address**: Appears in footer and policies

#### Policies
- **Terms of Service**: Linked in footer, full page at `/privacy-policy`
- **Return Policy**: Accessible from product pages and footer
- **Warranty Information**: Available in footer

#### Example: What Changes

**Before Publishing:**
```
Title: My Store
Primary Color: Cyan (#06b6d4)
Company Name: Generic Shop
Return Policy: Default text
```

**After Publishing:**
```
Title: Acme Corporation
Primary Color: Your Custom Color
Company Name: Acme Corporation
Return Policy: Your Custom Policy Text
```

**All pages instantly reflect these changes without requiring code changes!**

---

## 2. Order Channels Management (`/admin` → Order Channels Tab)

### Accessing Order Channels

1. Navigate to `/admin` (your main admin panel)
2. Authenticate with admin credentials
3. Click on the **"Order Channels"** tab

### Features

#### Channel Selection

Toggle between **WhatsApp** and **Telegram** order notification channels. Only one channel can be active at a time.

Each channel has:
- **Enable/Disable Toggle**: Control whether orders use this channel
- **Configuration Section**: Input credentials and settings
- **Message Templates**: Customize notification messages
- **Test Connection**: Validate your credentials before going live

#### WhatsApp Configuration

**Required Information:**
- **Phone Number**: Your WhatsApp Business number with country code (e.g., +1234567890)
- **API Key**: WhatsApp Business API authentication key

**Getting WhatsApp Business API:**
1. Visit [WhatsApp Business Platform](https://www.whatsapp.com/business/api/)
2. Register your business account
3. Get your WhatsApp phone number and API key
4. Add in this admin panel

**Message Templates:**
- `order_confirmation`: Initial order received message
- `order_processing`: Order is being prepared
- `order_completed`: Order shipped/ready for pickup
- `order_cancelled`: Order cancellation notice

**Example Template:**
```
Your order has been confirmed! 
Order ID: {order_id}
We'll update you soon with shipping details.
```

**Test Connection:**
- Fill in phone number and API key
- Click "Test Connection" button
- Green checkmark = valid credentials
- Red X = invalid credentials or API issue

#### Telegram Bot Configuration

**Required Information:**
- **Bot Token**: Your Telegram bot API token from BotFather
- **Chat ID**: Your Telegram chat ID where notifications are sent

**Getting Telegram Bot Token:**
1. Open Telegram and search for `@BotFather`
2. Send `/start` command
3. Send `/newbot` to create a new bot
4. Follow the prompts and get your bot token
5. Paste token in the admin panel

**Getting Chat ID:**
1. Start a conversation with your new bot
2. Send any message
3. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find your `chat_id` in the response
5. Paste in the admin panel

**Message Templates:**
Same as WhatsApp:
- `order_confirmation`
- `order_processing`
- `order_completed`
- `order_cancelled`

**Template Variables:**
- `{order_id}`: Unique order identifier
- Customize messages for your brand voice

#### Recent Orders

**Orders Table** shows:
- **Order ID**: Unique identifier (first 8 characters)
- **Customer**: Customer name
- **Amount**: Order total amount
- **Channel**: WhatsApp, Telegram, or Web
- **Status**: Current order status (dropdown to change)
- **Action**: View detailed order information

**Status Updates:**
- Change order status from dropdown: Pending → Processing → Completed → Cancelled
- Automatically updates Firebase with new status and timestamp
- Notifications sent via active channel when status changes

### Message Flow

When an order is created:
1. Order saved to Firebase `orders` collection
2. If WhatsApp is enabled: Sends order confirmation via WhatsApp
3. If Telegram is enabled: Sends order confirmation via Telegram
4. Admin receives notification for manual follow-up

### Testing Your Setup

**Before Going Live:**
1. Configure WhatsApp OR Telegram (or both)
2. Click "Test Connection" button
3. Verify you receive test messages
4. Check message formatting and content
5. Update template messages if needed
6. Enable the channel
7. Create a test order to verify notifications

**Troubleshooting:**
- If test fails: Check credentials are correct
- If messages not received: Verify phone number/chat ID format
- Check Firebase connection and database rules
- Review browser console for errors

### Best Practices

1. **Keep Numbers/Tokens Secure**: Don't share credentials publicly
2. **Test Before Launch**: Always test both success and error scenarios
3. **Update Templates**: Customize messages to match your brand
4. **Monitor Orders**: Check admin panel regularly for new orders
5. **Respond Quickly**: Use these channels to quickly acknowledge and update customers
6. **Compliance**: Ensure you comply with platform policies (WhatsApp, Telegram)

---

## Technical Details

### File Structure

```
src/
├── pages/
│   ├── ChangeBusiness.tsx          # Main business config page
│   └── Admin.tsx                    # Enhanced with order-channels tab
├── components/
│   └── admin/
│       └── OrderChannelManager.tsx # Order channels UI component
├── utils/
│   └── businessConfigManager.ts    # Firebase operations
└── types.ts                         # New interfaces (BusinessConfig, OrderChannel, Order)
```

### Database Schema

**Business Config:**
```
firebase_db
└── business_config/
    └── default/
        ├── company_name: string
        ├── primary_color: string
        ├── secondary_color: string
        ├── accent_color: string
        ├── terms_of_service: string
        ├── seo_meta_title: string
        ├── seo_meta_description: string
        └── ... (all business settings)
```

**Order Channels:**
```
firebase_db
└── integrations/
    ├── whatsapp/
    │   ├── phone_number: string
    │   ├── api_key: string
    │   ├── enabled: boolean
    │   └── message_templates: object
    └── telegram/
        ├── bot_token: string
        ├── chat_id: string
        ├── enabled: boolean
        └── message_templates: object
```

**Orders:**
```
firebase_db
└── orders/
    └── {orderId}/
        ├── customer_name: string
        ├── amount: number
        ├── status: string
        ├── channel: string
        └── ... (order details)
```

### API Integration

#### Business Config Manager Functions

```typescript
// Load configuration
await fetchBusinessConfig('default')

// Save configuration
await saveBusinessConfig('default', config)

// Update specific fields
await updateBusinessConfig('default', updates)

// Get order channels
await fetchOrderChannel('whatsapp' | 'telegram')

// Save order channel
await saveOrderChannel(channelType, config)

// Test connection
await testChannelConnection(channelType, config)
```

### Security Notes

1. **Admin Authentication**: Required for both `/changebusiness` and `/admin`
2. **Environment Variables**: Credentials stored in `.env` files, never exposed to client
3. **Firebase Rules**: Implement RLS to restrict database access to authenticated admins
4. **API Keys**: Stored securely; implement rate limiting for API calls
5. **Data Validation**: All inputs validated before saving

---

## Future Enhancements

Potential features to add:
- SMS notifications (Twilio integration)
- Email notifications (SendGrid)
- Webhook support for external systems
- Order analytics and reporting
- Bulk order import/export
- Multi-language support
- Advanced message scheduling

---

## Support & Troubleshooting

**Common Issues:**

**Q: Changes not saving**
- A: Check internet connection and Firebase connectivity
- Ensure admin is authenticated
- Check browser console for errors

**Q: Messages not sending**
- A: Verify credentials (phone number format, API keys)
- Click "Test Connection" to validate
- Check message templates aren't empty

**Q: Can't access /changebusiness**
- A: Must be logged in with correct admin credentials
- Check environment variables are set correctly
- Clear localStorage and try again

**Q: Database errors**
- A: Verify Firebase is properly configured
- Check database rules allow admin access
- Review Firebase console for connection issues

---

## Getting Help

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Review Firebase console for database issues
3. Verify all environment variables are set
4. Test with different browsers
5. Contact support with error screenshots
