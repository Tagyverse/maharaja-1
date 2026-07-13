# R2 Warning - 5 Minute Fix

## You See This:
```
Branding saved but: R2 binding not configured
```

## Here's What To Do:

### 1️⃣ Create R2 Bucket (2 minutes)

Open: https://dash.cloudflare.com/

- Click **R2** (left sidebar)
- Click **"Create bucket"** button
- Enter name: `srimaharaja-images`
- Click **"Create"**
- Done! ✓

### 2️⃣ Deploy Code (2 minutes)

In your terminal:

```bash
npm run build
wrangler pages deploy dist
```

Wait for it to finish. Should see deployment success message.

### 3️⃣ Verify It Works (1 minute)

1. Go to SuperAdmin
2. Rebrand Tool
3. Change something (e.g., brand name)
4. Click "Publish to Cloudflare"
5. Should see: **"Branding published to Cloudflare!"**

✓ No warning = Success!

---

## What Just Happened?

- **R2 Bucket**: Cloud storage for branding data
- **Wrangler Deploy**: Connected bucket to your website
- **Publish**: Now uploads branding changes to the cloud
- **Result**: Changes live worldwide in 5 minutes!

---

## That's It!

Your branding system is now fully live. Every time you:

1. Edit in Rebrand Tool
2. Save to Firebase
3. Publish to Cloudflare

→ Your website gets updated automatically in 5 minutes.

No redeploy needed. Ever. 🚀
