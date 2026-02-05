import React from 'react';
import { ShieldAlert, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SafetyTrust = () => {
    const { t } = useTranslation();
    
    return (
        <section className="py-20 bg-base-100">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12 bg-base-200 p-8 md:p-16 rounded-[4rem] border border-base-300">
                    <div className="flex-1 space-y-6">
                        <div className="badge badge-error gap-2 p-4 text-white font-bold">
                            <ShieldAlert size={16} /> {t('home.safety.title').toUpperCase()}
                        </div>
                        <h2 className="text-4xl font-black leading-tight italic">{t('home.safety.subtitle')}</h2>
                        <p className="text-base-content/70 text-lg">{t('home.safety.subtitle')}</p>
                        <ul className="space-y-3 font-semibold">
                            <li className="flex items-center gap-2"><CheckCircle size={20} className="text-green-500" /> {t('home.safety.verification.title')}</li>
                            <li className="flex items-center gap-2"><CheckCircle size={20} className="text-green-500" /> {t('home.safety.moderation.title')}</li>
                            <li className="flex items-center gap-2"><CheckCircle size={20} className="text-green-500" /> {t('home.safety.reporting.title')}</li>
                        </ul>
                    </div>
                    <div className="flex-1 w-full flex justify-center">
                        <div className="w-64 h-64 bg-primary/20 rounded-full flex items-center justify-center border-[20px] border-white shadow-2xl">
                            <ShieldCheck size={100} className="text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SafetyTrust;