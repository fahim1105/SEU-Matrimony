import { useState } from 'react';
import { 
    HelpCircle, 
    Search, 
    ChevronDown, 
    ChevronUp, 
    Mail, 
    MessageCircle, 
    BookOpen, 
    Shield, 
    UserPlus, 
    Heart, 
    Settings, 
    AlertCircle,
    CheckCircle,
    Phone,
    Clock,
    Send
} from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

const HelpCenter = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: t('helpCenter.categories.all'), icon: BookOpen },
        { id: 'profile', name: t('helpCenter.categories.profile'), icon: Settings },
        { id: 'connections', name: t('helpCenter.categories.connections'), icon: Heart },
        { id: 'safety', name: t('helpCenter.categories.safety'), icon: Shield },
        { id: 'account', name: t('helpCenter.categories.account'), icon: AlertCircle }
    ];

    const faqs = [
        {
            category: 'getting-started',
            question: t('helpCenter.faqs.createAccount.question'),
            answer: t('helpCenter.faqs.createAccount.answer')
        },
        {
            category: 'getting-started',
            question: t('helpCenter.faqs.whoCanJoin.question'),
            answer: t('helpCenter.faqs.whoCanJoin.answer')
        },
        {
            category: 'getting-started',
            question: t('helpCenter.faqs.verificationTime.question'),
            answer: t('helpCenter.faqs.verificationTime.answer')
        },
        {
            category: 'profile',
            question: t('helpCenter.faqs.biodataInfo.question'),
            answer: t('helpCenter.faqs.biodataInfo.answer')
        },
        {
            category: 'profile',
            question: t('helpCenter.faqs.editProfile.question'),
            answer: t('helpCenter.faqs.editProfile.answer')
        },
        {
            category: 'profile',
            question: t('helpCenter.faqs.photoUpload.question'),
            answer: t('helpCenter.faqs.photoUpload.answer')
        },
        {
            category: 'profile',
            question: t('helpCenter.faqs.standOut.question'),
            answer: t('helpCenter.faqs.standOut.answer')
        },
        {
            category: 'connections',
            question: t('helpCenter.faqs.sendRequest.question'),
            answer: t('helpCenter.faqs.sendRequest.answer')
        },
        {
            category: 'connections',
            question: t('helpCenter.faqs.afterAccepted.question'),
            answer: t('helpCenter.faqs.afterAccepted.answer')
        },
        {
            category: 'connections',
            question: t('helpCenter.faqs.cancelRequest.question'),
            answer: t('helpCenter.faqs.cancelRequest.answer')
        },
        {
            category: 'connections',
            question: t('helpCenter.faqs.requestLimit.question'),
            answer: t('helpCenter.faqs.requestLimit.answer')
        },
        {
            category: 'connections',
            question: t('helpCenter.faqs.rejection.question'),
            answer: t('helpCenter.faqs.rejection.answer')
        },
        {
            category: 'safety',
            question: t('helpCenter.faqs.safety.question'),
            answer: t('helpCenter.faqs.safety.answer')
        },
        {
            category: 'safety',
            question: t('helpCenter.faqs.suspicious.question'),
            answer: t('helpCenter.faqs.suspicious.answer')
        },
        {
            category: 'safety',
            question: t('helpCenter.faqs.personalInfo.question'),
            answer: t('helpCenter.faqs.personalInfo.answer')
        },
        {
            category: 'safety',
            question: t('helpCenter.faqs.dataProtection.question'),
            answer: t('helpCenter.faqs.dataProtection.answer')
        },
        {
            category: 'safety',
            question: t('helpCenter.faqs.firstMeeting.question'),
            answer: t('helpCenter.faqs.firstMeeting.answer')
        },
        {
            category: 'account',
            question: t('helpCenter.faqs.forgotPassword.question'),
            answer: t('helpCenter.faqs.forgotPassword.answer')
        },
        {
            category: 'account',
            question: t('helpCenter.faqs.changeEmail.question'),
            answer: t('helpCenter.faqs.changeEmail.answer')
        },
        {
            category: 'account',
            question: t('helpCenter.faqs.deleteAccount.question'),
            answer: t('helpCenter.faqs.deleteAccount.answer')
        },
        {
            category: 'account',
            question: t('helpCenter.faqs.deactivateVsDelete.question'),
            answer: t('helpCenter.faqs.deactivateVsDelete.answer')
        },
        {
            category: 'account',
            question: t('helpCenter.faqs.suspended.question'),
            answer: t('helpCenter.faqs.suspended.answer')
        },
        {
            category: 'account',
            question: t('helpCenter.faqs.noNotifications.question'),
            answer: t('helpCenter.faqs.noNotifications.answer')
        }
    ];

    const quickLinks = [
        {
            icon: Shield,
            title: t('helpCenter.quickLinksItems.safety.title'),
            description: t('helpCenter.quickLinksItems.safety.description'),
            link: '/guidelines'
        },
        {
            icon: BookOpen,
            title: t('helpCenter.quickLinksItems.privacy.title'),
            description: t('helpCenter.quickLinksItems.privacy.description'),
            link: '/privacy'
        },
        {
            icon: Settings,
            title: t('helpCenter.quickLinksItems.terms.title'),
            description: t('helpCenter.quickLinksItems.terms.description'),
            link: '/terms'
        }
    ];

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = searchTerm === '' || 
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-base-100 py-25 md:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-primary/10 text-primary font-bold text-sm sm:text-base tracking-wider uppercase mb-4 sm:mb-6">
                        <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        {t('helpCenter.title')}
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral mb-4 sm:mb-6">
                        {t('helpCenter.howCanWeHelp')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t('helpCenter.helpYou')}</span>
                    </h1>
                    <p className="text-base-content/70 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
                        {t('helpCenter.subtitle')}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
                    <div className="relative">
                        <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-neutral/50" />
                        <input
                            type="text"
                            placeholder={t('helpCenter.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 sm:py-5 bg-base-200 border-2 border-base-300 rounded-2xl sm:rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base lg:text-lg shadow-lg"
                        />
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
                    {quickLinks.map((link, index) => (
                        <Link 
                            key={index}
                            to={link.link}
                            className="bg-base-200 p-5 sm:p-6 rounded-2xl sm:rounded-3xl hover:shadow-xl transition-all group border border-base-300 hover:border-primary/30"
                        >
                            <div className="bg-primary/20 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                                <link.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                            </div>
                            <h3 className="font-bold text-neutral mb-2 text-sm sm:text-base group-hover:text-primary transition-colors">
                                {link.title}
                            </h3>
                            <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed">
                                {link.description}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Category Filter */}
                <div className="mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral mb-4 sm:mb-6">{t('helpCenter.browseByCat')}</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${
                                    selectedCategory === category.id
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-base-200 text-neutral hover:bg-base-300'
                                }`}
                            >
                                <category.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQs */}
                <div className="mb-12 sm:mb-16">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral mb-6 sm:mb-8">
                        {t('helpCenter.faqTitle')}
                        {searchTerm && (
                            <span className="text-base sm:text-lg font-normal text-base-content/70 ml-3">
                                ({filteredFaqs.length} {t('helpCenter.results')})
                            </span>
                        )}
                    </h2>

                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 bg-base-200 rounded-2xl sm:rounded-3xl">
                            <HelpCircle className="w-16 h-16 sm:w-20 sm:h-20 text-neutral/30 mx-auto mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-2">{t('helpCenter.noResults')}</h3>
                            <p className="text-base-content/70 text-sm sm:text-base">
                                {t('helpCenter.noResultsDesc')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {filteredFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-base-200 rounded-xl sm:rounded-2xl overflow-hidden border border-base-300 hover:border-primary/30 transition-all"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left hover:bg-base-300/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="font-semibold text-neutral text-sm sm:text-base lg:text-lg">
                                                {faq.question}
                                            </span>
                                        </div>
                                        {expandedFaq === index ? (
                                            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-neutral/50 flex-shrink-0" />
                                        )}
                                    </button>
                                    {expandedFaq === index && (
                                        <div className="px-5 sm:px-6 pb-4 sm:pb-5 pl-12 sm:pl-16">
                                            <p className="text-base-content/70 leading-relaxed text-sm sm:text-base">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact Support */}
                <div className="bg-gradient-to-br from-primary to-secondary p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl text-white">
                    <div className="text-center mb-8 sm:mb-10">
                        <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6" />
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('helpCenter.stillNeedHelp')}</h2>
                        <p className="opacity-90 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
                            {t('helpCenter.stillNeedHelpDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                        {/* Email Support */}
                        <div className="bg-white/10 backdrop-blur-sm p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-white/20">
                            <Mail className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4" />
                            <h3 className="font-bold mb-2 text-base sm:text-lg">{t('helpCenter.supportCards.email.title')}</h3>
                            <p className="text-white/80 mb-3 sm:mb-4 text-xs sm:text-sm">
                                {t('helpCenter.supportCards.email.description')}
                            </p>
                            <a 
                                href="mailto:support@seumatrimony.com"
                                className="text-white hover:underline font-semibold flex items-center gap-2 text-sm sm:text-base"
                            >
                                <Send className="w-4 h-4" />
                                {t('helpCenter.supportCards.email.action')}
                            </a>
                        </div>

                        {/* Phone Support */}
                        <div className="bg-white/10 backdrop-blur-sm p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-white/20">
                            <Phone className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4" />
                            <h3 className="font-bold mb-2 text-base sm:text-lg">{t('helpCenter.supportCards.phone.title')}</h3>
                            <p className="text-white/80 mb-3 sm:mb-4 text-xs sm:text-sm">
                                {t('helpCenter.supportCards.phone.description')}
                            </p>
                            <a 
                                href="tel:+8801234567890"
                                className="text-white hover:underline font-semibold flex items-center gap-2 text-sm sm:text-base"
                            >
                                <Phone className="w-4 h-4" />
                                +880 123 456 7890
                            </a>
                        </div>

                        {/* Support Hours */}
                        <div className="bg-white/10 backdrop-blur-sm p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-white/20">
                            <Clock className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4" />
                            <h3 className="font-bold mb-2 text-base sm:text-lg">{t('helpCenter.supportCards.hours.title')}</h3>
                            <p className="text-white/80 mb-2 text-xs sm:text-sm">
                                {t('helpCenter.supportCards.hours.days')}
                            </p>
                            <p className="text-white font-semibold text-sm sm:text-base">
                                {t('helpCenter.supportCards.hours.time')}
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-white/80 mb-4 text-xs sm:text-sm">
                            {t('helpCenter.avgResponse')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <a 
                                href="mailto:support@seumatrimony.com"
                                className="btn bg-white text-primary border-none hover:bg-base-200 px-6 sm:px-8 rounded-full font-bold text-sm sm:text-base"
                            >
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                {t('helpCenter.contactSupport')}
                            </a>
                            <Link 
                                to="/guidelines"
                                className="btn btn-outline border-white text-white hover:bg-white hover:text-primary px-6 sm:px-8 rounded-full font-bold text-sm sm:text-base"
                            >
                                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                                {t('helpCenter.viewGuidelines')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Additional Resources */}
                <div className="mt-12 sm:mt-16 bg-base-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral mb-6 sm:mb-8 text-center">{t('helpCenter.additionalResources')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <Link 
                            to="/success-stories"
                            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-base-100 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all group"
                        >
                            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:scale-110 transition-transform" />
                            <div>
                                <h3 className="font-bold text-neutral mb-1 text-sm sm:text-base">{t('helpCenter.resourceLinks.stories.title')}</h3>
                                <p className="text-base-content/70 text-xs sm:text-sm">{t('helpCenter.resourceLinks.stories.description')}</p>
                            </div>
                        </Link>

                        <Link 
                            to="/privacy"
                            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-base-100 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all group"
                        >
                            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:scale-110 transition-transform" />
                            <div>
                                <h3 className="font-bold text-neutral mb-1 text-sm sm:text-base">{t('helpCenter.resourceLinks.privacy.title')}</h3>
                                <p className="text-base-content/70 text-xs sm:text-sm">{t('helpCenter.resourceLinks.privacy.description')}</p>
                            </div>
                        </Link>

                        <Link 
                            to="/terms"
                            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-base-100 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all group"
                        >
                            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:scale-110 transition-transform" />
                            <div>
                                <h3 className="font-bold text-neutral mb-1 text-sm sm:text-base">{t('helpCenter.resourceLinks.terms.title')}</h3>
                                <p className="text-base-content/70 text-xs sm:text-sm">{t('helpCenter.resourceLinks.terms.description')}</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8 sm:mt-12">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm sm:text-base"
                    >
                        ← {t('helpCenter.backToHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
