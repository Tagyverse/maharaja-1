# Quick Start Guide: Business Config & Admin Workflow

## Default Credentials

**For `/changebusiness` and `/admin` pages:**
- **ID:** `admin`
- **Password:** `admin@123`

## First Time Setup (5 minutes)

### 1. Access Business Settings
```
Navigate to: http://yoursite.com/changebusiness
Login with: admin / admin@123
```

### 2. Configure Your Business (2 minutes)

**General Tab:**
- [ ] Enter your company name
- [ ] Add your company tagline
- [ ] Add business email and phone
- [ ] Enter business address

**Branding Tab:**
- [ ] Pick your primary brand color (e.g., #06b6d4 for cyan)
- [ ] Pick secondary color (e.g., #0f172a for dark)
- [ ] Pick accent color (e.g., #06b6d4 for highlights)
- [ ] Upload company logo URL

**SEO Tab:**
- [ ] Set meta title (e.g., "Acme Corporation - Quality Products")
- [ ] Set meta description (e.g., "Shop premium products from Acme Corp")
- [ ] Add OG image URL for social sharing
- [ ] Add keywords (e.g., "products, shop, quality")

**Policies Tab:**
- [ ] Write your Terms of Service
- [ ] Write your Return Policy
- [ ] Write Warranty Information

**Theme Tab:**
- [ ] Choose font family (System UI recommended)
- [ ] Choose color scheme (Auto recommended)
- [ ] Choose button style (Rounded or Square)
- [ ] Toggle dark mode if desired

### 3. Save Changes
```
Click "Save Changes" button → See green success message
```
Your settings are now saved to Firebase!

### 4. Publish to Live
```
Click "Publish to Live" button → See green success message
```
Your entire app is now branded with your settings!

---

## What Changed After Publishing?

✓ All users see your company name in browser title
✓ Your colors applied to all buttons and links
✓ Your logo displays in header
✓ Your policies appear in footer
✓ Your SEO meta tags improve search visibility
✓ Your theme (dark/light) applies globally
✓ No code changes needed - all dynamic!

---

## Admin Panel Features

### Order Channels (WhatsApp & Telegram)

Navigate to: `http://yoursite.com/admin` → "Order Channels" tab

**Setup WhatsApp:**
1. Get WhatsApp Business API credentials
2. Enter phone number and API key
3. Click "Test Connection"
4. Enable channel when ready

**Setup Telegram:**
1. Message @BotFather on Telegram
2. Create bot and get token
3. Enter bot token and chat ID
4. Click "Test Connection"
5. Enable channel when ready

**Orders will automatically send notifications via your chosen channel!**

---

## Workflow Summary

```
┌─────────────────────────────────────────────┐
│ Step 1: Go to /changebusiness              │
│ Step 2: Configure settings (all tabs)       │
│ Step 3: Click "Save Changes" (Firebase)     │
│ Step 4: Click "Publish to Live" (R2 CDN)   │
│ Step 5: Page auto-refreshes                 │
│ Step 6: All users see your branding!        │
└─────────────────────────────────────────────┘
```

---

## File Locations

- **Business Config:** `/changebusiness`
- **Admin Panel:** `/admin`
- **Client Copy:** `/clientcopy`
- **Policies:** `/privacy-policy`, `/shipping-policy`, `/refund-policy`

---

## Need to Update Your Branding?

1. Go to `/changebusiness`
2. Login with admin credentials
3. Make changes in any tab
4. Click "Save Changes"
5. Click "Publish to Live"
6. Done! Changes live immediately

---

## Troubleshooting

**Q: Changes not showing up?**
- Make sure you clicked "Save Changes" first
- Then click "Publish to Live"
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

**Q: Can't login?**
- Username: `admin`
- Password: `admin@123`
- Check you're at correct URL: `/changebusiness`

**Q: Colors still showing old brand?**
- Make sure publish was successful (green message)
- Clear browser cache
- Try in a different browser

**Q: WhatsApp/Telegram not sending messages?**
- Test connection first to validate credentials
- Check phone number format (+country code)
- Verify API keys/tokens are correct

---

## Environment Variables (if you want to change credentials)

Edit `.env` file:
```env
VITE_ADMIN_ID=admin
VITE_ADMIN_PASSWORD=admin@123
```

Then restart your dev server or redeploy to production.

---

## Security Notes

- Keep your admin credentials secure
- Don't share `.env` file publicly
- Change credentials after initial setup
- Use Firebase security rules to restrict database access

---

## Next Steps

1. ✓ Complete First Time Setup above
2. ✓ Configure WhatsApp or Telegram for orders
3. ✓ Test order notifications
4. ✓ Monitor orders in `/admin` panel
5. ✓ Update policies and branding as needed

**You're all set! Your business is now fully configured and dynamic! 🚀**
