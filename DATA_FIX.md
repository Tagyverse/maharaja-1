# Data Preservation Fix

## Problem
When updating business info in `/changebusiness`, other previously saved data was being lost. This was caused by the save functions completely replacing the entire document instead of performing a partial update.

## Root Cause
The `saveBusinessConfig()` and `saveOrderChannel()` functions in `businessConfigManager.ts` were using Firebase's `set()` method, which completely overwrites a document.

```typescript
// OLD - LOSES DATA
await set(configRef, data);  // Replaces entire document
```

## Solution
Updated both save functions to:
1. **Fetch existing data** from Firebase first
2. **Merge** the existing data with the new changes
3. **Save the merged result** back to Firebase

```typescript
// NEW - PRESERVES DATA
const snapshot = await get(configRef);
const existingData = snapshot.exists() ? snapshot.val() : getDefaultConfig();
const mergedData = { ...existingData, ...config };
await set(configRef, mergedData);
```

## How It Works

### When you save business config:
```
1. Fetch current data from Firebase
2. Merge with your changes:
   - Your new values override old ones
   - Untouched fields remain unchanged
3. Save complete merged data back to Firebase
```

### Example:
**Original saved data:**
```json
{
  "company_name": "Acme Corp",
  "primary_color": "#ff0000",
  "tagline": "Best Products"
}
```

**You update only company_name:**
```json
{
  "company_name": "Acme Corporation"
}
```

**Result saved to Firebase:**
```json
{
  "company_name": "Acme Corporation",  ✓ Updated
  "primary_color": "#ff0000",          ✓ Preserved
  "tagline": "Best Products"           ✓ Preserved
}
```

## Files Modified
- `/src/utils/businessConfigManager.ts`
  - `saveBusinessConfig()` - Now preserves data
  - `saveOrderChannel()` - Now preserves data

## Testing
1. Go to `/changebusiness`
2. Save some data (e.g., company name, colors)
3. Reload page
4. Change only one field (e.g., tagline)
5. Save again
6. Verify all previous data is still there

All previous data should now be preserved when you update!
