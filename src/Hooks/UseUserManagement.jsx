import { useState } from 'react';
import UseAxiosSecure from './UseAxiosSecure';
import { toast } from 'react-hot-toast';

const UseUserManagement = () => {
    const [loading, setLoading] = useState(false);
    const axiosSecure = UseAxiosSecure();

    // Register user in database
    const registerUser = async (userData) => {
        setLoading(true);
        try {
            const response = await axiosSecure.post('/register-user', userData);
            if (response.data.success) {
                toast.success(response.data.message || 'রেজিস্ট্রেশন সফল হয়েছে');
                return { success: true, data: response.data };
            } else {
                toast.error(response.data.message || 'রেজিস্ট্রেশনে সমস্যা হয়েছে');
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'রেজিস্ট্রেশনে সমস্যা হয়েছে';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Update email verification status
    const verifyEmail = async (email) => {
        setLoading(true);
        try {
            const response = await axiosSecure.patch('/verify-email', { email });
            if (response.data.success) {
                toast.success(response.data.message || 'ইমেইল ভেরিফিকেশন সফল হয়েছে');
                return { success: true };
            } else {
                toast.error(response.data.message || 'ভেরিফিকেশনে সমস্যা হয়েছে');
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'ইমেইল ভেরিফিকেশনে সমস্যা হয়েছে';
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
            const response = await axiosSecure.get(`/user/${email}`);
            if (response.data.success) {
                return { success: true, user: response.data.user };
            } else {
                return { success: false, error: response.data.message || 'ইউজার তথ্য পাওয়া যায়নি' };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'ইউজার তথ্য আনতে সমস্যা হয়েছে';
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

    return {
        loading,
        registerUser,
        verifyEmail,
        getUserInfo,
        deactivateAccount,
        reactivateAccount
    };
};

export default UseUserManagement;