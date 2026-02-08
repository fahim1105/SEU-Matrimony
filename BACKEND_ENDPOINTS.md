# SEU Matrimony Backend API Endpoints

Complete list of all available API endpoints in `Server/test.js`

---

## Base URL
- **Production**: `https://server-gold-nu.vercel.app`
- **Local**: `http://localhost:5000`

---

## Public Endpoints

### Health Check
- **GET** `/` - Server health check
  - Returns: `{ success: true, message: "SEU Matrimony Backend is Live! 🚀", timestamp: "..." }`

### User Management
- **POST** `/register-user` - Register new user
  - Body: `{ email, displayName, uid, photoURL?, isGoogleUser?, isEmailVerified? }`
  - Returns: User registration confirmation

- **GET** `/user/:email` - Get user information
  - Returns: User data including verification status

### Email Verification
- **PATCH** `/verify-email` - Update email verification status
  - Body: `{ email }`
  - Returns: Verification success message

- **POST** `/verify-email-test` - Fallback email verification endpoint
  - Body: `{ email }`
  - Returns: Verification success message

### User Statistics
- **GET** `/user-stats/:email` - Get user statistics
  - Returns: `{ biodataCount, sentRequests, receivedRequests, totalRequests }`

### Biodata Management
- **GET** `/biodata-status/:email` - Check biodata status
  - Returns: `{ hasBiodata, status, biodataId?, biodata? }`

- **GET** `/biodata/:email` - Get biodata by email
  - Returns: Complete biodata information

- **GET** `/browse-matches/:email` - Browse approved biodatas (excluding user's own)
  - Returns: Array of approved biodatas for matching
  - Note: Excludes the requesting user's biodata

- **GET** `/all-biodata` - Get all approved biodatas
  - Returns: Array of all approved biodatas
  - Note: Fallback endpoint for browse matches

- **PUT** `/biodata` - Save or update biodata
  - Body: Complete biodata object with `contactEmail`
  - Returns: Success message with biodataId
  - Note: New biodatas require admin approval (status: 'pending')

### Friends & Requests
- **GET** `/friends-list/:email` - Get accepted friend requests
  - Returns: Array of accepted requests where user is sender or receiver

---

## Admin Endpoints

### Biodata Management
- **GET** `/admin/pending-biodatas` - Get all pending biodatas
  - Returns: Array of biodatas with status 'pending'

- **PATCH** `/admin/approve-biodata/:biodataId` - Approve a biodata by custom biodataId
  - Params: `biodataId` (e.g., SEU0001)
  - Returns: Success message

- **PATCH** `/admin/reject-biodata/:biodataId` - Reject a biodata by custom biodataId
  - Params: `biodataId` (e.g., SEU0001)
  - Body: `{ reason? }`
  - Returns: Success message

- **PATCH** `/admin/biodata-status/:id` - Update biodata status by MongoDB ObjectId
  - Params: `id` (MongoDB ObjectId)
  - Body: `{ status: 'approved' | 'rejected' | 'pending', adminNote?: string }`
  - Returns: Success message
  - Note: Used by PendingBiodatas admin page

### User Management
- **GET** `/admin/users` - Get all users
  - Returns: Array of all registered users

- **GET** `/admin/all-users` - Alternative endpoint for all users
  - Returns: Array of all registered users

### Statistics & Analytics
- **GET** `/admin/stats` - Get admin dashboard statistics
  - Returns: `{ totalUsers, totalBiodatas, pendingBiodatas, approvedBiodatas, totalRequests }`

- **GET** `/admin/detailed-report` - Get detailed analytics report
  - Query params: `startDate?`, `endDate?`
  - Returns: Comprehensive report with date-based filtering

### Success Stories
- **GET** `/admin/success-stories` - Get all success stories
  - Returns: Array of success stories

- **POST** `/admin/success-stories` - Create new success story
  - Body: Success story data
  - Returns: Created story ID

- **PUT** `/admin/success-stories/:id` - Update success story
  - Body: Updated success story data
  - Returns: Success message

- **DELETE** `/admin/success-stories/:id` - Delete success story
  - Returns: Success message

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "অপারেশন সফল হয়েছে",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "সমস্যা হয়েছে"
}
```

---

## MongoDB Collections

1. **users** - User accounts and authentication
2. **biodatas** - User biodata profiles
3. **requests** - Friend/match requests
4. **successStories** - Success stories from matched couples

---

## Authentication

- Most endpoints use Firebase Authentication tokens
- Frontend sends token via `Authorization` header
- Admin endpoints require admin role verification

---

## CORS Configuration

Allowed origins:
- `https://seu-matrimony.pages.dev` (Production)
- `http://localhost:5173` (Development)
- `http://localhost:5174` (Development alternate)

---

## Deployment

- Platform: Vercel Serverless Functions
- Entry point: `Server/test.js`
- Configuration: `Server/vercel.json`
- MongoDB: Atlas cluster with hardcoded credentials as fallback

---

## Notes

- All error messages are in Bengali (বাংলা)
- Empty array fallbacks prevent undefined errors
- Lazy MongoDB connection for serverless compatibility
- Firebase Admin SDK is optional (won't crash if missing)
