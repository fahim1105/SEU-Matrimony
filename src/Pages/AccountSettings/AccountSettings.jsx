import { useState, useEffect } from 'react';
import { Settings, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import i18n from '../../i18n/i18n';

const AccountSettings = () => {
    const { t } = useTranslation();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivationReason, setDeactivationReason] = useState('');
    const { user, logout } = UseAuth();
    const { getUserInfo, deactivateAccount } = UseUserManagement();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const locale = i18n.language === 'bn' ? 'bn-BD' : 'en-US';
        return date.toLocaleDateString(locale);
    };

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
            toast.error(t('accountSettings.reasonRequired'));
            return;
        }

        const result = await deactivateAccount(user.email, deactivationReason);
        if (result.success) {
            setShowDeactivateModal(false);
            await logout();
            toast.success(t('accountSettings.deactivated'));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="text-neutral/70 ml-4">{t('accountSettings.loading')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <BackButton to="/dashboard" label={t('accountSettings.backToDashboard')} />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        {t('accountSettings.title')}
                    </h1>
                    <p className="text-neutral/70 mt-2">{t('accountSettings.subtitle')}</p>
                </div>

                <div className="grid gap-6">
                    {/* Account Status */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-semibold text-neutral mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            {t('accountSettings.accountStatus')}
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-base-100 p-4 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    {userInfo?.isEmailVerified ? (
                                        <CheckCircle className="w-5 h-5 text-success" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-error" />
                                    )}
                                    <span className="font-medium">{t('accountSettings.emailStatus')}</span>
                                </div>
                                <p className="text-sm text-neutral/70">
                                    {userInfo?.isEmailVerified ? t('accountSettings.verified') : t('accountSettings.notVerified')}
                                </p>
                            </div>

                            <div className="bg-base-100 p-4 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    {userInfo?.isActive ? (
                                        <CheckCircle className="w-5 h-5 text-success" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-error" />
                                    )}
                                    <span className="font-medium">{t('accountSettings.accountStatus')}</span>
                                </div>
                                <p className="text-sm text-neutral/70">
                                    {userInfo?.isActive ? t('accountSettings.active') : t('accountSettings.inactive')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-semibold text-neutral mb-4">{t('accountSettings.accountInfo')}</h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-base-300">
                                <span className="text-neutral/70">{t('biodata.name')}</span>
                                <span className="font-medium">{user?.displayName}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-base-300">
                                <span className="text-neutral/70">{t('auth.email')}</span>
                                <span className="font-medium">{user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-base-300">
                                <span className="text-neutral/70">{t('accountSettings.role')}</span>
                                <span className="font-medium capitalize">{userInfo?.role || 'User'}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-neutral/70">{t('accountSettings.memberSince')}</span>
                                <span className="font-medium">
                                    {formatDate(userInfo?.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-error/10 border border-error/20 p-6 rounded-3xl">
                        <h2 className="text-xl font-semibold text-error mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {t('accountSettings.dangerZone')}
                        </h2>
                        
                        <div className="bg-base-100 p-4 rounded-2xl">
                            <h3 className="font-semibold text-neutral mb-2">{t('accountSettings.deactivateAccount')}</h3>
                            <p className="text-sm text-neutral/70 mb-4">
                                {t('accountSettings.deactivateWarning')}
                            </p>
                            <button
                                onClick={() => setShowDeactivateModal(true)}
                                className="bg-error text-base-100 px-6 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all"
                            >
                                {t('accountSettings.deactivateAccount')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deactivate Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-200 p-6 rounded-3xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-error mb-4">{t('accountSettings.deactivateAccount')}</h3>
                        
                        <p className="text-neutral/70 mb-4">
                            {t('accountSettings.deactivateWarning')}
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-neutral mb-2">
                                {t('accountSettings.deactivateReason')}
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
                                {t('accountSettings.cancel')}
                            </button>
                            <button
                                onClick={handleDeactivateAccount}
                                className="flex-1 bg-error text-base-100 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all"
                            >
                                {t('accountSettings.confirmDeactivation')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSettings;