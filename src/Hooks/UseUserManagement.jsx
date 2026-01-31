import { useState } from 'react';
import UseAxiosSecure from './UseAxiosSecure';
import { apiWithFallback } from '../utils/apiChecker';
import { toast } from 'react-hot-toast';

const UseUserManagement = () => {
    const [loading, setLoading] = useState(false);
    const axiosSecure = UseAxiosSecure();

    // Register user in database
    const registerUser = async (userData) => {
        console.log('🚀 UseUserManagement: Starting registration process');
        console.log('📤 Sending data:', userData);
        
        setLoading(true);
        try {
            console.log('📡 Making API call to /register-user');
            // Use fallback system for user registration
            const response = await apiWithFallback.registerUser(axiosSecure, userData);
            
            console.log('📥 API Response received:', response);
            console.log('📊 Response status:', response.status);
            console.log('📋 Response data:', response.data);
            
            if (response.data.success) {
                console.log('✅ Registration successful');
                return { 
                    success: true, 
                    data: response.data, 
                    message: response.data.message,
                    warning: response.data.warning || null
                };
            } else {
                console.log('❌ Registration failed - server returned success: false');
                return { 
                    success: false, 
                    error: response.data.message, 
                    message: response.data.message 
                };
            }
        } catch (error) {
            console.error('❌ API call failed:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            
            // Enhanced error handling for different scenarios
            let message = 'রেজিস্ট্রেশনে সমস্যা হয়েছে';
            
            if (error.message) {
                // Custom error messages from apiChecker
                message = error.message;
            } else if (error.response?.data?.message) {
                // Server error messages
                message = error.response.data.message;
            } else if (error.response?.status === 404) {
                message = 'রেজিস্ট্রেশন সার্ভিস সাময়িকভাবে অনুপলব্ধ';
            } else if (error.response?.status >= 500) {
                message = 'সার্ভার সমস্যা। পরে চেষ্টা করুন।';
            }
            
            return { 
                success: false, 
                error: message, 
                message,
                fullError: error
            };
        } finally {
            setLoading(false);
        }
    };

    // Update email verification status
    const verifyEmail = async (email) => {
        setLoading(true);
        try {
            // Use fallback system for email verification
            const response = await apiWithFallback.verifyEmail(axiosSecure, email);

            if (response.data.success) {
                toast.success(response.data.message || 'ইমেইল ভেরিফিকেশন সফল হয়েছে');
                return { success: true };
            } else {
                toast.error(response.data.message || 'ভেরিফিকেশনে সমস্যা হয়েছে');
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            const message = error.message || error.response?.data?.message || 'ইমেইল ভেরিফিকেশনে সমস্যা হয়েছে';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Verify email using token (for email link verification)
    const verifyEmailToken = async (token, email) => {
        setLoading(true);
        try {
            const response = await apiWithFallback.verifyEmailToken(axiosSecure, { token, email });

            if (response.data.success) {
                toast.success(response.data.message || 'ইমেইল ভেরিফিকেশন সফল হয়েছে');
                return { success: true, user: response.data.user };
            } else {
                toast.error(response.data.message || 'ভেরিফিকেশনে সমস্যা হয়েছে');
                return { success: false, error: response.data.message, expired: response.data.expired };
            }
        } catch (error) {
            const message = error.message || error.response?.data?.message || 'টোকেন ভেরিফিকেশনে সমস্যা হয়েছে';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Get user info
    const getUserInfo = async (email) => {
        setLoading(true);
        try {
            // Use fallback system for getUserInfo
            const response = await apiWithFallback.getUserInfo(axiosSecure, email);
            
            if (response.data.success) {
                return { success: true, user: response.data.user };
            } else {
                return { success: false, error: response.data.message || 'ইউজার তথ্য পাওয়া যায়নি' };
            }
        } catch (error) {
            const message = error.message || error.response?.data?.message || 'ইউজার তথ্য আনতে সমস্যা হয়েছে';
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Deactivate account
    const deactivateAccount = async (email, reason) => {
        setLoading(true);
        try {
            const response = await axiosSecure.patch('/deactivate-account', { email, reason });
            if (response.data.success) {
                toast.success(response.data.message || 'একাউন্ট ডিঅ্যাক্টিভেট হয়েছে');
                return { success: true };
            } else {
                toast.error(response.data.message || 'একাউন্ট ডিঅ্যাক্টিভেট করতে সমস্যা হয়েছে');
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'একাউন্ট ডিঅ্যাক্টিভেট করতে সমস্যা হয়েছে';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Reactivate account
    const reactivateAccount = async (email) => {
        setLoading(true);
        try {
            const response = await axiosSecure.patch('/reactivate-account', { email });
            if (response.data.success) {
                toast.success(response.data.message || 'একাউন্ট রিঅ্যাক্টিভেট হয়েছে');
                return { success: true };
            } else {
                toast.error(response.data.message || 'একাউন্ট রিঅ্যাক্টিভেট করতে সমস্যা হয়েছে');
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'একাউন্ট রিঅ্যাক্টিভেট করতে সমস্যা হয়েছে';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Send verification email
    const sendVerificationEmail = async (email) => {
        setLoading(true);
        try {
            const response = await apiWithFallback.sendVerificationEmail(axiosSecure, email);
            
            if (response.data.success) {
                toast.success(response.data.message || 'ভেরিফিকেশন ইমেইল পাঠানো হয়েছে');
                if (response.data.warning) {
                    // Use toast.success instead of toast.info for compatibility
                    toast.success(response.data.warning, { duration: 6000 });
                }
                return { success: true, warning: response.data.warning };
            } else {
                toast.error(response.data.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে');
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            const message = error.message || error.response?.data?.message || 'ভেরিফিকেশন ইমেইল পাঠাতে সমস্যা হয়েছে';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Complete registration for authenticated users missing from database
    const completeRegistration = async (userData) => {
        setLoading(true);
        try {
            const response = await apiWithFallback.completeRegistration(axiosSecure, userData);
            
            if (response.data.success) {
                toast.success(response.data.message || 'রেজিস্ট্রেশন সম্পন্ন হয়েছে');
                return { success: true, user: response.data.user };
            } else {
                toast.error(response.data.message || 'রেজিস্ট্রেশন সম্পন্ন করতে সমস্যা হয়েছে');
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            const message = error.message || error.response?.data?.message || 'রেজিস্ট্রেশন সম্পন্ন করতে সমস্যা হয়েছে';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        registerUser,
        verifyEmail,
        verifyEmailToken,
        sendVerificationEmail,
        completeRegistration,
        getUserInfo,
        deactivateAccount,
        reactivateAccount
    };
};

export default UseUserManagement;