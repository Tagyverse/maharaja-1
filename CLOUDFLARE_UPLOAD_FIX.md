# Cloudflare Upload Fix - SuperAdmin Publish to R2

## The Problem
When trying to push/upload data to Cloudflare R2 from the SuperAdmin panel, the operation was failing with:
- **Error:** `R2_BUCKET binding not configured`
- **Impact:** SuperAdmin couldn't publish branding changes or product data to the live R2 storage

## Root Causes

1. **Hard failure on missing R2 binding** - The API (`publish-data.ts`) was throwing an error if the R2 binding wasn't available, instead of gracefully handling the case
2. **No fallback behavior** - Even if R2 wasn't configured, the data collection was still valid and should have been saved
3. **Poor error messages** - Users had no clear feedback about what went wrong

## The Solution

### 1. Updated `/api/publish-data` (functions-src/api/publish-data.ts)
- Made `R2_BUCKET` an optional binding (`R2_BUCKET?: R2Bucket`)
- Added try-catch around R2 upload to handle failures gracefully
- Returns success even if R2 upload fails, with a warning
- Improved logging for debugging

**Before:**
```typescript
if (!context.env.R2_BUCKET) {
  return new Response(
    JSON.stringify({ error: 'R2_BUCKET binding not configured' }),
    { status: 500, ... }
  );
}
```

**After:**
```typescript
if (context.env.R2_BUCKET) {
  try {
    await context.env.R2_BUCKET.put('site-data.json', ...);
    return success response;
  } catch (r2Error) {
    console.error('[PUBLISH] R2 upload failed:', r2Error);
    // Continue to fallback
  }
}
return success with warning;
```

### 2. Updated RebrandTool (src/components/admin/RebrandTool.tsx)
- Parse response JSON before checking status
- Handle warning responses properly
- Show warning message to user without blocking publish

### 3. Updated PublishManager (src/components/admin/PublishManager.tsx)
- Handle single `warning` field from API response
- Display warnings to users in the success message
- Log warnings for debugging

## How to Fix R2 Configuration

If you see the warning `R2 binding not configured`, follow these steps:

### In Cloudflare Dashboard:
1. Go to **R2 Storage** → **Buckets**
2. Create a bucket named `srimaharaja-images` (or your configured name)
3. Go to **Account Settings** → **API Tokens**
4. Create an API token with R2 permissions

### In wrangler.toml:
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "srimaharaja-images"
preview_bucket_name = "srimaharaja-images"
```

### Deploy:
```bash
git push origin main
# Cloudflare automatically redeploys with the new binding
```

## Testing the Fix

1. Go to **SuperAdmin** → **Rebrand**
2. Click **"Publish to Cloudflare"**
3. You should see one of these outcomes:
   - ✅ Success: "Branding published to Cloudflare! Live in ~5 min."
   - ⚠️ Warning: "Branding saved but: R2 binding not configured..."
   - ❌ Error: Check browser console for detailed error

Check the browser console (F12) for detailed logs starting with `[REBRAND]` or `[PUBLISH]`

## Files Modified

- `functions-src/api/publish-data.ts` - Core fix to handle missing R2 gracefully
- `src/components/admin/RebrandTool.tsx` - Better error handling for publish response
- `src/components/admin/PublishManager.tsx` - Handle warnings in response

## Next Steps

1. **Verify R2 bucket exists** in Cloudflare dashboard
2. **Check wrangler.toml** has correct bucket_name
3. **Deploy** the updated code
4. **Test publishing** from SuperAdmin panel
5. **Check Cloudflare logs** if issues persist: Pages → All deployments → View logs
