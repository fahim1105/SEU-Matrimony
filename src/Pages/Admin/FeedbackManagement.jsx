import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Trash2, Eye, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseAuth from '../../Hooks/UseAuth';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import LoveLoader from '../../Components/LoveLoader/LoveLoader';

const FeedbackManagement = () => {
    const { t, i18n } = useTranslation();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'resolved'
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    
    const axiosSecure = UseAxiosSecure();
    const { user } = UseAuth();

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get('/admin/feedbacks');
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

    const handleStatusUpdate = async (feedbackId, newStatus) => {
        try {
            const response = await axiosSecure.patch(`/admin/feedback-status/${feedbackId}`, {
                status: newStatus,
                adminEmail: user.email
            });

            if (response.data.success) {
                toast.success(`Feedback marked as ${newStatus}`);
                fetchFeedbacks();
                setShowDetailsModal(false);
            } else {
                toast.error(response.data.message || 'Error updating status');
            }
        } catch (error) {
            console.error('Error updating feedback status:', error);
            toast.error(error.response?.data?.message || 'Error updating status');
        }
    };

    const handleDelete = async (feedbackId) => {
        const result = await Swal.fire({
            title: t('feedbackManagement.deleteConfirm'),
            text: t('feedbackManagement.deleteConfirmText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('feedbackManagement.yesDelete'),
            cancelButtonText: t('common.cancel')
        });

        if (!result.isConfirmed) return;

        try {
            const response = await axiosSecure.delete(`/admin/feedback/${feedbackId}`);
            
            if (response.data.success) {
                toast.success('Feedback deleted successfully');
                fetchFeedbacks();
                setShowDetailsModal(false);
            } else {
                toast.error(response.data.message || 'Error deleting feedback');
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            toast.error(error.response?.data?.message || 'Error deleting feedback');
        }
    };

    const handleSendReply = async (feedbackId) => {
        if (!replyText.trim()) {
            toast.error('Please enter a reply');
            return;
        }

        setSendingReply(true);
        try {
            const response = await axiosSecure.post(`/admin/feedback-reply/${feedbackId}`, {
                reply: replyText,
                adminEmail: user.email
            });

            if (response.data.success) {
                toast.success('Reply sent successfully');
                setReplyText('');
                fetchFeedbacks();
                setShowDetailsModal(false);
            } else {
                toast.error(response.data.message || 'Error sending reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error(error.response?.data?.message || 'Error sending reply');
        } finally {
            setSendingReply(false);
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

    const filteredFeedbacks = feedbacks.filter(feedback => {
        if (filterStatus === 'all') return true;
        return feedback.status === filterStatus;
    });

    if (loading) {
        return <LoveLoader/>
    }

    return (
        <div className="min-h-screen bg-base-100 py-4 sm:py-6 lg:py-8 rounded-3xl">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <BackButton label={t('common.back')} />
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        {t('feedbackManagement.title') || 'Feedback & Bug Reports'}
                    </h1>
                    <p className="text-neutral/70 mt-2">{t('feedbackManagement.subtitle') || 'Manage user feedback and bug reports'}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-base-200 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral/70 text-sm">{t('feedbackManagement.totalFeedbacks')}</p>
                                <p className="text-2xl font-bold text-neutral">{feedbacks.length}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div className="bg-base-200 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral/70 text-sm">{t('feedbackManagement.pending')}</p>
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
                                <p className="text-neutral/70 text-sm">{t('feedbackManagement.resolved')}</p>
                                <p className="text-2xl font-bold text-success">
                                    {feedbacks.filter(f => f.status === 'resolved').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            filterStatus === 'all' ? 'bg-primary text-white' : 'bg-base-200 text-neutral hover:bg-base-300'
                        }`}
                    >
                        {t('feedbackManagement.all')} ({feedbacks.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            filterStatus === 'pending' ? 'bg-warning text-white' : 'bg-base-200 text-neutral hover:bg-base-300'
                        }`}
                    >
                        {t('feedbackManagement.pending')} ({feedbacks.filter(f => f.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('resolved')}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            filterStatus === 'resolved' ? 'bg-success text-white' : 'bg-base-200 text-neutral hover:bg-base-300'
                        }`}
                    >
                        {t('feedbackManagement.resolved')} ({feedbacks.filter(f => f.status === 'resolved').length})
                    </button>
                </div>

                {/* Feedbacks List */}
                {filteredFeedbacks.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral mb-2">{t('feedbackManagement.noFeedbacks')}</h3>
                        <p className="text-neutral/70">{t('feedbackManagement.noFeedbacksDesc')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredFeedbacks.map((feedback) => (
                            <div key={feedback._id} className="bg-base-200 p-4 sm:p-6 rounded-2xl shadow-lg">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                                                {feedback.userPhoto ? (
                                                    <img src={feedback.userPhoto} alt={feedback.userName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <MessageSquare className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-neutral">{feedback.userName}</p>
                                                <p className="text-xs text-neutral/70">{feedback.userEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(feedback.type)}`}>
                                                {getTypeLabel(feedback.type)}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                feedback.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                                            }`}>
                                                {feedback.status === 'pending' ? '⏳ ' + t('feedbackManagement.pending') : '✅ ' + t('feedbackManagement.resolved')}
                                            </span>
                                            {feedback.hasReply && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-info/20 text-info">
                                                    💬 {t('feedbackManagement.replied')}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-neutral/80 text-sm mb-2 line-clamp-2">{feedback.description}</p>
                                        <p className="text-xs text-neutral/50">{t('feedbackManagement.submitted')}: {formatDate(feedback.submittedAt)}</p>
                                    </div>

                                    <div className="flex sm:flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedFeedback(feedback);
                                                setShowDetailsModal(true);
                                            }}
                                            className="flex-1 sm:flex-none bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {t('feedbackManagement.view')}
                                        </button>
                                        {feedback.status === 'pending' && (
                                            <button
                                                onClick={() => handleStatusUpdate(feedback._id, 'resolved')}
                                                className="flex-1 sm:flex-none bg-success text-white px-4 py-2 rounded-xl font-semibold hover:bg-success/90 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                {t('feedbackManagement.resolve')}
                                            </button>
                                        )}
                                    </div>
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
                            <h2 className="text-xl font-bold text-neutral">{t('feedbackManagement.details')}</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-base-300 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-6 p-4 bg-base-100 rounded-xl">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                                {selectedFeedback.userPhoto ? (
                                    <img src={selectedFeedback.userPhoto} alt={selectedFeedback.userName} className="w-full h-full object-cover" />
                                ) : (
                                    <MessageSquare className="w-6 h-6 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-neutral">{selectedFeedback.userName}</p>
                                <p className="text-sm text-neutral/70">{selectedFeedback.userEmail}</p>
                            </div>
                        </div>

                        {/* Type & Status */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedFeedback.type)}`}>
                                {getTypeLabel(selectedFeedback.type)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedFeedback.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                            }`}>
                                {selectedFeedback.status === 'pending' ? '⏳ ' + t('feedbackManagement.pending') : '✅ ' + t('feedbackManagement.resolved')}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-neutral mb-2">{t('feedbackManagement.description')}</h3>
                            <p className="text-neutral/80 bg-base-100 p-4 rounded-xl whitespace-pre-wrap">{selectedFeedback.description}</p>
                        </div>

                        {/* Screenshot */}
                        {selectedFeedback.screenshot && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-neutral mb-2">{t('feedbackManagement.screenshot')}</h3>
                                <img
                                    src={selectedFeedback.screenshot}
                                    alt="Screenshot"
                                    className="w-full rounded-xl border-2 border-base-300"
                                />
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="mb-6 p-4 bg-base-100 rounded-xl space-y-2 text-sm">
                            <p><span className="font-medium">{t('feedbackManagement.submitted')}:</span> {formatDate(selectedFeedback.submittedAt)}</p>
                            {selectedFeedback.resolvedAt && (
                                <>
                                    <p><span className="font-medium">{t('feedbackManagement.resolvedAt')}:</span> {formatDate(selectedFeedback.resolvedAt)}</p>
                                    <p><span className="font-medium">{t('feedbackManagement.resolvedBy')}:</span> {selectedFeedback.resolvedBy}</p>
                                </>
                            )}
                        </div>

                        {/* Admin Reply Section */}
                        {selectedFeedback.hasReply && selectedFeedback.adminReply && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-neutral mb-2">{t('feedbackManagement.adminReply')}</h3>
                                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-xl">
                                    <p className="text-neutral/80 whitespace-pre-wrap">{selectedFeedback.adminReply}</p>
                                    <p className="text-xs text-neutral/50 mt-2">{t('feedbackManagement.replied')}: {formatDate(selectedFeedback.repliedAt)}</p>
                                </div>
                            </div>
                        )}

                        {/* Reply Input (if not replied yet) */}
                        {!selectedFeedback.hasReply && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-neutral mb-2">{t('feedbackManagement.sendReplyToUser')}</h3>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={t('feedbackManagement.typeReply')}
                                    className="w-full p-4 bg-base-100 rounded-xl border-2 border-base-300 focus:border-primary focus:outline-none min-h-[120px] resize-none"
                                />
                                <button
                                    onClick={() => handleSendReply(selectedFeedback._id)}
                                    disabled={sendingReply || !replyText.trim()}
                                    className="mt-3 w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingReply ? t('feedbackManagement.sending') : t('feedbackManagement.sendReply')}
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            {selectedFeedback.status === 'pending' && (
                                <button
                                    onClick={() => handleStatusUpdate(selectedFeedback._id, 'resolved')}
                                    className="flex-1 bg-success text-white py-3 rounded-xl font-semibold hover:bg-success/90 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {t('feedbackManagement.markAsResolved')}
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(selectedFeedback._id)}
                                className="flex-1 bg-error text-white py-3 rounded-xl font-semibold hover:bg-error/90 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackManagement;
