import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import { Mail, AlertTriangle, UserPlus } from 'lucide-react';
import { localStorageManager } from '../../utils/localStorageManager';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';

const ProtectedRoute = ({ children, requireEmailVerification = true, requireActiveAccount = true }) => {
    const { user, loading } = UseAuth();
    const { getUserInfo, registerUser } = UseUserManagement();
    const [userStatus, setUserStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [showRegistrationCompletion, setShowRegistrationCompletion] = useState(false);
    const [completingRegistration, setCompletingRegistration] = useState(false);
    const location = useLocation();

    useEffect(() => {
        console.log('🔍 ProtectedRoute useEffect triggered');
        console.log('- user:', user);
        console.log('- user?.email:', user?.email);
        console.log('- loading:', loading);
        
        if (user?.email && !loading) {
            console.log('✅ User authenticated, checking status...');
            checkUserStatus();
        } else if (!loading && !user) {
            console.log('❌ No user and not loading');
            // Check localStorage for cached user status as fallback
            const cachedEmail = localStorage.getItem('lastAuthenticatedEmail');
            if (cachedEmail && cachedEmail.endsWith('@seu.edu.bd')) {
                console.log('🔍 Found cached email, checking localStorage status:', cachedEmail);
                const cachedStatus = localStorageManager.getUserStatus(cachedEmail);
                if (cachedStatus && cachedStatus.isGoogleUser) {
                    console.log('✅ Using cached Google user status');
                    setUserStatus(cachedStatus);
                    setStatusLoading(false);
                    return;
                }
            }
            setStatusLoading(false);
        }
    }, [user, loading]);

    const checkUserStatus = async () => {
        console.log('🔍 ProtectedRoute: Checking user status for:', user?.email);
        console.log('🔍 User providerData:', user?.providerData);
        
        try {
            const result = await getUserInfo(user.email);
            console.log('📥 Database result:', result);
            
            if (result.success) {
                console.log('✅ User found in database:', result.user);
                setUserStatus(result.user);
                // Save to localStorage for offline access
                localStorageManager.saveUserStatus(user.email, result.user);
                // Cache the authenticated email for fallback
                localStorage.setItem('lastAuthenticatedEmail', user.email);
            } else {
                console.log('❌ User not found in database, checking if Google user...');
                
                // If user not found in database, check if it's a Google user
                const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com') || 
                                   user.providerId === 'google.com' ||
                                   user.firebase?.sign_in_provider === 'google.com';
                
                console.log('🔍 Is Google user?', isGoogleUser);
                
                if (user.email && user.email.endsWith('@seu.edu.bd') && isGoogleUser) {
                    console.log('✅ Google user not in database, creating temporary status');
                    const fallbackStatus = {
                        email: user.email,
                        isEmailVerified: true, // Google users are pre-verified
                        isActive: true,
                        role: 'user',
                        isGoogleUser: true // Important: Mark as Google user
                    };
                    console.log('📝 Fallback status:', fallbackStatus);
                    setUserStatus(fallbackStatus);
                    // Save fallback status to localStorage
                    localStorageManager.saveUserStatus(user.email, fallbackStatus);
                    // Cache the authenticated email for fallback
                    localStorage.setItem('lastAuthenticatedEmail', user.email);
                } else {
                    console.log('❌ Non-Google user or invalid email');
                    console.log('User email:', user.email);
                    console.log('User providerData:', user.providerData);
                    console.log('User object:', user);
                    
                    // Check if user is authenticated with SEU email
                    if (user.email && user.email.endsWith('@seu.edu.bd')) {
                        console.log('📝 SEU user not in database, showing registration completion');
                        setShowRegistrationCompletion(true);
                    } else {
                        setUserStatus(null);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error checking user status:', error);
            
            // Enhanced Google user detection for fallback
            const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com') || 
                               user.providerId === 'google.com' ||
                               user.firebase?.sign_in_provider === 'google.com' ||
                               user.reloadUserInfo?.providerUserInfo?.some(p => p.providerId === 'google.com') ||
                               user.metadata?.creationTime !== user.metadata?.lastSignInTime; // Google users often have different creation/signin times
            
            console.log('🔍 Enhanced Google user detection:', isGoogleUser);
            
            // For Google users, provide fallback status
            if (user.email && user.email.endsWith('@seu.edu.bd') && isGoogleUser) {
                console.log('✅ Providing fallback status for Google user');
                const fallbackStatus = {
                    email: user.email,
                    isEmailVerified: true,
                    isActive: true,
                    role: 'user',
                    isGoogleUser: true // Important: Mark as Google user
                };
                console.log('📝 Enhanced fallback status:', fallbackStatus);
                setUserStatus(fallbackStatus);
                // Save fallback status to localStorage
                localStorageManager.saveUserStatus(user.email, fallbackStatus);
                // Cache the authenticated email for fallback
                localStorage.setItem('lastAuthenticatedEmail', user.email);
            } else {
                // Check localStorage as final fallback
                const localStatus = localStorageManager.getUserStatus(user.email);
                console.log('📱 localStorage status:', localStatus);
                if (localStatus) {
                    console.log('✅ Using localStorage user status');
                    setUserStatus(localStatus);
                } else {
                    console.log('❌ No fallback available');
                    setUserStatus(null);
                }
            }
        } finally {
            setStatusLoading(false);
        }
    };

    // Handle registration completion for authenticated users not in database
    const handleCompleteRegistration = async () => {
        if (!user?.email) return;
        
        setCompletingRegistration(true);
        const toastId = toast.loading("রেজিস্ট্রেশন সম্পন্ন করা হচ্ছে...");
        
        try {
            // Determine if user is Google user
            const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com') || 
                               user.providerId === 'google.com' ||
                               user.firebase?.sign_in_provider === 'google.com' ||
                               user.reloadUserInfo?.providerUserInfo?.some(p => p.providerId === 'google.com');
            
            const userData = {
                email: user.email,
                displayName: user.displayName || 'SEU User',
                uid: user.uid || 'firebase-uid-missing',
                photoURL: user.photoURL || '',
                isGoogleUser: isGoogleUser,
                isEmailVerified: isGoogleUser // Google users are pre-verified
            };
            
            // Use the existing registerUser function which will call /register-user endpoint
            const result = await registerUser(userData);
            
            if (result.success) {
                toast.success("রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে!", { id: toastId });
                // Create user status from the registration result
                const newUserStatus = {
                    email: userData.email,
                    displayName: userData.displayName,
                    isEmailVerified: userData.isEmailVerified,
                    isActive: true,
                    role: 'user',
                    isGoogleUser: userData.isGoogleUser
                };
                setUserStatus(newUserStatus);
                setShowRegistrationCompletion(false);
                // Save to localStorage
                localStorageManager.saveUserStatus(user.email, newUserStatus);
            } else {
                toast.error(result.message || "রেজিস্ট্রেশন সম্পন্ন করতে সমস্যা হয়েছে", { id: toastId });
            }
        } catch (error) {
            console.error('Registration completion error:', error);
            toast.error("রেজিস্ট্রেশন সম্পন্ন করতে সমস্যা হয়েছে", { id: toastId });
        } finally {
            setCompletingRegistration(false);
        }
    };

    // Show loading spinner while checking authentication
    if (loading || statusLoading) {
        return <Loader />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/auth/login" state={location.pathname} replace />;
    }

    // Show registration completion if user is authenticated but not in database
    if (showRegistrationCompletion) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-base-200 p-8 rounded-3xl shadow-2xl text-center">
                    <UserPlus className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-neutral mb-4">রেজিস্ট্রেশন সম্পন্ন করুন</h2>
                    <p className="text-neutral/70 mb-2">
                        আপনি সফলভাবে লগইন করেছেন কিন্তু আপনার প্রোফাইল তৈরি হয়নি।
                    </p>
                    <div className="bg-info/10 p-3 rounded-lg mb-6">
                        <p className="text-sm text-info font-medium">
                            ইমেইল: {user?.email}
                        </p>
                        <p className="text-sm text-info font-medium">
                            নাম: {user?.displayName || 'SEU User'}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={handleCompleteRegistration}
                            disabled={completingRegistration}
                            className={`w-full py-3 rounded-2xl font-semibold transition-all ${
                                completingRegistration 
                                    ? 'bg-base-300 text-neutral/50 cursor-not-allowed' 
                                    : 'bg-primary text-base-100 hover:bg-primary/90'
                            }`}
                        >
                            {completingRegistration ? "প্রক্রিয়াকরণ..." : "রেজিস্ট্রেশন সম্পন্ন করুন"}
                        </button>
                        <button
                            onClick={() => window.location.href = '/auth/login'}
                            className="w-full bg-base-100 text-neutral py-3 rounded-2xl font-semibold hover:bg-base-300 transition-all border border-base-300"
                        >
                            আবার লগইন করুন
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check email verification requirement - Only check database status, not Firebase
    // Skip verification check for Google users
    console.log('🔍 Email verification check:');
    console.log('- requireEmailVerification:', requireEmailVerification);
    console.log('- userStatus?.isEmailVerified:', userStatus?.isEmailVerified);
    console.log('- userStatus?.isGoogleUser:', userStatus?.isGoogleUser);
    console.log('- Full userStatus:', userStatus);
    
    if (requireEmailVerification && !userStatus?.isEmailVerified && !userStatus?.isGoogleUser) {
        console.log('❌ Email verification required - showing verification page');
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-base-200 p-8 rounded-3xl shadow-2xl text-center">
                    <Mail className="w-16 h-16 text-warning mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-neutral mb-4">ইমেইল ভেরিফিকেশন প্রয়োজন</h2>
                    <p className="text-neutral/70 mb-6">
                        এই পেজ অ্যাক্সেস করতে প্রথমে আপনার ইমেইল ভেরিফাই করুন।
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.href = '/auth/verify-email'}
                            className="w-full bg-primary text-base-100 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all"
                        >
                            ইমেইল ভেরিফাই করুন
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-base-100 text-neutral py-3 rounded-2xl font-semibold hover:bg-base-300 transition-all border border-base-300"
                        >
                            হোমে ফিরে যান
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    console.log('✅ Email verification check passed - allowing access');

    // Check active account requirement
    if (requireActiveAccount && !userStatus?.isActive) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-base-200 p-8 rounded-3xl shadow-2xl text-center">
                    <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-neutral mb-4">একাউন্ট নিষ্ক্রিয়</h2>
                    <p className="text-neutral/70 mb-6">
                        আপনার একাউন্ট বর্তমানে নিষ্ক্রিয় রয়েছে। সাহায্যের জন্য সাপোর্টের সাথে যোগাযোগ করুন।
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.href = 'mailto:support@seu.edu.bd'}
                            className="w-full bg-primary text-base-100 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all"
                        >
                            সাপোর্টে যোগাযোগ করুন
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-base-100 text-neutral py-3 rounded-2xl font-semibold hover:bg-base-300 transition-all border border-base-300"
                        >
                            হোমে ফিরে যান
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // All checks passed, render the protected content
    return children;
};

export default ProtectedRoute;