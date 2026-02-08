const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

// CORS configuration for production
app.use(cors({
    origin: ['https://seu-matrimony.pages.dev', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Connection
const uri = process.env.DB_USER && process.env.DB_PASS 
    ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mcccn4v.mongodb.net/?appName=Cluster0`
    : `mongodb+srv://seu_matrimony_db:4aEbBOUr0dApEeki@cluster0.mcccn4v.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db, usersCollection, biodataCollection, requestCollection;
let isConnected = false;

async function connectDB() {
    if (isConnected && db && usersCollection) {
        return { db, usersCollection, biodataCollection, requestCollection };
    }

    try {
        await client.connect();
        db = client.db("seuMatrimonyDB");
        usersCollection = db.collection("users");
        biodataCollection = db.collection("biodatas");
        requestCollection = db.collection("requests");
        await db.admin().ping();
        isConnected = true;
        console.log('✅ MongoDB connected');
        return { db, usersCollection, biodataCollection, requestCollection };
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
}

// Initialize connection
connectDB().catch(console.error);

// Health check
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'SEU Matrimony Backend is Live! 🚀',
        timestamp: new Date().toISOString()
    });
});

// Register user
app.post('/register-user', async (req, res) => {
    try {
        const collections = await connectDB();
        
        const { email, displayName, uid, photoURL, isGoogleUser, isEmailVerified } = req.body;

        // Validate required fields
        if (!email || !displayName || !uid) {
            return res.status(400).json({
                success: false,
                message: 'প্রয়োজনীয় তথ্য অনুপস্থিত (email, displayName, uid প্রয়োজন)'
            });
        }

        // Validate SEU email
        if (!email.endsWith('@seu.edu.bd')) {
            return res.status(400).json({
                success: false,
                message: 'শুধুমাত্র SEU ইমেইল (@seu.edu.bd) ব্যবহার করুন'
            });
        }

        // Check for existing user
        const existingUser = await collections.usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'এই ইমেইল দিয়ে একাউন্ট ইতিমধ্যে আছে'
            });
        }

        const newUser = {
            uid,
            email,
            displayName,
            photoURL: photoURL || null,
            isEmailVerified: isGoogleUser ? true : (isEmailVerified || false),
            isActive: true,
            role: 'user',
            isGoogleUser: isGoogleUser || false,
            createdAt: new Date()
        };

        const result = await collections.usersCollection.insertOne(newUser);

        res.json({
            success: true,
            userId: result.insertedId,
            message: isGoogleUser ? 'Google একাউন্ট সফলভাবে তৈরি হয়েছে' : 'রেজিস্ট্রেশন সফল হয়েছে।',
            userData: {
                email: newUser.email,
                displayName: newUser.displayName,
                uid: newUser.uid
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: `Database error: ${error.message}`
        });
    }
});

// Get user info
app.get('/user/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        
        const { email } = req.params;
        const user = await collections.usersCollection.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ইউজার পাওয়া যায়নি'
            });
        }
        
        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'ইউজার তথ্য আনতে সমস্যা হয়েছে'
        });
    }
});

// Email verification
app.patch('/verify-email', async (req, res) => {
    try {
        const collections = await connectDB();
        
        const { email } = req.body;
        const result = await collections.usersCollection.updateOne(
            { email },
            { $set: { isEmailVerified: true, verifiedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
        }

        res.json({ success: true, message: 'ইমেইল ভেরিফিকেশন সফল হয়েছে' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ success: false, message: 'ভেরিফিকেশনে সমস্যা হয়েছে' });
    }
});

// Email verification test endpoint (fallback)
app.post('/verify-email-test', async (req, res) => {
    try {
        const collections = await connectDB();
        
        const { email } = req.body;
        const result = await collections.usersCollection.updateOne(
            { email },
            { $set: { isEmailVerified: true, verifiedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
        }

        res.json({ success: true, message: 'ইমেইল ভেরিফিকেশন সফল হয়েছে' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ success: false, message: 'ভেরিফিকেশনে সমস্যা হয়েছে' });
    }
});

// Get user stats
app.get('/user-stats/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const { email } = req.params;

        // Get user's biodatas count
        const biodataCount = await collections.biodataCollection.countDocuments({ contactEmail: email });
        
        // Get sent requests count
        const sentRequests = await collections.requestCollection.countDocuments({ senderEmail: email });
        
        // Get received requests count
        const receivedRequests = await collections.requestCollection.countDocuments({ receiverEmail: email });

        res.json({
            success: true,
            stats: {
                biodataCount,
                sentRequests,
                receivedRequests,
                totalRequests: sentRequests + receivedRequests
            }
        });
    } catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({
            success: false,
            message: 'ইউজার স্ট্যাটস আনতে সমস্যা হয়েছে'
        });
    }
});

// Get biodata status
app.get('/biodata-status/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const { email } = req.params;

        const biodata = await collections.biodataCollection.findOne({ contactEmail: email });
        
        if (!biodata) {
            return res.json({
                success: true,
                hasBiodata: false,
                status: null
            });
        }

        res.json({
            success: true,
            hasBiodata: true,
            status: biodata.status || 'pending',
            biodataId: biodata.biodataId,
            biodata: biodata
        });
    } catch (error) {
        console.error('Biodata status error:', error);
        res.status(500).json({
            success: false,
            message: 'বায়োডাটা স্ট্যাটাস আনতে সমস্যা হয়েছে'
        });
    }
});

// Get friends list (accepted requests)
app.get('/friends-list/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const { email } = req.params;

        // Get all accepted requests where user is either sender or receiver
        const friends = await collections.requestCollection.find({
            $or: [
                { senderEmail: email, status: 'accepted' },
                { receiverEmail: email, status: 'accepted' }
            ]
        }).toArray();

        res.json({
            success: true,
            friends: friends,
            count: friends.length
        });
    } catch (error) {
        console.error('Friends list error:', error);
        res.status(500).json({
            success: false,
            message: 'বন্ধু তালিকা আনতে সমস্যা হয়েছে'
        });
    }
});

// Get biodata by email
app.get('/biodata/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const { email } = req.params;

        const biodata = await collections.biodataCollection.findOne({ contactEmail: email });
        
        if (!biodata) {
            return res.status(404).json({
                success: false,
                message: 'বায়োডাটা পাওয়া যায়নি'
            });
        }

        res.json({
            success: true,
            biodata: biodata
        });
    } catch (error) {
        console.error('Get biodata error:', error);
        res.status(500).json({
            success: false,
            message: 'বায়োডাটা আনতে সমস্যা হয়েছে'
        });
    }
});

// Save or update biodata
app.put('/biodata', async (req, res) => {
    try {
        const collections = await connectDB();
        const biodata = req.body;

        // Validate required fields
        if (!biodata.contactEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'কন্টাক্ট ইমেইল প্রয়োজন' 
            });
        }

        // Check if user exists and is verified
        const user = await collections.usersCollection.findOne({ email: biodata.contactEmail });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'ইউজার পাওয়া যায়নি' 
            });
        }
        if (!user.isEmailVerified) {
            return res.status(403).json({ 
                success: false, 
                message: 'প্রথমে ইমেইল ভেরিফাই করুন' 
            });
        }
        if (!user.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে' 
            });
        }

        // Check if biodata already exists
        const existingBiodata = await collections.biodataCollection.findOne({ 
            contactEmail: biodata.contactEmail 
        });

        if (!existingBiodata) {
            // New biodata - generate unique biodata ID and set status to pending
            const count = await collections.biodataCollection.countDocuments();
            biodata.biodataId = `SEU${String(count + 1).padStart(4, '0')}`;
            biodata.status = 'pending'; // Admin approval required
            biodata.submittedAt = new Date();
        } else {
            // Updating existing biodata - preserve existing status and biodataId
            biodata.biodataId = existingBiodata.biodataId;
            biodata.status = existingBiodata.status;
            biodata.submittedAt = existingBiodata.submittedAt;
        }

        // Always update the updatedAt timestamp
        biodata.updatedAt = new Date();

        const query = { contactEmail: biodata.contactEmail };
        const updateDoc = { $set: biodata };
        const result = await collections.biodataCollection.updateOne(
            query, 
            updateDoc, 
            { upsert: true }
        );

        const message = existingBiodata
            ? 'বায়োডাটা সফলভাবে আপডেট হয়েছে।'
            : 'বায়োডাটা সফলভাবে সাবমিট হয়েছে। এডমিন অনুমোদনের অপেক্ষায় রয়েছে।';

        res.json({
            success: true,
            message,
            result,
            biodataId: biodata.biodataId
        });
    } catch (error) {
        console.error('Biodata save error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'বায়োডাটা সেভ করতে সমস্যা হয়েছে', 
            error: error.message 
        });
    }
});

// ===== ADMIN ENDPOINTS =====

// Get pending biodatas
app.get('/admin/pending-biodatas', async (req, res) => {
    try {
        const collections = await connectDB();
        const pendingBiodatas = await collections.biodataCollection.find({ 
            status: 'pending' 
        }).toArray();

        res.json({
            success: true,
            biodatas: pendingBiodatas || [],
            count: pendingBiodatas ? pendingBiodatas.length : 0
        });
    } catch (error) {
        console.error('Get pending biodatas error:', error);
        res.status(500).json({
            success: false,
            message: 'পেন্ডিং বায়োডাটা আনতে সমস্যা হয়েছে',
            biodatas: []
        });
    }
});

// Approve biodata
app.patch('/admin/approve-biodata/:biodataId', async (req, res) => {
    try {
        const collections = await connectDB();
        const { biodataId } = req.params;

        const result = await collections.biodataCollection.updateOne(
            { biodataId },
            { 
                $set: { 
                    status: 'approved',
                    approvedAt: new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'বায়োডাটা পাওয়া যায়নি'
            });
        }

        res.json({
            success: true,
            message: 'বায়োডাটা অনুমোদিত হয়েছে'
        });
    } catch (error) {
        console.error('Approve biodata error:', error);
        res.status(500).json({
            success: false,
            message: 'বায়োডাটা অনুমোদন করতে সমস্যা হয়েছে'
        });
    }
});

// Reject biodata
app.patch('/admin/reject-biodata/:biodataId', async (req, res) => {
    try {
        const collections = await connectDB();
        const { biodataId } = req.params;
        const { reason } = req.body;

        const result = await collections.biodataCollection.updateOne(
            { biodataId },
            { 
                $set: { 
                    status: 'rejected',
                    rejectedAt: new Date(),
                    rejectionReason: reason || 'No reason provided'
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'বায়োডাটা পাওয়া যায়নি'
            });
        }

        res.json({
            success: true,
            message: 'বায়োডাটা প্রত্যাখ্যান করা হয়েছে'
        });
    } catch (error) {
        console.error('Reject biodata error:', error);
        res.status(500).json({
            success: false,
            message: 'বায়োডাটা প্রত্যাখ্যান করতে সমস্যা হয়েছে'
        });
    }
});

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

// Get all users (admin)
app.get('/admin/users', async (req, res) => {
    try {
        const collections = await connectDB();
        const users = await collections.usersCollection.find({}).toArray();

        res.json({
            success: true,
            users: users || [],
            count: users ? users.length : 0
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'ইউজার তালিকা আনতে সমস্যা হয়েছে',
            users: []
        });
    }
});

// Get admin stats
app.get('/admin/stats', async (req, res) => {
    try {
        const collections = await connectDB();

        const totalUsers = await collections.usersCollection.countDocuments();
        const totalBiodatas = await collections.biodataCollection.countDocuments();
        const pendingBiodatas = await collections.biodataCollection.countDocuments({ status: 'pending' });
        const approvedBiodatas = await collections.biodataCollection.countDocuments({ status: 'approved' });
        const totalRequests = await collections.requestCollection.countDocuments();

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalBiodatas,
                pendingBiodatas,
                approvedBiodatas,
                totalRequests
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'স্ট্যাটস আনতে সমস্যা হয়েছে'
        });
    }
});

// Get all users (renamed from /admin/users to /admin/all-users)
app.get('/admin/all-users', async (req, res) => {
    try {
        const collections = await connectDB();
        const users = await collections.usersCollection.find({}).toArray();

        res.json({
            success: true,
            users: users,
            count: users.length
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'ইউজার তালিকা আনতে সমস্যা হয়েছে'
        });
    }
});

// Get detailed report (for analytics)
app.get('/admin/detailed-report', async (req, res) => {
    try {
        const collections = await connectDB();
        const { startDate, endDate } = req.query;

        // Basic stats
        const totalUsers = await collections.usersCollection.countDocuments();
        const totalBiodatas = await collections.biodataCollection.countDocuments();
        const pendingBiodatas = await collections.biodataCollection.countDocuments({ status: 'pending' });
        const approvedBiodatas = await collections.biodataCollection.countDocuments({ status: 'approved' });

        // Date filter for trends
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // User registration trends (monthly aggregation)
        const userTrends = await collections.usersCollection.aggregate([
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]).toArray();

        // Biodata submission trends (monthly aggregation)
        const biodataTrends = await collections.biodataCollection.aggregate([
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]).toArray();

        // Department statistics
        const departmentStats = await collections.biodataCollection.aggregate([
            { $match: { department: { $exists: true, $ne: null, $ne: "" } } },
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]).toArray();

        // District statistics
        const districtStats = await collections.biodataCollection.aggregate([
            { $match: { district: { $exists: true, $ne: null, $ne: "" } } },
            {
                $group: {
                    _id: "$district",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]).toArray();

        res.json({
            success: true,
            report: {
                totalUsers,
                totalBiodatas,
                pendingBiodatas,
                approvedBiodatas,
                userTrends: userTrends || [],
                biodataTrends: biodataTrends || [],
                departmentStats: departmentStats || [],
                districtStats: districtStats || [],
                period: { startDate, endDate }
            }
        });
    } catch (error) {
        console.error('Get detailed report error:', error);
        res.status(500).json({
            success: false,
            message: 'রিপোর্ট আনতে সমস্যা হয়েছে',
            report: {
                totalUsers: 0,
                totalBiodatas: 0,
                pendingBiodatas: 0,
                approvedBiodatas: 0,
                userTrends: [],
                biodataTrends: [],
                departmentStats: [],
                districtStats: []
            }
        });
    }
});

// Browse Matches - Get approved biodatas excluding user's own
app.get('/browse-matches/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const email = req.params.email;

        const biodatas = await collections.biodataCollection.find({
            status: 'approved',
            contactEmail: { $ne: email }
        }).toArray();

        res.json({ 
            success: true, 
            biodatas: biodatas || [],
            count: biodatas ? biodatas.length : 0
        });
    } catch (error) {
        console.error('Browse matches error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'ম্যাচ খুঁজতে সমস্যা হয়েছে',
            biodatas: []
        });
    }
});

// All Biodata - Get all approved biodatas (fallback)
app.get('/all-biodata', async (req, res) => {
    try {
        const collections = await connectDB();
        
        const biodatas = await collections.biodataCollection.find({
            status: 'approved'
        }).toArray();

        res.json({
            success: true,
            biodatas: biodatas || [],
            count: biodatas ? biodatas.length : 0
        });
    } catch (error) {
        console.error('Get all biodata error:', error);
        res.status(500).json({
            success: false,
            message: 'বায়োডাটা আনতে সমস্যা হয়েছে',
            biodatas: []
        });
    }
});

// Get success stories (admin)
app.get('/admin/success-stories', async (req, res) => {
    try {
        const collections = await connectDB();
        
        // Get success stories collection
        const successStoriesCollection = collections.db.collection('successStories');
        const stories = await successStoriesCollection.find({}).toArray();

        res.json({
            success: true,
            stories: stories || [],
            count: stories ? stories.length : 0
        });
    } catch (error) {
        console.error('Get success stories error:', error);
        res.status(500).json({
            success: false,
            message: 'সাফল্যের গল্প আনতে সমস্যা হয়েছে',
            stories: []
        });
    }
});

// Create success story (admin)
app.post('/admin/success-stories', async (req, res) => {
    try {
        const collections = await connectDB();
        const storyData = req.body;
        
        const successStoriesCollection = collections.db.collection('successStories');
        const result = await successStoriesCollection.insertOne({
            ...storyData,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: 'সাফল্যের গল্প যোগ করা হয়েছে',
            storyId: result.insertedId
        });
    } catch (error) {
        console.error('Create success story error:', error);
        res.status(500).json({
            success: false,
            message: 'সাফল্যের গল্প যোগ করতে সমস্যা হয়েছে'
        });
    }
});

// Update success story (admin)
app.put('/admin/success-stories/:id', async (req, res) => {
    try {
        const collections = await connectDB();
        const { id } = req.params;
        const storyData = req.body;
        
        const { ObjectId } = require('mongodb');
        const successStoriesCollection = collections.db.collection('successStories');
        
        const result = await successStoriesCollection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: {
                    ...storyData,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'সাফল্যের গল্প পাওয়া যায়নি'
            });
        }

        res.json({
            success: true,
            message: 'সাফল্যের গল্প আপডেট করা হয়েছে'
        });
    } catch (error) {
        console.error('Update success story error:', error);
        res.status(500).json({
            success: false,
            message: 'সাফল্যের গল্প আপডেট করতে সমস্যা হয়েছে'
        });
    }
});

// Delete success story (admin)
app.delete('/admin/success-stories/:id', async (req, res) => {
    try {
        const collections = await connectDB();
        const { id } = req.params;
        
        const { ObjectId } = require('mongodb');
        const successStoriesCollection = collections.db.collection('successStories');
        
        const result = await successStoriesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'সাফল্যের গল্প পাওয়া যায়নি'
            });
        }

        res.json({
            success: true,
            message: 'সাফল্যের গল্প ডিলিট করা হয়েছে'
        });
    } catch (error) {
        console.error('Delete success story error:', error);
        res.status(500).json({
            success: false,
            message: 'সাফল্যের গল্প ডিলিট করতে সমস্যা হয়েছে'
        });
    }
});

// Get sent requests
app.get('/sent-requests/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const email = req.params.email;
        
        const requests = await collections.requestCollection.find({ 
            senderEmail: email 
        }).toArray();
        
        res.json({ 
            success: true, 
            requests: requests || [] 
        });
    } catch (error) {
        console.error('Get sent requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'পাঠানো রিকোয়েস্ট আনতে সমস্যা হয়েছে',
            requests: []
        });
    }
});

// Get accepted conversations
app.get('/accepted-conversations/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const email = req.params.email;
        
        // Get messages collection
        const messagesCollection = collections.db.collection('messages');

        // Find all accepted requests where user is either sender or receiver
        const acceptedRequests = await collections.requestCollection.find({
            $or: [
                { senderEmail: email, status: 'accepted' },
                { receiverEmail: email, status: 'accepted' }
            ]
        }).sort({ lastActivity: -1, updatedAt: -1, sentAt: -1 }).toArray();

        // Create conversation objects with other user info and last message
        const conversations = await Promise.all(
            acceptedRequests.map(async (request) => {
                const otherUserEmail = request.senderEmail === email
                    ? request.receiverEmail
                    : request.senderEmail;

                // Get other user's biodata for name
                const otherUserBiodata = await collections.biodataCollection.findOne({
                    contactEmail: otherUserEmail
                });

                // Get last message for this conversation
                const lastMessage = await messagesCollection
                    .findOne(
                        { conversationId: request._id },
                        { sort: { sentAt: -1 } }
                    );

                return {
                    _id: request._id,
                    otherUser: {
                        email: otherUserEmail,
                        name: otherUserBiodata?.name || 'SEU Member',
                        profileImage: otherUserBiodata?.profileImage || ''
                    },
                    lastActivity: request.lastActivity || request.updatedAt || request.sentAt,
                    lastMessage: lastMessage ? {
                        message: lastMessage.message,
                        sentAt: lastMessage.sentAt,
                        senderEmail: lastMessage.senderEmail
                    } : null
                };
            })
        );

        // Sort by last activity (most recent first)
        conversations.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

        res.json({
            success: true,
            conversations: conversations || []
        });
    } catch (error) {
        console.error('Get accepted conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'কথোপকথন আনতে সমস্যা হয়েছে',
            conversations: []
        });
    }
});

module.exports = app;
