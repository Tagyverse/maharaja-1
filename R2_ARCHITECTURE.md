# R2 Architecture & Data Flow

## Complete Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          SUPER ADMIN PANEL                                       │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ RebrandTool Component (src/components/admin/RebrandTool.tsx)            │   │
│  │                                                                         │   │
│  │ ┌─ Tabs ────────────────────────────────────────────────────────────┐  │   │
│  │ │ • Basic Info                                                     │  │   │
│  │ │ • Colors (with presets)                                         │  │   │
│  │ │ • Presets (6 themes)                                            │  │   │
│  │ │ • Navigation Styling                                            │  │   │
│  │ │ • Card Design                                                   │  │   │
│  │ └────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                         │   │
│  │ [Save to Firebase] [Publish to Cloudflare] [Copy brand.ts] [Copy JSON]│   │
│  │                                                                         │   │
│  └─────────────────────────┬───────────────────────────────────────────────┘   │
└────────────────────────────┼──────────────────────────────────────────────────┘
                             │
                 ┌───────────▼──────────────┐
                 │ Fetch Existing Data      │
                 │ GET /api/get-published   │
                 └───────────┬──────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
    ▼ (Dev)                              ▼ (Production)
┌─────────────────┐               ┌──────────────────────┐
│ R2 Not Available│               │ R2 Available         │
│ (No Binding)    │               │ (From wrangler.toml) │
│                 │               │                      │
│ Returns Default │               │ Fetches from R2      │
│ Branding Data   │               │ site-data.json       │
└────────┬────────┘               └──────────┬───────────┘
         │                                    │
         └──────────────┬─────────────────────┘
                        │
         ┌──────────────▼──────────────┐
         │ Load Branding into Form     │
         │ (Pre-fill edit fields)      │
         └──────────────┬──────────────┘
                        │
                ┌───────▼────────┐
                │ User Edits     │
                │ - Colors       │
                │ - Name/Tagline │
                │ - Navigation   │
                │ - Card Design  │
                └───────┬────────┘
                        │
                ┌───────▼─────────────────┐
                │ Click "Publish"         │
                │ POST /api/publish-data  │
                └───────┬─────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
   ▼ (Dev)                         ▼ (Production)
┌─────────────────┐          ┌──────────────────────┐
│ R2 Not Available│          │ R2 Available         │
│ (No Binding)    │          │ (From wrangler.toml) │
│                 │          │                      │
│ ✅ Returns:     │          │ ✅ Uploads to R2:    │
│ {               │          │ {                    │
│  success: true, │          │  success: true,      │
│  warning:       │          │  r2_configured: true │
│   "Not config"  │          │ }                    │
│ }               │          │                      │
│                 │          │ 📦 R2 Bucket         │
│ ⚠️ No upload    │          │ site-data.json       │
└────────┬────────┘          └──────────┬───────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼─────────────┐
         │ Show Success Message       │
         │ User Sees Toast Notification
         └──────────────┬─────────────┘
                        │
           ┌────────────▼────────────┐
           │ Live Site Loads Branding│
           │                         │
           │ usePublishedDataContext │
           │ GET /api/get-published  │
           └────────────┬────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
   ▼ (Dev - No R2)              ▼ (Production - R2)
┌──────────────────┐       ┌─────────────────────┐
│ Returns Defaults │       │ Fetches from R2     │
│                  │       │ - site-data.json    │
│ Default Branding │       │ - All updated data  │
│ Applied to Site  │       │                     │
│                  │       │ Updated Branding    │
│ Dev testing OK   │       │ Applied to Site     │
└──────────────────┘       │                     │
                           │ Live globally!      │
                           │ ~5 min propagation  │
                           └─────────────────────┘
```

---

## API Endpoints Explained

### 1. GET /api/get-published-data
**Purpose**: Fetch existing branding data

```typescript
Request:  GET /api/get-published-data

Response (Production - R2 Available):
{
  "branding": { ... data from R2 ... },
  "navigation_settings": { ... },
  "card_design": { ... },
  "published_at": "2025-07-13T10:30:00Z",
  "version": "1.0.0"
}

Response (Development - No R2):
{
  "branding": { ... default data ... },
  "navigation_settings": { ... defaults ... },
  "card_design": { ... defaults ... },
  "published_at": "2025-07-13T10:30:00Z",
  "version": "1.0.0",
  "isDefault": true
}
```

### 2. POST /api/publish-data
**Purpose**: Save branding data to R2

```typescript
Request:
{
  "data": {
    "branding": { ... updated data ... },
    "navigation_settings": { ... },
    "card_design": { ... },
    "products": { ... },
    "categories": { ... }
  }
}

Response (Production - R2 Available):
{
  "success": true,
  "published_at": "2025-07-13T10:30:00Z",
  "size": 2048,
  "productCount": 15,
  "categoryCount": 5,
  "r2_configured": true
}

Response (Development - No R2):
{
  "success": true,
  "published_at": "2025-07-13T10:30:00Z",
  "size": 2048,
  "productCount": 15,
  "categoryCount": 5,
  "warning": "R2 binding not configured - data collected but not uploaded to R2",
  "r2_configured": false
}
```

---

## File Structure for R2

### In Cloudflare R2 Bucket
```
srimaharaja-images/
├── site-data.json          ← Main branding/product data
├── images/
│   ├── product-1.jpg
│   ├── product-2.jpg
│   └── ...
└── metadata/
    └── version.txt
```

### In wrangler.toml (Configuration)
```toml
[[r2_buckets]]
binding = "R2_BUCKET"           # Variable name in code
bucket_name = "srimaharaja-images"  # Actual bucket name
preview_bucket_name = "srimaharaja-images"  # Local preview
```

---

## Environment Detection

### How the System Knows When R2 is Available

```typescript
// In Cloudflare Worker Context
export const onRequest: PagesFunction<Env> = async (context) => {
  // Cloudflare sets this automatically when deployed
  const env = context.env as Env;
  
  if (env.R2_BUCKET) {
    // ✅ We're in production, Cloudflare provided the binding
    // Upload to R2
  } else {
    // ❌ We're in local dev, no R2 binding available
    // Use fallback
  }
}
```

### Local Development
```
wrangler dev
  ↓
Wrangler doesn't have R2 bucket available locally
  ↓
env.R2_BUCKET = undefined
  ↓
API detects this and uses fallback
```

### Production (Cloudflare Pages)
```
wrangler deploy
  ↓
Cloudflare reads wrangler.toml
  ↓
Cloudflare provides R2 binding automatically
  ↓
env.R2_BUCKET = actual R2Bucket instance
  ↓
API uploads to R2 successfully
```

---

## Data Persistence Flow

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN EDITS BRANDING                                    │
│ (RebrandTool Component)                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │ Save to Firebase   │
         │ (Local Persistence)│
         └─────────┬──────────┘
                   │
    ┌──────────────▼────────────────┐
    │ Publish to Cloudflare         │
    │ POST /api/publish-data        │
    └──────────────┬────────────────┘
                   │
        ┌──────────▼──────────┐
        │ Upload to R2        │
        │ site-data.json      │
        └──────────┬──────────┘
                   │
     ┌─────────────▼────────────┐
     │ Cloudflare CDN Caches    │
     │ (5 minute TTL)           │
     └─────────────┬────────────┘
                   │
    ┌──────────────▼────────────────┐
    │ All Global Endpoints Served   │
    │ Updated Branding Applied      │
    │ ✅ Live Worldwide             │
    └───────────────────────────────┘
```

---

## Deployment Checklist

```
□ wrangler.toml has [[r2_buckets]] section
  └─ binding = "R2_BUCKET"
  └─ bucket_name = "srimaharaja-images"

□ Cloudflare Account has R2 bucket
  └─ Named: "srimaharaja-images"
  └─ Accessible with API token

□ Build succeeds
  npm run build ✓

□ Deploy succeeds
  wrangler deploy ✓

□ Test admin publish
  □ Open SuperAdmin
  □ Edit branding
  □ Click Publish
  □ Check response (should have r2_configured: true)

□ Verify in Cloudflare Dashboard
  □ Go to R2
  □ Open bucket
  □ See site-data.json with recent timestamp
  └─ ✅ Branding is being uploaded!
```

---

## Troubleshooting

### ❌ Getting "R2_BUCKET not configured" in production
**Solution:**
1. Check wrangler.toml has r2_buckets
2. Check Cloudflare bucket exists and is named correctly
3. Redeploy: `wrangler deploy`

### ❌ Branding not updating on live site
**Solution:**
1. Check if publish succeeded (look for r2_configured: true)
2. Check R2 bucket has site-data.json
3. Check timestamp is recent (within 5 min)
4. Wait ~5 minutes for CDN cache to clear
5. Hard refresh browser (Ctrl+Shift+R)

### ✅ Getting "R2 not configured" warning locally (NORMAL!)
**Solution:**
- This is expected in local development
- R2 only available when deployed
- No action needed!

---

## Summary

| Component | Dev | Production |
|-----------|-----|-----------|
| wrangler.toml | Has config | Has config |
| env.R2_BUCKET | undefined | Available |
| API behavior | Fallback | Upload to R2 |
| Admin works? | Yes | Yes |
| Data persists? | Firebase only | R2 + Firebase |
| Live site updates? | No | Yes (~5 min) |

**R2 is an advanced persistence layer that works automatically in production!** 🚀
