# FIX ADMIN 401 ERROR - DO THIS NOW! 🚨

## The Problem
Your admin account gets 401 Unauthorized and logs out when accessing admin pages.

## Root Cause
**Firebase Admin SDK is NOT initialized on Vercel backend**, so it cannot verify your Firebase authentication token.

## Quick Fix (5 minutes)

### Step 1: Get Firebase Credentials
Run this command in your terminal:

```bash
cat Server/seu-matrimony.json | tr -d '\n' | tr -d ' '
```

This will output a VERY LONG string starting with `{"type":"service_account"...`

**Copy the entire output** (Cmd+A, Cmd+C)

### Step 2: Add to Vercel

1. Go to: **https://vercel.com/dashboard**
2. Click on your **server-gold-nu** project
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New** button
6. Fill in:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Paste the long string from Step 1
   - **Environments**: Check all three boxes (Production, Preview, Development)
7. Click **Save**

### Step 3: Redeploy Backend

Still in Vercel dashboard:
1. Click **Deployments** (top menu)
2. Find the latest deployment (top of list)
3. Click the **...** (three dots) button on the right
4. Click **Redeploy**
5. Wait 30-60 seconds for deployment to complete

### Step 4: Verify It's Working

Run this command:
```bash
curl https://server-gold-nu.vercel.app/
```

Look for this in the output:
```json
"firebase": "✅ Initialized"
```

If you see `"firebase": "❌ Not Initialized"`, the environment variable wasn't set correctly. Try again.

### Step 5: Test Admin Panel

1. Go to: **http://localhost:5174/** (local dev server is running)
2. Login with: `2024200000635@seu.edu.bd`
3. Go to **Admin Dashboard** → **Pending Biodatas**
4. **Open browser console** (F12 or Cmd+Option+I)
5. Look for these logs:
   ```
   🔑 UseAxiosSecure: Getting token for request to /admin/pending-biodatas
   ✅ Token obtained from Firebase auth.currentUser
   ✅ Authorization header set
   ```

If you see 401 error, look for:
```
🔄 Got 401 error, attempting token refresh...
✅ Token refreshed successfully, retrying request...
```

### Step 6: Test on Production

After Vercel backend is redeployed AND Cloudflare Pages has deployed the frontend:

1. Go to: **https://seu-matrimony.pages.dev**
2. **Hard refresh**: Press `Cmd + Shift + R`
3. Login with admin account
4. Go to Admin Dashboard → Pending Biodatas
5. Should work without 401 error!

## Why This Fixes It

- **Before**: Vercel backend had no Firebase credentials → couldn't verify tokens → returned 401
- **After**: Vercel backend has Firebase credentials → can verify tokens → returns data

## If Still Not Working

Check Vercel logs:
1. Vercel Dashboard → server-gold-nu → Deployments
2. Click latest deployment
3. Click **Functions** tab
4. Look for logs showing:
   - `✅ Firebase Admin SDK initialized successfully` ← Good!
   - `⚠️ Firebase service account not found` ← Bad! Environment variable not set correctly

---

**DO THIS NOW** - It's the only way to fix the 401 error!
