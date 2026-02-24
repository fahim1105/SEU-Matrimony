import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Eye, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseAuth from '../../Hooks/UseAuth';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import LoveLoader from '../../Components/LoveLoader/LoveLoader';

const MyFeedbacks = () => {
    const { t, i18n } = useTranslation();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    const axiosSecure = UseAxiosSecure();
    const { user } = UseAuth();

    useEffect(() => {
        if (user?.email) {
            fetchMyFeedbacks();
        }
    }, [user]);

    const fetchMyFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/my-feedbacks?userEmail=${user.email}`);
            if (response.data.success) {
                setFeedbacks(response.data.feedbacks);
            } else {
                toast.error(response.data.message || 'Error loading feedbacks');
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            toast.error(error.response?.data?.message || 'Error loading feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const locale = i18n.language === 'bn' ? 'bn-BD' : 'en-US';
        return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    };

    const getTypeLabel = (type) => {
        const types = {
            general: 'General Feedback',
            bug: 'Bug Report',
            feature: 'Feature Request'
        };
        return types[type] || type;
    };

    const getTypeColor = (type) => {
        const colors = {
            general: 'bg-info/20 text-info',
            bug: 'bg-error/20 text-error',
            feature: 'bg-success/20 text-success'
        };
        return colors[type] || 'bg-base-300 text-neutral';
    };

    if (loading) {
        return <LoveLoader/>
    }

    return (
        <div className="min-h-screen bg-base-100 py-4 sm:py-6 lg:py-8 rounded-3xl">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <BackButton label={t('common.back')} />
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        {t('myFeedbacks.title') || 'My Feedbacks'}
                    </h1>
                    <p className="text-neutral/70 mt-2">{t('myFeedbacks.subtitle') || 'View your submitted feedbacks and admin replies'}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-base-200 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral/70 text-sm">{t('myFeedbacks.total') || 'Total'}</p>
                                <p className="text-2xl font-bold text-neutral">{feedbacks.length}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div className="bg-base-200 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral/70 text-sm">{t('myFeedbacks.pending') || 'Pending'}</p>
                                <p className="text-2xl font-bold text-warning">
                                    {feedbacks.filter(f => f.status === 'pending').length}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-warning" />
                        </div>
                    </div>
                    <div className="bg-base-200 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral/70 text-sm">{t('myFeedbacks.replied') || 'Replied'}</p>
                                <p className="text-2xl font-bold text-success">
                                    {feedbacks.filter(f => f.hasReply).length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                    </div>
                </div>

                {/* Feedbacks List */}
                {feedbacks.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral mb-2">{t('myFeedbacks.noFeedbacks') || 'No Feedbacks'}</h3>
                        <p className="text-neutral/70">{t('myFeedbacks.noFeedbacksDesc') || 'You haven\'t submitted any feedback yet'}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {feedbacks.map((feedback) => (
                            <div key={feedback._id} className="bg-base-200 p-4 sm:p-6 rounded-2xl shadow-lg">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
                                                {getTypeLabel(feedback.type)}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                feedback.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                                            }`}>
                                                {feedback.status === 'pending' ? '⏳ ' + (t('myFeedbacks.statusPending') || 'Pending') : '✅ ' + (t('myFeedbacks.statusResolved') || 'Resolved')}
                                            </span>
                                            {feedback.hasReply && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-info/20 text-info">
                                                    💬 {t('myFeedbacks.adminReplied') || 'Admin Replied'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-neutral/80 text-sm mb-2 line-clamp-2">{feedback.description}</p>
                                        <p className="text-xs text-neutral/50">{t('myFeedbacks.submitted') || 'Submitted'}: {formatDate(feedback.submittedAt)}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedFeedback(feedback);
                                            setShowDetailsModal(true);
                                        }}
                                        className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {t('common.view') || 'View'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-neutral">{t('myFeedbacks.details') || 'Feedback Details'}</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-base-300 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Type & Status */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedFeedback.type)}`}>
                                {getTypeLabel(selectedFeedback.type)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedFeedback.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                            }`}>
                                {selectedFeedback.status === 'pending' ? '⏳ ' + (t('myFeedbacks.statusPending') || 'Pending') : '✅ ' + (t('myFeedbacks.statusResolved') || 'Resolved')}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-neutral mb-2">{t('myFeedbacks.yourFeedback') || 'Your Feedback'}</h3>
                            <p className="text-neutral/80 bg-base-100 p-4 rounded-xl whitespace-pre-wrap">{selectedFeedback.description}</p>
                        </div>

                        {/* Screenshot */}
                        {selectedFeedback.screenshot && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-neutral mb-2">{t('myFeedbacks.screenshot') || 'Screenshot'}</h3>
                                <img
                                    src={selectedFeedback.screenshot}
                                    alt="Screenshot"
                                    className="w-full rounded-xl border-2 border-base-300"
                                />
                            </div>
                        )}

                        {/* Admin Reply */}
                        {selectedFeedback.hasReply && selectedFeedback.adminReply && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-neutral mb-2">{t('myFeedbacks.adminReply') || 'Admin Reply'}</h3>
                                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-xl">
                                    <p className="text-neutral/80 whitespace-pre-wrap">{selectedFeedback.adminReply}</p>
                                    <p className="text-xs text-neutral/50 mt-2">{t('myFeedbacks.repliedAt') || 'Replied'}: {formatDate(selectedFeedback.repliedAt)}</p>
                                </div>
                            </div>
                        )}

                        {/* No Reply Yet */}
                        {!selectedFeedback.hasReply && (
                            <div className="mb-6 p-4 bg-warning/10 border-l-4 border-warning rounded-xl">
                                <p className="text-neutral/80">
                                    {t('myFeedbacks.noReplyYet') || 'Admin hasn\'t replied yet. You will be notified when they respond.'}
                                </p>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="p-4 bg-base-100 rounded-xl space-y-2 text-sm">
                            <p><span className="font-medium">{t('myFeedbacks.submitted') || 'Submitted'}:</span> {formatDate(selectedFeedback.submittedAt)}</p>
                            {selectedFeedback.resolvedAt && (
                                <p><span className="font-medium">{t('myFeedbacks.resolved') || 'Resolved'}:</span> {formatDate(selectedFeedback.resolvedAt)}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyFeedbacks;
