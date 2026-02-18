import { useState, useEffect } from 'react';
import { Settings, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import BackButton from '../../Components/BackButton/BackButton';
import LoveLoader from '../../Components/LoveLoader/LoveLoader';
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
        return <LoveLoader />;
    }

    return (
        <div className="min-h-screen bg-base-100 py-6 sm:py-8 md:py-12 rounded-3xl">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-6 sm:mb-8">
                    <BackButton to="/dashboard" label={t('accountSettings.backToDashboard')} />
                    <div className="mt-4">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral flex items-center gap-2 sm:gap-3">
                            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                            <span className="break-words">{t('accountSettings.title')}</span>
                        </h1>
                        <p className="text-neutral/70 mt-2 text-sm sm:text-base">{t('accountSettings.subtitle')}</p>
                    </div>
                </div>

                <div className="grid gap-4 sm:gap-6">
                    {/* Account Status */}
                    <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                        <h2 className="text-lg sm:text-xl font-semibold text-neutral mb-3 sm:mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                            <span>{t('accountSettings.accountStatus')}</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-base-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                    {userInfo?.isEmailVerified ? (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-error flex-shrink-0" />
                                    )}
                                    <span className="font-medium text-sm sm:text-base">{t('accountSettings.emailStatus')}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-neutral/70 ml-6 sm:ml-8">
                                    {userInfo?.isEmailVerified ? t('accountSettings.verified') : t('accountSettings.notVerified')}
                                </p>
                            </div>

                            <div className="bg-base-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                    {userInfo?.isActive ? (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-error flex-shrink-0" />
                                    )}
                                    <span className="font-medium text-sm sm:text-base">{t('accountSettings.accountStatus')}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-neutral/70 ml-6 sm:ml-8">
                                    {userInfo?.isActive ? t('accountSettings.active') : t('accountSettings.inactive')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                        <h2 className="text-lg sm:text-xl font-semibold text-neutral mb-3 sm:mb-4">{t('accountSettings.accountInfo')}</h2>
                        
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-2 sm:py-3 border-b border-base-300">
                                <span className="text-neutral/70 text-sm sm:text-base">{t('biodata.name')}</span>
                                <span className="font-medium text-sm sm:text-base break-words">{user?.displayName}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-2 sm:py-3 border-b border-base-300">
                                <span className="text-neutral/70 text-sm sm:text-base">{t('auth.email')}</span>
                                <span className="font-medium text-sm sm:text-base break-all">{user?.email}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-2 sm:py-3 border-b border-base-300">
                                <span className="text-neutral/70 text-sm sm:text-base">{t('accountSettings.role')}</span>
                                <span className="font-medium text-sm sm:text-base capitalize">{userInfo?.role || 'User'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-2 sm:py-3">
                                <span className="text-neutral/70 text-sm sm:text-base">{t('accountSettings.memberSince')}</span>
                                <span className="font-medium text-sm sm:text-base">
                                    {formatDate(userInfo?.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-error/10 border border-error/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                        <h2 className="text-lg sm:text-xl font-semibold text-error mb-3 sm:mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span>{t('accountSettings.dangerZone')}</span>
                        </h2>
                        
                        <div className="bg-base-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                            <h3 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('accountSettings.deactivateAccount')}</h3>
                            <p className="text-xs sm:text-sm text-neutral/70 mb-3 sm:mb-4 leading-relaxed">
                                {t('accountSettings.deactivateWarning')}
                            </p>
                            <button
                                onClick={() => setShowDeactivateModal(true)}
                                className="w-full sm:w-auto bg-error text-base-100 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold hover:bg-error/90 transition-all text-sm sm:text-base"
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
                    <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold text-error mb-3 sm:mb-4 break-words">
                            {t('accountSettings.deactivateAccount')}
                        </h3>
                        
                        <p className="text-neutral/70 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                            {t('accountSettings.deactivateWarning')}
                        </p>

                        <div className="mb-4 sm:mb-6">
                            <label className="block text-xs sm:text-sm font-medium text-neutral mb-2">
                                {t('accountSettings.deactivateReason')}
                            </label>
                            <textarea
                                value={deactivationReason}
                                onChange={(e) => setDeactivationReason(e.target.value)}
                                placeholder={i18n.language === 'bn' ? 'কেন আপনি একাউন্ট ডিঅ্যাক্টিভেট করতে চান?' : 'Why do you want to deactivate your account?'}
                                className="w-full p-2.5 sm:p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm sm:text-base"
                                rows="3"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowDeactivateModal(false)}
                                className="flex-1 bg-base-100 text-neutral py-2 sm:py-2.5 rounded-xl font-semibold hover:bg-base-300 transition-all text-sm sm:text-base order-2 sm:order-1"
                            >
                                {t('accountSettings.cancel')}
                            </button>
                            <button
                                onClick={handleDeactivateAccount}
                                className="flex-1 bg-error text-base-100 py-2 sm:py-2.5 rounded-xl font-semibold hover:bg-error/90 transition-all text-sm sm:text-base order-1 sm:order-2"
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