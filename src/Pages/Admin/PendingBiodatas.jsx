import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, User, Mail, SquareCheckBig } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';

const PendingBiodatas = () => {
    const { t, i18n } = useTranslation();
    const [pendingBiodatas, setPendingBiodatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBiodata, setSelectedBiodata] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

    const axiosSecure = UseAxiosSecure();

    // Format date based on current language
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const locale = i18n.language === 'bn' ? 'bn-BD' : 'en-US';
        return date.toLocaleDateString(locale);
    };

    useEffect(() => {
        fetchPendingBiodatas();
    }, []);

    const fetchPendingBiodatas = async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get('/admin/pending-biodatas');
            if (response.data.success) {
                setPendingBiodatas(response.data.biodatas);
            } else {
                toast.error(response.data.message || t('messages.error.loadError'));
            }
        } catch (error) {
            console.error('Error fetching pending biodatas:', error);
            const message = error.response?.data?.message || t('messages.error.loadError');
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (biodata, action) => {
        setSelectedBiodata(biodata);
        setActionType(action);
        setAdminNote('');
        setShowModal(true);
    };

    const confirmAction = async () => {
        if (!selectedBiodata || !actionType) return;

        try {
            const response = await axiosSecure.patch(`/admin/biodata-status/${selectedBiodata._id}`, {
                status: actionType === 'approve' ? 'approved' : 'rejected',
                adminNote: adminNote
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Remove from pending list
                setPendingBiodatas(prev =>
                    prev.filter(biodata => biodata._id !== selectedBiodata._id)
                );
                setShowModal(false);
            } else {
                toast.error(response.data.message || t('messages.error.updateError'));
            }
        } catch (error) {
            console.error('Error updating biodata status:', error);
            const message = error.response?.data?.message || t('messages.error.updateError');
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">{t('admin.loadingPendingBiodatas')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label={t('common.back')} />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <Clock className="w-8 h-8 text-warning" />
                        {t('admin.pendingBiodatas')}
                    </h1>
                    <p className="text-neutral/70 mt-2">{t('admin.awaitingApproval')}</p>
                </div>

                {/* Stats */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-warning/20 p-4 rounded-2xl">
                            <Clock className="w-8 h-8 text-warning" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-neutral">{pendingBiodatas.length}</h3>
                            <p className="text-neutral/70">{t('admin.biodatasAwaitingApproval')}</p>
                        </div>
                    </div>
                </div>

                {/* Pending Biodatas */}
                {pendingBiodatas.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4 flex justify-center">
                            <SquareCheckBig size={111} /> 
                        </div>
                        <h3 className="text-xl font-semibold text-neutral mb-2">{t('admin.allBiodataReviewed')}</h3>
                        <p className="text-neutral/70">{t('admin.noPendingBiodatas')}</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {pendingBiodatas.map((biodata) => (
                            <div key={biodata._id} className="bg-base-200 p-6 rounded-3xl shadow-lg">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Profile Image */}
                                    <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        {biodata.profileImage ? (
                                            <img
                                                src={biodata.profileImage}
                                                alt={biodata.name}
                                                className="w-full h-full object-cover rounded-2xl"
                                            />
                                        ) : (
                                            <User className="w-16 h-16 text-neutral/50" />
                                        )}
                                    </div>

                                    {/* Biodata Info */}
                                    <div className="flex-1">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-neutral mb-2">{biodata.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-neutral/70 mb-1">
                                                    <Mail className="w-4 h-4" />
                                                    <span>{biodata.contactEmail}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-semibold">
                                                    {t('admin.pending')}
                                                </div>
                                                <p className="text-xs text-neutral/50 mt-1">
                                                    {formatDate(biodata.submittedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Basic Info Grid */}
                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-neutral/50 uppercase tracking-wide">{t('admin.age')}</p>
                                                <p className="font-semibold">{biodata.age} {t('admin.years')}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral/50 uppercase tracking-wide">{t('admin.gender')}</p>
                                                <p className="font-semibold">{biodata.gender}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral/50 uppercase tracking-wide">{t('admin.department')}</p>
                                                <p className="font-semibold">{biodata.department}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral/50 uppercase tracking-wide">{t('admin.district')}</p>
                                                <p className="font-semibold">{biodata.district}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button className="bg-base-100 text-neutral px-4 py-2 rounded-xl font-semibold hover:bg-base-300 transition-all flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                {t('admin.viewDetails')}
                                            </button>

                                            <button
                                                onClick={() => handleAction(biodata, 'approve')}
                                                className="bg-success text-base-100 px-4 py-2 rounded-xl font-semibold hover:bg-success/90 transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                {t('admin.approve')}
                                            </button>

                                            <button
                                                onClick={() => handleAction(biodata, 'reject')}
                                                className="bg-error text-base-100 px-4 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {t('admin.reject')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-200 p-6 rounded-3xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-neutral mb-4">
                            {actionType === 'approve' ? t('admin.approveBiodata') : t('admin.rejectBiodata')}
                        </h3>

                        <p className="text-neutral/70 mb-4">
                            {t('admin.confirmApprove')} <strong>{selectedBiodata?.name}</strong> {actionType === 'approve' ? t('admin.wantToApprove') : t('admin.wantToReject')}
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-neutral mb-2">
                                {t('admin.adminNote')}
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder={t('admin.adminNotePlaceholder')}
                                className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-base-100 text-neutral py-2 rounded-xl font-semibold hover:bg-base-300 transition-all"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 py-2 rounded-xl font-semibold transition-all ${actionType === 'approve'
                                    ? 'bg-success text-base-100 hover:bg-success/90'
                                    : 'bg-error text-base-100 hover:bg-error/90'
                                    }`}
                            >
                                {actionType === 'approve' ? t('admin.approve') : t('admin.reject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingBiodatas;