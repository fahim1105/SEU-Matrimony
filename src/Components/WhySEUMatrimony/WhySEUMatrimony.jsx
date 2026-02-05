import React from 'react';
import { ShieldCheck, Users, Lock, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WhySEUMatrimony = () => {
    const { t } = useTranslation();
    
    const features = [
        { icon: <ShieldCheck size={32} />, title: t('home.whySEU.verified.title'), desc: t('home.whySEU.verified.description') },
        { icon: <Users size={32} />, title: t('home.whySEU.matching.title'), desc: t('home.whySEU.matching.description') },
        { icon: <Lock size={32} />, title: t('home.whySEU.privacy.title'), desc: t('home.whySEU.privacy.description') },
        { icon: <Heart size={32} />, title: t('home.whySEU.support.title'), desc: t('home.whySEU.support.description') }
    ];

    return (
        <section className="py-20 bg-base-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 italic tracking-tight">{t('home.whySEU.title')}</h2>
                    <p className="text-base-content/60 max-w-xl mx-auto italic">{t('home.whySEU.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="card bg-base-200/50 p-8 hover:bg-base-100 hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-primary/20 group">
                            <div className="text-primary mb-6 p-4 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-sm text-base-content/70 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhySEUMatrimony;