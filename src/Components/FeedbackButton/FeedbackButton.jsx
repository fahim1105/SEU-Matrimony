import { useState } from 'react';
import { MessageSquare, X, Send, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import UseAuth from '../../Hooks/UseAuth';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackButton = () => {
    const { t } = useTranslation();
    const { user } = UseAuth();
    const axiosSecure = UseAxiosSecure();
    const navigate = useNavigate();
    
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'general',
        description: '',
        screenshot: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    const handleOpenModal = () => {
        if (!user) {
            toast.error(t('feedback.loginRequired') || 'Please login to submit feedback');
            setTimeout(() => {
                navigate('/auth/login');
            }, 1000);
            return;
        }
        setIsOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error(t('feedback.invalidFileType') || 'Please select an image file (JPG/PNG)');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error(t('feedback.fileTooLarge') || 'File size must be less than 2MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setFormData(prev => ({ ...prev, screenshot: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            toast.error(t('feedback.descriptionRequired') || 'Please provide a description');
            return;
        }

        setLoading(true);
        const toastId = toast.loading(t('feedback.submitting') || 'Submitting feedback...');

        try {
            const response = await axiosSecure.post('/submit-feedback', {
                userEmail: user.email,
                type: formData.type,
                description: formData.description,
                screenshot: formData.screenshot,
                submittedAt: new Date()
            });

            if (response.data.success) {
                toast.success(t('feedback.submitSuccess') || 'Feedback submitted successfully!', { id: toastId });
                
                // Reset form
                setFormData({
                    type: 'general',
                    description: '',
                    screenshot: null
                });
                setImagePreview(null);
                setIsOpen(false);
            } else {
                toast.error(response.data.message || t('feedback.submitError'), { id: toastId });
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            const message = error.response?.data?.message || t('feedback.submitError') || 'Error submitting feedback';
            toast.error(message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                onClick={handleOpenModal}
                className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-primary/90 transition-all z-40 hover:scale-110"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={t('feedback.title') || 'Feedback & Bug Report'}
            >
                <MessageSquare className="w-6 h-6" />
            </motion.button>

            {/* Feedback Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-200 rounded-2xl sm:rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-neutral flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    {t('feedback.title') || 'Feedback & Bug Report'}
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-base-300 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Feedback Type */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral mb-2">
                                        {t('feedback.type') || 'Feedback Type'}
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        <option value="general">{t('feedback.general') || 'General Feedback'}</option>
                                        <option value="bug">{t('feedback.bug') || 'Bug Report'}</option>
                                        <option value="feature">{t('feedback.feature') || 'Feature Request'}</option>
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral mb-2">
                                        {t('feedback.description') || 'Description'} <span className="text-error">*</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder={t('feedback.descriptionPlaceholder') || 'Please describe your feedback or issue in detail...'}
                                        className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                        rows="5"
                                        required
                                    />
                                </div>

                                {/* Screenshot Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral mb-2">
                                        {t('feedback.screenshot') || 'Screenshot (Optional)'}
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="screenshot-upload"
                                        />
                                        <label
                                            htmlFor="screenshot-upload"
                                            className="flex items-center justify-center gap-2 w-full p-4 bg-base-100 border-2 border-dashed border-base-300 rounded-xl hover:border-primary hover:bg-base-100/50 transition-all cursor-pointer"
                                        >
                                            <Upload className="w-5 h-5 text-primary" />
                                            <span className="text-sm text-neutral/70">
                                                {t('feedback.uploadImage') || 'Click to upload image (Max 2MB)'}
                                            </span>
                                        </label>

                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        setFormData(prev => ({ ...prev, screenshot: null }));
                                                    }}
                                                    className="absolute top-2 right-2 bg-error text-white p-1.5 rounded-lg hover:bg-error/90 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info Note */}
                                <div className="p-3 bg-info/10 border border-info/20 rounded-xl">
                                    <p className="text-info text-xs">
                                        💡 {t('feedback.note') || 'Your feedback helps us improve the platform. Thank you!'}
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 bg-base-300 text-neutral py-3 rounded-xl font-semibold hover:bg-base-100 transition-all"
                                        disabled={loading}
                                    >
                                        {t('common.cancel') || 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {t('feedback.submitting') || 'Submitting...'}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                {t('feedback.submit') || 'Submit'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FeedbackButton;
