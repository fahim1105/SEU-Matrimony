import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
    Users, 
    Heart, 
    MessageCircle, 
    CheckCircle, 
    Clock, 
    Mail,
    Shield,
    AlertTriangle,
    FileText,
    Calendar,
    User
} from 'lucide-react';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseRole from '../../Hooks/UseRole';

const DashboardHome = () => {
    const [userStats, setUserStats] = useState({
        sentRequests: 0,
        receivedRequests: 0,
        acceptedRequests: 0,
        profileViews: 0
    });
    const [userInfo, setUserInfo] = useState(null);
    const [biodataStatus, setBiodataStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const { user } = UseAuth();
    const { getUserInfo } = UseUserManagement();
    const { role } = UseRole();
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        if (user?.email) {
            // Enhanced authentication check with multiple fallback methods
            const checkAuthAndFetch = async () => {
                let canProceed = false;
                
                // Method 1: Check if getIdToken is available as function
                if (typeof user.getIdToken === 'function') {
                    console.log('✅ getIdToken method available');
                    canProceed = true;
                }
                // Method 2: Check if user has accessToken
                else if (user.accessToken) {
                    console.log('✅ accessToken available in user object');
                    canProceed = true;
                }
                // Method 3: Check if it's a Google user (they might not need token immediately)
                else {
                    const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com') || 
                                       user.providerId === 'google.com';
                    if (isGoogleUser) {
                        console.log('✅ Google user detected, proceeding with fallback auth');
                        canProceed = true;
                    }
                }
                
                if (canProceed) {
                    fetchDashboardData();
                } else {
                    console.warn('⚠️ Authentication not ready, retrying in 2 seconds...');
                    // Retry after a longer delay to allow Firebase to fully initialize
                    const timer = setTimeout(() => {
                        console.log('🔄 Retrying dashboard data fetch...');
                        fetchDashboardData();
                    }, 2000);
                    return () => clearTimeout(timer);
                }
            };
            
            checkAuthAndFetch();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user?.email) {
            console.warn('Cannot fetch dashboard data: user email not available');
            setLoading(false);
            return;
        }

        try {
            // Get user info
            const userResult = await getUserInfo(user.email);
            if (userResult.success) {
                setUserInfo(userResult.user);
            }

            // Get real user statistics
            try {
                const statsResponse = await axiosSecure.get(`/user-stats/${user.email}`);
                if (statsResponse.data.success) {
                    setUserStats(statsResponse.data.stats);
                }
            } catch (statsError) {
                console.log('User stats not available:', statsError.message);
            }

            // Get biodata status
            try {
                const biodataResponse = await axiosSecure.get(`/biodata-status/${user.email}`);
                if (biodataResponse.data.success) {
                    setBiodataStatus(biodataResponse.data);
                }
            } catch (biodataError) {
                console.log('Biodata status not available:', biodataError.message);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">ড্যাশবোর্ড লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral mb-2">
                        স্বাগতম, {user?.displayName}! 👋
                    </h1>
                    <p className="text-neutral/70">আপনার ম্যাট্রিমনি যাত্রার ওভারভিউ</p>
                </div>

                {/* Status Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/20 p-3 rounded-2xl">
                                <Heart className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{userStats.sentRequests}</h3>
                                <p className="text-neutral/70 text-sm">পাঠানো রিকোয়েস্ট</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-success/20 p-3 rounded-2xl">
                                <MessageCircle className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{userStats.receivedRequests}</h3>
                                <p className="text-neutral/70 text-sm">প্রাপ্ত রিকোয়েস্ট</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-warning/20 p-3 rounded-2xl">
                                <CheckCircle className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{userStats.acceptedRequests}</h3>
                                <p className="text-neutral/70 text-sm">গৃহীত রিকোয়েস্ট</p>
                            </div>
                        </div>
                    </div>

                    {/* <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-info/20 p-3 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-info" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{userStats.profileViews}</h3>
                                <p className="text-neutral/70 text-sm">প্রোফাইল ভিউ</p>
                            </div>
                        </div>
                    </div> */}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Biodata Status */}
                    <div className="lg:col-span-2 bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            বায়োডাটা স্ট্যাটাস
                        </h2>

                        {biodataStatus ? (
                            biodataStatus.hasProfile ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-primary" />
                                            <span className="font-medium">বায়োডাটা স্ট্যাটাস</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {biodataStatus.status === 'approved' ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-success" />
                                                    <span className="text-success font-medium">অনুমোদিত</span>
                                                </>
                                            ) : biodataStatus.status === 'pending' ? (
                                                <>
                                                    <Clock className="w-5 h-5 text-warning" />
                                                    <span className="text-warning font-medium">অনুমোদনের অপেক্ষায়</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="w-5 h-5 text-error" />
                                                    <span className="text-error font-medium">প্রত্যাখ্যাত</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            <span className="font-medium">সাবমিট করা হয়েছে</span>
                                        </div>
                                        <span className="text-neutral/70 text-sm">
                                            {new Date(biodataStatus.submittedAt).toLocaleDateString('bn-BD')}
                                        </span>
                                    </div>

                                    {biodataStatus.status === 'pending' && (
                                        <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl">
                                            <p className="text-warning font-medium mb-2">⏳ অনুমোদনের অপেক্ষায়</p>
                                            <p className="text-neutral/70 text-sm">
                                                আপনার বায়োডাটা এডমিন রিভিউ করছেন। অনুমোদিত হলে সম্পূর্ণ ফিচার ব্যবহার করতে পারবেন।
                                            </p>
                                        </div>
                                    )}

                                    {biodataStatus.status === 'rejected' && (
                                        <div className="p-4 bg-error/10 border border-error/20 rounded-2xl">
                                            <p className="text-error font-medium mb-2">❌ বায়োডাটা প্রত্যাখ্যাত</p>
                                            <p className="text-neutral/70 text-sm mb-3">
                                                আপনার বায়োডাটা প্রত্যাখ্যান করা হয়েছে। পুনরায় সাবমিট করুন।
                                            </p>
                                            <Link 
                                                to="/dashboard/biodata-form" 
                                                className="bg-error text-base-100 px-4 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all inline-block"
                                            >
                                                পুনরায় সাবমিট করুন
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 bg-base-100 rounded-2xl text-center">
                                    <FileText className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-neutral mb-2">বায়োডাটা তৈরি করুন</h3>
                                    <p className="text-neutral/70 text-sm mb-4">
                                        আপনার এখনও কোনো বায়োডাটা নেই। প্রথমে বায়োডাটা তৈরি করুন।
                                    </p>
                                    <Link 
                                        to="/dashboard/biodata-form" 
                                        className="bg-primary text-base-100 px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all inline-block"
                                    >
                                        বায়োডাটা তৈরি করুন
                                    </Link>
                                </div>
                            )
                        ) : (
                            <div className="animate-pulse space-y-4">
                                <div className="h-16 bg-base-100 rounded-2xl"></div>
                                <div className="h-16 bg-base-100 rounded-2xl"></div>
                            </div>
                        )}
                    </div>

                    {/* Account Status */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            একাউন্ট স্ট্যাটাস
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-base-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-primary" />
                                    <span className="font-medium">ইমেইল ভেরিফিকেশন</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {userInfo?.isEmailVerified ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-success" />
                                            <span className="text-success font-medium">ভেরিফাইড</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-5 h-5 text-warning" />
                                            <span className="text-warning font-medium">পেন্ডিং</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-base-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-primary" />
                                    <span className="font-medium">একাউন্ট স্ট্যাটাস</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {userInfo?.isActive ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-success" />
                                            <span className="text-success font-medium">সক্রিয়</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-5 h-5 text-error" />
                                            <span className="text-error font-medium">নিষ্ক্রিয়</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!userInfo?.isEmailVerified && (
                            <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-2xl">
                                <p className="text-warning font-medium mb-2">⚠️ ইমেইল ভেরিফিকেশন প্রয়োজন</p>
                                <p className="text-neutral/70 text-sm mb-3">
                                    সম্পূর্ণ ফিচার ব্যবহার করতে আপনার ইমেইল ভেরিফাই করুন।
                                </p>
                                <Link 
                                    to="/auth/verify-email" 
                                    className="bg-warning text-base-100 px-4 py-2 rounded-xl font-semibold hover:bg-warning/90 transition-all inline-block"
                                >
                                    এখনই ভেরিফাই করুন
                                </Link>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mt-6">
                            <h3 className="font-semibold text-neutral mb-4">দ্রুত অ্যাকশন</h3>
                            <div className="space-y-3">
                                {/* Profile Actions */}
                                {!biodataStatus?.hasProfile ? (
                                    <Link to="/dashboard/biodata-form" className="w-full bg-primary text-base-100 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all block text-center matrimony-hover">
                                        <User className="w-4 h-4 inline mr-2" />
                                        বায়োডাটা তৈরি করুন
                                    </Link>
                                ) : biodataStatus?.status === 'rejected' ? (
                                    <Link to="/dashboard/biodata-form" className="w-full bg-error text-base-100 py-3 rounded-2xl font-semibold hover:bg-error/90 transition-all block text-center matrimony-hover">
                                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                                        পুনরায় সাবমিট করুন
                                    </Link>
                                ) : (
                                    <Link to="/dashboard/biodata-form" className="w-full bg-secondary text-base-100 py-3 rounded-2xl font-semibold hover:bg-secondary/90 transition-all block text-center matrimony-hover">
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        বায়োডাটা এডিট করুন
                                    </Link>
                                )}
                                
                                {/* Requests */}
                                <Link to="/dashboard/requests" className="w-full bg-base-100 text-neutral py-3 rounded-2xl font-semibold hover:bg-base-300 transition-all border border-base-300 block text-center matrimony-hover">
                                    <Heart className="w-4 h-4 inline mr-2" />
                                    রিকোয়েস্ট দেখুন
                                </Link>

                                {/* Browse Matches */}
                                {biodataStatus?.status === 'approved' && (
                                    <Link to="/browse-matches" className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-2xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all block text-center matrimony-hover">
                                        <Users className="w-4 h-4 inline mr-2" />
                                        ম্যাচ খুঁজুন
                                    </Link>
                                )}

                                {/* Admin Status Display (Read-only) */}
                                {role === 'admin' && (
                                    <div className="w-full bg-success/20 text-success py-3 rounded-2xl font-semibold text-center border border-success/30 matrimony-glow">
                                        <Shield className="w-4 h-4 inline mr-2" />
                                        আপনি একজন এডমিন
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tips Section */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
                            <h3 className="font-semibold text-neutral mb-2 flex items-center gap-2">
                                💡 <span className="matrimony-text-gradient">সফলতার টিপস</span>
                            </h3>
                            <div className="text-sm text-neutral/70 space-y-1">
                                <p>• আপনার প্রোফাইল সম্পূর্ণ এবং সত্যবাদী তথ্য দিয়ে পূরণ করুন</p>
                                <p>• নিয়মিত প্রোফাইল আপডেট করুন</p>
                                <p>• ভদ্র এবং সম্মানজনক আচরণ বজায় রাখুন</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;