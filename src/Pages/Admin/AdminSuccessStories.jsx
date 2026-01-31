import { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Heart,
    Calendar,
    User,
    Save,
    X
} from 'lucide-react';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AdminSuccessStories = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [formData, setFormData] = useState({
        coupleName: '',
        weddingDate: '',
        story: '',
        image: '',
        location: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        fetchSuccessStories();
    }, []);

    const fetchSuccessStories = async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get('/admin/success-stories');
            if (response.data.success) {
                setStories(response.data.stories);
            }
        } catch (error) {
            console.error('Error fetching success stories:', error);
            toast.error('সাকসেস স্টোরি লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openModal = (story = null) => {
        if (story) {
            setEditingStory(story);
            setFormData({
                coupleName: story.coupleName || '',
                weddingDate: story.weddingDate || '',
                story: story.story || '',
                image: story.image || '',
                location: story.location || ''
            });
        } else {
            setEditingStory(null);
            setFormData({
                coupleName: '',
                weddingDate: '',
                story: '',
                image: '',
                location: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStory(null);
        setFormData({
            coupleName: '',
            weddingDate: '',
            story: '',
            image: '',
            location: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const storyData = {
                ...formData,
                createdAt: editingStory ? editingStory.createdAt : new Date(),
                updatedAt: new Date()
            };

            let response;
            if (editingStory) {
                // Update existing story
                response = await axiosSecure.put(`/admin/success-stories/${editingStory._id}`, storyData);
            } else {
                // Create new story
                response = await axiosSecure.post('/admin/success-stories', storyData);
            }

            if (response.data.success) {
                toast.success(editingStory ? 'সাকসেস স্টোরি আপডেট হয়েছে' : 'নতুন সাকসেস স্টোরি যোগ করা হয়েছে');
                fetchSuccessStories();
                closeModal();
            } else {
                toast.error(response.data.message || 'সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error saving success story:', error);
            toast.error('সাকসেস স্টোরি সেভ করতে সমস্যা হয়েছে');
        } finally {
            setSubmitting(false);
        }
    };

    // const handleDelete = async (storyId) => {
    //     if (!confirm('আপনি কি নিশ্চিত যে এই সাকসেস স্টোরি ডিলিট করতে চান?')) {
    //         return;
    //     }

    //     try {
    //         const response = await axiosSecure.delete(`/admin/success-stories/${storyId}`);
    //         if (response.data.success) {
    //             toast.success('সাকসেস স্টোরি ডিলিট হয়েছে');
    //             fetchSuccessStories();
    //         } else {
    //             toast.error(response.data.message || 'ডিলিট করতে সমস্যা হয়েছে');
    //         }
    //     } catch (error) {
    //         console.error('Error deleting success story:', error);
    //         toast.error('সাকসেস স্টোরি ডিলিট করতে সমস্যা হয়েছে');
    //     }
    // };

    const handleDelete = async (storyId) => {
        // সুইট অ্যালার্ট কনফার্মেশন বক্স
        Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "ডিলিট করলে এটি আর ফিরে পাওয়া যাবে না!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EC4899', // আপনার পছন্দের পিঙ্ক কালার
            cancelButtonColor: '#6B7280', // গ্রে কালার
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosSecure.delete(`/admin/success-stories/${storyId}`);

                    if (response.data.success) {
                        // ডিলিট সফল হলে সাকসেস মেসেজ
                        Swal.fire({
                            title: 'ডিলিট হয়েছে!',
                            text: 'সাকসেস স্টোরিটি সফলভাবে মুছে ফেলা হয়েছে।',
                            icon: 'success',
                            confirmButtonColor: '#EC4899'
                        });
                        fetchSuccessStories();
                    } else {
                        toast.error(response.data.message || 'ডিলিট করতে সমস্যা হয়েছে');
                    }
                } catch (error) {
                    console.error('Error deleting success story:', error);
                    toast.error('সার্ভারে সমস্যা হচ্ছে, আবার চেষ্টা করুন');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">সাকসেস স্টোরি লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <BackButton to="/dashboard" label="ড্যাশবোর্ডে ফিরে যান" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral flex items-center gap-2 sm:gap-3">
                                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                সাকসেস স্টোরি ম্যানেজমেন্ট
                            </h1>
                            <p className="text-neutral/70 mt-1 sm:mt-2 text-sm sm:text-base">সফল বিবাহের গল্প যোগ ও সম্পাদনা করুন</p>
                        </div>

                        <button
                            onClick={() => openModal()}
                            className="bg-primary text-base-100 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4" />
                            নতুন স্টোরি যোগ করুন
                        </button>
                    </div>
                </div>

                {/* Stories Grid */}
                {stories.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral mb-2">কোনো সাকসেস স্টোরি নেই</h3>
                        <p className="text-neutral/70 mb-4">প্রথম সাকসেস স্টোরি যোগ করুন</p>
                        <button
                            onClick={() => openModal()}
                            className="btn btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            স্টোরি যোগ করুন
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {stories.map((story) => (
                            <div key={story._id} className="bg-base-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                                {/* Story Image */}
                                <div className="h-48 sm:h-56 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                                    {story.image ? (
                                        <img
                                            src={story.image}
                                            alt={story.coupleName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-full h-full flex items-center justify-center text-6xl"
                                        style={{ display: story.image ? 'none' : 'flex' }}
                                    >
                                        💕
                                    </div>
                                </div>

                                {/* Story Content */}
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-neutral mb-2">{story.coupleName}</h3>

                                    <div className="space-y-2 mb-4">
                                        {story.weddingDate && (
                                            <div className="flex items-center gap-2 text-sm text-neutral/70">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(story.weddingDate).toLocaleDateString('bn-BD')}</span>
                                            </div>
                                        )}

                                        {story.location && (
                                            <div className="flex items-center gap-2 text-sm text-neutral/70">
                                                <User className="w-4 h-4" />
                                                <span>{story.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-neutral/70 text-sm mb-4 line-clamp-3">
                                        {story.story}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal(story)}
                                            className="flex-1 bg-base-100 text-neutral py-2 rounded-lg font-semibold hover:bg-base-300 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            সম্পাদনা
                                        </button>

                                        <button
                                            onClick={() => handleDelete(story._id)}
                                            className="flex-1 bg-error text-base-100 py-2 rounded-lg font-semibold hover:bg-error/90 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            ডিলিট
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-base-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral">
                                    {editingStory ? 'সাকসেস স্টোরি সম্পাদনা' : 'নতুন সাকসেস স্টোরি'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="btn btn-ghost btn-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                {/* Couple Name */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral mb-2">দম্পতির নাম *</label>
                                    <input
                                        type="text"
                                        name="coupleName"
                                        value={formData.coupleName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="যেমন: রহিম ও করিম"
                                    />
                                </div>

                                {/* Wedding Date */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral mb-2">বিবাহের তারিখ</label>
                                    <input
                                        type="date"
                                        name="weddingDate"
                                        value={formData.weddingDate}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral mb-2">স্থান</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="যেমন: ঢাকা, বাংলাদেশ"
                                    />
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral mb-2">ছবির লিংক</label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                {/* Story */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral mb-2">গল্প *</label>
                                    <textarea
                                        name="story"
                                        value={formData.story}
                                        onChange={handleInputChange}
                                        required
                                        rows="6"
                                        className="w-full p-3 bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                        placeholder="তাদের প্রেমের গল্প এবং বিবাহের অভিজ্ঞতা লিখুন..."
                                    />
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-primary text-base-100 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {submitting ? 'সেভ করা হচ্ছে...' : (editingStory ? 'আপডেট করুন' : 'সেভ করুন')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 bg-base-200 text-neutral py-3 rounded-xl font-semibold hover:bg-base-300 transition-all"
                                    >
                                        বাতিল
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSuccessStories;