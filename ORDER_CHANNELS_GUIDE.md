# Order Channels Configuration Guide

## Overview

The **Order Channels** feature in the Admin Panel allows you to configure how customers receive order confirmations and updates. You can choose ONE active notification channel at a time.

## Architecture

### Structure
- **Admin Panel Location**: `Admin.tsx` → "Order Channels" tab
- **Component**: `OrderChannelsManager.tsx` (364 lines)
- **Storage**: Firebase `admin_config/order_channels` node

### Three Available Channels

#### 1. WhatsApp Messaging
- **Purpose**: Send order details directly to customer via WhatsApp
- **How it works**: Order confirmation is sent as a WhatsApp message with order details
- **Configuration needed**:
  - WhatsApp API Key
  - Business Phone Number
  - Message Template (customizable with variables)
- **Variables available**:
  - `{ORDER_ID}` - Order identifier
  - `{TOTAL}` - Order total amount
  - `{STATUS}` - Order status

**Example Message**:
```
Your order ABC123 has been placed.
Total: $99.99
Status: Confirmed
```

#### 2. Telegram Notifications
- **Purpose**: Admin receives order notifications via Telegram bot
- **How it works**: Admin gets notified in Telegram when new orders are placed
- **Configuration needed**:
  - Telegram Bot Token (from BotFather)
  - Admin Chat ID (where notifications go)
  - Notification Template (customizable)
- **Variables available**:
  - `{ORDER_ID}` - Order identifier
  - `{TOTAL}` - Order total
  - `{CUSTOMER_NAME}` - Customer's name

**Example Notification**:
```
📦 New Order: ABC123
Total: $99.99
Customer: John Doe
```

#### 3. Standard Payment Gateway (Default)
- **Purpose**: Traditional checkout flow with payment processing
- **How it works**: Orders processed through normal payment gateway, customer gets email confirmation
- **Configuration**: No additional setup needed
- **Best for**: Standard e-commerce operations

## How to Use

### Access Order Channels
1. Go to **Admin Panel**
2. Click **"Order Channels"** tab (Send icon)
3. Choose your preferred channel

### Configure WhatsApp Channel

1. **Select WhatsApp** radio button
2. **Enter API Key**: Your WhatsApp API credentials
3. **Enter Phone Number**: Your business WhatsApp number
4. **Customize Message**: Edit the template with your preferred message
5. **Click Save**: Configuration is saved to Firebase

**Best Practices**:
- Keep messages concise
- Include key order details
- Use friendly language

### Configure Telegram Channel

1. **Select Telegram** radio button
2. **Get Bot Token**:
   - Talk to @BotFather on Telegram
   - Create a new bot
   - Copy the API Token
3. **Get Chat ID**:
   - Send `/start` to your bot
   - Forward the message to @userinfobot
   - Copy your chat ID
4. **Enter credentials** and customize template
5. **Click Save**: Configuration saved

### Use Standard Payment Gateway

1. **Select "Standard Payment Gateway"** radio button
2. **Click Save**: No additional setup needed
3. Orders will process normally through checkout

## Key Features

✅ **Single Active Channel**: Only one channel works at a time
✅ **Real-time Validation**: Required fields marked with error messages
✅ **Template Customization**: Customize order messages/notifications
✅ **Firebase Integration**: Configuration persists in database
✅ **Easy Switching**: Change channels anytime with one click
✅ **Error Handling**: Clear error messages if config is incomplete

## Data Storage

Configuration is stored in Firebase at:
```
admin_config/order_channels
├── activeChannel: "whatsapp" | "telegram" | "payment"
├── whatsapp:
│   ├── enabled: boolean
│   ├── apiKey: string (encrypted)
│   ├── phoneNumber: string
│   └── messageTemplate: string
├── telegram:
│   ├── enabled: boolean
│   ├── botToken: string (encrypted)
│   ├── chatId: string
│   └── notificationTemplate: string
└── payment:
    ├── enabled: boolean
    └── gatewayType: string
```

## Important Notes

⚠️ **Security**: 
- API keys are displayed as password inputs for security
- Store credentials securely
- Never share API keys publicly

⚠️ **One Channel Rule**: 
- Only one channel can be active
- Switching disables the previous channel
- All orders will use the active channel

⚠️ **Testing**:
- Test each channel before going live
- Verify API credentials are correct
- Check message templates are appropriate

## Troubleshooting

**Configuration won't save**:
- Check all required fields are filled
- Verify API credentials are valid
- Check Firebase connectivity

**Messages not sending**:
- Verify API key/token is correct
- Check phone number format for WhatsApp
- Confirm Chat ID for Telegram

**Switch channels not working**:
- Refresh the page
- Check browser console for errors
- Verify Firebase permissions

## Future Enhancements

Possible additions:
- Email notifications
- SMS alerts
- Multiple channel support
- Message scheduling
- Delivery confirmation

## Support

For issues or questions about order channels:
1. Check error messages in the UI
2. Verify API credentials
3. Test with a simple message
4. Check Firebase logs
