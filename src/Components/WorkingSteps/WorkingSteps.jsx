import React from 'react';
import { UserPlus, Search, MessageSquareHeart, Gem } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WorkingSteps = () => {
    const { t } = useTranslation();
    
    const steps = [
        { icon: <UserPlus size={28} />, title: t('home.howItWorks.step1.title'), desc: t('home.howItWorks.step1.description') },
        { icon: <Search size={28} />, title: t('home.howItWorks.step2.title'), desc: t('home.howItWorks.step2.description') },
        { icon: <MessageSquareHeart size={28} />, title: t('home.howItWorks.step3.title'), desc: t('home.howItWorks.step3.description') },
        { icon: <Gem size={28} />, title: t('nav.browseMatches'), desc: t('home.howItWorks.step3.description') }
    ];

    return (
        <section className="py-24 bg-base-200/50 text-neutral-content rounded-[3rem] my-10 mx-4 md:mx-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-4xl font-black text-neutral/90 text-center mb-20 italic">{t('home.howItWorks.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-col items-center text-center group relative z-10">
                            <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-primary/20 rotate-12 group-hover:rotate-0 transition-all duration-300">
                                {s.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-neutral mb-2">{s.title}</h3>
                            <p className="text-neutral/70 text-sm max-w-[200px]">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WorkingSteps;