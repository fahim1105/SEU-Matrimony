import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Mail, CheckCircle, RefreshCw, ArrowLeft, Clock, ExternalLink, Send } from "lucide-react";
import UseAuth from "../../Hooks/UseAuth";
import UseUserManagement from "../../Hooks/UseUserManagement";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const EmailVerification = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const { user, reloadUser, sendEmailVerification } = UseAuth();
    const { verifyEmail, getUserInfo } = UseUserManagement();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get data from navigation state
    const email = location.state?.email;
    const displayName = location.state?.displayName;
    const photoURL = location.state?.photoURL;
    const uid = location.state?.uid;
    const fromRegistration = location.state?.fromRegistration || false;
    const isEmailUser = location.state?.isEmailUser || false;
    const useFirebaseVerification = location.state?.useFirebaseVerification || false;
    const dbStorageFailed = location.state?.dbStorageFailed || false;

    // Check verification status periodically for email users
    useEffect(() => {
        if (isEmailUser && email && !verified && useFirebaseVerification) {
            const interval = setInterval(checkFirebaseVerificationStatus, 5000);
            return () => clearInterval(interval);
        }
    }, [isEmailUser, email, verified, useFirebaseVerification]);

    const checkFirebaseVerificationStatus = async () => {
        if (!user) return;
        
        setCheckingStatus(true);
        try {
            // Reload Firebase user to get latest emailVerified status
            await reloadUser();
            
            if (user.emailVerified) {
                console.log('✅ Firebase email verified');
                await handleVerificationComplete();
            }
        } catch (error) {
            console.error('Firebase status check error:', error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleVerificationComplete = async () => {
        try {
            // Update database verification status
            const verifyResult = await verifyEmail(email);
            
            if (verifyResult.success) {
                // Save verification status to localStorage as backup
                const verificationData = {
                    email: email,
                    isEmailVerified: true,
                    verifiedAt: new Date().toISOString(),
                    method: 'firebase'
                };
                localStorage.setItem(`email_verified_${email}`, JSON.stringify(verificationData));
                
                setVerified(true);
                toast.success(t('messages.success.emailVerificationSuccess'));
                
                // Navigate to home after successful verification
                setTimeout(() => {
                    navigate("/", { 
                        state: { 
                            message: "ইমেইল ভেরিফাই সফল! স্বাগতম SEU Matrimony তে।",
                            email: email,
                            fromVerification: true
                        },
                        replace: true 
                    });
                }, 2000);
            } else {
                // Even if database update fails, save to localStorage
                const verificationData = {
                    email: email,
                    isEmailVerified: true,
                    verifiedAt: new Date().toISOString(),
                    method: 'firebase',
                    dbSyncPending: true
                };
                localStorage.setItem(`email_verified_${email}`, JSON.stringify(verificationData));
                
                setVerified(true);
                toast.success("ইমেইল ভেরিফিকেশন সফল! (Database sync pending)");
                
                setTimeout(() => {
                    navigate("/", { 
                        state: { 
                            message: "ইমেইল ভেরিফাই সফল! স্বাগতম SEU Matrimony তে।",
                            email: email,
                            fromVerification: true
                        },
                        replace: true 
                    });
                }, 2000);
            }
        } catch (error) {
            // Even on error, if Firebase verification is done, save to localStorage
            const verificationData = {
                email: email,
                isEmailVerified: true,
                verifiedAt: new Date().toISOString(),
                method: 'firebase',
                dbSyncPending: true
            };
            localStorage.setItem(`email_verified_${email}`, JSON.stringify(verificationData));
            
            setVerified(true);
            toast.success("ইমেইল ভেরিফিকেশন সফল! (Database sync pending)");
            
            setTimeout(() => {
                navigate("/", { 
                    state: { 
                        message: "ইমেইল ভেরিফাই সফল! স্বাগতম SEU Matrimony তে।",
                        email: email,
                        fromVerification: true
                    },
                    replace: true 
                });
            }, 2000);
        }
    };

    const handleManualCheck = async () => {
        setLoading(true);
        const toastId = toast.loading("স্ট্যাটাস চেক করা হচ্ছে...");
        
        try {
            // Reload Firebase user first
            await reloadUser();
            
            if (user && user.emailVerified) {
                // Update database verification status
                const verifyResult = await verifyEmail(email);
                
                // Save to localStorage regardless of database result
                const verificationData = {
                    email: email,
                    isEmailVerified: true,
                    verifiedAt: new Date().toISOString(),
                    method: 'firebase',
                    dbSyncPending: !verifyResult.success
                };
                localStorage.setItem(`email_verified_${email}`, JSON.stringify(verificationData));
                
                setVerified(true);
                
                if (verifyResult.success) {
                    toast.success("ইমেইল ভেরিফিকেশন সফল হয়েছে!", { id: toastId });
                } else {
                    toast.success("ইমেইল ভেরিফিকেশন সফল! (Database sync pending)", { id: toastId });
                }
                
                setTimeout(() => {
                    navigate("/", { 
                        state: { 
                            message: "ইমেইল ভেরিফাই সফল! স্বাগতম SEU Matrimony তে।",
                            email: email,
                            fromVerification: true
                        },
                        replace: true 
                    });
                }, 2000);
            } else {
                toast.error("এখনো ভেরিফিকেশন সম্পন্ন হয়নি। ইমেইল চেক করুন।", { id: toastId });
            }
        } catch (error) {
            toast.error("স্ট্যাটাস চেক করতে সমস্যা হয়েছে", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setLoading(true);
        const toastId = toast.loading("ভেরিফিকেশন ইমেইল পাঠানো হচ্ছে...");
        
        try {
            await sendEmailVerification();
            toast.success("ভেরিফিকেশন ইমেইল পুনরায় পাঠানো হয়েছে! ইনবক্স চেক করুন।", { id: toastId });
        } catch (error) {
            console.error("Resend email error:", error);
            toast.error("ইমেইল পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-base-200 p-8 rounded-[2.5rem] shadow-2xl border border-base-300/50 backdrop-blur-sm">
                
                <div className="text-center mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        verified ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                        {verified ? (
                            <CheckCircle className="w-10 h-10 text-success" />
                        ) : (
                            <Clock className="w-10 h-10 text-warning" />
                        )}
                    </div>
                    <h1 className="text-2xl font-black text-neutral italic uppercase tracking-tighter mb-2">
                        ইমেইল ভেরিফিকেশন
                    </h1>
                    <p className="text-neutral/70 text-sm font-medium">
                        {verified ? "ভেরিফিকেশন সম্পন্ন!" : "ইমেইল পাঠানো হয়েছে"}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-base-100 p-4 rounded-2xl border border-base-300">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2 italic">
                            ইমেইল ঠিকানা
                        </p>
                        <p className="text-sm font-semibold text-neutral break-all">
                            {email}
                        </p>
                    </div>

                    {verified ? (
                        <div className="bg-success/10 p-6 rounded-2xl border border-success/20 text-center">
                            <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
                            <h3 className="font-bold text-success mb-2">ভেরিফিকেশন সফল!</h3>
                            <p className="text-sm text-neutral/70 mb-3">
                                আপনার ইমেইল সফলভাবে ভেরিফাই হয়েছে। হোম পেজে নিয়ে যাওয়া হচ্ছে...
                            </p>
                            <div className="w-full bg-success/20 rounded-full h-2">
                                <div className="bg-success h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-warning/10 p-6 rounded-2xl border border-warning/20">
                            <div className="text-center mb-4">
                                <Mail className="w-8 h-8 text-warning mx-auto mb-3" />
                                <h3 className="font-bold text-warning mb-2">ইমেইল ভেরিফিকেশন প্রয়োজন</h3>
                                <p className="text-sm text-neutral/70 mb-3">
                                    আপনার ইমেইল ইনবক্স চেক করুন এবং Firebase থেকে পাঠানো ভেরিফিকেশন লিংকে ক্লিক করুন।
                                </p>
                                {checkingStatus && (
                                    <div className="flex items-center justify-center gap-2 text-xs text-info mb-3">
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        স্ট্যাটাস চেক করা হচ্ছে...
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                {/* Status Check Button */}
                                <button
                                    onClick={handleManualCheck}
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl font-bold text-sm bg-success text-base-100 hover:bg-success/80 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                    {loading ? "চেক করা হচ্ছে..." : "স্ট্যাটাস চেক করুন"}
                                </button>
                                
                                {/* Resend Email Button */}
                                <button
                                    onClick={handleResendEmail}
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl font-bold text-sm bg-warning text-base-100 hover:bg-warning/80 transition-all flex items-center justify-center gap-2"
                                >
                                    <Send size={16} />
                                    {loading ? "পাঠানো হচ্ছে..." : "পুনরায় ইমেইল পাঠান"}
                                </button>
                                
                                <div className="text-center">
                                    <p className="text-xs text-neutral/60 mb-2">
                                        ইমেইল পাননি? স্প্যাম ফোল্ডার চেক করুন
                                    </p>
                                    <button
                                        onClick={() => window.open('https://mail.google.com', '_blank')}
                                        className="text-xs text-primary hover:underline flex items-center justify-center gap-1"
                                    >
                                        <ExternalLink size={12} />
                                        Gmail খুলুন
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate("/auth/login")}
                            className="w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest italic transition-all bg-base-100 border border-base-300 hover:bg-base-300 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={14} />
                            লগইনে ফিরে যান
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-neutral/30 text-[8px] font-black uppercase tracking-widest italic leading-relaxed">
                            {fromRegistration ? "স্বাগতম SEU Matrimony তে!" : "সমস্যা হলে এডমিনের সাথে যোগাযোগ করুন"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;