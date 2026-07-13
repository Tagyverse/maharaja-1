# Production Deployment Guide

## Overview
This guide covers deploying the Sri Maharaja advanced branding system to production.

## System Features

### Advanced Branding Studio (v2.0)
- 8-section tabbed interface for complete design control
- 5+ production-ready presets (Modern Pro, Luxury Elite, Minimal Zen, Bold Energy, Playful Kids, Classic Heritage, etc.)
- Live component previews
- Design system exports (JSON, CSS, TypeScript)
- Firebase persistence + Cloudflare R2 publishing

### Production-Ready Components
- `RebrandToolPro.tsx` - Advanced 8-tab branding editor
- `DesignSystemPreview.tsx` - Live component showcase
- `AdvancedBrandingEditor.tsx` - Code export & download
- `advancedBrandingPresets.ts` - 5+ complete themes

---

## Environment Setup

### 1. Environment Variables

#### Local Development (.env.local)
```
VITE_ADMIN_ID=admin
VITE_ADMIN_PASSWORD=admin123
VITE_R2_BUCKET_URL=https://srimaharaja-images.r2.dev
FIREBASE_DATABASE_URL=https://maharajagroups-29c74-default-rtdb.firebaseio.com
VITE_SUPABASE_URL=https://fqxdxobrtxhpezjzqrnf.supabase.co
VITE_SUPABASE_ANON_KEY=[your-supabase-key]
RAZORPAY_KEY_ID=[test-key-for-dev]
RAZORPAY_KEY_SECRET=[test-secret-for-dev]
RAZORPAY_WEBHOOK_SECRET=[test-webhook-for-dev]
```

#### Production (Cloudflare Pages)
Set these in Cloudflare Pages Environment Variables:

```
RAZORPAY_KEY_ID=rzp_live_production_key_id
RAZORPAY_KEY_SECRET=rzp_live_production_key_secret
RAZORPAY_WEBHOOK_SECRET=wh_live_production_webhook_secret
RESEND_API_KEY=your_resend_api_key
FIREBASE_DATABASE_URL=https://maharajagroups-29c74-default-rtdb.firebaseio.com
SUPABASE_URL=https://fqxdxobrtxhpezjzqrnf.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
R2_BUCKET_NAME=srimaharaja-images
R2_BUCKET_URL=https://srimaharaja-images.r2.dev
```

### 2. Cloudflare Configuration

#### wrangler.toml
- R2 bucket binding: `srimaharaja-images` (create in R2 dashboard first)
- Environment variables configured for prod/preview
- Pages build output: `dist`

#### Cloudflare Pages Settings
1. Go to Pages > Project
2. Settings > Environment Variables
3. Add production environment variables
4. Set custom domain: `srimaharaja.com`

### 3. Firebase Setup
- Database: `maharajagroups-29c74-default-rtdb.firebaseio.com`
- Branding data stored at `/branding`
- Ensure appropriate security rules

### 4. R2 Storage
- Bucket name: `srimaharaja-images`
- Publish endpoint: `https://srimaharaja-images.r2.dev`
- Enable CORS for image uploads
- Cloudflare Analytics enabled

---

## Deployment Steps

### Step 1: Pre-Deployment Checklist
```bash
# Verify build
npm run build

# Check functions compile
npm run build:functions

# Verify no TypeScript errors
npx tsc --noEmit
```

### Step 2: Deploy to Cloudflare Pages
```bash
# Using Wrangler
wrangler pages deploy dist

# Or via GitHub (if connected)
git push origin main
# (Cloudflare will auto-deploy)
```

### Step 3: Verify Deployment
1. Check Cloudflare Pages deployment status
2. Test branding API endpoints:
   - `GET /api/get-published-data` → returns branding theme
   - `POST /api/publish-data` → updates R2 with new branding
3. Verify R2 bucket contains `site-data.json`

### Step 4: Enable Features
In SuperAdmin:
1. Navigate to Rebrand Tool
2. Click "Switch to Branding Studio Pro" (if available)
3. Test preset selection
4. Publish to Cloudflare
5. Verify live updates

---

## API Endpoints

### GET /api/get-published-data
Fetches current branding theme from R2 (or returns default)

**Response:**
```json
{
  "branding": {
    "name": "Sri Maharaja",
    "tagline": "Premium Quality Crackers",
    "theme": { ... advanced branding theme ... }
  },
  "navigation_settings": { ... },
  "card_design": { ... },
  "published_at": "2024-01-15T10:30:00Z",
  "version": "2.0.0"
}
```

### POST /api/publish-data
Publishes branding theme to Cloudflare R2

**Request:**
```json
{
  "data": {
    "branding": { ... },
    "navigation_settings": { ... },
    "card_design": { ... }
  }
}
```

**Response:**
```json
{
  "success": true,
  "published_at": "2024-01-15T10:30:00Z",
  "size": 2048,
  "productCount": 45,
  "categoryCount": 8
}
```

---

## Branding Presets

### Available Themes
1. **Modern Pro** - Contemporary, clean, professional
2. **Luxury Elite** - Premium, sophisticated, high-end
3. **Minimal Zen** - Simple, calm, minimalist
4. **Bold Energy** - Vibrant, energetic, eye-catching
5. **Playful Kids** - Fun, colorful, child-friendly
6. **Classic Heritage** - Traditional, timeless, heritage

### Custom Presets
To add new presets:
1. Edit `src/config/advancedBrandingPresets.ts`
2. Add new theme object following `AdvancedBrandingTheme` type
3. Include: colors, typography, spacing, components, etc.
4. Run `npm run build` to verify
5. Deploy changes

---

## Monitoring & Maintenance

### Health Checks
- R2 bucket accessible and populated
- Firebase database responding
- API endpoints returning 200
- Branding data valid JSON

### Performance
- Build size: ~968KB (247KB gzip)
- API response time: <200ms
- R2 cache: 5 minutes (Cache-Control: max-age=300)

### Common Issues

#### R2 Not Configured
- Branding data is collected but not uploaded
- Error message suggests configuring R2 in Cloudflare dashboard
- Publishing still succeeds with warning

#### 404 on Published Data
- No published data exists yet
- API returns default branding structure
- First publish will create `site-data.json` in R2

#### Presets Not Appearing
- Clear browser cache
- Verify `advancedBrandingPresets.ts` is built
- Check SuperAdmin component imports

---

## Rollback Procedure

If deployment fails:
1. Check Cloudflare Pages deployment history
2. Revert to previous deployment
3. Verify R2 bucket has backup `site-data.json`
4. Clear browser cache
5. Test again

---

## Performance Optimization

### Caching Strategy
- API responses cached 5 minutes
- CSS/JS cached 1 year
- Images cached via CDN

### Bundle Optimization
- Code splitting enabled
- Lazy loading for admin components
- Tree-shaking for unused presets

---

## Security Considerations

1. Admin credentials in `.env.local` only (not in repo)
2. Razorpay keys in Cloudflare secrets (never hardcoded)
3. Firebase security rules enabled
4. CORS configured for R2
5. Rate limiting on publish endpoint

---

## Next Steps

1. Deploy to production following steps above
2. Test all branding features in admin
3. Monitor API performance
4. Gather user feedback on presets
5. Add custom presets as needed

---

## Support

For issues:
- Check Cloudflare Pages logs
- Verify `.env.production` variables
- Review R2 bucket permissions
- Test API endpoints directly
- Check browser console for client errors
