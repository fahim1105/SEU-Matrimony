const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const app = express()

require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000


// Firebase admin SDK
const admin = require("firebase-admin");
let firebaseInitialized = false;

try {
    // Try to load service account from file
    let serviceAccount;
    try {
        serviceAccount = require("./seu-matrimony.json");
    } catch (fileError) {
        console.log('⚠️ Service account file not found, trying environment variable...');
        // Fallback to environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } else {
            console.log('⚠️ Firebase service account not found - Firebase features will be disabled');
            serviceAccount = null;
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    console.error('⚠️ Server will continue without Firebase Admin features');
    firebaseInitialized = false;
}

// Email configuration (using Gmail SMTP)
let transporter = null;

try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('✅ Email service configured successfully');
    } else {
        console.log('⚠️ Email credentials not found. Email service will be disabled.');
        console.log('Add EMAIL_USER and EMAIL_PASS to .env file to enable email service.');
    }
} catch (error) {
    console.error('❌ Email service configuration failed:', error.message);
}

app.use(express.json({ limit: '10mb' }));

// Simple and effective CORS setup for Vercel
app.use((req, res, next) => {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }

    next();
});

// Backup CORS using cors package
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both common Vite ports
    credentials: false, // Set to false for simplicity
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// MongoDB Connection URI - Use local MongoDB for now
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

// Global database references
let db, biodataCollection, requestCollection, usersCollection, verificationCollection, messagesCollection, successStoriesCollection;
let isConnected = false;

// Connect to MongoDB
async function connectDB() {
    if (isConnected) {
        return { db, biodataCollection, requestCollection, usersCollection, verificationCollection, messagesCollection, successStoriesCollection };
    }

    try {
        await client.connect();
        
        db = client.db("seuMatrimonyDB");
        biodataCollection = db.collection("biodatas");
        requestCollection = db.collection("requests");
        usersCollection = db.collection("users");
        verificationCollection = db.collection("verifications");
        messagesCollection = db.collection("messages");
        successStoriesCollection = db.collection("successStories");

        await db.admin().ping();
        isConnected = true;

        console.log("-------------------------------------------------");
        console.log(" ✅ Pinged your deployment.");
        console.log(" 🚀 You successfully connected to MongoDB!");
        console.log("-------------------------------------------------");

        return { db, biodataCollection, requestCollection, usersCollection, verificationCollection, messagesCollection, successStoriesCollection };
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
}

// Initialize connection
connectDB().catch(console.error);

// --- Middleware: ইউজার ভেরিফিকেশন চেক করা ---
const checkUserVerification = async (req, res, next) => {
    try {
        await connectDB(); // Ensure DB is connected
        
        const userEmail = req.body.email || req.body.contactEmail || req.params.email || req.query.email;
        if (!userEmail) return res.status(400).json({ success: false, message: 'ইমেইল প্রয়োজন' });

        const user = await usersCollection.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
        if (!user.isEmailVerified) return res.status(403).json({ success: false, message: 'ইমেইল ভেরিফাই করুন' });
        if (!user.isActive) return res.status(403).json({ success: false, message: 'আপনার একাউন্ট নিষ্ক্রিয়' });

        req.user = user;
        next();
    } catch (error) {
        console.error('User verification middleware error:', error);
        res.status(500).json({ success: false, message: 'সার্ভার ইন্টারনাল এরর' });
    }
};

// --- Enhanced Firebase Token Verification Middleware ---
const VerifyFirebaseToken = async (req, res, next) => {
    const Token = req.headers.authorization;
    
    console.log('🔐 Token verification attempt:', {
        path: req.path,
        method: req.method,
        hasToken: !!Token,
        firebaseInitialized
    });
    
    if (!Token) {
        console.log('❌ No token provided');
        return res.status(401).send({ message: 'Unauthorized access - No token provided' });
    }
    
    if (!firebaseInitialized) {
        console.log('❌ Firebase not initialized');
        return res.status(500).send({ message: 'Firebase authentication not available' });
    }
    
    try {
        const tokenId = Token.split(' ')[1];
        if (!tokenId) {
            console.log('❌ Invalid token format');
            return res.status(401).send({ message: 'Unauthorized access - Invalid token format' });
        }
        
        console.log('🔍 Verifying token...');
        const decoded = await admin.auth().verifyIdToken(tokenId);
        console.log('✅ Token verified:', { uid: decoded.uid, email: decoded.email, provider: decoded.firebase?.sign_in_provider });
        
        // Enhanced email resolution
        let userEmail = decoded.email;
        
        if (!userEmail && decoded.uid) {
            console.log('⚠️ No email in token, trying to get from Firebase user record...');
            try {
                const userRecord = await admin.auth().getUser(decoded.uid);
                userEmail = userRecord.email;
                console.log('✅ Email from Firebase user record:', userEmail);
            } catch (error) {
                console.log('⚠️ Could not get email from Firebase, trying database...');
                // Try database lookup
                const collections = await connectDB();
                const user = await collections.usersCollection.findOne({ uid: decoded.uid });
                if (user && user.email) {
                    userEmail = user.email;
                    console.log('✅ Email from database:', userEmail);
                } else {
                    console.log('❌ User not found in database by uid:', decoded.uid);
                }
            }
        }
        
        if (!userEmail) {
            console.log('❌ Could not resolve user email from token, Firebase, or database');
            return res.status(401).send({ message: 'Could not verify user email' });
        }
        
        req.decoded_email = userEmail;
        req.decoded_uid = decoded.uid;
        req.decoded_provider = decoded.firebase?.sign_in_provider;
        
        console.log('✅ Token verification successful:', { email: userEmail, uid: decoded.uid });
        next();
    } catch (err) {
        console.error('❌ Token verification failed:', err.message);
        return res.status(401).send({ message: "Unauthorized access - Token verification failed", error: err.message });
    }
};

// --- Admin Verification Middleware ---
const verifyAdmin = async (req, res, next) => {
    const email = req.decoded_email;
    const uid = req.decoded_uid;
    
    console.log('👮 Admin verification attempt:', { email, uid });
    
    if (!email) {
        console.log('❌ No email in decoded token');
        return res.status(403).send({ message: "Forbidden access - No email identified" });
    }
    
    try {
        const collections = await connectDB(); // Ensure DB is connected
        
        let user = await collections.usersCollection.findOne({ email });
        console.log('🔍 User lookup by email:', { email, found: !!user });
        
        if (!user && uid) {
            user = await collections.usersCollection.findOne({ uid });
            console.log('🔍 User lookup by uid:', { uid, found: !!user });
        }
        
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(403).send({ message: "Forbidden access - User not found" });
        }
        
        console.log('👤 User found:', { email: user.email, role: user.role, isActive: user.isActive });
        
        if (user.role !== 'admin') {
            console.log('❌ User is not admin:', user.role);
            return res.status(403).send({ message: "Forbidden access - Insufficient permissions" });
        }
        
        if (!user.isActive) {
            console.log('❌ User account is inactive');
            return res.status(403).send({ message: "Forbidden access - Account inactive" });
        }
        
        console.log('✅ Admin verification successful');
        req.admin_user = user;
        next();
    } catch (error) {
        console.error('❌ verifyAdmin error:', error);
        return res.status(500).send({ message: "Internal server error" });
    }
};

// ১. ইউজার রেজিস্ট্রেশন (Outside run() for Vercel)
app.post('/register-user', async (req, res) => {
    try {
        const collections = await connectDB(); // Ensure DB connection and get collections
        
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

// ২. Get user info (Outside run() for Vercel)
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

// ৩. Email verification (Outside run() for Vercel)
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

// ৪. Browse Matches (Outside run() for Vercel)
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

// ৫. All Biodata (Outside run() for Vercel)
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

// ৬. Get sent requests (Outside run() for Vercel)
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

// ৭. Get accepted conversations (Outside run() for Vercel)
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

// ৮. Get user stats (Outside run() for Vercel)
app.get('/user-stats/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const email = req.params.email;

        const sentRequests = await collections.requestCollection.countDocuments({ senderEmail: email });
        const receivedRequests = await collections.requestCollection.countDocuments({ receiverEmail: email });
        const acceptedRequests = await collections.requestCollection.countDocuments({
            $or: [
                { senderEmail: email, status: 'accepted' },
                { receiverEmail: email, status: 'accepted' }
            ]
        });

        // Profile views (placeholder for now)
        const profileViews = 0;

        res.json({
            success: true,
            stats: {
                sentRequests,
                receivedRequests,
                acceptedRequests,
                profileViews
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'ইউজার স্ট্যাটস আনতে সমস্যা হয়েছে',
            stats: {
                sentRequests: 0,
                receivedRequests: 0,
                acceptedRequests: 0,
                profileViews: 0
            }
        });
    }
});

// ৯. Get biodata status (Outside run() for Vercel)
app.get('/biodata-status/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const email = req.params.email;
        
        const biodata = await collections.biodataCollection.findOne({ contactEmail: email });

        if (!biodata) {
            return res.json({
                success: true,
                hasProfile: false,
                status: null
            });
        }

        res.json({
            success: true,
            hasProfile: true,
            status: biodata.status,
            submittedAt: biodata.submittedAt,
            updatedAt: biodata.updatedAt
        });
    } catch (error) {
        console.error('Get biodata status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'বায়োডাটা স্ট্যাটাস আনতে সমস্যা হয়েছে',
            hasProfile: false,
            status: null
        });
    }
});

// ১০. Get friends list (Outside run() for Vercel)
app.get('/friends-list/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const email = req.params.email;

        // Find all accepted connections where user is either sender or receiver
        const friendConnections = await collections.requestCollection.find({
            $or: [
                { senderEmail: email, status: 'accepted' },
                { receiverEmail: email, status: 'accepted' }
            ]
        }).toArray();

        // Get friends' biodata information
        const friends = await Promise.all(
            friendConnections.map(async (connection) => {
                const friendEmail = connection.senderEmail === email
                    ? connection.receiverEmail
                    : connection.senderEmail;

                // Get friend's biodata
                const friendBiodata = await collections.biodataCollection.findOne({
                    contactEmail: friendEmail,
                    status: 'approved'
                });

                if (friendBiodata) {
                    return {
                        _id: connection._id,
                        connectionId: connection._id,
                        friendEmail: friendEmail,
                        name: friendBiodata.name,
                        age: friendBiodata.age,
                        department: friendBiodata.department,
                        district: friendBiodata.district,
                        profileImage: friendBiodata.profileImage,
                        biodataId: friendBiodata.biodataId || friendBiodata._id.toString(),
                        connectedAt: connection.updatedAt || connection.sentAt,
                        isInitiator: connection.senderEmail === email
                    };
                }
                return null;
            })
        );

        // Filter out null values and sort by connection date
        const validFriends = friends
            .filter(friend => friend !== null)
            .sort((a, b) => new Date(b.connectedAt) - new Date(a.connectedAt));

        res.json({ 
            success: true, 
            friends: validFriends || []
        });
    } catch (error) {
        console.error('Get friends list error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'ফ্রেন্ডস লিস্ট আনতে সমস্যা হয়েছে',
            friends: []
        });
    }
});

// ১১. Get biodata by email (Outside run() for Vercel)
app.get('/biodata/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const email = req.params.email;
        
        const biodata = await collections.biodataCollection.findOne({ 
            contactEmail: email 
        });

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

// ১২. Save/Update biodata (Outside run() for Vercel)
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
            biodata.createdAt = new Date();
        } else {
            // Updating existing biodata - preserve existing status and biodataId
            biodata.biodataId = existingBiodata.biodataId;
            biodata.status = existingBiodata.status;
            biodata.submittedAt = existingBiodata.submittedAt;
            biodata.createdAt = existingBiodata.createdAt;
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

// ১৩. Check request status by biodata ID (Outside run() for Vercel)
app.get('/request-status-by-biodata/:senderEmail/:biodataId', async (req, res) => {
    try {
        const collections = await connectDB();
        const { senderEmail, biodataId } = req.params;

        // Get receiver's email from biodata
        const receiverBiodata = await collections.biodataCollection.findOne({
            biodataId: biodataId,
            status: 'approved'
        });

        if (!receiverBiodata) {
            return res.json({ 
                success: true, 
                hasRequest: false, 
                status: null, 
                requestId: null 
            });
        }

        const receiverEmail = receiverBiodata.contactEmail;

        // Check for connection in both directions
        const request = await collections.requestCollection.findOne({
            $or: [
                { senderEmail: senderEmail, receiverEmail: receiverEmail },
                { senderEmail: receiverEmail, receiverEmail: senderEmail }
            ]
        });

        res.json({
            success: true,
            hasRequest: !!request,
            status: request?.status || null,
            requestId: request?._id || null,
            isInitiator: request ? request.senderEmail === senderEmail : false
        });
    } catch (error) {
        console.error('Check request status by biodata error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'রিকোয়েস্ট স্ট্যাটাস চেক করতে সমস্যা হয়েছে' 
        });
    }
});

// ১৪. Check request status by ObjectId (Outside run() for Vercel)
app.get('/request-status-by-objectid/:senderEmail/:objectId', async (req, res) => {
    try {
        const collections = await connectDB();
        const { senderEmail, objectId } = req.params;
        const { ObjectId } = require('mongodb');

        // Get receiver's email from biodata using ObjectId
        const receiverBiodata = await collections.biodataCollection.findOne({
            _id: new ObjectId(objectId),
            status: 'approved'
        });

        if (!receiverBiodata) {
            return res.json({ 
                success: true, 
                hasRequest: false, 
                status: null, 
                requestId: null 
            });
        }

        const receiverEmail = receiverBiodata.contactEmail;

        // Check for connection in both directions
        const request = await collections.requestCollection.findOne({
            $or: [
                { senderEmail: senderEmail, receiverEmail: receiverEmail },
                { senderEmail: receiverEmail, receiverEmail: senderEmail }
            ]
        });

        res.json({
            success: true,
            hasRequest: !!request,
            status: request?.status || null,
            requestId: request?._id || null,
            isInitiator: request ? request.senderEmail === senderEmail : false
        });
    } catch (error) {
        console.error('Check request status by ObjectId error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'রিকোয়েস্ট স্ট্যাটাস চেক করতে সমস্যা হয়েছে' 
        });
    }
});

// ১৫. Get public success stories (Outside run() for Vercel)
app.get('/success-stories', async (req, res) => {
    try {
        const collections = await connectDB();
        const successStoriesCollection = collections.db.collection('successStories');
        
        const stories = await successStoriesCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
            
        res.json({ 
            success: true, 
            stories: stories || []
        });
    } catch (error) {
        console.error('Get public success stories error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'সাকসেস স্টোরি আনতে সমস্যা হয়েছে',
            stories: []
        });
    }
});

// ১৬. Get received requests (Outside run() for Vercel)
app.get('/received-requests/:email', async (req, res) => {
    try {
        const collections = await connectDB();
        const email = req.params.email;
        
        const requests = await collections.requestCollection
            .find({ receiverEmail: email })
            .toArray();
            
        res.json({ 
            success: true, 
            requests: requests || []
        });
    } catch (error) {
        console.error('Get received requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'রিকোয়েস্ট আনতে সমস্যা হয়েছে',
            requests: []
        });
    }
});

// ১৭. Admin: Get pending biodatas (Outside run() for Vercel)
app.get('/admin/pending-biodatas', async (req, res) => {
    try {
        const collections = await connectDB();
        
        // Get admin email from query parameter (sent by frontend)
        const adminEmail = req.query.adminEmail || req.headers['x-admin-email'];
        
        if (!adminEmail) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin email required' 
            });
        }
        
        // Verify admin
        const adminUser = await collections.usersCollection.findOne({ email: adminEmail });
        if (!adminUser || adminUser.role !== 'admin' || !adminUser.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden access - Admin privileges required' 
            });
        }
        
        const pendingBiodatas = await collections.biodataCollection
            .find({ status: 'pending' })
            .toArray();
            
        res.json({ 
            success: true, 
            biodatas: pendingBiodatas || []
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

// ১৮. Admin: Update biodata status (Outside run() for Vercel)
app.patch('/admin/biodata-status/:id', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const collections = await connectDB();
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const { ObjectId } = require('mongodb');

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'অবৈধ স্ট্যাটাস'
            });
        }

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

// ১৯. Admin: Get all users (Outside run() for Vercel)
app.get('/admin/all-users', async (req, res) => {
    try {
        const collections = await connectDB();
        
        // Get admin email from query parameter (sent by frontend)
        const adminEmail = req.query.adminEmail || req.headers['x-admin-email'];
        
        if (!adminEmail) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin email required' 
            });
        }
        
        // Verify admin
        const adminUser = await collections.usersCollection.findOne({ email: adminEmail });
        if (!adminUser || adminUser.role !== 'admin' || !adminUser.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden access - Admin privileges required' 
            });
        }
        
        const users = await collections.usersCollection.find({}).toArray();
        
        res.json({
            success: true,
            users: users || [],
            count: users ? users.length : 0
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'ইউজার তালিকা আনতে সমস্যা হয়েছে',
            users: []
        });
    }
});

// ২০. Admin: Get detailed report (Outside run() for Vercel)
app.get('/admin/detailed-report', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const collections = await connectDB();
        const { startDate, endDate } = req.query;

        const totalUsers = await collections.usersCollection.countDocuments();
        const totalBiodatas = await collections.biodataCollection.countDocuments();
        const pendingBiodatas = await collections.biodataCollection.countDocuments({ status: 'pending' });
        const approvedBiodatas = await collections.biodataCollection.countDocuments({ status: 'approved' });

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

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

// ২১. Get biodata by ObjectId (Outside run() for Vercel)
app.get('/biodata-by-objectid/:objectId', async (req, res) => {
    try {
        const collections = await connectDB();
        const objectId = req.params.objectId;
        
        const biodata = await collections.biodataCollection.findOne({
            _id: new ObjectId(objectId),
            status: 'approved'
        });

        if (!biodata) {
            return res.status(404).json({ 
                success: false, 
                message: 'বায়োডাটা পাওয়া যায়নি' 
            });
        }

        // Return full biodata - contact info visibility controlled by frontend
        res.json({ 
            success: true, 
            biodata: biodata 
        });
    } catch (error) {
        console.error('Get biodata by ObjectId error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'বায়োডাটা আনতে সমস্যা হয়েছে',
            biodata: null
        });
    }
});

// ২২. Send connection request (Outside run() for Vercel)
app.post('/send-request', async (req, res) => {
    try {
        const collections = await connectDB();
        console.log('Send request received:', req.body);
        const requestInfo = req.body;

        // Validate required fields
        if (!requestInfo.senderEmail || !requestInfo.receiverEmail) {
            return res.status(400).json({ success: false, message: 'প্রেরক এবং প্রাপকের ইমেইল প্রয়োজন' });
        }

        // Check if sender exists and is verified
        const sender = await collections.usersCollection.findOne({ email: requestInfo.senderEmail });
        if (!sender) {
            return res.status(404).json({ success: false, message: 'প্রেরক ইউজার পাওয়া যায়নি' });
        }
        if (!sender.isEmailVerified) {
            return res.status(403).json({ success: false, message: 'প্রথমে ইমেইল ভেরিফাই করুন' });
        }
        if (!sender.isActive) {
            return res.status(403).json({ success: false, message: 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে' });
        }

        // Check if receiver exists
        const receiver = await collections.usersCollection.findOne({ email: requestInfo.receiverEmail });
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'প্রাপক ইউজার পাওয়া যায়নি' });
        }

        // Check if request already exists (in both directions)
        const existingRequest = await collections.requestCollection.findOne({
            $or: [
                { senderEmail: requestInfo.senderEmail, receiverEmail: requestInfo.receiverEmail },
                { senderEmail: requestInfo.receiverEmail, receiverEmail: requestInfo.senderEmail }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ 
                success: false, 
                message: existingRequest.status === 'pending' 
                    ? 'ইতিমধ্যে একটি পেন্ডিং রিকোয়েস্ট আছে' 
                    : 'আপনারা ইতিমধ্যে কানেক্টেড'
            });
        }

        // Add timestamp
        requestInfo.sentAt = new Date();
        requestInfo.status = 'pending';

        const result = await collections.requestCollection.insertOne(requestInfo);
        console.log('Request saved:', result);

        res.json({ 
            success: true, 
            message: 'কানেকশন রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে', 
            result,
            requestId: result.insertedId
        });
    } catch (error) {
        console.error('Send request error:', error);
        res.status(500).json({ success: false, message: 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে' });
    }
});

// ২৩. Send request by biodata ID (Outside run() for Vercel)
app.post('/send-request-by-biodata', async (req, res) => {
    try {
        const collections = await connectDB();
        console.log('Send request by biodata received:', req.body);
        const { senderEmail, receiverBiodataId, status, sentAt } = req.body;

        // Validate required fields
        if (!senderEmail || !receiverBiodataId) {
            return res.status(400).json({ success: false, message: 'প্রেরকের ইমেইল এবং প্রাপকের বায়োডাটা আইডি প্রয়োজন' });
        }

        // Check if sender exists and is verified
        const sender = await collections.usersCollection.findOne({ email: senderEmail });
        if (!sender) {
            return res.status(404).json({ success: false, message: 'প্রেরক ইউজার পাওয়া যায়নি' });
        }
        if (!sender.isEmailVerified) {
            return res.status(403).json({ success: false, message: 'প্রথমে ইমেইল ভেরিফাই করুন' });
        }
        if (!sender.isActive) {
            return res.status(403).json({ success: false, message: 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে' });
        }

        // Get receiver's biodata to find their email
        const receiverBiodata = await collections.biodataCollection.findOne({
            biodataId: receiverBiodataId,
            status: 'approved'
        });

        if (!receiverBiodata) {
            return res.status(404).json({ success: false, message: 'প্রাপকের বায়োডাটা পাওয়া যায়নি' });
        }

        const receiverEmail = receiverBiodata.contactEmail;

        // Check if receiver exists
        const receiver = await collections.usersCollection.findOne({ email: receiverEmail });
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'প্রাপক ইউজার পাওয়া যায়নি' });
        }

        // Check if request already exists (in both directions)
        const existingRequest = await collections.requestCollection.findOne({
            $or: [
                { senderEmail: senderEmail, receiverEmail: receiverEmail },
                { senderEmail: receiverEmail, receiverEmail: senderEmail }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ 
                success: false, 
                message: existingRequest.status === 'pending' 
                    ? 'ইতিমধ্যে একটি পেন্ডিং রিকোয়েস্ট আছে' 
                    : 'আপনারা ইতিমধ্যে কানেক্টেড'
            });
        }

        // Create request
        const requestInfo = {
            senderEmail,
            receiverEmail,
            receiverBiodataId,
            status: status || 'pending',
            sentAt: sentAt ? new Date(sentAt) : new Date()
        };

        const result = await collections.requestCollection.insertOne(requestInfo);
        console.log('Request by biodata saved:', result);

        res.json({ 
            success: true, 
            message: 'কানেকশন রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে', 
            result,
            requestId: result.insertedId
        });
    } catch (error) {
        console.error('Send request by biodata error:', error);
        res.status(500).json({ success: false, message: 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে' });
    }
});

// ২৪. Send request by ObjectId (Outside run() for Vercel)
app.post('/send-request-by-objectid', async (req, res) => {
    try {
        const collections = await connectDB();
        console.log('Send request by ObjectId received:', req.body);
        const { senderEmail, receiverObjectId, receiverEmail, status, sentAt } = req.body;

        // Validate required fields
        if (!senderEmail || !receiverObjectId) {
            return res.status(400).json({ success: false, message: 'প্রেরকের ইমেইল এবং প্রাপকের ObjectId প্রয়োজন' });
        }

        // Check if sender exists and is verified
        const sender = await collections.usersCollection.findOne({ email: senderEmail });
        if (!sender) {
            return res.status(404).json({ success: false, message: 'প্রেরক ইউজার পাওয়া যায়নি' });
        }
        if (!sender.isEmailVerified) {
            return res.status(403).json({ success: false, message: 'প্রথমে ইমেইল ভেরিফাই করুন' });
        }
        if (!sender.isActive) {
            return res.status(403).json({ success: false, message: 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে' });
        }

        // Get receiver's biodata to find their email (if not provided)
        let finalReceiverEmail = receiverEmail;
        if (!finalReceiverEmail) {
            const receiverBiodata = await collections.biodataCollection.findOne({
                _id: new ObjectId(receiverObjectId),
                status: 'approved'
            });

            if (!receiverBiodata) {
                return res.status(404).json({ success: false, message: 'প্রাপকের বায়োডাটা পাওয়া যায়নি' });
            }

            finalReceiverEmail = receiverBiodata.contactEmail;
        }

        // Check if receiver exists
        const receiver = await collections.usersCollection.findOne({ email: finalReceiverEmail });
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'প্রাপক ইউজার পাওয়া যায়নি' });
        }

        // Check if request already exists (in both directions)
        const existingRequest = await collections.requestCollection.findOne({
            $or: [
                { senderEmail: senderEmail, receiverEmail: finalReceiverEmail },
                { senderEmail: finalReceiverEmail, receiverEmail: senderEmail }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ 
                success: false, 
                message: existingRequest.status === 'pending' 
                    ? 'ইতিমধ্যে একটি পেন্ডিং রিকোয়েস্ট আছে' 
                    : 'আপনারা ইতিমধ্যে কানেক্টেড'
            });
        }

        // Create request
        const requestInfo = {
            senderEmail,
            receiverEmail: finalReceiverEmail,
            receiverObjectId,
            status: status || 'pending',
            sentAt: sentAt ? new Date(sentAt) : new Date()
        };

        const result = await collections.requestCollection.insertOne(requestInfo);
        console.log('Request by ObjectId saved:', result);

        res.json({ 
            success: true, 
            message: 'কানেকশন রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে', 
            result,
            requestId: result.insertedId
        });
    } catch (error) {
        console.error('Send request by ObjectId error:', error);
        res.status(500).json({ success: false, message: 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে' });
    }
});

// ২৫. Cancel connection request (Outside run() for Vercel)
app.delete('/cancel-request/:requestId', async (req, res) => {
    try {
        const collections = await connectDB();
        const requestId = req.params.requestId;

        const result = await collections.requestCollection.deleteOne({
            _id: new ObjectId(requestId),
            status: 'pending' // Only allow canceling pending requests
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'রিকোয়েস্ট পাওয়া যায়নি বা ইতিমধ্যে প্রক্রিয়া করা হয়েছে' 
            });
        }

        res.json({ 
            success: true, 
            message: 'রিকোয়েস্ট সফলভাবে বাতিল করা হয়েছে' 
        });
    } catch (error) {
        console.error('Cancel request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে' 
        });
    }
});

// Keep old run() function for other endpoints
async function run() {
    try {
        await connectDB(); // Use shared connection

        // Database test endpoint for debugging
        app.get('/db-test', async (req, res) => {
            try {
                console.log('🔍 Database test endpoint called');

                // Test database connection
                const dbStats = await db.stats();
                console.log('✅ Database stats:', dbStats);

                // Test collections access
                const userCount = await usersCollection.countDocuments();
                const biodataCount = await biodataCollection.countDocuments();

                console.log('📊 Collection counts:', { userCount, biodataCount });

                res.json({
                    success: true,
                    message: 'Database connection successful',
                    stats: {
                        dbName: db.databaseName,
                        userCount,
                        biodataCount,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.error('❌ Database test failed:', error);
                res.status(500).json({
                    success: false,
                    message: 'Database connection failed',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Enhanced admin check endpoint for debugging
        app.get('/check-admin-users', async (req, res) => {
            try {
                console.log('🔍 Checking admin users...');
                
                // Get all users with their roles
                const allUsers = await usersCollection.find({}, { 
                    projection: { 
                        email: 1, 
                        role: 1, 
                        displayName: 1, 
                        isActive: 1, 
                        isEmailVerified: 1,
                        uid: 1,
                        createdAt: 1
                    } 
                }).toArray();
                
                // Find admin users
                const adminUsers = allUsers.filter(user => user.role === 'admin');
                
                console.log('📊 All users:', allUsers.length);
                console.log('👑 Admin users:', adminUsers.length);
                
                res.json({
                    success: true,
                    totalUsers: allUsers.length,
                    adminUsers: adminUsers.length,
                    users: allUsers,
                    admins: adminUsers,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('❌ Admin check failed:', error);
                res.status(500).json({
                    success: false,
                    message: 'Admin check failed',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Test admin access endpoint
        app.get('/test-admin-access', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const adminUser = req.admin_user;
                console.log('✅ Test admin access successful for:', adminUser.email);
                
                res.json({
                    success: true,
                    message: 'Admin access verified successfully',
                    admin: {
                        email: adminUser.email,
                        role: adminUser.role,
                        isActive: adminUser.isActive,
                        displayName: adminUser.displayName
                    },
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('❌ Test admin access failed:', error);
                res.status(500).json({
                    success: false,
                    message: 'Test admin access failed',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // ১. ইউজার রেজিস্ট্রেশন
        app.post('/register-user', async (req, res) => {
            try {
                console.log('=== REGISTRATION REQUEST START ===');
                console.log('Request body:', JSON.stringify(req.body, null, 2));
                console.log('Request headers:', req.headers);

                const { email, displayName, uid, photoURL, isGoogleUser, isEmailVerified } = req.body;

                // Validate required fields
                console.log(req.body)
                if (!email || !displayName || !uid) {
                    console.log('❌ Missing required fields:', {
                        email: !!email,
                        displayName: !!displayName,
                        uid: !!uid
                    });
                    return res.status(400).json({
                        success: false,
                        message: 'প্রয়োজনীয় তথ্য অনুপস্থিত (email, displayName, uid প্রয়োজন)'
                    });
                }

                // Validate SEU email
                if (!email.endsWith('@seu.edu.bd')) {
                    console.log('❌ Invalid email domain:', email);
                    return res.status(400).json({
                        success: false,
                        message: 'শুধুমাত্র SEU ইমেইল (@seu.edu.bd) ব্যবহার করুন'
                    });
                }

                console.log('✅ Validation passed, checking for existing user...');

                // Check for existing user
                const existingUser = await usersCollection.findOne({ email });
                if (existingUser) {
                    console.log('❌ User already exists:', email);
                    console.log('Existing user data:', existingUser);
                    return res.status(400).json({
                        success: false,
                        message: 'এই ইমেইল দিয়ে একাউন্ট ইতিমধ্যে আছে'
                    });
                }

                console.log('✅ No existing user found, creating new user...');

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

                console.log('📝 User object to insert:', JSON.stringify(newUser, null, 2));

                // Test database connection
                console.log('🔍 Testing database connection...');
                const dbStats = await db.stats();
                console.log('✅ Database connected. Stats:', dbStats);

                // Insert user
                console.log('💾 Inserting user into database...');
                const result = await usersCollection.insertOne(newUser);
                console.log('✅ User inserted successfully!');
                console.log('Insert result:', result);
                console.log('Inserted ID:', result.insertedId);

                // Verify insertion
                const insertedUser = await usersCollection.findOne({ _id: result.insertedId });
                console.log('🔍 Verification - Retrieved user:', insertedUser);

                console.log('=== REGISTRATION SUCCESS ===');

                // For non-Google users, attempt to send verification email
                if (!isGoogleUser) {
                    try {
                        console.log('📧 Attempting to send verification email...');
                        // Note: This is a placeholder - actual email sending would happen here
                        console.log(`📧 Verification email would be sent to: ${email}`);
                    } catch (emailError) {
                        console.error('Email sending failed:', emailError);
                        // Don't fail registration if email sending fails
                    }
                }

                res.json({
                    success: true,
                    userId: result.insertedId,
                    message: isGoogleUser ? 'Google একাউন্ট সফলভাবে তৈরি হয়েছে' : 'রেজিস্ট্রেশন সফল হয়েছে। ইমেইল ভেরিফিকেশনের জন্য ইনবক্স চেক করুন।',
                    emailSent: !isGoogleUser,
                    warning: !isGoogleUser ? 'ইমেইল সার্ভিস সাময়িকভাবে বন্ধ। ম্যানুয়াল ভেরিফিকেশন ব্যবহার করুন।' : null,
                    userData: {
                        email: newUser.email,
                        displayName: newUser.displayName,
                        uid: newUser.uid
                    }
                });
            } catch (error) {
                console.error('=== REGISTRATION ERROR ===');
                console.error('Error details:', error);
                console.error('Error stack:', error.stack);
                res.status(500).json({
                    success: false,
                    message: `Database error: ${error.message}`,
                    errorCode: error.code || 'UNKNOWN_ERROR'
                });
            }
        });

        // ২. বায়োডাটা সেভ বা আপডেট (Upsert) - Simplified for debugging
        app.put('/biodata', VerifyFirebaseToken, async (req, res) => {
            try {
                console.log('Biodata request received:', req.body);
                const biodata = req.body;

                // Validate required fields
                if (!biodata.contactEmail) {
                    return res.status(400).json({ success: false, message: 'কন্টাক্ট ইমেইল প্রয়োজন' });
                }

                // Check if user exists and is verified
                const user = await usersCollection.findOne({ email: biodata.contactEmail });
                if (!user) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }
                if (!user.isEmailVerified) {
                    return res.status(403).json({ success: false, message: 'প্রথমে ইমেইল ভেরিফাই করুন' });
                }
                if (!user.isActive) {
                    return res.status(403).json({ success: false, message: 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে' });
                }

                // Check if biodata already exists
                const existingBiodata = await biodataCollection.findOne({ contactEmail: biodata.contactEmail });

                if (!existingBiodata) {
                    // New biodata - generate unique biodata ID and set status to pending
                    const count = await biodataCollection.countDocuments();
                    biodata.biodataId = `SEU${String(count + 1).padStart(4, '0')}`;
                    biodata.status = 'pending'; // Admin approval required for new biodata
                    biodata.submittedAt = new Date();
                } else {
                    // Updating existing biodata - preserve existing status and biodataId
                    biodata.biodataId = existingBiodata.biodataId;
                    biodata.status = existingBiodata.status; // Keep existing status
                    biodata.submittedAt = existingBiodata.submittedAt; // Keep original submission date
                }

                // Always update the updatedAt timestamp
                biodata.updatedAt = new Date();

                const query = { contactEmail: biodata.contactEmail };
                const updateDoc = { $set: biodata };
                const result = await biodataCollection.updateOne(query, updateDoc, { upsert: true });

                console.log('Biodata save result:', result);

                const message = existingBiodata
                    ? 'বায়োডাটা সফলভাবে আপডেট হয়েছে।'
                    : 'বায়োডাটা সফলভাবে সাবমিট হয়েছে। এডমিন অনুমোদনের অপেক্ষায় রয়েছে।';

                res.json({
                    success: true,
                    message,
                    result
                });
            } catch (error) {
                console.error('Biodata save error:', error);
                res.status(500).json({ success: false, message: 'বায়োডাটা সেভ করতে সমস্যা হয়েছে', error: error.message });
            }
        });

        // ৩. ফিল্টার অনুযায়ী সব বায়োডাটা আনা (Approved Only)
        app.get('/all-biodata', async (req, res) => {
            const { gender, department, bloodGroup } = req.query;
            let query = { status: 'approved' };
            if (gender) query.gender = gender;
            if (department) query.department = department;
            if (bloodGroup) query.bloodGroup = bloodGroup;

            const result = await biodataCollection.find(query).toArray();
            res.send(result);
        });

        // ৪. কানেকশন রিকোয়েস্ট পাঠানো
        app.post('/send-request', VerifyFirebaseToken, async (req, res) => {
            try {
                console.log('Send request received:', req.body);
                const requestInfo = req.body;

                // Validate required fields
                if (!requestInfo.senderEmail || !requestInfo.receiverEmail) {
                    return res.status(400).json({ success: false, message: 'প্রেরক এবং প্রাপকের ইমেইল প্রয়োজন' });
                }

                // Check if sender exists and is verified
                const sender = await usersCollection.findOne({ email: requestInfo.senderEmail });
                if (!sender) {
                    return res.status(404).json({ success: false, message: 'প্রেরক ইউজার পাওয়া যায়নি' });
                }
                if (!sender.isEmailVerified) {
                    return res.status(403).json({ success: false, message: 'প্রথমে ইমেইল ভেরিফাই করুন' });
                }
                if (!sender.isActive) {
                    return res.status(403).json({ success: false, message: 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে' });
                }

                // Check if receiver exists
                const receiver = await usersCollection.findOne({ email: requestInfo.receiverEmail });
                if (!receiver) {
                    return res.status(404).json({ success: false, message: 'প্রাপক ইউজার পাওয়া যায়নি' });
                }

                // Check if request already exists
                const existingRequest = await requestCollection.findOne({
                    senderEmail: requestInfo.senderEmail,
                    receiverEmail: requestInfo.receiverEmail
                });

                if (existingRequest) {
                    return res.status(400).json({ success: false, message: 'আপনি ইতিমধ্যে এই ব্যক্তির কাছে রিকোয়েস্ট পাঠিয়েছেন' });
                }

                // Add timestamp
                requestInfo.sentAt = new Date();
                requestInfo.status = 'pending';

                const result = await requestCollection.insertOne(requestInfo);
                console.log('Request saved:', result);

                res.json({ success: true, message: 'কানেকশন রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে', result });
            } catch (error) {
                console.error('Send request error:', error);
                res.status(500).json({ success: false, message: 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে' });
            }
        });


        // ৫. ইমেইল ভেরিফিকেশন স্ট্যাটাস আপডেট
        app.patch('/verify-email', async (req, res) => {
            try {
                const { email } = req.body;
                const result = await usersCollection.updateOne(
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

        // Test verify-email endpoint (duplicate for testing)
        app.post('/verify-email-test', async (req, res) => {
            try {
                const { email } = req.body;
                console.log('Verify email test called for:', email);

                const result = await usersCollection.updateOne(
                    { email },
                    { $set: { isEmailVerified: true, verifiedAt: new Date() } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'ইমেইল ভেরিফিকেশন সফল হয়েছে (Test)' });
            } catch (error) {
                console.error('Email verification test error:', error);
                res.status(500).json({ success: false, message: 'ভেরিফিকেশনে সমস্যা হয়েছে' });
            }
        });

        // ৫.১ ইমেইল ভেরিফিকেশন লিংক পাঠানো
        app.post('/send-verification-email', async (req, res) => {
            try {
                const { email } = req.body;

                if (!email) {
                    return res.status(400).json({ success: false, message: 'ইমেইল প্রয়োজন' });
                }

                // Check if user exists
                const user = await usersCollection.findOne({ email });
                if (!user) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                if (user.isEmailVerified) {
                    return res.status(400).json({ success: false, message: 'ইমেইল ইতিমধ্যে ভেরিফাই করা হয়েছে' });
                }

                // Create a verification token
                const verificationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
                const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/verify-email-link?token=${verificationToken}&email=${encodeURIComponent(email)}`;

                // Store verification token in database
                await usersCollection.updateOne(
                    { email },
                    {
                        $set: {
                            verificationToken,
                            verificationTokenCreatedAt: new Date()
                        }
                    }
                );

                // Try to send email if transporter is available
                if (transporter) {
                    try {
                        const mailOptions = {
                            from: process.env.EMAIL_USER || 'noreply@seu.edu.bd',
                            to: email,
                            subject: 'SEU Matrimony - ইমেইল ভেরিফিকেশন',
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <h1 style="color: #e91e63; margin: 0;">SEU Matrimony</h1>
                                        <p style="color: #666; margin: 5px 0;">Southeast University Matrimony Platform</p>
                                    </div>
                                    
                                    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                                        <h2 style="color: #333; margin-top: 0;">ইমেইল ভেরিফিকেশন</h2>
                                        <p style="color: #666; line-height: 1.6;">
                                            আপনার SEU Matrimony একাউন্ট সক্রিয় করতে নিচের বাটনে ক্লিক করুন:
                                        </p>
                                        
                                        <div style="text-align: center; margin: 30px 0;">
                                            <a href="${verificationLink}" 
                                               style="background: #e91e63; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                                ইমেইল ভেরিফাই করুন
                                            </a>
                                        </div>
                                        
                                        <p style="color: #666; font-size: 14px;">
                                            অথবা এই লিংকটি কপি করে ব্রাউজারে পেস্ট করুন:<br>
                                            <a href="${verificationLink}" style="color: #e91e63; word-break: break-all;">${verificationLink}</a>
                                        </p>
                                    </div>
                                    
                                    <div style="text-align: center; color: #999; font-size: 12px;">
                                        <p>এই ইমেইলটি SEU Matrimony থেকে পাঠানো হয়েছে</p>
                                        <p>যদি আপনি এই একাউন্ট তৈরি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
                                    </div>
                                </div>
                            `
                        };

                        await transporter.sendMail(mailOptions);
                        console.log(`📧 Verification email sent to: ${email}`);

                        res.json({
                            success: true,
                            message: 'ভেরিফিকেশন ইমেইল সফলভাবে পাঠানো হয়েছে',
                            verificationToken // For testing purposes
                        });
                    } catch (emailError) {
                        console.error('Email sending failed:', emailError);
                        res.json({
                            success: true,
                            message: 'ভেরিফিকেশন টোকেন তৈরি হয়েছে কিন্তু ইমেইল পাঠানো যায়নি',
                            warning: 'ইমেইল সার্ভিসে সমস্যা। ম্যানুয়াল ভেরিফিকেশন ব্যবহার করুন।',
                            verificationToken
                        });
                    }
                } else {
                    // No email service configured
                    console.log(`📧 Email service not configured. Token created for: ${email}`);
                    res.json({
                        success: true,
                        message: 'ভেরিফিকেশন টোকেন তৈরি হয়েছে',
                        warning: 'ইমেইল সার্ভিস কনফিগার করা হয়নি। ম্যানুয়াল ভেরিফিকেশন ব্যবহার করুন।',
                        verificationToken
                    });
                }
            } catch (error) {
                console.error('Send verification email error:', error);
                res.status(500).json({ success: false, message: 'ইমেইল পাঠাতে সমস্যা হয়েছে' });
            }
        });

        // ৫.২ ইমেইল ভেরিফিকেশন টোকেন যাচাই করা (Email Link Verification)
        app.post('/verify-email-token', async (req, res) => {
            try {
                const { token, email } = req.body;

                if (!token || !email) {
                    return res.status(400).json({ success: false, message: 'টোকেন এবং ইমেইল প্রয়োজন' });
                }

                // Find user with this email and token
                const user = await usersCollection.findOne({ 
                    email, 
                    verificationToken: token 
                });

                if (!user) {
                    return res.status(404).json({ success: false, message: 'অবৈধ ভেরিফিকেশন লিংক' });
                }

                if (user.isEmailVerified) {
                    return res.status(400).json({ success: false, message: 'ইমেইল ইতিমধ্যে ভেরিফাই করা হয়েছে' });
                }

                // Check if token is expired (24 hours)
                const tokenAge = new Date() - new Date(user.verificationTokenCreatedAt);
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

                if (tokenAge > maxAge) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'ভেরিফিকেশন লিংকের মেয়াদ শেষ। নতুন লিংক চান।',
                        expired: true
                    });
                }

                // Verify the token format
                try {
                    const decoded = Buffer.from(token, 'base64').toString();
                    const [tokenEmail] = decoded.split(':');
                    
                    if (tokenEmail !== email) {
                        return res.status(400).json({ success: false, message: 'অবৈধ ভেরিফিকেশন টোকেন' });
                    }
                } catch (decodeError) {
                    return res.status(400).json({ success: false, message: 'অবৈধ টোকেন ফরম্যাট' });
                }

                // Update user as verified and remove token
                const result = await usersCollection.updateOne(
                    { email },
                    {
                        $set: {
                            isEmailVerified: true,
                            verifiedAt: new Date()
                        },
                        $unset: {
                            verificationToken: 1,
                            verificationTokenCreatedAt: 1
                        }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                console.log(`✅ Email verified successfully for: ${email}`);

                res.json({ 
                    success: true, 
                    message: 'ইমেইল সফলভাবে ভেরিফাই হয়েছে!',
                    user: {
                        email: user.email,
                        displayName: user.displayName,
                        isEmailVerified: true
                    }
                });
            } catch (error) {
                console.error('Verify email token error:', error);
                res.status(500).json({ success: false, message: 'ভেরিফিকেশনে সমস্যা হয়েছে' });
            }
        });

        // ৬. ইউজার প্রোফাইল তথ্য
        app.get('/user/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const user = await usersCollection.findOne({ email });

                if (!user) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, user });
            } catch (error) {
                console.error('Get user error:', error);
                res.status(500).json({ success: false, message: 'ইউজার তথ্য আনতে সমস্যা হয়েছে' });
            }
        });

        // ৭. একাউন্ট ডিঅ্যাক্টিভেট করা
        app.patch('/deactivate-account', async (req, res) => {
            try {
                const { email, reason } = req.body;

                const result = await usersCollection.updateOne(
                    { email },
                    {
                        $set: {
                            isActive: false,
                            deactivatedAt: new Date(),
                            deactivationReason: reason || 'User requested'
                        }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'একাউন্ট সফলভাবে ডিঅ্যাক্টিভেট হয়েছে' });
            } catch (error) {
                console.error('Deactivate account error:', error);
                res.status(500).json({ success: false, message: 'একাউন্ট ডিঅ্যাক্টিভেট করতে সমস্যা হয়েছে' });
            }
        });

        // ৮. একাউন্ট রিঅ্যাক্টিভেট করা
        app.patch('/reactivate-account', async (req, res) => {
            try {
                const { email } = req.body;

                const result = await usersCollection.updateOne(
                    { email },
                    {
                        $set: {
                            isActive: true,
                            reactivatedAt: new Date()
                        },
                        $unset: {
                            deactivatedAt: 1,
                            deactivationReason: 1
                        }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'একাউন্ট সফলভাবে রিঅ্যাক্টিভেট হয়েছে' });
            } catch (error) {
                console.error('Reactivate account error:', error);
                res.status(500).json({ success: false, message: 'একাউন্ট রিঅ্যাক্টিভেট করতে সমস্যা হয়েছে' });
            }
        });

        // ৯. রিকোয়েস্ট দেখা (Received Requests)
        app.get('/received-requests/:email', VerifyFirebaseToken, async (req, res) => {
            try {
                const email = req.params.email;
                const query = { receiverEmail: email };
                const result = await requestCollection.find(query).toArray();
                res.json({ success: true, requests: result });
            } catch (error) {
                console.error('Get requests error:', error);
                res.status(500).json({ success: false, message: 'রিকোয়েস্ট আনতে সমস্যা হয়েছে' });
            }
        });

        // ১০. রিকোয়েস্ট এক্সেপ্ট বা রিজেক্ট করা
        app.patch('/request-status/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const { status } = req.body; // 'accepted' or 'rejected'
                const filter = { _id: new ObjectId(id) };
                const updateDoc = { $set: { status: status, updatedAt: new Date() } };
                const result = await requestCollection.updateOne(filter, updateDoc);

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'রিকোয়েস্ট স্ট্যাটাস আপডেট হয়েছে' });
            } catch (error) {
                console.error('Update request status error:', error);
                res.status(500).json({ success: false, message: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' });
            }
        });

        // ১১. এডমিন - পেন্ডিং বায়োডাটা দেখা
        app.get('/admin/pending-biodatas', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const pendingBiodatas = await biodataCollection.find({ status: 'pending' }).toArray();
                res.json({ success: true, biodatas: pendingBiodatas });
            } catch (error) {
                console.error('Get pending biodatas error:', error);
                res.status(500).json({ success: false, message: 'পেন্ডিং বায়োডাটা আনতে সমস্যা হয়েছে' });
            }
        });

        // ১২. এডমিন - বায়োডাটা অনুমোদন/প্রত্যাখ্যান
        app.patch('/admin/biodata-status/:id', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const id = req.params.id;
                const { status, adminNote } = req.body; // 'approved' or 'rejected'

                const updateDoc = {
                    $set: {
                        status: status,
                        adminReviewedAt: new Date(),
                        adminNote: adminNote || ''
                    }
                };

                const result = await biodataCollection.updateOne(
                    { _id: new ObjectId(id) },
                    updateDoc
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'বায়োডাটা পাওয়া যায়নি' });
                }

                const message = status === 'approved' ? 'বায়োডাটা অনুমোদিত হয়েছে' : 'বায়োডাটা প্রত্যাখ্যান করা হয়েছে';
                res.json({ success: true, message });
            } catch (error) {
                console.error('Update biodata status error:', error);
                res.status(500).json({ success: false, message: 'বায়োডাটা স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' });
            }
        });

        // ১৪. ইউজারের পাঠানো রিকোয়েস্ট দেখা (Sent Requests)
        app.get('/sent-requests/:email', VerifyFirebaseToken, async (req, res) => {
            try {
                const email = req.params.email;
                const query = { senderEmail: email };
                const result = await requestCollection.find(query).toArray();
                res.json({ success: true, requests: result });
            } catch (error) {
                console.error('Get sent requests error:', error);
                res.status(500).json({ success: false, message: 'পাঠানো রিকোয়েস্ট আনতে সমস্যা হয়েছে' });
            }
        });

        // ১৫. ইউজার স্ট্যাটিস্টিক্স (Real Data)
        app.get('/user-stats/:email', VerifyFirebaseToken, async (req, res) => {
            try {
                const email = req.params.email;

                const sentRequests = await requestCollection.countDocuments({ senderEmail: email });
                const receivedRequests = await requestCollection.countDocuments({ receiverEmail: email });
                const acceptedRequests = await requestCollection.countDocuments({
                    $or: [
                        { senderEmail: email, status: 'accepted' },
                        { receiverEmail: email, status: 'accepted' }
                    ]
                });

                // Profile views (you can implement a views collection later)
                const profileViews = 0; // Placeholder for now

                res.json({
                    success: true,
                    stats: {
                        sentRequests,
                        receivedRequests,
                        acceptedRequests,
                        profileViews
                    }
                });
            } catch (error) {
                console.error('Get user stats error:', error);
                res.status(500).json({ success: false, message: 'ইউজার স্ট্যাটস আনতে সমস্যা হয়েছে' });
            }
        });

        // ১৭. এডমিন রোল সেট করা (Development এর জন্য)
        app.patch('/set-admin/:email', async (req, res) => {
            try {
                const email = req.params.email;

                // Only allow SEU emails to become admin
                if (!email.endsWith('@seu.edu.bd')) {
                    return res.status(400).json({ success: false, message: 'শুধুমাত্র SEU ইমেইল এডমিন হতে পারে' });
                }

                const result = await usersCollection.updateOne(
                    { email },
                    { $set: { role: 'admin', updatedAt: new Date() } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'এডমিন রোল সেট করা হয়েছে' });
            } catch (error) {
                console.error('Set admin role error:', error);
                res.status(500).json({ success: false, message: 'এডমিন রোল সেট করতে সমস্যা হয়েছে' });
            }
        });
        app.get('/biodata-status/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const biodata = await biodataCollection.findOne({ contactEmail: email });

                if (!biodata) {
                    return res.json({
                        success: true,
                        hasProfile: false,
                        status: null
                    });
                }

                res.json({
                    success: true,
                    hasProfile: true,
                    status: biodata.status,
                    submittedAt: biodata.submittedAt,
                    updatedAt: biodata.updatedAt
                });
            } catch (error) {
                console.error('Get biodata status error:', error);
                res.status(500).json({ success: false, message: 'বায়োডাটা স্ট্যাটাস আনতে সমস্যা হয়েছে' });
            }
        });
        // ১৭. গৃহীত রিকোয়েস্ট থেকে কথোপকথন তৈরি
        app.get('/accepted-conversations/:email', async (req, res) => {
            try {
                const email = req.params.email;

                // Find all accepted requests where user is either sender or receiver
                const acceptedRequests = await requestCollection.find({
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
                        const otherUserBiodata = await biodataCollection.findOne({
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

                res.json({ success: true, conversations });
            } catch (error) {
                console.error('Get conversations error:', error);
                res.status(500).json({ success: false, message: 'কথোপকথন আনতে সমস্যা হয়েছে' });
            }
        });

        // ১৮. মেসেজ পাঠানো
        app.post('/send-message', async (req, res) => {
            try {
                const { conversationId, senderEmail, receiverEmail, message } = req.body;

                if (!conversationId || !senderEmail || !receiverEmail || !message) {
                    return res.status(400).json({ success: false, message: 'সব তথ্য প্রয়োজন' });
                }

                // Verify the conversation exists (accepted request)
                const conversation = await requestCollection.findOne({
                    _id: new ObjectId(conversationId),
                    status: 'accepted'
                });

                if (!conversation) {
                    return res.status(404).json({ success: false, message: 'কথোপকথন পাওয়া যায়নি' });
                }

                // Verify sender is part of this conversation
                const isValidSender = conversation.senderEmail === senderEmail || conversation.receiverEmail === senderEmail;
                if (!isValidSender) {
                    return res.status(403).json({ success: false, message: 'অনুমতি নেই' });
                }

                const messageData = {
                    conversationId: new ObjectId(conversationId),
                    senderEmail,
                    receiverEmail,
                    message: message.trim(),
                    sentAt: new Date(),
                    isRead: false
                };

                const result = await messagesCollection.insertOne(messageData);

                if (result.insertedId) {
                    // Update conversation's last activity
                    await requestCollection.updateOne(
                        { _id: new ObjectId(conversationId) },
                        { $set: { lastActivity: new Date() } }
                    );

                    res.json({
                        success: true,
                        message: 'মেসেজ পাঠানো হয়েছে',
                        messageId: result.insertedId
                    });
                } else {
                    res.status(500).json({ success: false, message: 'মেসেজ সেভ করতে সমস্যা হয়েছে' });
                }
            } catch (error) {
                console.error('Send message error:', error);
                res.status(500).json({ success: false, message: 'মেসেজ পাঠাতে সমস্যা হয়েছে' });
            }
        });

        // ১৯. কথোপকথনের মেসেজ আনা
        app.get('/messages/:conversationId', async (req, res) => {
            try {
                const conversationId = req.params.conversationId;

                // Verify conversation exists
                const conversation = await requestCollection.findOne({
                    _id: new ObjectId(conversationId),
                    status: 'accepted'
                });

                if (!conversation) {
                    return res.status(404).json({ success: false, message: 'কথোপকথন পাওয়া যায়নি' });
                }

                // Get messages for this conversation, sorted by time
                const messages = await messagesCollection
                    .find({ conversationId: new ObjectId(conversationId) })
                    .sort({ sentAt: 1 })
                    .toArray();

                res.json({ success: true, messages });
            } catch (error) {
                console.error('Get messages error:', error);
                res.status(500).json({ success: false, message: 'মেসেজ আনতে সমস্যা হয়েছে' });
            }
        });

        // ১৯.১. মেসেজ পড়া হিসেবে চিহ্নিত করা
        app.patch('/mark-messages-read/:conversationId/:userEmail', async (req, res) => {
            try {
                const { conversationId, userEmail } = req.params;

                // Mark all unread messages in this conversation as read for this user
                const result = await messagesCollection.updateMany(
                    {
                        conversationId: new ObjectId(conversationId),
                        receiverEmail: userEmail,
                        isRead: false
                    },
                    {
                        $set: {
                            isRead: true,
                            readAt: new Date()
                        }
                    }
                );

                res.json({
                    success: true,
                    message: 'মেসেজ পড়া হিসেবে চিহ্নিত করা হয়েছে',
                    modifiedCount: result.modifiedCount
                });
            } catch (error) {
                console.error('Mark messages read error:', error);
                res.status(500).json({ success: false, message: 'মেসেজ আপডেট করতে সমস্যা হয়েছে' });
            }
        });

        // ১৯.২. অপঠিত মেসেজের সংখ্যা
        app.get('/unread-count/:userEmail', async (req, res) => {
            try {
                const userEmail = req.params.userEmail;

                const unreadCount = await messagesCollection.countDocuments({
                    receiverEmail: userEmail,
                    isRead: false
                });

                res.json({ success: true, unreadCount });
            } catch (error) {
                console.error('Get unread count error:', error);
                res.status(500).json({ success: false, message: 'অপঠিত মেসেজ গণনা করতে সমস্যা হয়েছে' });
            }
        });

        // ২৫. এডমিন - সব ইউজার দেখা
        app.get('/admin/all-users', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const users = await usersCollection.find({}).sort({ createdAt: -1 }).toArray();
                res.json({ success: true, users });
            } catch (error) {
                console.error('Get all users error:', error);
                res.status(500).json({ success: false, message: 'ইউজার তালিকা আনতে সমস্যা হয়েছে' });
            }
        });

        // ২৬. এডমিন - ইউজার সক্রিয় করা
        app.patch('/admin/activate-user', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const { email } = req.body;

                const result = await usersCollection.updateOne(
                    { email },
                    {
                        $set: {
                            isActive: true,
                            reactivatedAt: new Date()
                        },
                        $unset: {
                            deactivatedAt: 1,
                            deactivationReason: 1
                        }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'ইউজার সফলভাবে সক্রিয় করা হয়েছে' });
            } catch (error) {
                console.error('Activate user error:', error);
                res.status(500).json({ success: false, message: 'ইউজার সক্রিয় করতে সমস্যা হয়েছে' });
            }
        });

        // ২৭. এডমিন - ইউজার নিষ্ক্রিয় করা
        app.patch('/admin/deactivate-user', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const { email, reason } = req.body;

                const result = await usersCollection.updateOne(
                    { email },
                    {
                        $set: {
                            isActive: false,
                            deactivatedAt: new Date(),
                            deactivationReason: reason || 'Admin action'
                        }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'ইউজার সফলভাবে নিষ্ক্রিয় করা হয়েছে' });
            } catch (error) {
                console.error('Deactivate user error:', error);
                res.status(500).json({ success: false, message: 'ইউজার নিষ্ক্রিয় করতে সমস্যা হয়েছে' });
            }
        });

        // ২৮. এডমিন - ইউজার ভেরিফাই করা
        app.patch('/admin/verify-user', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const { email } = req.body;

                const result = await usersCollection.updateOne(
                    { email },
                    {
                        $set: {
                            isEmailVerified: true,
                            verifiedAt: new Date(),
                            verifiedBy: 'admin'
                        }
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'ইউজার সফলভাবে ভেরিফাই করা হয়েছে' });
            } catch (error) {
                console.error('Verify user error:', error);
                res.status(500).json({ success: false, message: 'ইউজার ভেরিফাই করতে সমস্যা হয়েছে' });
            }
        });

        // ২৯. এডমিন - ইউজার ডিলিট করা
        app.delete('/admin/delete-user/:email', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const email = req.params.email;

                // Delete user's biodata first
                await biodataCollection.deleteOne({ contactEmail: email });

                // Delete user's requests
                await requestCollection.deleteMany({
                    $or: [
                        { senderEmail: email },
                        { receiverEmail: email }
                    ]
                });

                // Delete user's messages
                await messagesCollection.deleteMany({
                    $or: [
                        { senderEmail: email },
                        { receiverEmail: email }
                    ]
                });

                // Finally delete the user
                const result = await usersCollection.deleteOne({ email });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'ইউজার এবং সংশ্লিষ্ট সকল ডেটা সফলভাবে ডিলিট করা হয়েছে' });
            } catch (error) {
                console.error('Delete user error:', error);
                res.status(500).json({ success: false, message: 'ইউজার ডিলিট করতে সমস্যা হয়েছে' });
            }
        });

        // ৩০. এডমিন - বিস্তারিত রিপোর্ট
        app.get('/admin/detailed-report', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const { startDate, endDate } = req.query;

                let dateFilter = {};
                if (startDate && endDate) {
                    dateFilter = {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    };
                }

                // User registration trends
                const userTrends = await usersCollection.aggregate([
                    { $match: dateFilter },
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

                // Biodata submission trends
                const biodataTrends = await biodataCollection.aggregate([
                    { $match: dateFilter },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$submittedAt" },
                                month: { $month: "$submittedAt" }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ]).toArray();

                // Department wise distribution
                const departmentStats = await biodataCollection.aggregate([
                    { $match: { status: 'approved' } },
                    {
                        $group: {
                            _id: "$department",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]).toArray();

                // District wise distribution
                const districtStats = await biodataCollection.aggregate([
                    { $match: { status: 'approved' } },
                    {
                        $group: {
                            _id: "$district",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]).toArray();

                res.json({
                    success: true,
                    report: {
                        userTrends,
                        biodataTrends,
                        departmentStats,
                        districtStats
                    }
                });
            } catch (error) {
                console.error('Get detailed report error:', error);
                res.status(500).json({ success: false, message: 'রিপোর্ট তৈরি করতে সমস্যা হয়েছে' });
            }
        });

        // ৩২. ফ্রেন্ডস লিস্ট আনা (Connected Users)
        app.get('/friends-list/:email', async (req, res) => {
            try {
                const email = req.params.email;

                // Find all accepted connections where user is either sender or receiver
                const friendConnections = await requestCollection.find({
                    $or: [
                        { senderEmail: email, status: 'accepted' },
                        { receiverEmail: email, status: 'accepted' }
                    ]
                }).toArray();

                // Get friends' biodata information
                const friends = await Promise.all(
                    friendConnections.map(async (connection) => {
                        const friendEmail = connection.senderEmail === email
                            ? connection.receiverEmail
                            : connection.senderEmail;

                        // Get friend's biodata
                        const friendBiodata = await biodataCollection.findOne({
                            contactEmail: friendEmail,
                            status: 'approved'
                        });

                        if (friendBiodata) {
                            return {
                                _id: connection._id,
                                connectionId: connection._id,
                                friendEmail: friendEmail,
                                name: friendBiodata.name,
                                age: friendBiodata.age,
                                department: friendBiodata.department,
                                district: friendBiodata.district,
                                profileImage: friendBiodata.profileImage,
                                biodataId: friendBiodata.biodataId || friendBiodata._id.toString(), // Fallback to ObjectId if biodataId is missing
                                connectedAt: connection.updatedAt || connection.sentAt,
                                isInitiator: connection.senderEmail === email
                            };
                        }
                        return null;
                    })
                );

                // Filter out null values and sort by connection date
                const validFriends = friends
                    .filter(friend => friend !== null)
                    .sort((a, b) => new Date(b.connectedAt) - new Date(a.connectedAt));

                res.json({ success: true, friends: validFriends });
            } catch (error) {
                console.error('Get friends list error:', error);
                res.status(500).json({ success: false, message: 'ফ্রেন্ডস লিস্ট আনতে সমস্যা হয়েছে' });
            }
        });

        // ৩৩. Browse Matches এ Connected Users বাদ দেওয়া
        app.get('/browse-matches/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const { gender, department, bloodGroup, ageMin, ageMax } = req.query;

                // Get user's connected friends
                const connections = await requestCollection.find({
                    $or: [
                        { senderEmail: email, status: 'accepted' },
                        { receiverEmail: email, status: 'accepted' }
                    ]
                }).toArray();

                // Extract connected emails
                const connectedEmails = connections.map(conn =>
                    conn.senderEmail === email ? conn.receiverEmail : conn.senderEmail
                );

                // Add current user's email to exclude list
                connectedEmails.push(email);

                // Build query for matches
                let query = {
                    status: 'approved',
                    contactEmail: { $nin: connectedEmails } // Exclude connected users
                };

                if (gender) query.gender = gender;
                if (department) query.department = department;
                if (bloodGroup) query.bloodGroup = bloodGroup;
                if (ageMin || ageMax) {
                    query.age = {};
                    if (ageMin) query.age.$gte = parseInt(ageMin);
                    if (ageMax) query.age.$lte = parseInt(ageMax);
                }

                const matches = await biodataCollection.find(query).toArray();

                // Remove sensitive information for public browsing
                const publicMatches = matches.map(match => {
                    const {
                        contactEmail,
                        mobile,
                        presentAddress,
                        permanentAddress,
                        ...publicData
                    } = match;
                    return publicData;
                });

                res.json({ success: true, matches: publicMatches });
            } catch (error) {
                console.error('Get browse matches error:', error);
                res.status(500).json({ success: false, message: 'ম্যাচ খুঁজতে সমস্যা হয়েছে' });
            }
        });

        // ৩১. টাইপিং স্ট্যাটাস আপডেট (Optional enhancement)
        app.post('/typing-status', async (req, res) => {
            try {
                const { conversationId, userEmail, isTyping } = req.body;

                // This could be implemented with WebSocket for real-time updates
                // For now, just return success
                res.json({ success: true, message: 'টাইপিং স্ট্যাটাস আপডেট হয়েছে' });
            } catch (error) {
                console.error('Typing status error:', error);
                res.status(500).json({ success: false, message: 'টাইপিং স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' });
            }
        });

        // ২০. বায়োডাটা আইডি দিয়ে প্রোফাইল আনা
        // app.get('/biodata-by-id/:biodataId', async (req, res) => {
        //     try {
        //         const biodataId = req.params.biodataId;
        //         const biodata = await biodataCollection.findOne({
        //             biodataId: biodataId,
        //             status: 'approved'
        //         });

        //         if (!biodata) {
        //             return res.status(404).json({ success: false, message: 'বায়োডাটা পাওয়া যায়নি' });
        //         }

        //         // Return full biodata - contact info visibility will be controlled by frontend based on connection status
        //         res.json({ success: true, biodata: biodata });
        //     } catch (error) {
        //         console.error('Get biodata by ID error:', error);
        //         res.status(500).json({ success: false, message: 'বায়োডাটা আনতে সমস্যা হয়েছে' });
        //     }
        // });

        // ২০.১. MongoDB ObjectId দিয়ে প্রোফাইল আনা (Fallback)
        app.get('/biodata-by-objectid/:objectId', async (req, res) => {
            try {
                const objectId = req.params.objectId;
                const biodata = await biodataCollection.findOne({
                    _id: new ObjectId(objectId),
                    status: 'approved'
                });

                console.log(biodata)
                if (!biodata) {
                    return res.status(404).json({ success: false, message: 'বায়োডাটা পাওয়া যায়নি' });
                }

                // Return full biodata - contact info visibility will be controlled by frontend based on connection status
                res.json({ success: true, biodata: biodata });
            } catch (error) {
                console.error('Get biodata by ObjectId error:', error);
                res.status(500).json({ success: false, message: 'বায়োডাটা আনতে সমস্যা হয়েছে' });
            }
        });

        // ২১. রিকোয়েস্ট স্ট্যাটাস চেক করা
        app.get('/request-status/:senderEmail/:receiverEmail', async (req, res) => {
            try {
                const { senderEmail, receiverEmail } = req.params;

                const request = await requestCollection.findOne({
                    senderEmail: senderEmail,
                    receiverEmail: receiverEmail
                });

                res.json({
                    success: true,
                    hasRequest: !!request,
                    status: request?.status || null,
                    requestId: request?._id || null
                });
            } catch (error) {
                console.error('Check request status error:', error);
                res.status(500).json({ success: false, message: 'রিকোয়েস্ট স্ট্যাটাস চেক করতে সমস্যা হয়েছে' });
            }
        });

        // ২২. রিকোয়েস্ট বাতিল করা
        app.delete('/cancel-request/:requestId', async (req, res) => {
            try {
                const requestId = req.params.requestId;

                const result = await requestCollection.deleteOne({
                    _id: new ObjectId(requestId),
                    status: 'pending' // Only allow canceling pending requests
                });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি বা ইতিমধ্যে প্রক্রিয়া করা হয়েছে' });
                }

                res.json({ success: true, message: 'রিকোয়েস্ট সফলভাবে বাতিল করা হয়েছে' });
            } catch (error) {
                console.error('Cancel request error:', error);
                res.status(500).json({ success: false, message: 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে' });
            }
        });

        // ২২.১. আনফ্রেন্ড করা (Accepted requests) - Either user can unfriend
        app.delete('/unfriend/:requestId', async (req, res) => {
            try {
                const requestId = req.params.requestId;

                const result = await requestCollection.deleteOne({
                    _id: new ObjectId(requestId),
                    status: 'accepted' // Only allow unfriending accepted requests
                });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'কানেকশন পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'সফলভাবে আনফ্রেন্ড করা হয়েছে' });
            } catch (error) {
                console.error('Unfriend error:', error);
                res.status(500).json({ success: false, message: 'আনফ্রেন্ড করতে সমস্যা হয়েছে' });
            }
        });

        // ২২.২. ইমেইল দিয়ে আনফ্রেন্ড করা (Either user can unfriend)
        app.delete('/unfriend-by-email/:senderEmail/:receiverEmail', async (req, res) => {
            try {
                const { senderEmail, receiverEmail } = req.params;

                // Find the connection between these two users (either direction)
                const connection = await requestCollection.findOne({
                    $or: [
                        { senderEmail: senderEmail, receiverEmail: receiverEmail, status: 'accepted' },
                        { senderEmail: receiverEmail, receiverEmail: senderEmail, status: 'accepted' }
                    ]
                });

                if (!connection) {
                    return res.status(404).json({ success: false, message: 'কোনো কানেকশন পাওয়া যায়নি' });
                }

                // Delete the connection
                const result = await requestCollection.deleteOne({ _id: connection._id });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'কানেকশন ডিলিট করতে সমস্যা হয়েছে' });
                }

                res.json({ success: true, message: 'সফলভাবে আনফ্রেন্ড করা হয়েছে' });
            } catch (error) {
                console.error('Unfriend by email error:', error);
                res.status(500).json({ success: false, message: 'আনফ্রেন্ড করতে সমস্যা হয়েছে' });
            }
        });

        // ২৩. বায়োডাটা আইডি দিয়ে রিকোয়েস্ট পাঠানো
        app.post('/send-request-by-biodata', VerifyFirebaseToken, async (req, res) => {
            try {
                console.log('Send request by biodata received:', req.body);
                const { senderEmail, receiverBiodataId, status } = req.body;

                // Validate required fields
                if (!senderEmail || !receiverBiodataId) {
                    return res.status(400).json({ success: false, message: 'প্রেরক ইমেইল এবং প্রাপকের বায়োডাটা আইডি প্রয়োজন' });
                }

                // Get receiver's biodata to find email
                const receiverBiodata = await biodataCollection.findOne({
                    biodataId: receiverBiodataId,
                    status: 'approved'
                });

                if (!receiverBiodata) {
                    return res.status(404).json({ success: false, message: 'প্রাপকের বায়োডাটা পাওয়া যায়নি' });
                }

                const receiverEmail = receiverBiodata.contactEmail;

                // Check if sender exists and is verified
                const sender = await usersCollection.findOne({ email: senderEmail });
                if (!sender) {
                    return res.status(404).json({ success: false, message: 'প্রেরক ইউজার পাওয়া যায়নি' });
                }
                if (!sender.isEmailVerified) {
                    return res.status(403).json({ success: false, message: 'প্রথমে ইমেইল ভেরিফাই করুন' });
                }
                if (!sender.isActive) {
                    return res.status(403).json({ success: false, message: 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে' });
                }

                // Check if request already exists
                const existingRequest = await requestCollection.findOne({
                    senderEmail: senderEmail,
                    receiverEmail: receiverEmail
                });

                if (existingRequest) {
                    return res.status(400).json({ success: false, message: 'আপনি ইতিমধ্যে এই ব্যক্তির কাছে রিকোয়েস্ট পাঠিয়েছেন' });
                }

                // Create request
                const requestData = {
                    senderEmail,
                    receiverEmail,
                    receiverBiodataId,
                    status: 'pending',
                    sentAt: new Date()
                };

                const result = await requestCollection.insertOne(requestData);
                console.log('Request saved:', result);

                res.json({ success: true, message: 'কানেকশন রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে', result });
            } catch (error) {
                console.error('Send request by biodata error:', error);
                res.status(500).json({ success: false, message: 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে' });
            }
        });

        // ২৩.১. ObjectId দিয়ে রিকোয়েস্ট পাঠানো (Fallback)
        app.post('/send-request-by-objectid', VerifyFirebaseToken, async (req, res) => {
            try {
                console.log('Send request by ObjectId received:', req.body);
                const { senderEmail, receiverObjectId, status } = req.body;

                // Validate required fields
                if (!senderEmail || !receiverObjectId) {
                    return res.status(400).json({ success: false, message: 'প্রেরক ইমেইল এবং প্রাপকের ObjectId প্রয়োজন' });
                }

                // Get receiver's biodata to find email
                const receiverBiodata = await biodataCollection.findOne({
                    _id: new ObjectId(receiverObjectId),
                    status: 'approved'
                });

                if (!receiverBiodata) {
                    return res.status(404).json({ success: false, message: 'প্রাপকের বায়োডাটা পাওয়া যায়নি' });
                }

                const receiverEmail = receiverBiodata.contactEmail;

                // Check if sender exists and is verified
                const sender = await usersCollection.findOne({ email: senderEmail });
                if (!sender) {
                    return res.status(404).json({ success: false, message: 'প্রেরক ইউজার পাওয়া যায়নি' });
                }
                if (!sender.isEmailVerified) {
                    return res.status(403).json({ success: false, message: 'প্রথমে ইমেইল ভেরিফাই করুন' });
                }
                if (!sender.isActive) {
                    return res.status(403).json({ success: false, message: 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে' });
                }

                // Check if request already exists
                const existingRequest = await requestCollection.findOne({
                    senderEmail: senderEmail,
                    receiverEmail: receiverEmail
                });

                if (existingRequest) {
                    return res.status(400).json({ success: false, message: 'আপনি ইতিমধ্যে এই ব্যক্তির কাছে রিকোয়েস্ট পাঠিয়েছেন' });
                }

                // Create request
                const requestData = {
                    senderEmail,
                    receiverEmail,
                    receiverObjectId,
                    status: 'pending',
                    sentAt: new Date()
                };

                const result = await requestCollection.insertOne(requestData);
                console.log('Request saved:', result);

                res.json({ success: true, message: 'কানেকশন রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে', result });
            } catch (error) {
                console.error('Send request by ObjectId error:', error);
                res.status(500).json({ success: false, message: 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে' });
            }
        });

        // ২৪. বায়োডাটা আইডি দিয়ে রিকোয়েস্ট স্ট্যাটাস চেক করা - Both directions
        app.get('/request-status-by-biodata/:senderEmail/:biodataId', async (req, res) => {
            try {
                const { senderEmail, biodataId } = req.params;

                // Get receiver's email from biodata
                const receiverBiodata = await biodataCollection.findOne({
                    biodataId: biodataId,
                    status: 'approved'
                });

                if (!receiverBiodata) {
                    return res.json({ success: true, hasRequest: false, status: null, requestId: null });
                }

                const receiverEmail = receiverBiodata.contactEmail;

                // Check for connection in both directions
                const request = await requestCollection.findOne({
                    $or: [
                        { senderEmail: senderEmail, receiverEmail: receiverEmail },
                        { senderEmail: receiverEmail, receiverEmail: senderEmail }
                    ]
                });

                res.json({
                    success: true,
                    hasRequest: !!request,
                    status: request?.status || null,
                    requestId: request?._id || null,
                    isInitiator: request ? request.senderEmail === senderEmail : false
                });
            } catch (error) {
                console.error('Check request status by biodata error:', error);
                res.status(500).json({ success: false, message: 'রিকোয়েস্ট স্ট্যাটাস চেক করতে সমস্যা হয়েছে' });
            }
        });

        // ২৤.১. ObjectId দিয়ে রিকোয়েস্ট স্ট্যাটাস চেক করা (Fallback) - Both directions
        app.get('/request-status-by-objectid/:senderEmail/:objectId', async (req, res) => {
            try {
                const { senderEmail, objectId } = req.params;

                // Get receiver's email from biodata using ObjectId
                const receiverBiodata = await biodataCollection.findOne({
                    _id: new ObjectId(objectId),
                    status: 'approved'
                });

                if (!receiverBiodata) {
                    return res.json({ success: true, hasRequest: false, status: null, requestId: null });
                }

                const receiverEmail = receiverBiodata.contactEmail;

                // Check for connection in both directions
                const request = await requestCollection.findOne({
                    $or: [
                        { senderEmail: senderEmail, receiverEmail: receiverEmail },
                        { senderEmail: receiverEmail, receiverEmail: senderEmail }
                    ]
                });

                res.json({
                    success: true,
                    hasRequest: !!request,
                    status: request?.status || null,
                    requestId: request?._id || null,
                    isInitiator: request ? request.senderEmail === senderEmail : false
                });
            } catch (error) {
                console.error('Check request status by ObjectId error:', error);
                res.status(500).json({ success: false, message: 'রিকোয়েস্ট স্ট্যাটাস চেক করতে সমস্যা হয়েছে' });
            }
        });

        // ২৫. Mutual Connection Check - Check if two users are connected (both directions)
        app.get('/check-mutual-connection/:userEmail/:targetIdentifier', async (req, res) => {
            try {
                const { userEmail, targetIdentifier } = req.params;
                console.log('Checking mutual connection:', { userEmail, targetIdentifier });

                let targetEmail = targetIdentifier;

                // If targetIdentifier looks like an ObjectId or biodataId, get the email
                if (targetIdentifier.length === 24 || (!targetIdentifier.includes('@') && !isNaN(targetIdentifier))) {
                    try {
                        let targetBiodata;

                        // Try to find biodata by biodataId first (if it's a number)
                        if (!isNaN(targetIdentifier)) {
                            targetBiodata = await biodataCollection.findOne({ biodataId: parseInt(targetIdentifier) });
                            console.log('Found by biodataId:', targetBiodata ? 'Yes' : 'No');
                        }

                        // If not found and looks like ObjectId, try ObjectId
                        if (!targetBiodata && targetIdentifier.length === 24) {
                            try {
                                targetBiodata = await biodataCollection.findOne({ _id: new ObjectId(targetIdentifier) });
                                console.log('Found by ObjectId:', targetBiodata ? 'Yes' : 'No');
                            } catch (objectIdError) {
                                console.log('Invalid ObjectId format');
                            }
                        }

                        if (targetBiodata) {
                            targetEmail = targetBiodata.contactEmail;
                            console.log('Target email found:', targetEmail);
                        } else {
                            console.log('No biodata found for identifier:', targetIdentifier);
                            return res.json({ success: true, isConnected: false, message: 'Target user not found' });
                        }
                    } catch (error) {
                        console.log('Error finding target biodata:', error.message);
                        return res.json({ success: true, isConnected: false, message: 'Error finding target user' });
                    }
                }

                console.log('Checking connection between:', userEmail, 'and', targetEmail);

                // Check for accepted connection in both directions
                const connection = await requestCollection.findOne({
                    $or: [
                        { senderEmail: userEmail, receiverEmail: targetEmail, status: 'accepted' },
                        { senderEmail: targetEmail, receiverEmail: userEmail, status: 'accepted' }
                    ]
                });

                console.log('Connection found:', connection ? 'Yes' : 'No');

                res.json({
                    success: true,
                    isConnected: !!connection,
                    connectionId: connection?._id || null,
                    connectionDate: connection?.updatedAt || connection?.sentAt || null,
                    userEmail,
                    targetEmail,
                    debug: {
                        originalIdentifier: targetIdentifier,
                        resolvedEmail: targetEmail,
                        connectionExists: !!connection
                    }
                });
            } catch (error) {
                console.error('Check mutual connection error:', error);
                res.status(500).json({ success: false, message: 'কানেকশন চেক করতে সমস্যা হয়েছে', error: error.message });
            }
        });

        // Debug endpoint to check all connections for a user
        app.get('/debug-connections/:email', async (req, res) => {
            try {
                const email = req.params.email;

                // Get all connections where user is involved
                const allConnections = await requestCollection.find({
                    $or: [
                        { senderEmail: email },
                        { receiverEmail: email }
                    ]
                }).toArray();

                // Get user's biodata
                const userBiodata = await biodataCollection.findOne({ contactEmail: email });

                res.json({
                    success: true,
                    email,
                    biodataId: userBiodata?.biodataId,
                    totalConnections: allConnections.length,
                    connections: allConnections.map(conn => ({
                        id: conn._id,
                        sender: conn.senderEmail,
                        receiver: conn.receiverEmail,
                        status: conn.status,
                        sentAt: conn.sentAt,
                        updatedAt: conn.updatedAt
                    }))
                });
            } catch (error) {
                console.error('Debug connections error:', error);
                res.status(500).json({ success: false, message: 'Debug failed', error: error.message });
            }
        });

        app.get('/biodata/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const query = { contactEmail: email };
                const result = await biodataCollection.findOne(query);

                if (!result) {
                    return res.status(404).json({ success: false, message: 'বায়োডাটা পাওয়া যায়নি' });
                }

                res.json({ success: true, biodata: result });
            } catch (error) {
                console.error('Get biodata error:', error);
                res.status(500).json({ success: false, message: 'বায়োডাটা আনতে সমস্যা হয়েছে' });
            }
        });

        app.get('/admin-stats', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const totalBiodata = await biodataCollection.countDocuments();
                const approvedBiodata = await biodataCollection.countDocuments({ status: 'approved' });
                const pendingBiodata = await biodataCollection.countDocuments({ status: 'pending' });
                const totalMale = await biodataCollection.countDocuments({ gender: 'Male', status: 'approved' });
                const totalFemale = await biodataCollection.countDocuments({ gender: 'Female', status: 'approved' });
                const totalUsers = await usersCollection.countDocuments();
                const verifiedUsers = await usersCollection.countDocuments({ isEmailVerified: true });
                const activeUsers = await usersCollection.countDocuments({ isActive: true });
                const totalRequests = await requestCollection.countDocuments();
                const acceptedRequests = await requestCollection.countDocuments({ status: 'accepted' });

                res.json({
                    success: true,
                    stats: {
                        totalBiodata,
                        approvedBiodata,
                        pendingBiodata,
                        totalMale,
                        totalFemale,
                        totalUsers,
                        verifiedUsers,
                        activeUsers,
                        totalRequests,
                        acceptedRequests
                    }
                });
            } catch (error) {
                console.error('Get admin stats error:', error);
                res.status(500).json({ success: false, message: 'স্ট্যাটস আনতে সমস্যা হয়েছে' });
            }
        });

        // ======================================================
        // SUCCESS STORIES API ENDPOINTS
        // ======================================================

        // ৩৪. এডমিন - সব সাকসেস স্টোরি দেখা
        app.get('/admin/success-stories', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const stories = await successStoriesCollection.find({}).sort({ createdAt: -1 }).toArray();
                res.json({ success: true, stories });
            } catch (error) {
                console.error('Get success stories error:', error);
                res.status(500).json({ success: false, message: 'সাকসেস স্টোরি আনতে সমস্যা হয়েছে' });
            }
        });

        // ৩৫. এডমিন - নতুন সাকসেস স্টোরি তৈরি
        app.post('/admin/success-stories', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const storyData = req.body;

                // Validate required fields
                if (!storyData.coupleName || !storyData.story) {
                    return res.status(400).json({ success: false, message: 'দম্পতির নাম এবং গল্প প্রয়োজন' });
                }

                // Add timestamps
                storyData.createdAt = new Date();
                storyData.updatedAt = new Date();

                const result = await successStoriesCollection.insertOne(storyData);

                if (result.insertedId) {
                    res.json({
                        success: true,
                        message: 'নতুন সাকসেস স্টোরি সফলভাবে যোগ করা হয়েছে',
                        storyId: result.insertedId
                    });
                } else {
                    res.status(500).json({ success: false, message: 'সাকসেস স্টোরি সেভ করতে সমস্যা হয়েছে' });
                }
            } catch (error) {
                console.error('Create success story error:', error);
                res.status(500).json({ success: false, message: 'সাকসেস স্টোরি তৈরি করতে সমস্যা হয়েছে' });
            }
        });

        // ৩৬. এডমিন - সাকসেস স্টোরি আপডেট
        app.put('/admin/success-stories/:id', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const storyId = req.params.id;
                const updateData = req.body;

                // Validate required fields
                if (!updateData.coupleName || !updateData.story) {
                    return res.status(400).json({ success: false, message: 'দম্পতির নাম এবং গল্প প্রয়োজন' });
                }

                // Add updated timestamp
                updateData.updatedAt = new Date();

                const result = await successStoriesCollection.updateOne(
                    { _id: new ObjectId(storyId) },
                    { $set: updateData }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ success: false, message: 'সাকসেস স্টোরি পাওয়া যায়নি' });
                }

                if (result.modifiedCount > 0) {
                    res.json({ success: true, message: 'সাকসেস স্টোরি সফলভাবে আপডেট হয়েছে' });
                } else {
                    res.json({ success: true, message: 'কোনো পরিবর্তন হয়নি' });
                }
            } catch (error) {
                console.error('Update success story error:', error);
                res.status(500).json({ success: false, message: 'সাকসেস স্টোরি আপডেট করতে সমস্যা হয়েছে' });
            }
        });

        // ৩৭. এডমিন - সাকসেস স্টোরি ডিলিট
        app.delete('/admin/success-stories/:id', VerifyFirebaseToken, verifyAdmin, async (req, res) => {
            try {
                const storyId = req.params.id;

                const result = await successStoriesCollection.deleteOne({ _id: new ObjectId(storyId) });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'সাকসেস স্টোরি পাওয়া যায়নি' });
                }

                res.json({ success: true, message: 'সাকসেস স্টোরি সফলভাবে ডিলিট করা হয়েছে' });
            } catch (error) {
                console.error('Delete success story error:', error);
                res.status(500).json({ success: false, message: 'সাকসেস স্টোরি ডিলিট করতে সমস্যা হয়েছে' });
            }
        });

        // ৩৮. পাবলিক - সাকসেস স্টোরি দেখা (ফ্রন্টএন্ড পেজের জন্য)
        app.get('/success-stories', async (req, res) => {
            try {
                const stories = await successStoriesCollection.find({}).sort({ createdAt: -1 }).toArray();
                res.json({ success: true, stories });
            } catch (error) {
                console.error('Get public success stories error:', error);
                res.status(500).json({ success: false, message: 'সাকসেস স্টোরি আনতে সমস্যা হয়েছে' });
            }
        });

        // ইনডেক্স তৈরি (Performance Optimization)
        try {
            await biodataCollection.createIndex({ contactEmail: 1 });
            await biodataCollection.createIndex({ status: 1 });
            await biodataCollection.createIndex({ gender: 1 });
            await biodataCollection.createIndex({ department: 1 });
            await biodataCollection.createIndex({ district: 1 });

            await usersCollection.createIndex({ email: 1 }, { unique: true });
            await usersCollection.createIndex({ uid: 1 }, { unique: true });
            await usersCollection.createIndex({ isEmailVerified: 1 });
            await usersCollection.createIndex({ isActive: 1 });

            await requestCollection.createIndex({ senderEmail: 1 });
            await requestCollection.createIndex({ receiverEmail: 1 });
            await requestCollection.createIndex({ status: 1 });

            await messagesCollection.createIndex({ conversationId: 1 });
            await messagesCollection.createIndex({ senderEmail: 1 });
            await messagesCollection.createIndex({ receiverEmail: 1 });
            await messagesCollection.createIndex({ sentAt: -1 });

            await successStoriesCollection.createIndex({ createdAt: -1 });
            await successStoriesCollection.createIndex({ coupleName: 1 });

            console.log("✅ Database indexes created successfully!");
        } catch (indexError) {
            console.log("ℹ️ Index creation info:", indexError.message);
        }

        console.log("🎉 Server setup completed successfully!");

    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        console.error("🔄 Please check your database credentials and connection string");
        process.exit(1);
    }
    // run() এর শেষে client.close() দেওয়া যাবে না, কারণ সার্ভার সবসময় কানেক্টেড থাকতে হবে।
}

// Call run() but don't block on it for Vercel
if (process.env.NODE_ENV !== 'production') {
    run().catch(console.dir);
}
// Note: In production (Vercel), run() is not called to avoid blocking serverless function initialization
// All critical endpoints are registered outside run() function

// রুট টেস্ট এবং Health Check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'SEU Matrimony Backend is Live! 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        firebase: firebaseInitialized ? '✅ Initialized' : '❌ Not Initialized',
        database: isConnected ? '✅ Connected' : '⚠️ Not Connected',
        endpoints: {
            'POST /register-user': 'User registration',
            'POST /send-verification-email': 'Send verification email',
            'PATCH /verify-email': 'Email verification',
            'GET /user/:email': 'Get user info',
            'PUT /biodata': 'Save/Update biodata',
            'GET /all-biodata': 'Get approved biodatas',
            'POST /send-request': 'Send connection request',
            'GET /admin-stats': 'Admin statistics',
            'GET /admin/pending-biodatas': 'Admin - Pending biodatas (requires auth)'
        }
    });
});

// Health check endpoint for Vercel
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
    res.json({
        success: true,
        message: 'CORS is working!',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to check all routes
app.get('/debug-routes', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running!',
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /cors-test',
            'GET /debug-routes',
            'POST /register-user',
            'POST /send-verification-email',
            'PATCH /verify-email',
            'GET /user/:email',
            'PUT /biodata',
            'GET /all-biodata',
            'POST /send-request'
        ],
        timestamp: new Date().toISOString()
    });
});

// Complete registration for authenticated Firebase users who are missing from database
app.post('/complete-registration', VerifyFirebaseToken, async (req, res) => {
    try {
        const { email, displayName, photoURL } = req.body;
        const firebaseEmail = req.decoded_email;
        
        // Ensure the Firebase token email matches the request email
        if (email !== firebaseEmail) {
            return res.status(403).json({ 
                success: false, 
                message: 'ইমেইল মিল নেই। আবার লগইন করুন।' 
            });
        }
        
        // Validate SEU email
        if (!email.endsWith('@seu.edu.bd')) {
            return res.status(400).json({ 
                success: false, 
                message: 'শুধুমাত্র SEU ইমেইল (@seu.edu.bd) ব্যবহার করুন' 
            });
        }
        
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.json({ 
                success: true, 
                message: 'ইউজার ইতিমধ্যে রেজিস্টার্ড',
                user: existingUser
            });
        }
        
        // Get Firebase user info to determine if it's Google user
        let isGoogleUser = false;
        try {
            const firebaseUser = await admin.auth().getUserByEmail(email);
            isGoogleUser = firebaseUser.providerData.some(provider => provider.providerId === 'google.com');
        } catch (firebaseError) {
            console.log('Could not get Firebase user info:', firebaseError.message);
        }
        
        // Create user in database
        const newUser = {
            email,
            displayName: displayName || 'SEU User',
            uid: req.decoded_uid || 'firebase-uid',
            photoURL: photoURL || '',
            isEmailVerified: isGoogleUser, // Google users are pre-verified
            isActive: true,
            role: 'user',
            isGoogleUser,
            createdAt: new Date(),
            completedAt: new Date() // Mark as completed registration
        };
        
        const result = await usersCollection.insertOne(newUser);
        
        res.json({
            success: true,
            message: isGoogleUser ? 'Google একাউন্ট সফলভাবে সিঙ্ক হয়েছে' : 'রেজিস্ট্রেশন সম্পন্ন হয়েছে',
            userId: result.insertedId,
            user: newUser
        });
        
    } catch (error) {
        console.error('Complete registration error:', error);
        res.status(500).json({
            success: false,
            message: 'রেজিস্ট্রেশন সম্পন্ন করতে সমস্যা হয়েছে',
            error: error.message
        });
    }
});

// Simple verify-email endpoint outside run function (for Vercel compatibility)
// This works even if MongoDB connection fails
app.patch('/verify-email-simple', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        // Try to update in database if connection exists
        try {
            if (client && client.topology && client.topology.isConnected()) {
                const db = client.db("seuMatrimonyDB");
                const usersCollection = db.collection("users");
                
                const result = await usersCollection.updateOne(
                    { email },
                    { $set: { isEmailVerified: true, verifiedAt: new Date() } }
                );
                
                if (result.matchedCount > 0) {
                    return res.json({
                        success: true,
                        message: 'ইমেইল ভেরিফিকেশন সফল হয়েছে',
                        updated: true
                    });
                } else {
                    // User not found in database, but Firebase verification is done
                    return res.json({
                        success: true,
                        message: 'Firebase ভেরিফিকেশন সফল। Database sync pending.',
                        updated: false,
                        warning: 'User will be synced when they log in'
                    });
                }
            } else {
                // MongoDB not connected, but Firebase verification is done
                return res.json({
                    success: true,
                    message: 'Firebase ভেরিফিকেশন সফল। Database sync pending.',
                    updated: false,
                    warning: 'Database connection unavailable'
                });
            }
        } catch (dbError) {
            console.error('Database update error:', dbError);
            // Even if database fails, Firebase verification is done
            return res.json({
                success: true,
                message: 'Firebase ভেরিফিকেশন সফল। Database sync pending.',
                updated: false,
                warning: 'Database update failed but will sync later'
            });
        }
    } catch (error) {
        console.error('Verify email simple error:', error);
        res.status(500).json({
            success: false,
            message: 'ভেরিফিকেশনে সমস্যা হয়েছে',
            error: error.message
        });
    }
});

// Temporary endpoint to make a user admin (for testing)
app.post('/make-admin', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        const result = await usersCollection.updateOne(
            { email },
            { $set: { role: 'admin' } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log(`✅ Made ${email} an admin`);
        
        res.json({
            success: true,
            message: `${email} is now an admin`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Make admin failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to make user admin',
            error: error.message
        });
    }
});

// সার্ভার লিসেনিং
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(` ⚡ Nodemon: Server running on port ${port}`);
    });
}

// Export for Vercel serverless
module.exports = app;