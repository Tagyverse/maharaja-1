# ChangeBusiness Component Guide

## Overview

The `ChangeBusiness` component is a dedicated, focused admin interface for managing business information that displays on your homepage footer. It contains only workable features that directly reflect on the live homepage.

## Location

- **Component:** `/src/components/admin/ChangeBusiness.tsx`
- **Tab:** Admin → "Business Info"
- **Icon:** Building2

## Features

### 1. **Company Details**
- Company Name (required)
- Business Description
- Copyright Text

### 2. **Contact Information** (appears in footer)
- Email Address (required, with validation)
- Phone Number (required)
- Business Address (required)
- Toggle to show/hide contact information on homepage

### 3. **Social Media Links** (optional)
- Facebook
- Instagram
- Twitter/X
- LinkedIn
- YouTube
- Toggle to show/hide social links on homepage

## How It Works

### Saving Business Information

1. Navigate to **Admin → Business Info** tab
2. Fill in your business details:
   - All required fields must be completed (marked with *)
   - Email must be a valid email address
   - Phone and address should be customer-facing information
3. Click **"Save Business Information"** button
4. Confirmation message appears when successfully saved
5. Data is stored in Firebase at `footer_config`

### Publishing to Homepage

The business information is saved to Firebase immediately. To make changes live on your homepage:

1. Go to **Admin → Publish** tab
2. Click **"Publish to Cloudflare R2"** button
3. The data will merge with existing published data (no data loss)
4. Wait for publication to complete
5. Your homepage footer will update with the new business information

### Frontend Display

All business information displays in the Footer component at:
- **Location:** Bottom of every page on your homepage
- **Controlled by:** `footer_config` published data
- **Shows:** Company name, description, contact info, and social links (based on toggles)

## Database Schema

Business data is stored in Firebase under `footer_config`:

```javascript
{
  companyName: "Your Business",
  description: "Your business description",
  email: "contact@yourbusiness.com",
  phone: "+1 (555) 000-0000",
  address: "Your address here",
  social: {
    facebook: "https://facebook.com/yourbusiness",
    instagram: "https://instagram.com/yourbusiness",
    twitter: "https://twitter.com/yourbusiness",
    linkedin: "https://linkedin.com/company/yourbusiness",
    youtube: "https://youtube.com/@yourbusiness"
  },
  copyrightText: "© 2024 Your Business. All rights reserved.",
  showContact: true,
  showSocial: true,
  updated_at: "2024-01-15T10:30:00Z"
}
```

## Data Validation

The component validates:
- ✓ Company name is required
- ✓ Email is required and must contain @ symbol
- ✓ Phone number is required
- ✓ Address is required
- ✓ Shows error messages for invalid data

## Publishing Integration

When you save and publish:

1. **Local Save:** Data saves to Firebase immediately
2. **Publishing:** Data is merged with other published sections (carousel, products, etc.)
3. **Merge Strategy:** Only the business/footer fields are updated, preserving all other data
4. **Live Update:** Homepage footer updates to show new business information

## Important Notes

- **This component only manages business information** that appears in the footer
- **No data loss:** Publishing business info will NOT delete other published data (admin push, carousel, etc.)
- **Footer styling:** Business details display in your configured footer theme
- **Social links are optional:** Leave blank if you don't want to show that social platform
- **Contact info visibility:** Use toggles to control what appears on the homepage

## Troubleshooting

### Business info not showing on homepage?
1. Check that "Show contact information on homepage" is enabled
2. Run publish from Admin → Publish tab
3. Clear browser cache and reload homepage
4. Check that footer_config exists in Firebase

### Changes not saving?
1. Make sure all required fields are filled
2. Check that email format is valid (contains @)
3. Check browser console for Firebase errors
4. Verify you have Firebase write permissions

### Only some fields updated?
1. This is normal - only fields you changed are updated
2. Previous data for other fields is preserved
3. To reset a field, fill it with empty value and save

## Related Components

- **FooterManager:** Advanced footer styling (themes, colors, layout)
- **Footer:** Frontend component that displays all business info
- **PublishManager:** Publishes all changes to Cloudflare R2
- **NavigationCustomizer:** Customizes header navigation
