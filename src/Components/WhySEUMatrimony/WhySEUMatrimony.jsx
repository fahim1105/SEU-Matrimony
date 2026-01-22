import React from 'react';
import { ShieldCheck, Users, Lock, Heart } from 'lucide-react';

const WhySEUMatrimony = () => {
    const features = [
        { icon: <ShieldCheck size={32} />, title: "Verified Profiles", desc: "Every user is authenticated via @seu.edu.bd institutional email to ensure zero fake accounts." },
        { icon: <Users size={32} />, title: "Exclusive Community", desc: "A dedicated platform built exclusively for Southeast University students and alumni." },
        { icon: <Lock size={32} />, title: "Private & Secure", desc: "Your personal contact information remains hidden until you manually accept a request." },
        { icon: <Heart size={32} />, title: "Serious Intentions", desc: "We focus on meaningful relationships and long-term commitments within the SEU family." }
    ];

    return (
        <section className="py-20 bg-base-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 italic tracking-tight">Why <span className="text-primary">SEU Matrimony?</span></h2>
                    <p className="text-base-content/60 max-w-xl mx-auto italic">Creating a bridge of trust between SEUians for their lifetime journey.</p>
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