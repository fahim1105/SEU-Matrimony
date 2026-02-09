# Firebase Admin SDK Setup for Vercel

## Problem
The backend on Vercel cannot verify Firebase tokens because Firebase Admin SDK is not initialized. This causes all authenticated requests to fail with 401.

## Solution
Add Firebase service account credentials to Vercel environment variables.

## Steps to Fix

### Step 1: Get Firebase Service Account JSON
The file `Server/seu-matrimony.json` contains your Firebase Admin SDK credentials.

### Step 2: Convert JSON to Single Line
Run this command to get the JSON as a single line:

```bash
cat Server/seu-matrimony.json | tr -d '\n' | tr -d ' '
```

Copy the output (it will be a very long string starting with `{"type":"service_account"...`)

### Step 3: Add to Vercel Environment Variables

**Option A: Using Vercel Dashboard (Recommended)**
1. Go to: https://vercel.com/dashboard
2. Select your `server-gold-nu` project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Paste the single-line JSON from Step 2
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **...** menu on latest deployment → **Redeploy**

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variable
vercel env add FIREBASE_SERVICE_ACCOUNT

# When prompted:
# - Paste the single-line JSON
# - Select: Production, Preview, Development
# - Press Enter

# Redeploy
vercel --prod
```

### Step 4: Verify Firebase is Working

After redeployment, check:
```bash
curl https://server-gold-nu.vercel.app/
```

Look for:
```json
{
  "firebase": "✅ Initialized",
  "database": "✅ Connected"
}
```

If you see `"firebase": "❌ Not Initialized"`, the environment variable wasn't set correctly.

### Step 5: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Go to **Functions** tab
4. Click on any function to see logs
5. Look for:
   ```
   ✅ Firebase Admin SDK initialized successfully
   ```

If you see:
```
⚠️ Firebase service account not found - Firebase features will be disabled
```

Then the environment variable wasn't set correctly.

## Alternative: Quick Test Script

Create a test endpoint to check Firebase status:

```bash
# Test if Firebase is working
curl https://server-gold-nu.vercel.app/health
```

## Security Notes

- **NEVER commit `seu-matrimony.json` to Git** (it's already in .gitignore)
- **NEVER share the service account JSON publicly**
- The environment variable in Vercel is encrypted and secure
- Only team members with access to Vercel dashboard can see it

## After Setup

Once Firebase Admin SDK is initialized on Vercel:
1. The backend can verify Firebase ID tokens
2. Admin authentication will work
3. No more 401 errors for authenticated requests

---

**IMPORTANT**: Without this setup, the backend CANNOT verify any Firebase tokens, so ALL authenticated requests will fail with 401!
