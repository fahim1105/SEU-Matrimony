import { FileText, UserCheck, Shield, AlertTriangle, Ban, Scale, CheckCircle, XCircle, Mail, Users, Heart } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
    const { t } = useTranslation();

    const sections = [
        {
            icon: UserCheck,
            title: t('termsOfService.sections.eligibility.title'),
            content: [
                {
                    subtitle: t('termsOfService.sections.eligibility.whoCanUse'),
                    items: [
                        t('termsOfService.sections.eligibility.whoCanUseItems.item1'),
                        t('termsOfService.sections.eligibility.whoCanUseItems.item2'),
                        t('termsOfService.sections.eligibility.whoCanUseItems.item3'),
                        t('termsOfService.sections.eligibility.whoCanUseItems.item4'),
                        t('termsOfService.sections.eligibility.whoCanUseItems.item5'),
                        t('termsOfService.sections.eligibility.whoCanUseItems.item6')
                    ]
                },
                {
                    subtitle: t('termsOfService.sections.eligibility.responsibilities'),
                    items: [
                        t('termsOfService.sections.eligibility.responsibilitiesItems.item1'),
                        t('termsOfService.sections.eligibility.responsibilitiesItems.item2'),
                        t('termsOfService.sections.eligibility.responsibilitiesItems.item3'),
                        t('termsOfService.sections.eligibility.responsibilitiesItems.item4'),
                        t('termsOfService.sections.eligibility.responsibilitiesItems.item5'),
                        t('termsOfService.sections.eligibility.responsibilitiesItems.item6')
                    ]
                }
            ]
        },
        {
            icon: Shield,
            title: t('termsOfService.sections.acceptableUse.title'),
            content: [
                {
                    subtitle: t('termsOfService.sections.acceptableUse.youAgree'),
                    items: [
                        t('termsOfService.sections.acceptableUse.youAgreeItems.item1'),
                        t('termsOfService.sections.acceptableUse.youAgreeItems.item2'),
                        t('termsOfService.sections.acceptableUse.youAgreeItems.item3'),
                        t('termsOfService.sections.acceptableUse.youAgreeItems.item4'),
                        t('termsOfService.sections.acceptableUse.youAgreeItems.item5'),
                        t('termsOfService.sections.acceptableUse.youAgreeItems.item6'),
                        t('termsOfService.sections.acceptableUse.youAgreeItems.item7')
                    ]
                },
                {
                    subtitle: t('termsOfService.sections.acceptableUse.purpose'),
                    items: [
                        t('termsOfService.sections.acceptableUse.purposeItems.item1'),
                        t('termsOfService.sections.acceptableUse.purposeItems.item2'),
                        t('termsOfService.sections.acceptableUse.purposeItems.item3'),
                        t('termsOfService.sections.acceptableUse.purposeItems.item4')
                    ]
                }
            ]
        },
        {
            icon: Ban,
            title: t('termsOfService.sections.prohibited.title'),
            content: [
                {
                    subtitle: t('termsOfService.sections.prohibited.strictlyForbidden'),
                    items: [
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item1'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item2'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item3'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item4'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item5'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item6'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item7'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item8'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item9'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item10'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item11'),
                        t('termsOfService.sections.prohibited.strictlyForbiddenItems.item12')
                    ]
                },
                {
                    subtitle: t('termsOfService.sections.prohibited.consequences'),
                    items: [
                        t('termsOfService.sections.prohibited.consequencesItems.item1'),
                        t('termsOfService.sections.prohibited.consequencesItems.item2'),
                        t('termsOfService.sections.prohibited.consequencesItems.item3'),
                        t('termsOfService.sections.prohibited.consequencesItems.item4'),
                        t('termsOfService.sections.prohibited.consequencesItems.item5')
                    ]
                }
            ]
        },
        {
            icon: FileText,
            title: t('termsOfService.sections.profile.title'),
            content: [
                {
                    subtitle: t('termsOfService.sections.profile.guidelines'),
                    items: [
                        t('termsOfService.sections.profile.guidelinesItems.item1'),
                        t('termsOfService.sections.profile.guidelinesItems.item2'),
                        t('termsOfService.sections.profile.guidelinesItems.item3'),
                        t('termsOfService.sections.profile.guidelinesItems.item4'),
                        t('termsOfService.sections.profile.guidelinesItems.item5'),
                        t('termsOfService.sections.profile.guidelinesItems.item6')
                    ]
                },
                {
                    subtitle: t('termsOfService.sections.profile.verification'),
                    items: [
                        t('termsOfService.sections.profile.verificationItems.item1'),
                        t('termsOfService.sections.profile.verificationItems.item2'),
                        t('termsOfService.sections.profile.verificationItems.item3'),
                        t('termsOfService.sections.profile.verificationItems.item4'),
                        t('termsOfService.sections.profile.verificationItems.item5')
                    ]
                }
            ]
        },
        {
            icon: Users,
            title: t('termsOfService.sections.communication.title'),
            content: [
                {
                    subtitle: t('termsOfService.sections.communication.requests'),
                    items: [
                        t('termsOfService.sections.communication.requestsItems.item1'),
                        t('termsOfService.sections.communication.requestsItems.item2'),
                        t('termsOfService.sections.communication.requestsItems.item3'),
                        t('termsOfService.sections.communication.requestsItems.item4'),
                        t('termsOfService.sections.communication.requestsItems.item5')
                    ]
                },
                {
                    subtitle: t('termsOfService.sections.communication.messaging'),
                    items: [
                        t('termsOfService.sections.communication.messagingItems.item1'),
                        t('termsOfService.sections.communication.messagingItems.item2'),
                        t('termsOfService.sections.communication.messagingItems.item3'),
                        t('termsOfService.sections.communication.messagingItems.item4'),
                        t('termsOfService.sections.communication.messagingItems.item5'),
                        t('termsOfService.sections.communication.messagingItems.item6')
                    ]
                }
            ]
        },
        {
            icon: Scale,
            title: t('termsOfService.sections.intellectual.title'),
            content: [
                {
                    subtitle: t('termsOfService.sections.intellectual.yourContent'),
                    items: [
                        t('termsOfService.sections.intellectual.yourContentItems.item1'),
                        t('termsOfService.sections.intellectual.yourContentItems.item2'),
                        t('termsOfService.sections.intellectual.yourContentItems.item3'),
                        t('termsOfService.sections.intellectual.yourContentItems.item4'),
                        t('termsOfService.sections.intellectual.yourContentItems.item5')
                    ]
                },
                {
                    subtitle: t('termsOfService.sections.intellectual.ourContent'),
                    items: [
                        t('termsOfService.sections.intellectual.ourContentItems.item1'),
                        t('termsOfService.sections.intellectual.ourContentItems.item2'),
                        t('termsOfService.sections.intellectual.ourContentItems.item3'),
                        t('termsOfService.sections.intellectual.ourContentItems.item4'),
                        t('termsOfService.sections.intellectual.ourContentItems.item5')
                    ]
                }
            ]
        },
        {
            icon: AlertTriangle,
            title: t('termsOfService.sections.disclaimers.title'),
            content: [
                {
                    subtitle: t('termsOfService.sections.disclaimers.platform'),
                    items: [
                        t('termsOfService.sections.disclaimers.platformItems.item1'),
                        t('termsOfService.sections.disclaimers.platformItems.item2'),
                        t('termsOfService.sections.disclaimers.platformItems.item3'),
                        t('termsOfService.sections.disclaimers.platformItems.item4'),
                        t('termsOfService.sections.disclaimers.platformItems.item5'),
                        t('termsOfService.sections.disclaimers.platformItems.item6')
                    ]
                },
                {
                    subtitle: t('termsOfService.sections.disclaimers.liability'),
                    items: [
                        t('termsOfService.sections.disclaimers.liabilityItems.item1'),
                        t('termsOfService.sections.disclaimers.liabilityItems.item2'),
                        t('termsOfService.sections.disclaimers.liabilityItems.item3'),
                        t('termsOfService.sections.disclaimers.liabilityItems.item4'),
                        t('termsOfService.sections.disclaimers.liabilityItems.item5'),
                        t('termsOfService.sections.disclaimers.liabilityItems.item6')
                    ]
                }
            ]
        },
        {
            icon: XCircle,
            title: t('termsOfService.sections.termination.title'),
            content: [
                {
                    subtitle: t('termsOfService.sections.termination.yourRight'),
                    items: [
                        t('termsOfService.sections.termination.yourRightItems.item1'),
                        t('termsOfService.sections.termination.yourRightItems.item2'),
                        t('termsOfService.sections.termination.yourRightItems.item3'),
                        t('termsOfService.sections.termination.yourRightItems.item4'),
                        t('termsOfService.sections.termination.yourRightItems.item5')
                    ]
                },
                {
                    subtitle: t('termsOfService.sections.termination.ourRight'),
                    items: [
                        t('termsOfService.sections.termination.ourRightItems.item1'),
                        t('termsOfService.sections.termination.ourRightItems.item2'),
                        t('termsOfService.sections.termination.ourRightItems.item3'),
                        t('termsOfService.sections.termination.ourRightItems.item4'),
                        t('termsOfService.sections.termination.ourRightItems.item5'),
                        t('termsOfService.sections.termination.ourRightItems.item6')
                    ]
                }
            ]
        }
    ];

    const prohibitedList = [
        t('termsOfService.prohibitedList.item1'),
        t('termsOfService.prohibitedList.item2'),
        t('termsOfService.prohibitedList.item3'),
        t('termsOfService.prohibitedList.item4'),
        t('termsOfService.prohibitedList.item5'),
        t('termsOfService.prohibitedList.item6'),
        t('termsOfService.prohibitedList.item7'),
        t('termsOfService.prohibitedList.item8')
    ];

    return (
        <div className="min-h-screen bg-base-100 py-25 md:py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-primary/10 text-primary font-bold text-sm sm:text-base tracking-wider uppercase mb-4 sm:mb-6">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        {t('termsOfService.title')}
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral mb-4 sm:mb-6">
                        Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Guidelines</span>
                    </h1>
                    <p className="text-base-content/70 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
                        {t('termsOfService.subtitle')}
                    </p>
                    <p className="text-base-content/60 mt-4 text-xs sm:text-sm">
                        {t('termsOfService.lastUpdated')}: February 16, 2026
                    </p>
                </div>

                {/* Acceptance Notice */}
                <div className="bg-primary/10 border-l-4 border-primary p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-8 sm:mb-12">
                    <div className="flex gap-3 sm:gap-4">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-neutral mb-2 text-sm sm:text-base">{t('termsOfService.agreementTitle')}</h3>
                            <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed">
                                {t('termsOfService.agreementText')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Terms Sections */}
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

                {/* Quick Reference - Prohibited Activities */}
                <div className="bg-error/10 border-l-4 border-error p-4 sm:p-6 rounded-xl sm:rounded-2xl mt-8 sm:mt-12">
                    <div className="flex gap-3 sm:gap-4">
                        <Ban className="w-5 h-5 sm:w-6 sm:h-6 text-error flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-bold text-neutral mb-3 text-sm sm:text-base">{t('termsOfService.quickReference')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {prohibitedList.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2 text-base-content/70 text-xs sm:text-sm">
                                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-error flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Safety Guidelines */}
                <div className="bg-warning/10 border-l-4 border-warning p-4 sm:p-6 rounded-xl sm:rounded-2xl mt-6 sm:mt-8">
                    <div className="flex gap-3 sm:gap-4">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-neutral mb-2 text-sm sm:text-base">{t('termsOfService.safetyFirst')}</h3>
                            <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed mb-3">
                                {t('termsOfService.safetyText')}
                            </p>
                            <ul className="space-y-2 text-base-content/70 text-xs sm:text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-warning">•</span>
                                    <span>{t('termsOfService.safetyTips.tip1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning">•</span>
                                    <span>{t('termsOfService.safetyTips.tip2')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning">•</span>
                                    <span>{t('termsOfService.safetyTips.tip3')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning">•</span>
                                    <span>{t('termsOfService.safetyTips.tip4')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning">•</span>
                                    <span>{t('termsOfService.safetyTips.tip5')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Dispute Resolution */}
                <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mt-8 sm:mt-12">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                        <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                        <h2 className="text-xl sm:text-2xl font-bold text-neutral">{t('termsOfService.disputeResolution')}</h2>
                    </div>
                    <div className="space-y-4 text-base-content/70 text-sm sm:text-base">
                        <p className="leading-relaxed">
                            {t('termsOfService.disputeText')}
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>{t('termsOfService.disputeItems.item1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>{t('termsOfService.disputeItems.item2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>{t('termsOfService.disputeItems.item3')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Changes to Terms */}
                <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mt-6 sm:mt-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral mb-4">{t('termsOfService.changes')}</h2>
                    <p className="text-base-content/70 mb-4 text-sm sm:text-base leading-relaxed">
                        {t('termsOfService.changesText')}
                    </p>
                    <ul className="space-y-2 text-base-content/70 mb-6 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{t('termsOfService.changesItems.item1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{t('termsOfService.changesItems.item2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{t('termsOfService.changesItems.item3')}</span>
                        </li>
                    </ul>
                    <p className="text-base-content/60 text-xs sm:text-sm">
                        {t('termsOfService.changesAcceptance')}
                    </p>
                </div>

                {/* Severability */}
                <div className="bg-info/10 border-l-4 border-info p-4 sm:p-6 rounded-xl sm:rounded-2xl mt-6 sm:mt-8">
                    <div className="flex gap-3 sm:gap-4">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-info flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-neutral mb-2 text-sm sm:text-base">{t('termsOfService.severability')}</h3>
                            <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed">
                                {t('termsOfService.severabilityText')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-primary to-secondary p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl text-white mt-8 sm:mt-12 text-center">
                    <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('termsOfService.questionsTitle')}</h2>
                    <p className="mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto text-sm sm:text-base">
                        {t('termsOfService.questionsText')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                        <Link 
                            to="/privacy" 
                            className="btn btn-outline border-white text-white hover:bg-white hover:text-primary px-6 sm:px-8 rounded-full font-bold text-sm sm:text-base w-full sm:w-auto"
                        >
                            View Privacy Policy
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

export default TermsOfService;
