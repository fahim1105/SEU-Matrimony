import { useState, useEffect } from 'react';
import { Settings, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';

const AccountSettings = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivationReason, setDeactivationReason] = useState('');
    const { user, logout } = UseAuth();
    const { getUserInfo, deactivateAccount } = UseUserManagement();

    useEffect(() => {
        fetchUserInfo();
    }, [user]);

    const fetchUserInfo = async () => {
        if (user?.email) {
            const result = await getUserInfo(user.email);
            if (result.success) {
                setUserInfo(result.user);
            }
        }
        setLoading(false);
    };

    const handleDeactivateAccount = async () => {
        if (!deactivationReason.trim()) {
            toast.error('কারণ উল্লেখ করুন');
            return;
        }

        const result = await deactivateAccount(user.email, deactivationReason);
        if (result.success) {
            setShowDeactivateModal(false);
            await logout();
            toast.success('একাউন্ট ডিঅ্যাক্টিভেট হয়েছে');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <BackButton to="/dashboard" label="ড্যাশবোর্ডে ফিরে যান" />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        একাউন্ট সেটিংস
                    </h1>
                    <p className="text-neutral/70 mt-2">আপনার একাউন্ট তথ্য এবং নিরাপত্তা সেটিংস</p>
                </div>

                <div className="grid gap-6">
                    {/* Account Status */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-semibold text-neutral mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            একাউন্ট স্ট্যাটাস
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-base-100 p-4 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    {userInfo?.isEmailVerified ? (
                                        <CheckCircle className="w-5 h-5 text-success" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-error" />
                                    )}
                                    <span className="font-medium">ইমেইল ভেরিফিকেশন</span>
                                </div>
                                <p className="text-sm text-neutral/70">
                                    {userInfo?.isEmailVerified ? 'ভেরিফাইড' : 'ভেরিফাই করা হয়নি'}
                                </p>
                            </div>

                            <div className="bg-base-100 p-4 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    {userInfo?.isActive ? (
                                        <CheckCircle className="w-5 h-5 text-success" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-error" />
                                    )}
                                    <span className="font-medium">একাউন্ট স্ট্যাটাস</span>
                                </div>
                                <p className="text-sm text-neutral/70">
                                    {userInfo?.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-semibold text-neutral mb-4">একাউন্ট তথ্য</h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-base-300">
                                <span className="text-neutral/70">নাম</span>
                                <span className="font-medium">{user?.displayName}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-base-300">
                                <span className="text-neutral/70">ইমেইল</span>
                                <span className="font-medium">{user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-base-300">
                                <span className="text-neutral/70">রোল</span>
                                <span className="font-medium capitalize">{userInfo?.role || 'User'}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-neutral/70">যোগদানের তারিখ</span>
                                <span className="font-medium">
                                    {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-error/10 border border-error/20 p-6 rounded-3xl">
                        <h2 className="text-xl font-semibold text-error mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            বিপজ্জনক এলাকা
                        </h2>
                        
                        <div className="bg-base-100 p-4 rounded-2xl">
                            <h3 className="font-semibold text-neutral mb-2">একাউন্ট ডিঅ্যাক্টিভেট করুন</h3>
                            <p className="text-sm text-neutral/70 mb-4">
                                আপনার একাউন্ট সাময়িকভাবে নিষ্ক্রিয় করুন। আপনি পরে এটি পুনরায় সক্রিয় করতে পারবেন।
                            </p>
                            <button
                                onClick={() => setShowDeactivateModal(true)}
                                className="bg-error text-base-100 px-6 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all"
                            >
                                একাউন্ট ডিঅ্যাক্টিভেট করুন
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deactivate Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-200 p-6 rounded-3xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-error mb-4">একাউন্ট ডিঅ্যাক্টিভেট করুন</h3>
                        
                        <p className="text-neutral/70 mb-4">
                            আপনি কি নিশ্চিত যে আপনি আপনার একাউন্ট ডিঅ্যাক্টিভেট করতে চান? 
                            এটি সাময়িক এবং আপনি পরে পুনরায় সক্রিয় করতে পারবেন।
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-neutral mb-2">
                                ডিঅ্যাক্টিভেশনের কারণ
                            </label>
                            <textarea
                                value={deactivationReason}
                                onChange={(e) => setDeactivationReason(e.target.value)}
                                placeholder="কেন আপনি একাউন্ট ডিঅ্যাক্টিভেট করতে চান?"
                                className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeactivateModal(false)}
                                className="flex-1 bg-base-100 text-neutral py-2 rounded-xl font-semibold hover:bg-base-300 transition-all"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={handleDeactivateAccount}
                                className="flex-1 bg-error text-base-100 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all"
                            >
                                ডিঅ্যাক্টিভেট করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSettings;