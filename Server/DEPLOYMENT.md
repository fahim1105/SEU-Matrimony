# SEU Matrimony Backend - Vercel Deployment Guide

## 🚀 Vercel এ Deploy করার Steps

### **1. Prerequisites**
- Vercel account তৈরি করুন: https://vercel.com
- Vercel CLI install করুন: `npm i -g vercel`
- MongoDB Atlas account এবং database ready রাখুন

### **2. Environment Variables Setup**

Vercel dashboard এ গিয়ে আপনার project এ এই environment variables add করুন:

```
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
NODE_ENV=production
```

### **3. Firebase Service Account (যদি ব্যবহার করেন)**

Firebase service account JSON file এর content কে environment variable হিসেবে add করুন:

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

অথবা `seu-matrimony.json` file টি project root এ রাখুন।

### **4. Deploy Commands**

#### **Option 1: Vercel CLI দিয়ে**
```bash
cd Server
vercel --prod
```

#### **Option 2: GitHub Integration**
1. GitHub এ repository push করুন
2. Vercel dashboard এ গিয়ে GitHub repo connect করুন
3. Root directory হিসেবে `Server` folder select করুন
4. Auto-deploy enable করুন

### **5. Domain Configuration**

Deploy হওয়ার পর আপনি একটি URL পাবেন যেমন:
```
https://your-project-name.vercel.app
```

### **6. Frontend এ Backend URL Update**

Frontend এর environment variables এ backend URL update করুন:

```javascript
// .env.local (Frontend)
VITE_API_URL=https://your-backend-url.vercel.app
```

### **7. CORS Update**

Backend এর CORS configuration এ আপনার frontend domain add করুন:

```javascript
// Server/index.js
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-frontend-domain.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🔧 Troubleshooting

### **Common Issues:**

1. **MongoDB Connection Error**
   - MongoDB Atlas এ IP whitelist check করুন
   - Database credentials verify করুন
   - Network access settings check করুন

2. **CORS Error**
   - Frontend domain CORS এ add করা আছে কিনা check করুন
   - Credentials: true set করা আছে কিনা verify করুন

3. **Environment Variables**
   - Vercel dashboard এ সব environment variables properly set করা আছে কিনা check করুন
   - Redeploy করুন environment variables change করার পর

4. **File Upload Issues**
   - Vercel এ file upload limit আছে
   - Large files এর জন্য external storage (Cloudinary, AWS S3) ব্যবহার করুন

### **Performance Optimization:**

1. **Database Indexing**
   - MongoDB এ proper indexing ensure করুন
   - Slow queries optimize করুন

2. **Caching**
   - Static data এর জন্য caching implement করুন
   - Redis বা memory cache ব্যবহার করুন

3. **Error Logging**
   - Production এ proper error logging setup করুন
   - Sentry বা similar service ব্যবহার করুন

## 📊 Monitoring

### **Health Check**
আপনার deployed backend এর health check করতে:
```
GET https://your-backend-url.vercel.app/health
```

### **API Testing**
```
GET https://your-backend-url.vercel.app/
```

## 🔐 Security Checklist

- ✅ Environment variables properly configured
- ✅ CORS properly configured
- ✅ MongoDB connection secured
- ✅ Firebase service account secured
- ✅ No sensitive data in code
- ✅ HTTPS enabled (automatic with Vercel)

## 📝 Post-Deployment

1. **Test all API endpoints**
2. **Verify database connections**
3. **Check CORS functionality**
4. **Test file uploads (if any)**
5. **Monitor performance**
6. **Setup error tracking**

আপনার backend এখন production-ready এবং Vercel এ deploy করার জন্য সম্পূর্ণ প্রস্তুত! 🚀