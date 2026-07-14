# Admin Panel Credentials

## Current Admin Credentials

**Admin ID:** `admin`  
**Admin Password:** ` and both dark theme `

## How to Login

1. Navigate to `/admin` in your browser
2. Enter the Admin ID: `admin`
3. Enter the Password: `SecureAdmin@2024`
4. Click the "Login" button

## Changing Admin Credentials

To change the admin credentials, update the following environment variables in `.env.development.local`:

```
VITE_ADMIN_ID=your_new_admin_id
VITE_ADMIN_PASSWORD=your_new_password
```

Then reload the application for changes to take effect.

## Admin Panel Features

Once logged in, you have access to:

### 1. **Change Business Tab**
   - Update business name, email, and phone
   - Manage store features globally
   - View feature statistics (total, enabled, disabled, active percentage)
   - Enable/disable payment methods, shopping features, display options, etc.

### 2. **Features Tab**
   - Dedicated interface for feature management
   - View all 17 features organized by category
   - Toggle features on/off for the entire store
   - Real-time statistics updates

### 3. **Other Admin Tabs**
   - Products: Manage products and inventory
   - Categories: Manage product categories
   - Offers: Create and manage promotional offers
   - Carousel: Configure homepage carousel
   - And more...

## Feature Categories (17 Total)

### Payment Methods (3)
- Cash on Delivery (COD)
- Razorpay Payments
- UPI Payments

### Shopping Features (4)
- Customer Reviews
- Wishlist Functionality
- Virtual Try-On
- Gift Wrap Option

### Display Options (4)
- Promotional Banners
- Pop-up Notifications
- Carousel Slider
- Video Sections

### Logistics & Orders (3)
- Order Tracking
- Multi-Channel Selling
- Bulk Order Management

### Advanced Features (3)
- AI Assistant
- Bill Customizer
- Tax Calculator

## Security Notes

- The password `SecureAdmin@2024` is a default secure password. Consider changing it in production environments.
- Admin credentials are stored as environment variables and NOT hardcoded in the application.
- Always use strong, unique passwords for production environments.
- Never commit passwords to version control.

## Troubleshooting

### Login Not Working?
1. Verify the `.env.development.local` file has the correct credentials
2. Ensure the dev server is running
3. Clear browser cache and try again
4. Check that `VITE_ADMIN_ID` and `VITE_ADMIN_PASSWORD` are properly set

### Features Not Showing?
1. Login to the admin panel
2. Navigate to the "Change Business" or "Features" tab
3. All 17 features should be displayed with toggle switches
4. Changes are saved automatically to localStorage

## Default Configuration

The admin panel comes pre-configured with all features enabled:
- **Total Features:** 17
- **Enabled:** 17
- **Disabled:** 0
- **Active %:** 100%
