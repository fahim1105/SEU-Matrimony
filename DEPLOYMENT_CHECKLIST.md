# Deployment Checklist ✅

## Frontend (Already Done ✅)
- [x] Environment variable configured in `.env.local`
- [x] Axios hooks use environment variable
- [x] Debug console logs removed
- [x] Build successful
- [x] No TypeScript/ESLint errors

## Backend (Action Required ⚠️)

### 1. Vercel Environment Variables (CRITICAL)
Add these to Vercel dashboard → Settings → Environment Variables:

```bash
DB_USER=seu_matrimony_db
DB_PASS=4aEbBOUr0dApEeki
NODE_ENV=production
FRONTEND_URL=https://seu-matrimony.pages.dev
EMAIL_USER=2024200000635@seu.edu.bd
EMAIL_PASS=cbpl fxbk zewj ttlw
```

### 2. Verify Files Exist
- [x] `Server/seu-matrimony.json` (Firebase service account)
- [x] `Server/vercel.json` (Vercel config)
- [x] `Server/index.js` (Main server file)

### 3. Redeploy Backend
After adding environment variables:
```bash
cd Server
vercel --prod
```

Or use Vercel dashboard → Deployments → Redeploy

### 4. Test Backend Endpoints
```bash
# Health check
curl https://server-gold-nu.vercel.app/

# Database test
curl https://server-gold-nu.vercel.app/db-test

# Check admin users
curl https://server-gold-nu.vercel.app/check-admin-users
```

## Testing After Deployment

### 1. Clear Browser Cache
- Chrome/Edge: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
- Select "Cached images and files"
- Click "Clear data"

### 2. Hard Refresh
- Windows/Linux: Ctrl+Shift+R
- Mac: Cmd+Shift+R

### 3. Test User Flow
1. Register new user
2. Verify email
3. Create biodata
4. Browse matches
5. Send request
6. Check admin panel (if admin)

## Common Issues & Solutions

### Issue: Still seeing localhost errors
**Solution**: Clear browser cache and hard refresh

### Issue: Backend returns 404
**Solution**: Environment variables not set on Vercel. Follow VERCEL_SETUP.md

### Issue: MongoDB connection failed
**Solution**: Check DB_USER and DB_PASS in Vercel environment variables

### Issue: Firebase authentication failed
**Solution**: Verify `seu-matrimony.json` exists in Server folder

### Issue: CORS errors
**Solution**: Check FRONTEND_URL in Vercel environment variables matches your frontend URL

## Production URLs

- **Frontend**: https://seu-matrimony.pages.dev (or your actual URL)
- **Backend**: https://server-gold-nu.vercel.app
- **MongoDB**: MongoDB Atlas (connection string in environment variables)

## Environment Variables Summary

### Frontend (.env.local)
```bash
VITE_apiKey=AIzaSyDqBCuxPmouqc0qoUfGs64aBkvGFGePv4s
VITE_authDomain=seu-matrimony-e0f00.firebaseapp.com
VITE_projectId=seu-matrimony-e0f00
VITE_storageBucket=seu-matrimony-e0f00.firebasestorage.app
VITE_messagingSenderId=1096191915802
VITE_appId=1:1096191915802:web:29fe4b5d7139f4796e1ea3
VITE_image_Host_Key=2aa3ed986e65d3431400ace4b3a32884
VITE_API_URL=https://server-gold-nu.vercel.app
```

### Backend (Vercel Dashboard)
```bash
DB_USER=seu_matrimony_db
DB_PASS=4aEbBOUr0dApEeki
NODE_ENV=production
FRONTEND_URL=https://seu-matrimony.pages.dev
EMAIL_USER=2024200000635@seu.edu.bd
EMAIL_PASS=cbpl fxbk zewj ttlw
```

## Status

- ✅ Frontend configuration complete
- ✅ Debug logs removed
- ✅ Build successful
- ⚠️ Backend environment variables need to be added to Vercel
- ⚠️ Backend needs to be redeployed after adding variables

## Next Action

**Go to Vercel dashboard and add environment variables now!**

Then redeploy and test. Everything should work after that! 🚀
