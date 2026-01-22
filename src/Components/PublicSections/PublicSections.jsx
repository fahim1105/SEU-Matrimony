import React from 'react';
import { CheckCircle2, ShieldAlert, Zap, Quote } from 'lucide-react';

export const PublicSections = () => {
    return (
        <div className="space-y-24 py-16">

            {/* 1. Feature Section: Why SEU Matrimony */}
            <section className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black mb-4">Why Choose SEU Matrimony?</h2>
                    <p className="text-base-content/60 max-w-2xl mx-auto">আমরা SEU কমিউনিটির জন্য একটি নিরাপদ এবং বিশ্বস্ত মাধ্যম তৈরি করেছি।</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card bg-base-200/50 p-8 hover:bg-base-100 hover:shadow-2xl transition-all group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                            <ShieldAlert size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Verified Profiles</h3>
                        <p className="text-base-content/70">শুধুমাত্র @seu.edu.bd ইমেইল দিয়ে ভেরিফাইড ইউজাররাই এখানে থাকতে পারবে।</p>
                    </div>
                    <div className="card bg-base-200/50 p-8 hover:bg-base-100 hover:shadow-2xl transition-all group border-y-4 border-primary">
                        <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Request Control</h3>
                        <p className="text-base-content/70">আপনার অনুমতি ছাড়া কেউ আপনার সাথে যোগাযোগ বা প্রোফাইল ডিটেইলস দেখতে পারবে না।</p>
                    </div>
                    <div className="card bg-base-200/50 p-8 hover:bg-base-100 hover:shadow-2xl transition-all group">
                        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Zero Fake Accounts</h3>
                        <p className="text-base-content/70">আমাদের মডারেটর টিম প্রতিটি প্রোফাইল ম্যানুয়ালি রিভিউ করে থাকে।</p>
                    </div>
                </div>
            </section>

            {/* 2. Success Story Preview Section */}
            <section className="bg-primary/5 py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <span className="badge badge-primary font-bold mb-4 px-4 py-3">Success Story</span>
                            <h2 className="text-4xl font-black mb-6 leading-tight">Finding Love Within Your Own Campus.</h2>
                            <div className="relative p-8 bg-base-100 rounded-3xl shadow-xl">
                                <Quote className="absolute -top-4 -left-4 text-primary opacity-20" size={60} />
                                <p className="text-xl italic text-base-content/80">"SEU Matrimony-র মাধ্যমেই আমি আমার ব্যাচমেটকে নতুন করে চিনেছি। আমাদের আইডি ভেরিফাইড ছিল বলে পরিবারও সহজে বিশ্বাস করেছে।"</p>
                                <div className="mt-6 flex items-center gap-4">
                                    <div className="avatar">
                                        <div className="w-12 rounded-full ring ring-primary ring-offset-2">
                                            <img src="https://i.pravatar.cc/150?u=seu1" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold">Arif & Sumaiya</p>
                                        <p className="text-xs opacity-60">CSE & BBA Batch 45</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="h-64 bg-base-300 rounded-3xl overflow-hidden shadow-lg transform translate-y-8">
                                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=500" alt="Wedding" />
                            </div>
                            <div className="h-64 bg-base-300 rounded-3xl overflow-hidden shadow-lg">
                                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=500" alt="Wedding" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Steps to Start (Public Guide) */}
            <section className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-12">How It Works</h2>
                <div className="flex flex-col md:flex-row justify-center items-start gap-8">
                    {[
                        { step: '01', title: 'Register', desc: 'Use your SEU email to create a profile.' },
                        { step: '02', title: 'Find Match', desc: 'Browse profiles and send connection requests.' },
                        { step: '03', title: 'Connect', desc: 'Start chatting once they accept your request.' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-black mb-4 shadow-xl shadow-primary/30">
                                {item.step}
                            </div>
                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                            <p className="text-base-content/60">{item.desc}</p>
                            {idx !== 2 && <div className="hidden md:block w-full h-px bg-primary/20 mt-8 relative left-1/2"></div>}
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};