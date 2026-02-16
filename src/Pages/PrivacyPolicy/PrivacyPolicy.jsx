import { Shield, Lock, Eye, UserCheck, Database, Bell, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    const sections = [
        {
            icon: Database,
            title: t('privacyPolicy.sections.infoCollect.title'),
            content: [
                {
                    subtitle: t('privacyPolicy.sections.infoCollect.personal'),
                    items: [
                        t('privacyPolicy.sections.infoCollect.personalItems.item1'),
                        t('privacyPolicy.sections.infoCollect.personalItems.item2'),
                        t('privacyPolicy.sections.infoCollect.personalItems.item3'),
                        t('privacyPolicy.sections.infoCollect.personalItems.item4'),
                        t('privacyPolicy.sections.infoCollect.personalItems.item5'),
                        t('privacyPolicy.sections.infoCollect.personalItems.item6'),
                        t('privacyPolicy.sections.infoCollect.personalItems.item7'),
                        t('privacyPolicy.sections.infoCollect.personalItems.item8')
                    ]
                },
                {
                    subtitle: t('privacyPolicy.sections.infoCollect.usage'),
                    items: [
                        t('privacyPolicy.sections.infoCollect.usageItems.item1'),
                        t('privacyPolicy.sections.infoCollect.usageItems.item2'),
                        t('privacyPolicy.sections.infoCollect.usageItems.item3'),
                        t('privacyPolicy.sections.infoCollect.usageItems.item4'),
                        t('privacyPolicy.sections.infoCollect.usageItems.item5'),
                        t('privacyPolicy.sections.infoCollect.usageItems.item6')
                    ]
                }
            ]
        },
        {
            icon: Lock,
            title: t('privacyPolicy.sections.howWeUse.title'),
            content: [
                {
                    subtitle: t('privacyPolicy.sections.howWeUse.primary'),
                    items: [
                        t('privacyPolicy.sections.howWeUse.items.item1'),
                        t('privacyPolicy.sections.howWeUse.items.item2'),
                        t('privacyPolicy.sections.howWeUse.items.item3'),
                        t('privacyPolicy.sections.howWeUse.items.item4'),
                        t('privacyPolicy.sections.howWeUse.items.item5'),
                        t('privacyPolicy.sections.howWeUse.items.item6'),
                        t('privacyPolicy.sections.howWeUse.items.item7')
                    ]
                }
            ]
        },
        {
            icon: Eye,
            title: t('privacyPolicy.sections.sharing.title'),
            content: [
                {
                    subtitle: t('privacyPolicy.sections.sharing.whoCanSee'),
                    items: [
                        t('privacyPolicy.sections.sharing.whoCanSeeItems.item1'),
                        t('privacyPolicy.sections.sharing.whoCanSeeItems.item2'),
                        t('privacyPolicy.sections.sharing.whoCanSeeItems.item3'),
                        t('privacyPolicy.sections.sharing.whoCanSeeItems.item4'),
                        t('privacyPolicy.sections.sharing.whoCanSeeItems.item5')
                    ]
                },
                {
                    subtitle: t('privacyPolicy.sections.sharing.legal'),
                    items: [
                        t('privacyPolicy.sections.sharing.legalItems.item1'),
                        t('privacyPolicy.sections.sharing.legalItems.item2'),
                        t('privacyPolicy.sections.sharing.legalItems.item3')
                    ]
                }
            ]
        },
        {
            icon: Shield,
            title: t('privacyPolicy.sections.security.title'),
            content: [
                {
                    subtitle: t('privacyPolicy.sections.security.measures'),
                    items: [
                        t('privacyPolicy.sections.security.measuresItems.item1'),
                        t('privacyPolicy.sections.security.measuresItems.item2'),
                        t('privacyPolicy.sections.security.measuresItems.item3'),
                        t('privacyPolicy.sections.security.measuresItems.item4'),
                        t('privacyPolicy.sections.security.measuresItems.item5'),
                        t('privacyPolicy.sections.security.measuresItems.item6'),
                        t('privacyPolicy.sections.security.measuresItems.item7')
                    ]
                },
                {
                    subtitle: t('privacyPolicy.sections.security.responsibility'),
                    items: [
                        t('privacyPolicy.sections.security.responsibilityItems.item1'),
                        t('privacyPolicy.sections.security.responsibilityItems.item2'),
                        t('privacyPolicy.sections.security.responsibilityItems.item3'),
                        t('privacyPolicy.sections.security.responsibilityItems.item4')
                    ]
                }
            ]
        },
        {
            icon: UserCheck,
            title: t('privacyPolicy.sections.rights.title'),
            content: [
                {
                    subtitle: t('privacyPolicy.sections.rights.youHaveRight'),
                    items: [
                        t('privacyPolicy.sections.rights.items.item1'),
                        t('privacyPolicy.sections.rights.items.item2'),
                        t('privacyPolicy.sections.rights.items.item3'),
                        t('privacyPolicy.sections.rights.items.item4'),
                        t('privacyPolicy.sections.rights.items.item5'),
                        t('privacyPolicy.sections.rights.items.item6'),
                        t('privacyPolicy.sections.rights.items.item7')
                    ]
                }
            ]
        },
        {
            icon: Bell,
            title: t('privacyPolicy.sections.cookies.title'),
            content: [
                {
                    subtitle: t('privacyPolicy.sections.cookies.whatWeTrack'),
                    items: [
                        t('privacyPolicy.sections.cookies.items.item1'),
                        t('privacyPolicy.sections.cookies.items.item2'),
                        t('privacyPolicy.sections.cookies.items.item3'),
                        t('privacyPolicy.sections.cookies.items.item4'),
                        t('privacyPolicy.sections.cookies.items.item5')
                    ]
                }
            ]
        },
        {
            icon: Mail,
            title: t('privacyPolicy.sections.communications.title'),
            content: [
                {
                    subtitle: t('privacyPolicy.sections.communications.contactFor'),
                    items: [
                        t('privacyPolicy.sections.communications.items.item1'),
                        t('privacyPolicy.sections.communications.items.item2'),
                        t('privacyPolicy.sections.communications.items.item3'),
                        t('privacyPolicy.sections.communications.items.item4'),
                        t('privacyPolicy.sections.communications.items.item5'),
                        t('privacyPolicy.sections.communications.items.item6')
                    ]
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-base-100 py-25 md:py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-primary/10 text-primary font-bold text-sm sm:text-base tracking-wider uppercase mb-4 sm:mb-6">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        {t('privacyPolicy.title')}
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral mb-4 sm:mb-6">
                        Your Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Matters</span>
                    </h1>
                    <p className="text-base-content/70 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
                        {t('privacyPolicy.subtitle')}
                    </p>
                    <p className="text-base-content/60 mt-4 text-xs sm:text-sm">
                        {t('privacyPolicy.lastUpdated')}: February 16, 2026
                    </p>
                </div>

                {/* Important Notice */}
                <div className="bg-info/10 border-l-4 border-info p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-8 sm:mb-12">
                    <div className="flex gap-3 sm:gap-4">
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-info flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-neutral mb-2 text-sm sm:text-base">{t('privacyPolicy.importantNotice')}</h3>
                            <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed">
                                {t('privacyPolicy.noticeText')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Privacy Sections */}
                <div className="space-y-6 sm:space-y-8">
                    {sections.map((section, index) => (
                        <div key={index} className="bg-base-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="bg-primary/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex-shrink-0">
                                    <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl sm:text-2xl font-bold text-neutral">{section.title}</h2>
                                </div>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                {section.content.map((subsection, subIndex) => (
                                    <div key={subIndex}>
                                        {subsection.subtitle && (
                                            <h3 className="font-semibold text-neutral mb-3 text-base sm:text-lg">
                                                {subsection.subtitle}
                                            </h3>
                                        )}
                                        <ul className="space-y-2 sm:space-y-3">
                                            {subsection.items.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-start gap-2 sm:gap-3 text-base-content/70 text-sm sm:text-base">
                                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0 mt-0.5" />
                                                    <span className="flex-1">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Data Retention */}
                <div className="bg-warning/10 border-l-4 border-warning p-4 sm:p-6 rounded-xl sm:rounded-2xl mt-8 sm:mt-12">
                    <div className="flex gap-3 sm:gap-4">
                        <Database className="w-5 h-5 sm:w-6 sm:h-6 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-neutral mb-2 text-sm sm:text-base">{t('privacyPolicy.dataRetention')}</h3>
                            <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed mb-3">
                                {t('privacyPolicy.dataRetentionText')}
                            </p>
                            <ul className="space-y-2 text-base-content/70 text-xs sm:text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-warning">•</span>
                                    <span>{t('privacyPolicy.dataRetentionItems.item1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning">•</span>
                                    <span>{t('privacyPolicy.dataRetentionItems.item2')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning">•</span>
                                    <span>{t('privacyPolicy.dataRetentionItems.item3')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Children's Privacy */}
                <div className="bg-error/10 border-l-4 border-error p-4 sm:p-6 rounded-xl sm:rounded-2xl mt-6 sm:mt-8">
                    <div className="flex gap-3 sm:gap-4">
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-error flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-neutral mb-2 text-sm sm:text-base">{t('privacyPolicy.ageRequirement')}</h3>
                            <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed">
                                {t('privacyPolicy.ageRequirementText')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Policy Changes */}
                <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mt-8 sm:mt-12">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral mb-4">{t('privacyPolicy.changes')}</h2>
                    <p className="text-base-content/70 mb-4 text-sm sm:text-base leading-relaxed">
                        {t('privacyPolicy.changesText')}
                    </p>
                    <ul className="space-y-2 text-base-content/70 mb-6 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{t('privacyPolicy.changesItems.item1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{t('privacyPolicy.changesItems.item2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{t('privacyPolicy.changesItems.item3')}</span>
                        </li>
                    </ul>
                    <p className="text-base-content/60 text-xs sm:text-sm">
                        {t('privacyPolicy.changesAcceptance')}
                    </p>
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

export default PrivacyPolicy;
