# Task 35: Admin Biodata Status Update Fix

## Issue
```
PATCH https://server-gold-nu.vercel.app/admin/biodata-status/6988eb8… 404 (Not Found)
Error updating biodata status
```

## Root Cause
The PendingBiodatas admin page was calling `/admin/biodata-status/:id` with MongoDB ObjectId, but this endpoint didn't exist in the backend. The backend only had:
- `/admin/approve-biodata/:biodataId` (expects custom biodataId like SEU0001)
- `/admin/reject-biodata/:biodataId` (expects custom biodataId like SEU0001)

## Solution
Added new endpoint `/admin/biodata-status/:id` that:
- Accepts MongoDB ObjectId as parameter
- Updates biodata status (approved/rejected/pending)
- Supports admin notes
- Validates ObjectId format
- Sets appropriate timestamps

## Code Added to `Server/test.js`

```javascript
// Update biodata status by MongoDB ObjectId (used by PendingBiodatas page)
app.patch('/admin/biodata-status/:id', async (req, res) => {
    try {
        const collections = await connectDB();
        const { id } = req.params;
        const { status, adminNote } = req.body;

        // Validate status
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'অবৈধ স্ট্যাটাস'
            });
        }

        const { ObjectId } = require('mongodb');
        
        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'অবৈধ বায়োডাটা আইডি'
            });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (status === 'approved') {
            updateData.approvedAt = new Date();
        } else if (status === 'rejected') {
            updateData.rejectedAt = new Date();
        }

        if (adminNote) {
            updateData.adminNote = adminNote;
        }

        const result = await collections.biodataCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'বায়োডাটা পাওয়া যায়নি'
            });
        }

        const message = status === 'approved' 
            ? 'বায়োডাটা অনুমোদিত হয়েছে'
            : status === 'rejected'
            ? 'বায়োডাটা প্রত্যাখ্যান করা হয়েছে'
            : 'বায়োডাটা স্ট্যাটাস আপডেট হয়েছে';

        res.json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Update biodata status error:', error);
        res.status(500).json({
            success: false,
            message: 'বায়োডাটা স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে'
        });
    }
});
```

## Features
- ✅ ObjectId validation
- ✅ Status validation (only approved/rejected/pending allowed)
- ✅ Admin notes support
- ✅ Automatic timestamp management
- ✅ Bengali error messages
- ✅ Proper error handling

## Testing
```bash
# Syntax check
node -c Server/test.js
# ✅ Passed

# Test endpoint (after deployment)
curl -X PATCH https://server-gold-nu.vercel.app/admin/biodata-status/6988eb8... \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"approved","adminNote":"Looks good!"}'
```

## Deployment
Deploy to Vercel:
```bash
cd Server
vercel --prod
```

Or push to GitHub for auto-deploy:
```bash
git add Server/test.js
git commit -m "Add admin biodata status update endpoint"
git push origin main
```

## Impact
- ✅ Admin can now approve/reject biodatas from PendingBiodatas page
- ✅ Status updates work with MongoDB ObjectId
- ✅ Admin notes are saved with each action
- ✅ Proper timestamps for approval/rejection tracking

## Files Modified
- `Server/test.js` - Added new endpoint
- `BACKEND_ENDPOINTS.md` - Updated documentation
- `FIXES_APPLIED.md` - Added task summary

---

**Status**: ✅ Complete - Ready for deployment
**Date**: February 9, 2026
