# Google Registration Test Plan

## Current Status
✅ **Server Running**: http://localhost:5000  
✅ **Frontend Running**: http://localhost:5174  
✅ **Fixes Applied**: Authentication persistence and Google user detection enhanced

## Test Scenarios

### Test 1: Fresh Google Registration
**Steps:**
1. Open http://localhost:5174 in browser
2. Go to registration page
3. Click "Google দিয়ে রেজিস্ট্রেশন" button
4. Sign in with Google account (must be @seu.edu.bd email)
5. **Expected Result**: 
   - Registration completes successfully
   - User is stored in database
   - Redirected directly to dashboard (NO email verification page)
   - Toast shows "Google রেজিস্ট্রেশন সফল হয়েছে!"

### Test 2: Existing Google User Login
**Steps:**
1. Use the same Google account from Test 1
2. Try to register again with Google
3. **Expected Result**:
   - Shows "Google একাউন্ট ইতিমধ্যে রেজিস্টার্ড! লগইন সফল হয়েছে।"
   - Redirected directly to dashboard
   - No email verification required

### Test 3: Page Refresh Persistence
**Steps:**
1. After successful Google login (from Test 1 or 2)
2. Refresh the page (F5 or Ctrl+R)
3. **Expected Result**:
   - User remains logged in
   - No redirect to login page
   - No email verification page shown
   - Dashboard loads normally

### Test 4: Browser Session Persistence
**Steps:**
1. After successful Google login
2. Close browser tab
3. Open new tab and go to http://localhost:5174/dashboard
4. **Expected Result**:
   - User remains logged in
   - Dashboard loads directly
   - No authentication required

### Test 5: Email/Password Registration (Should Still Work)
**Steps:**
1. Go to registration page
2. Use email/password registration with @seu.edu.bd email
3. **Expected Result**:
   - Registration completes
   - Redirected to email verification page (this is correct behavior)
   - Email verification still required

## Debug Information to Check

### Browser Console Logs to Look For:
```
✅ User authenticated, checking status...
✅ User found in database: [user object]
✅ Email verification check passed - allowing access
```

### Logs to Avoid (These indicate problems):
```
❌ Email verification required - showing verification page
❌ No user and not loading
- Full userStatus: null
```

### Server Console Logs to Look For:
```
✅ User inserted successfully!
✅ Registration successful
📧 User email found: [email]
```

## Troubleshooting

### If Google Registration Shows Email Verification Page:
1. Check browser console for error messages
2. Look for "userStatus: null" in logs
3. Check if localStorage has cached data:
   - Open DevTools → Application → Local Storage
   - Look for `lastAuthenticatedEmail` key
   - Look for user status data

### If Database Storage Fails:
1. Check server console for database errors
2. Verify MongoDB connection
3. Check if user already exists in database

### If Authentication State is Lost:
1. Check browser console for Firebase auth errors
2. Look for "Auth state changed" logs
3. Verify Google provider configuration

## Success Criteria
- ✅ Google users register successfully
- ✅ Google users skip email verification
- ✅ Google users access dashboard directly
- ✅ Authentication persists across page refreshes
- ✅ Fallback mechanisms work when auth state is temporarily null
- ✅ Email/password users still require verification (unchanged)

## Manual Database Check
If needed, you can manually verify user storage:
1. Check MongoDB database: `seuMatrimonyDB.users`
2. Look for user with your Google email
3. Verify `isGoogleUser: true` and `isEmailVerified: true`

## Contact for Issues
If any test fails, provide:
1. Browser console logs
2. Server console logs  
3. Specific error messages
4. Which test scenario failed