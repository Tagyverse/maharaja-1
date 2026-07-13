# SuperAdmin Publishing Guide

## Quick Start: Publishing from SuperAdmin

### Rebrand Tool (Fast 10-minute rebrand)
1. Go to **SuperAdmin → Rebrand**
2. Edit brand name, tagline, logo, colors, contact info
3. Click **"Save to Firebase"** (saves locally)
4. Click **"Publish to Cloudflare"** (pushes to live)
5. Check for success/warning messages

### Publish Manager (Full data sync)
1. Go to **Admin → Publish Manager**
2. Click **"Preview Data"** to see what will be published
3. Click **"Publish Data"** to push everything to R2
4. Monitor the progress messages

---

## Understanding Status Messages

### ✅ Success
- **Message:** `"Successfully published to live!"`
- **Action:** Data is now live for all users (updates within 5 minutes)
- **Next:** No action needed

### ⚠️ Warning (New in this fix)
- **Message:** `"Published (with warnings)"`
- **Details:** `"...R2 binding not configured..."`
- **Action:** Configure R2 in Cloudflare dashboard (see setup below)
- **Impact:** Data collected but not uploaded to R2 storage yet

### ❌ Error
- **Message:** `"Publish failed"` with error details
- **Action:** Check browser console (F12) for `[REBRAND]` or `[PUBLISH]` logs
- **Common causes:**
  - No internet connection
  - Firebase database is down
  - Cloudflare API rate limited
  - Invalid data format

---

## Setting Up R2 Storage

### 1. Create R2 Bucket in Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2 Storage** in the left sidebar
3. Click **"Create Bucket"**
4. Enter bucket name: `srimaharaja-images`
5. Choose location (closest to your users)
6. Click **"Create Bucket"**

### 2. Get API Credentials

1. Go to **Account Settings** → **API Tokens**
2. Click **"Create Token"**
3. Choose template: **"Edit Cloudflare Workers"**
4. Grant permissions: ✓ R2 (All)
5. Copy the token (you'll need it for wrangler)

### 3. Configure wrangler.toml

Check your `wrangler.toml` file (in project root):

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "srimaharaja-images"
preview_bucket_name = "srimaharaja-images"
```

✅ If this looks correct, your project is ready!

### 4. Deploy

```bash
# Commit and push changes
git add wrangler.toml
git commit -m "Configure R2 bucket binding"
git push origin main
```

Cloudflare automatically redeploys with the new R2 binding.

---

## Debugging Tips

### Check if R2 is working
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try publishing
4. Look for logs starting with:
   - `[REBRAND]` - Rebrand tool logs
   - `[PUBLISH]` - Publish manager logs
   - `[PUBLISH] R2 upload failed:` - R2 connection error

### View Cloudflare Worker Logs
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on your project name
3. Go to **Pages** → **All deployments**
4. Click the latest deployment
5. Click **"View logs"** to see worker execution logs

### Test Data Collection
1. Go to **Admin → Publish Manager**
2. Click **"Preview Data"** first
3. Check that all sections show data:
   - Products count
   - Categories count
   - Size in KB
4. If any are empty, check that data exists in Firebase

---

## What Gets Published

When you click "Publish", this data is sent to R2:

- 📦 **Products** - All product data with images, prices, descriptions
- 🏷️ **Categories** - Product categories and organization
- 🎨 **Branding** - Colors, fonts, logo, company info
- ⚙️ **Navigation** - Menu settings and layout
- 📱 **Site Content** - Banners, text, promotions
- 🔗 **Social Links** - Instagram, Facebook, TikTok URLs
- 💬 **Messages** - FAQ, policies, contact info

All data is stored as `site-data.json` in your R2 bucket.

---

## FAQ

**Q: How long until changes go live?**
A: Usually within 5 minutes. Cache refreshes on next page load.

**Q: Can I publish without R2?**
A: Yes! With the latest fix, data is collected even if R2 isn't configured. You'll see a warning, but no error.

**Q: Where are my published files stored?**
A: In Cloudflare R2, in the bucket specified in `wrangler.toml` (default: `srimaharaja-images`)

**Q: Can I rollback a publish?**
A: Check the publish history in Admin panel → Publish Manager → "History" tab

**Q: What if publish fails with no error?**
A: Check your internet connection and Cloudflare status. Look at worker logs for details.

---

## Files Involved

- `wrangler.toml` - R2 bucket configuration
- `functions/api/publish-data.js` - API that handles publishing
- `src/components/admin/PublishManager.tsx` - UI for publishing
- `src/components/admin/RebrandTool.tsx` - Rebrand publishing

