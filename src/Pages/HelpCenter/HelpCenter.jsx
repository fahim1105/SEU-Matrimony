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
            question: 'How do I create an account on SEU Matrimony?',
            answer: 'To create an account: 1) Click "Register" on the homepage, 2) Enter your SEU email address, 3) Create a strong password, 4) Verify your email through the link sent to your inbox, 5) Complete your profile with accurate information. Your profile will be reviewed by our admin team before approval.'
        },
        {
            category: 'getting-started',
            question: 'Who can join SEU Matrimony?',
            answer: 'SEU Matrimony is exclusively for current students and alumni of Southeast University. You must be at least 18 years old, have a valid SEU email address, and be genuinely interested in finding a marriage partner. All profiles are verified to ensure authenticity.'
        },
        {
            category: 'getting-started',
            question: 'How long does profile verification take?',
            answer: 'Profile verification typically takes 24-48 hours. Our admin team reviews each profile to ensure all information is accurate and meets our guidelines. You will receive an email notification once your profile is approved. If additional information is needed, we will contact you.'
        },
        {
            category: 'profile',
            question: 'What information should I include in my biodata?',
            answer: 'Your biodata should include: personal details (name, age, height, complexion), educational background (department, batch, student ID), family information, religious preferences, and a brief description about yourself and what you are looking for in a partner. Be honest and accurate - this helps in finding compatible matches.'
        },
        {
            category: 'profile',
            question: 'Can I edit my profile after it is approved?',
            answer: 'Yes, you can edit your profile anytime from the Dashboard > Biodata Form. However, significant changes may require re-verification by our admin team. Minor updates like adding photos or updating your description can be done instantly.'
        },
        {
            category: 'profile',
            question: 'What kind of photos should I upload?',
            answer: 'Upload recent, clear photos that show your face. Photos should be appropriate and modest. Avoid group photos, heavily filtered images, or photos with inappropriate backgrounds. You can upload multiple photos to give a better representation of yourself.'
        },
        {
            category: 'profile',
            question: 'How do I make my profile stand out?',
            answer: 'To make your profile attractive: 1) Upload clear, recent photos, 2) Write a genuine and detailed description, 3) Be specific about your preferences, 4) Keep your information up-to-date, 5) Be honest about your expectations, 6) Respond promptly to connection requests.'
        },
        {
            category: 'connections',
            question: 'How do I send a connection request?',
            answer: 'Browse profiles from the "Browse Matches" page. When you find someone interesting, click "Send Request" on their profile. They will receive a notification and can accept or decline. If accepted, you can exchange contact information and start communicating.'
        },
        {
            category: 'connections',
            question: 'What happens after a connection is accepted?',
            answer: 'Once your connection request is accepted, both parties can view each other\'s contact information (email, phone number if provided). You can then communicate directly through the platform\'s messaging system or exchange contact details for further communication.'
        },
        {
            category: 'connections',
            question: 'Can I cancel a connection request?',
            answer: 'Yes, you can cancel a pending connection request anytime before it is accepted. Go to "My Requests" in your dashboard and click "Cancel" next to the request. Once a request is accepted, you cannot cancel it, but you can remove the connection from your friends list.'
        },
        {
            category: 'connections',
            question: 'How many connection requests can I send?',
            answer: 'There is no strict limit on connection requests, but we encourage quality over quantity. Send requests only to profiles you are genuinely interested in. Sending too many requests without proper consideration may be flagged as spam.'
        },
        {
            category: 'connections',
            question: 'What if someone rejects my request?',
            answer: 'Rejection is a normal part of the process. Respect their decision and do not send repeated requests or try to contact them through other means. There are many other compatible profiles on the platform. Keep searching and stay positive!'
        },
        {
            category: 'safety',
            question: 'How does SEU Matrimony ensure my safety?',
            answer: 'We verify all profiles through SEU email addresses, have admin approval for all biodatas, monitor suspicious activities, provide reporting mechanisms, and never share your contact information without your consent. However, always exercise caution and follow our safety guidelines.'
        },
        {
            category: 'safety',
            question: 'What should I do if I encounter suspicious behavior?',
            answer: 'If you encounter any suspicious behavior, harassment, or fake profiles, immediately report it using the "Report" button on the profile or contact our support team. We take all reports seriously and will investigate promptly. Your safety is our priority.'
        },
        {
            category: 'safety',
            question: 'Should I share my personal information?',
            answer: 'Only share personal information (phone number, address) after you have established trust and are comfortable. Never share financial information or send money to anyone. Always meet in public places for first meetings and inform family or friends about your plans.'
        },
        {
            category: 'safety',
            question: 'How is my data protected?',
            answer: 'We use industry-standard encryption, secure HTTPS connections, Firebase Authentication, and regular security audits. Your data is stored securely and never sold to third parties. Read our Privacy Policy for detailed information about data protection.'
        },
        {
            category: 'safety',
            question: 'What are the safety tips for first meetings?',
            answer: 'For first meetings: 1) Always meet in public places, 2) Inform family or friends about your meeting, 3) Arrange your own transportation, 4) Do not share financial information, 5) Trust your instincts, 6) Keep initial meetings short, 7) Video call before meeting in person.'
        },
        {
            category: 'account',
            question: 'I forgot my password. How do I reset it?',
            answer: 'Click "Forgot Password" on the login page, enter your registered email address, and you will receive a password reset link. Follow the instructions in the email to create a new password. If you do not receive the email, check your spam folder or contact support.'
        },
        {
            category: 'account',
            question: 'How do I change my email address?',
            answer: 'Currently, email addresses cannot be changed as they are tied to your SEU verification. If you need to update your email due to graduation or other reasons, please contact our support team with your new SEU alumni email for assistance.'
        },
        {
            category: 'account',
            question: 'How do I delete my account?',
            answer: 'To delete your account: Go to Dashboard > Account Settings > Delete Account. This action is permanent and cannot be undone. All your data, including profile, messages, and connections, will be deleted within 30 days. Consider deactivating instead if you might return.'
        },
        {
            category: 'account',
            question: 'What is the difference between deactivating and deleting?',
            answer: 'Deactivating temporarily hides your profile and you can reactivate anytime by logging in. Deleting permanently removes all your data and cannot be undone. Choose deactivation if you need a break but might return, and deletion if you are sure you want to leave permanently.'
        },
        {
            category: 'account',
            question: 'Why was my account suspended?',
            answer: 'Accounts may be suspended for violating our Terms of Service, such as fake information, harassment, inappropriate content, or suspicious activity. If your account was suspended, you should have received an email explaining the reason. Contact support if you believe this was a mistake.'
        },
        {
            category: 'account',
            question: 'I am not receiving email notifications. What should I do?',
            answer: 'Check your spam/junk folder first. Add support@seumatrimony.com to your contacts. Verify your email settings in Dashboard > Account Settings > Notifications. Ensure your email address is correct. If the issue persists, contact our support team.'
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
                        How Can We <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Help You?</span>
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
                                View Guidelines
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
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
