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

    if (loading) {
        return (
            <section className="py-24 bg-base-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">{t('successStories.loading')}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-base-100 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wider uppercase">
                        <Heart size={16} className="fill-current" />
                        {t('successStories.badge')}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-neutral leading-tight">
                        {t('successStories.title')} <br /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            {t('successStories.subtitle')}
                        </span>
                    </h2>
                    <p className="text-base-content/60 max-w-2xl mx-auto text-lg italic">
                        "{t('successStories.description')}"
                    </p>
                </div>

                {/* Stories Grid */}
                {stories.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="w-20 h-20 text-neutral/20 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-neutral mb-4">{t('successStories.noStories')}</h3>
                        <p className="text-neutral/60 mb-8">{t('successStories.noStoriesDesc')}</p>
                        <Link to="/auth/register" className="btn btn-primary rounded-full px-8">
                            {t('successStories.startYourStory')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {stories.map((story) => (
                            <div key={story._id} className="group relative bg-base-100 rounded-[2.5rem] border border-base-200 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                                {/* Image Container */}
                                <div className="relative h-[400px] overflow-hidden">
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
                                        className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-8xl"
                                        style={{ display: story.image ? 'none' : 'flex' }}
                                    >
                                        💕
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    
                                    {/* Overlay Content */}
                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <h3 className="text-2xl font-bold">{story.coupleName}</h3>
                                        {story.location && (
                                            <p className="text-sm opacity-90 flex items-center gap-2">
                                                <MapPin size={14} className="text-primary" /> {story.location}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Story Content */}
                                <div className="p-8 relative">
                                    <div className="absolute -top-10 right-8 w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white border-8 border-base-100 shadow-xl">
                                        <Quote size={32} />
                                    </div>
                                    
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {story.weddingDate && (
                                            <span className="badge badge-ghost text-xs opacity-60 flex gap-1 items-center">
                                                <Calendar size={12} /> {formatDate(story.weddingDate)}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-base-content/70 leading-relaxed mb-6 italic line-clamp-4">
                                        "{story.story.length > 150 ? story.story.substring(0, 150) + '...' : story.story}"
                                    </p>

                                    <div className="pt-6 border-t border-base-200">
                                        <button 
                                            onClick={() => openModal(story)}
                                            className="text-primary font-bold hover:underline flex items-center gap-2 group-hover:gap-3 transition-all"
                                        >
                                            <Eye size={16} />
                                            {t('successStories.readFullStory')} <span className="text-xl">→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                <div className="mt-20 text-center bg-gradient-to-br from-primary to-secondary p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                         <Heart size={300} />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">{t('successStories.ctaTitle')}</h3>
                    <p className="mb-8 opacity-90 max-w-xl mx-auto">{t('successStories.ctaDescription')}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/auth/register" className="btn bg-white text-primary border-none hover:bg-base-200 px-8 rounded-full font-black">
                            {t('successStories.ctaButton')}
                        </Link>
                    </div>
                </div>

                {/* Modal for Full Story */}
                {showModal && selectedStory && (
                    <div className="fixed inset-0 bg-black/50 flex lg:mt-16 items-center justify-center z-50 p-4">
                        <div className="bg-base-100 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-base-100 p-6 border-b border-base-200 flex items-center justify-between rounded-t-3xl">
                                <div className="flex items-center gap-3">
                                    <Heart className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-neutral">{selectedStory.coupleName}</h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="btn btn-ghost btn-circle"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {/* Story Image */}
                                {selectedStory.image && (
                                    <div className="mb-6 rounded-2xl overflow-hidden">
                                        <img 
                                            src={selectedStory.image} 
                                            alt={selectedStory.coupleName}
                                            className="w-full h-64 md:h-80 object-cover"
                                        />
                                    </div>
                                )}

                                {/* Story Details */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex flex-wrap gap-4 text-sm text-neutral/70">
                                        {selectedStory.weddingDate && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span>{t('successStories.weddingDate')}: {formatDate(selectedStory.weddingDate)}</span>
                                            </div>
                                        )}
                                        {selectedStory.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span>{t('successStories.location')}: {selectedStory.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Full Story */}
                                <div className="prose prose-lg max-w-none">
                                    <div className="bg-base-200/50 p-6 rounded-2xl border-l-4 border-primary">
                                        <Quote className="w-8 h-8 text-primary mb-4" />
                                        <p className="text-neutral leading-relaxed text-lg italic whitespace-pre-line">
                                            "{selectedStory.story}"
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="mt-8 pt-6 border-t border-base-200 text-center">
                                    <p className="text-neutral/60 text-sm mb-4">
                                        {t('successStories.lookingForPartner')}
                                    </p>
                                    <Link 
                                        to="/dashboard/biodata-form" 
                                        className="btn btn-primary rounded-full px-8"
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