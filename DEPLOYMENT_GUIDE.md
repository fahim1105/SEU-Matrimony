# SEU Matrimony Deployment Guide

Complete guide for deploying both frontend and backend to production.

---

## Backend Deployment (Vercel)

### Prerequisites
- Vercel account connected to GitHub repository
- MongoDB Atlas cluster credentials

### Steps

1. **Navigate to Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project: `server-gold-nu`

2. **Configure Environment Variables**
   - Go to Settings → Environment Variables
   - Add the following variables:
     ```
     DB_USER=seu_matrimony_db
     DB_PASS=4aEbBOUr0dApEeki
     NODE_ENV=production
     ```
   - Note: Hardcoded credentials in `test.js` serve as fallback

3. **Deploy Backend**
   - Option A: Push to GitHub (auto-deploy)
     ```bash
     git add Server/test.js
     git commit -m "Add missing backend endpoints"
     git push origin main
     ```
   
   - Option B: Manual deploy via Vercel CLI
     ```bash
     cd Server
     vercel --prod
     ```

4. **Verify Deployment**
   - Visit: https://server-gold-nu.vercel.app
   - Should see: `{ "success": true, "message": "SEU Matrimony Backend is Live! 🚀" }`

5. **Test Endpoints**
   ```bash
   # Test health check
   curl https://server-gold-nu.vercel.app/
   
   # Test email verification endpoint
   curl -X POST https://server-gold-nu.vercel.app/verify-email-test \
     -H "Content-Type: application/json" \
     -d '{"email":"test@seu.edu.bd"}'
   ```

---

## Frontend Deployment (Cloudflare Pages)

### Prerequisites
- Cloudflare Pages account
- GitHub repository connected

### Steps

1. **Build Frontend Locally (Optional)**
   ```bash
   npm run build
   ```
   - Verify no errors in build output
   - Check `dist/` folder is created

2. **Deploy to Cloudflare Pages**
   - Option A: Push to GitHub (auto-deploy)
     ```bash
     git add .
     git commit -m "Update frontend"
     git push origin main
     ```
   
   - Option B: Manual deploy via Wrangler CLI
     ```bash
     npx wrangler pages deploy dist
     ```

3. **Configure Environment Variables**
   - Go to Cloudflare Pages dashboard
   - Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://server-gold-nu.vercel.app
     ```

4. **Verify Deployment**
   - Visit: https://seu-matrimony.pages.dev
   - Test user registration and login
   - Check browser console for errors

---

## Post-Deployment Checklist

### Backend Verification
- [ ] Health check endpoint returns 200
- [ ] User registration works
- [ ] Email verification endpoints respond
- [ ] Admin endpoints accessible
- [ ] MongoDB connection successful
- [ ] CORS headers properly set

### Frontend Verification
- [ ] Homepage loads correctly
- [ ] User can register with SEU email
- [ ] Email verification flow works
- [ ] Login with Google works
- [ ] Admin dashboard accessible (for admin users)
- [ ] Language toggle works (English ↔ Bengali)
- [ ] No console errors

### Database Verification
- [ ] Users collection receiving new registrations
- [ ] Email verification updates working
- [ ] Biodata submissions saving correctly
- [ ] Admin approval workflow functional

---

## Troubleshooting

### Backend Issues

**404 Errors on Endpoints**
- Check `Server/vercel.json` points to `test.js`
- Verify deployment completed successfully
- Check Vercel logs for errors

**MongoDB Connection Errors**
- Verify environment variables in Vercel
- Check MongoDB Atlas IP whitelist (should allow all: 0.0.0.0/0)
- Verify credentials are correct

**CORS Errors**
- Ensure frontend URL is in CORS origins list
- Check `Access-Control-Allow-Origin` header in response

### Frontend Issues

**API Connection Errors**
- Verify `VITE_API_URL` in `.env.local` and Cloudflare Pages
- Check backend is deployed and accessible
- Verify CORS configuration

**Build Errors**
- Run `npm install` to ensure all dependencies installed
- Check for TypeScript/ESLint errors
- Verify all imports are correct

---

## Rollback Procedure

### Backend Rollback
1. Go to Vercel dashboard
2. Deployments → Select previous working deployment
3. Click "Promote to Production"

### Frontend Rollback
1. Go to Cloudflare Pages dashboard
2. Deployments → Select previous working deployment
3. Click "Rollback to this deployment"

---

## Monitoring

### Backend Monitoring
- Vercel Dashboard: https://vercel.com/dashboard
- View logs: Deployments → Select deployment → Logs
- Monitor function invocations and errors

### Frontend Monitoring
- Cloudflare Pages Dashboard
- Analytics → Web Analytics
- Monitor page views and errors

### Database Monitoring
- MongoDB Atlas Dashboard
- Monitor connections, queries, and performance
- Set up alerts for connection issues

---

## Environment Variables Summary

### Backend (Vercel)
```
DB_USER=seu_matrimony_db
DB_PASS=4aEbBOUr0dApEeki
NODE_ENV=production
```

### Frontend (Cloudflare Pages)
```
VITE_API_URL=https://server-gold-nu.vercel.app
```

### Local Development
```
# .env.local (frontend)
VITE_API_URL=https://server-gold-nu.vercel.app

# Server/.env (backend)
DB_USER=seu_matrimony_db
DB_PASS=4aEbBOUr0dApEeki
```

---

## Quick Deploy Commands

```bash
# Deploy backend
cd Server
vercel --prod

# Deploy frontend
npm run build
npx wrangler pages deploy dist

# Or just push to GitHub for auto-deploy
git add .
git commit -m "Deploy updates"
git push origin main
```

---

## Support

For deployment issues:
1. Check Vercel/Cloudflare logs
2. Review MongoDB Atlas connection status
3. Test endpoints individually
4. Check browser console for frontend errors
5. Verify environment variables are set correctly

---

Last Updated: February 9, 2026
