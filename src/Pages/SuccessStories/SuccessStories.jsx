import { useState, useEffect } from 'react';
import { Quote, Heart, Calendar, MapPin, X, Eye } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import UseAxiosPublic from '../../Hooks/UseAxiosPublic';
import toast from 'react-hot-toast';
import i18n from '../../i18n/i18n';

const SuccessStories = () => {
    const { t } = useTranslation();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const axiosPublic = UseAxiosPublic();

    useEffect(() => {
        fetchSuccessStories();
    }, []);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showModal) {
                closeModal();
            }
        };
        
        if (showModal) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    const fetchSuccessStories = async () => {
        setLoading(true);
        try {
            const response = await axiosPublic.get('/success-stories');
            if (response.data.success) {
                setStories(response.data.stories);
            }
        } catch (error) {
            console.error('Error fetching success stories:', error);
            toast.error(t('successStories.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const locale = i18n.language === 'bn' ? 'bn-BD' : 'en-US';
        return date.toLocaleDateString(locale);
    };

    const openModal = (story) => {
        setSelectedStory(story);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedStory(null);
        setShowModal(false);
    };

    // Close modal when clicking backdrop
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    if (loading) {
        return (
            <section className="py-12 sm:py-16 lg:py-24 bg-base-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70 text-sm sm:text-base">{t('successStories.loading')}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 sm:py-16 lg:py-24 bg-base-100 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header - Mobile Optimized */}
                <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm tracking-wider uppercase">
                        <Heart size={14} className="fill-current sm:w-4 sm:h-4" />
                        {t('successStories.badge')}
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral leading-tight px-4">
                        {t('successStories.title')} <br /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            {t('successStories.subtitle')}
                        </span>
                    </h2>
                    <p className="text-base-content/60 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg italic px-4">
                        "{t('successStories.description')}"
                    </p>
                </div>

                {/* Stories Grid - Mobile First: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
                {stories.length === 0 ? (
                    <div className="text-center py-12 sm:py-20 px-4">
                        <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-neutral/20 mx-auto mb-4 sm:mb-6" />
                        <h3 className="text-xl sm:text-2xl font-bold text-neutral mb-3 sm:mb-4">{t('successStories.noStories')}</h3>
                        <p className="text-neutral/60 mb-6 sm:mb-8 text-sm sm:text-base">{t('successStories.noStoriesDesc')}</p>
                        <Link to="/auth/register" className="btn btn-primary rounded-full px-6 sm:px-8 text-sm sm:text-base">
                            {t('successStories.startYourStory')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {stories.map((story) => (
                            <div 
                                key={story._id} 
                                className="group relative bg-base-100 rounded-3xl sm:rounded-[2.5rem] border border-base-200 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                            >
                                {/* Image Container - Fixed Height */}
                                <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden flex-shrink-0">
                                    {story.image ? (
                                        <img 
                                            src={story.image} 
                                            alt={story.coupleName} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl sm:text-8xl"
                                        style={{ display: story.image ? 'none' : 'flex' }}
                                    >
                                        💕
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    
                                    {/* Overlay Content */}
                                    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
                                        <h3 className="text-xl sm:text-2xl font-bold mb-1 line-clamp-2">{story.coupleName}</h3>
                                        {story.location && (
                                            <p className="text-xs sm:text-sm opacity-90 flex items-center gap-1 sm:gap-2">
                                                <MapPin size={12} className="text-primary flex-shrink-0 sm:w-3.5 sm:h-3.5" /> 
                                                <span className="truncate">{story.location}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Story Content - Flexible Height */}
                                <div className="p-5 sm:p-6 lg:p-8 relative flex flex-col flex-grow">
                                    <div className="absolute -top-8 sm:-top-10 right-6 sm:right-8 w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center text-white border-4 sm:border-8 border-base-100 shadow-xl">
                                        <Quote size={24} className="sm:w-8 sm:h-8" />
                                    </div>
                                    
                                    <div className="flex gap-2 mb-3 sm:mb-4 flex-wrap">
                                        {story.weddingDate && (
                                            <span className="badge badge-ghost text-xs opacity-60 flex gap-1 items-center">
                                                <Calendar size={10} className="sm:w-3 sm:h-3" /> 
                                                <span className="text-xs">{formatDate(story.weddingDate)}</span>
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-base-content/70 leading-relaxed mb-4 sm:mb-6 italic line-clamp-4 text-sm sm:text-base flex-grow">
                                        "{story.story.length > 150 ? story.story.substring(0, 150) + '...' : story.story}"
                                    </p>

                                    <div className="pt-4 sm:pt-6 border-t border-base-200 mt-auto">
                                        <button 
                                            onClick={() => openModal(story)}
                                            className="text-primary font-bold hover:underline flex items-center gap-2 group-hover:gap-3 transition-all text-sm sm:text-base"
                                        >
                                            <Eye size={14} className="sm:w-4 sm:h-4" />
                                            {t('successStories.readFullStory')} <span className="text-lg sm:text-xl">→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to Action - Mobile Optimized */}
                <div className="mt-12 sm:mt-20 text-center bg-gradient-to-br from-primary to-secondary p-8 sm:p-12 rounded-3xl sm:rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                         <Heart size={200} className="sm:w-[300px] sm:h-[300px]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 relative z-10">{t('successStories.ctaTitle')}</h3>
                    <p className="mb-6 sm:mb-8 opacity-90 max-w-xl mx-auto text-sm sm:text-base relative z-10">{t('successStories.ctaDescription')}</p>
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 relative z-10">
                        <Link to="/auth/register" className="btn bg-white text-primary border-none hover:bg-base-200 px-6 sm:px-8 rounded-full font-black text-sm sm:text-base">
                            {t('successStories.ctaButton')}
                        </Link>
                    </div>
                </div>

                {/* Modal for Full Story - Fully Responsive */}
                {showModal && selectedStory && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 lg:p-6"
                        onClick={handleBackdropClick}
                    >
                        <div className="bg-base-100 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                            {/* Modal Header - Sticky with Close Button */}
                            <div className="sticky top-0 bg-base-100 p-4 sm:p-6 border-b border-base-200 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl z-50 flex-shrink-0">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 pr-2">
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral truncate">{selectedStory.coupleName}</h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="btn btn-ghost btn-sm sm:btn-md btn-circle flex-shrink-0 hover:bg-error/10 hover:text-error transition-colors min-h-[44px] min-w-[44px]"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                                {/* Story Image */}
                                {selectedStory.image && (
                                    <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden">
                                        <img 
                                            src={selectedStory.image} 
                                            alt={selectedStory.coupleName}
                                            className="w-full h-48 sm:h-64 md:h-80 object-cover"
                                        />
                                    </div>
                                )}

                                {/* Story Details */}
                                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-neutral/70">
                                        {selectedStory.weddingDate && (
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                                <span>{t('successStories.weddingDate')}: {formatDate(selectedStory.weddingDate)}</span>
                                            </div>
                                        )}
                                        {selectedStory.location && (
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                                <span>{t('successStories.location')}: {selectedStory.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Full Story */}
                                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                                    <div className="bg-base-200/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-l-4 border-primary">
                                        <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-3 sm:mb-4" />
                                        <p className="text-neutral leading-relaxed text-sm sm:text-base lg:text-lg italic whitespace-pre-line">
                                            "{selectedStory.story}"
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-base-200 text-center">
                                    <p className="text-neutral/60 text-xs sm:text-sm mb-3 sm:mb-4">
                                        {t('successStories.lookingForPartner')}
                                    </p>
                                    <Link 
                                        to="/dashboard/biodata-form" 
                                        className="btn btn-primary rounded-full px-6 sm:px-8 text-sm sm:text-base"
                                        onClick={closeModal}
                                    >
                                        {t('successStories.joinToday')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SuccessStories;