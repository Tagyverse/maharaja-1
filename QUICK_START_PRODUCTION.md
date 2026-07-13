# Quick Start - Production Deployment

## 1. Environment Setup (5 minutes)

### Step 1: Verify .env files exist
```bash
ls -la | grep env
# Should show: .env.local, .env.production
```

### Step 2: Update Cloudflare Environment Variables
Go to **Cloudflare Pages > Project Settings > Environment Variables**

Add these for **Production**:
```
RAZORPAY_KEY_ID=rzp_live_[your_key]
RAZORPAY_KEY_SECRET=rzp_live_[your_secret]
RAZORPAY_WEBHOOK_SECRET=wh_live_[your_webhook]
RESEND_API_KEY=re_[your_resend_key]
```

## 2. Deploy (3 minutes)

### Option A: Using Wrangler
```bash
npm run build
wrangler pages deploy dist
```

### Option B: Using GitHub (if connected)
```bash
git add .
git commit -m "Production: Advanced branding system v2.0"
git push origin main
# Cloudflare will auto-deploy
```

## 3. Verify Deployment (2 minutes)

### Check Cloudflare
1. Go to Pages > Project
2. Check latest deployment status
3. Verify all functions compiled

### Test Endpoints
```bash
# Get published data (should return default theme)
curl https://srimaharaja.com/api/get-published-data

# Check health
curl https://srimaharaja.com/ -I
```

## 4. Test in Admin (5 minutes)

1. Go to **SuperAdmin** → **Rebrand Tool**
2. Select **"Branding Studio Pro"** if available
3. Click **Quick Apply** tab
4. Select **Modern Pro** preset
5. Click **Save to Firebase**
6. Click **Publish to Cloudflare**
7. Wait 5 minutes and refresh home page

## 5. Rollback (if needed)

### Revert in Cloudflare Pages
1. Pages > Project > Deployments
2. Find previous deployment
3. Click "Rollback to this deployment"

### Reset to Default Theme
1. Delete `site-data.json` from R2 bucket
2. API will return default theme
3. Upload again after fix

---

## New Files

| File | Usage |
|------|-------|
| `RebrandToolPro.tsx` | Advanced 8-tab editor (instead of old RebrandTool) |
| `DesignSystemPreview.tsx` | Live component showcase |
| `AdvancedBrandingEditor.tsx` | Export/download editor |
| `advancedBrandingPresets.ts` | 5+ production themes |
| `brandingAdvanced.ts` | Complete type system |

## Available Presets

1. **Modern Pro** - Dark, professional, clean
2. **Luxury Elite** - Gold, premium, sophisticated
3. **Minimal Zen** - White, simple, calm
4. **Bold Energy** - Pink, cyan, vibrant
5. **Playful Kids** - Colorful, fun, rounded
6. **Classic Heritage** - Brown, traditional, elegant

---

## API Endpoints

### GET /api/get-published-data
```bash
curl https://srimaharaja.com/api/get-published-data
# Returns: { branding, navigation_settings, card_design, published_at, version }
```

### POST /api/publish-data
```bash
curl -X POST https://srimaharaja.com/api/publish-data \
  -H "Content-Type: application/json" \
  -d '{"data": {...branding theme...}}'
```

---

## Troubleshooting

### Issue: "R2 not configured"
**Solution**: This is normal. R2 is optional. First publish will create `site-data.json`.

### Issue: Branding not updating
**Solution**: Clear Cloudflare cache
1. Pages > Project > Cache
2. Click "Purge Cache"
3. Wait 5 minutes

### Issue: Preset not appearing
**Solution**: 
1. Check browser cache (Ctrl+Shift+Del)
2. Verify file: `src/config/advancedBrandingPresets.ts`
3. Run `npm run build` again

### Issue: API returning 404
**Solution**: This is expected on first load. Hit "Publish" once to create `site-data.json`.

---

## Performance

| Component | Size | Time |
|-----------|------|------|
| Build | 247KB gzip | 9.96s |
| API Response | <200ms | - |
| Page Load | ~2s | - |
| Cache | 5 min | - |

---

## Monitoring

### Check Logs
Cloudflare Pages > Project > Logs

### Check Performance
Cloudflare Pages > Project > Metrics

### Check R2
R2 > Bucket > `srimaharaja-images`
- Look for `site-data.json`
- Check file size (should be 2-5KB)
- Check last modified time

---

## Production Checklist

Before going live:

- [ ] Environment variables set in Cloudflare
- [ ] Wrangler configured with credentials
- [ ] Build passes: `npm run build`
- [ ] Functions compile: `npm run build:functions`
- [ ] Deploy to production
- [ ] API endpoints respond 200
- [ ] Test preset selection
- [ ] Publish one preset to R2
- [ ] Verify R2 contains data
- [ ] Monitor for 24 hours
- [ ] Gather user feedback

---

## Support

For detailed help:
- `PRODUCTION_DEPLOYMENT.md` - Full guide
- `PRODUCTION_READY_SUMMARY.md` - Complete overview
- Check Cloudflare Pages logs for errors

---

## Command Reference

```bash
# Build for production
npm run build

# Deploy immediately
wrangler pages deploy dist

# Test locally
npm run dev

# Check TypeScript
npx tsc --noEmit

# Build only functions
npm run build:functions

# View wrangler config
cat wrangler.toml

# View environment
cat .env.production
```

---

**Status: READY FOR PRODUCTION**

Deploy now with confidence!
