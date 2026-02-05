import React from 'react';
import { ShieldCheck, Lock, EyeOff, UserCheck, AlertTriangle, MessageSquare, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Guidelines = () => {
    const { t } = useTranslation();
    
    const rules = [
        {
            icon: <UserCheck className="text-primary" size={32} />,
            title: t('guidelinesPage.profileVerification'),
            desc: t('guidelinesPage.profileVerificationDesc')
        },
        {
            icon: <Lock className="text-secondary" size={32} />,
            title: t('guidelinesPage.privacyFirst'),
            desc: t('guidelinesPage.privacyFirstDesc')
        },
        {
            icon: <EyeOff className="text-accent" size={32} />,
            title: t('guidelinesPage.photosMedia'),
            desc: t('guidelinesPage.photosMediaDesc')
        }
    ];

    return (
        <section className="py-20 bg-base-100">
            <div className="container mx-auto px-6 lg:px-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
                        <ShieldCheck className="text-primary" size={40} />
                        {t('guidelinesPage.title')}
                    </h2>
                    <p className="text-base-content/60 max-w-2xl mx-auto">
                        {t('guidelinesPage.subtitle')}
                    </p>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
                    {rules.map((rule, idx) => (
                        <div key={idx} className="card bg-base-200/50 p-8 rounded-3xl hover:bg-base-100 hover:shadow-xl transition-all border border-transparent hover:border-primary/20">
                            <div className="mb-6 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
                                {rule.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{rule.title}</h3>
                            <p className="text-sm text-base-content/70 leading-relaxed">{rule.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Detailed Steps */}
                <div className="bg-base-200 text-neutral-content rounded-[3rem] p-10 lg:p-16 relative overflow-hidden">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl text-neutral font-bold mb-6 flex items-center gap-2">
                                <AlertTriangle className="text-warning" />
                                {t('guidelinesPage.safetyTips')}
                            </h3>
                            <ul className="space-y-4 text-neutral">
                                <li className="flex gap-3">
                                    <div className="badge badge-primary badge-xs mt-2"></div>
                                    <p>{t('guidelinesPage.tip1')}</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="badge badge-primary badge-xs mt-2"></div>
                                    <p>{t('guidelinesPage.tip2')}</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="badge badge-primary badge-xs mt-2"></div>
                                    <p>{t('guidelinesPage.tip3')}</p>
                                </li>
                            </ul>
                        </div>
                        <div className="hidden lg:block">
                            <div className="mockup-phone border-primary">
                                <div className="camera"></div>
                                <div className="display">
                                    <div className="artboard artboard-demo phone-1 flex flex-col gap-4 p-6 justify-start bg-white text-base-content">
                                        <div className="chat chat-start w-full">
                                            <div className="chat-bubble chat-bubble-primary">{t('guidelinesPage.chatExample')}</div>
                                        </div>
                                        <div className="chat chat-end w-full ">
                                            <div className="chat-bubble bg-black/80 text-white">{t('guidelinesPage.chatReply')}</div>
                                        </div>
                                        <div className="alert alert-warning text-[10px] mt-10">
                                            <AlertTriangle size={12} /> {t('guidelinesPage.chatWarning')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-16 text-center">
                    <div className="flex justify-center gap-2 mb-4">
                        <Heart className="text-red-500 fill-red-500 animate-pulse" />
                    </div>
                    <p className="font-semibold italic">"{t('guidelinesPage.footerQuote')}"</p>
                </div>
            </div>
        </section>
    );
};

export default Guidelines;