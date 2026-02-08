# 🚀 Deployment Steps - Follow This Order!

## Current Problem
- Frontend is calling `/browse-matches/:email` and `/all-biodata`
- Both return **404 Not Found**
- **Reason**: Backend hasn't been deployed yet!

---

## ✅ Step-by-Step Deployment

### Step 1: Deploy Backend (REQUIRED FIRST!)

```bash
cd Server
vercel --prod
```

**Wait for:** "✅ Production: https://server-gold-nu.vercel.app"

---

### Step 2: Test Backend

```bash
# Test health check
curl https://server-gold-nu.vercel.app/

# Test browse-matches
curl https://server-gold-nu.vercel.app/browse-matches/test@seu.edu.bd

# Test all-biodata
curl https://server-gold-nu.vercel.app/all-biodata
```

**Expected:** All should return JSON (not 404)

---

### Step 3: Deploy Frontend

```bash
# From project root
git add -A
git commit -m "Deploy: Backend endpoints + frontend fixes"
git push origin main
```

**Wait for:** Cloudflare Pages deployment (1-2 minutes)

---

### Step 4: Test Website

1. Visit: https://seu-matrimony.pages.dev
2. Login with your account
3. Go to Browse Matches
4. Should see biodatas (or empty state if no biodatas exist)
5. No 404 errors in console

---

## Quick Commands (Copy & Paste)

```bash
# 1. Deploy Backend
cd Server && vercel --prod && cd ..

# 2. Deploy Frontend  
git add -A && git commit -m "Deploy all fixes" && git push origin main
```

---

## What Gets Fixed

After backend deployment:
- ✅ Browse matches page works
- ✅ Admin dashboard works
- ✅ Analytics page works
- ✅ Email verification works
- ✅ All admin features work
- ✅ No more 404 errors

---

## If You Don't Have Vercel CLI

Install it first:
```bash
npm install -g vercel
vercel login
```

Then deploy:
```bash
cd Server
vercel --prod
```

---

**START HERE:** Deploy backend first, then everything else will work!
