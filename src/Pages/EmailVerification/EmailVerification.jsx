import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import toast from 'react-hot-toast';

const EmailVerification = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, sendEmailVerification, reloadUser } = UseAuth();
    const { verifyEmail } = UseUserManagement();
    
    const email = location.state?.email || user?.email;

    useEffect(() => {
        if (user?.emailVerified) {
            handleEmailVerified();
        }
    }, [user]);

    const handleEmailVerified = async () => {
        if (email) {
            const result = await verifyEmail(email);
            if (result.success) {
                setIsVerified(true);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
        }
    };

    const handleResendEmail = async () => {
        setLoading(true);
        try {
            await sendEmailVerification();
            toast.success('ভেরিফিকেশন ইমেইল পুনরায় পাঠানো হয়েছে');
        } catch (error) {
            toast.error('ইমেইল পাঠাতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const checkVerificationStatus = async () => {
        setCheckingStatus(true);
        try {
            await reloadUser();
            if (user?.emailVerified) {
                await handleEmailVerified();
            } else {
                toast.error('এখনও ভেরিফাই হয়নি। ইমেইল চেক করুন।');
            }
        } catch (error) {
            toast.error('স্ট্যাটাস চেক করতে সমস্যা হয়েছে');
        } finally {
            setCheckingStatus(false);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-base-200 p-8 rounded-3xl shadow-2xl text-center">
                    <div className="mb-6">
                        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-success mb-2">ভেরিফিকেশন সফল!</h1>
                        <p className="text-neutral/70">আপনার ইমেইল সফলভাবে ভেরিফাই হয়েছে।</p>
                    </div>
                    <p className="text-sm text-neutral/50">ড্যাশবোর্ডে রিডাইরেক্ট হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-base-200 p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-neutral mb-2">ইমেইল ভেরিফিকেশন</h1>
                    <p className="text-neutral/70 text-sm">
                        আপনার ইমেইল <span className="font-semibold text-primary">{email}</span> এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে।
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-base-100 p-4 rounded-2xl border border-base-300">
                        <h3 className="font-semibold text-neutral mb-2">পরবর্তী ধাপ:</h3>
                        <ol className="text-sm text-neutral/70 space-y-1 list-decimal list-inside">
                            <li>আপনার ইমেইল ইনবক্স চেক করুন</li>
                            <li>SEU Matrimony থেকে আসা ইমেইল খুঁজুন</li>
                            <li>ভেরিফিকেশন লিংকে ক্লিক করুন</li>
                            <li>নিচের "স্ট্যাটাস চেক করুন" বাটনে ক্লিক করুন</li>
                        </ol>
                    </div>

                    <button
                        onClick={checkVerificationStatus}
                        disabled={checkingStatus}
                        className="w-full bg-primary text-base-100 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {checkingStatus ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                চেক করা হচ্ছে...
                            </>
                        ) : (
                            'স্ট্যাটাস চেক করুন'
                        )}
                    </button>

                    <button
                        onClick={handleResendEmail}
                        disabled={loading}
                        className="w-full bg-base-100 text-neutral py-3 rounded-2xl font-semibold hover:bg-base-300 transition-all disabled:opacity-50 border border-base-300"
                    >
                        {loading ? 'পাঠানো হচ্ছে...' : 'ইমেইল পুনরায় পাঠান'}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-neutral/50">
                        ইমেইল পাননি? স্প্যাম ফোল্ডার চেক করুন অথবা কিছুক্ষণ অপেক্ষা করুন।
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;