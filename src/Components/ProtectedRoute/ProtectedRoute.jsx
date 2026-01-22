import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import { Shield, Mail, AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ children, requireEmailVerification = true, requireActiveAccount = true }) => {
    const { user, loading } = UseAuth();
    const { getUserInfo } = UseUserManagement();
    const [userStatus, setUserStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (user?.email && !loading) {
            checkUserStatus();
        } else if (!loading) {
            setStatusLoading(false);
        }
    }, [user, loading]);

    const checkUserStatus = async () => {
        try {
            const result = await getUserInfo(user.email);
            if (result.success) {
                setUserStatus(result.user);
            }
        } catch (error) {
            console.error('Error checking user status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    // Show loading spinner while checking authentication
    if (loading || statusLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">যাচাই করা হচ্ছে...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/auth/login" state={location.pathname} replace />;
    }

    // Check email verification requirement
    if (requireEmailVerification && (!user.emailVerified || !userStatus?.isEmailVerified)) {
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