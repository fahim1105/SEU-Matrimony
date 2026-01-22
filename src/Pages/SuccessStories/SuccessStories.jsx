import React from 'react';
import { Quote, Heart, Calendar, MapPin } from 'lucide-react';

const SuccessStories = () => {
    const stories = [
        {
            id: 1,
            couple: "Arif & Sumaiya",
            dept: "CSE & BBA (Batch 45)",
            image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
            story: "SEU Matrimony-র মাধ্যমেই আমি আমার ব্যাচমেটকে নতুন করে চিনেছি। আমাদের আইডি ভেরিফাইড ছিল বলে পরিবারও সহজে বিশ্বাস করেছে। এটি আমাদের জীবনের সেরা সিদ্ধান্ত ছিল।",
            date: "Joined 2024",
            location: "Dhaka, Bangladesh"
        },
        {
            id: 2,
            couple: "Tanvir & Nafisa",
            dept: "EEE & English (Batch 42)",
            image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
            story: "আমরা দুজনেই একই ক্যাম্পাসে ছিলাম কিন্তু কখনো কথা হয়নি। এই প্ল্যাটফর্মটি আমাদের মনের মিল খুঁজে পেতে সাহায্য করেছে। নিরাপত্তা ব্যবস্থা সত্যিই প্রশংসনীয়।",
            date: "Joined 2023",
            location: "Uttara, Dhaka"
        },
        {
            id: 3,
            couple: "Rohan & Ishrat",
            dept: "Pharmacy & Law",
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
            story: "Institutional email ভেরিফিকেশন থাকার কারণে ফেক প্রোফাইলের ভয় ছিল না। আমরা খুব সহজেই একে অপরের পরিবারকে মানাতে পেরেছি। ধন্যবাদ SEU Matrimony!",
            date: "Joined 2025",
            location: "Banani, Dhaka"
        }
    ];

    return (
        <section className="py-24 bg-base-100 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wider uppercase">
                        <Heart size={16} className="fill-current" />
                        Campus Love Stories
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-neutral leading-tight">
                        From Campus Corridors to <br /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Happily Ever After</span>
                    </h2>
                    <p className="text-base-content/60 max-w-2xl mx-auto text-lg italic">
                        "SEU Matrimony-র মাধ্যমে খুঁজে পাওয়া কিছু সুন্দর জুটির গল্প যা আপনাকেও অনুপ্রাণিত করবে।"
                    </p>
                </div>

                {/* Grid Structure */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {stories.map((story) => (
                        <div key={story.id} className="group relative bg-base-100 rounded-[2.5rem] border border-base-200 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                            {/* Image Container */}
                            <div className="relative h-[400px] overflow-hidden">
                                <img 
                                    src={story.image} 
                                    alt={story.couple} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                
                                {/* Overlay Content */}
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <h3 className="text-2xl font-bold">{story.couple}</h3>
                                    <p className="text-sm opacity-90 flex items-center gap-2">
                                        <MapPin size={14} className="text-primary" /> {story.location}
                                    </p>
                                </div>
                            </div>

                            {/* Story Content */}
                            <div className="p-8 relative">
                                <div className="absolute -top-10 right-8 w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white border-8 border-base-100 shadow-xl">
                                    <Quote size={32} />
                                </div>
                                
                                <div className="flex gap-2 mb-4">
                                    <span className="badge badge-outline border-primary/30 text-primary font-semibold">{story.dept}</span>
                                    <span className="badge badge-ghost text-xs opacity-60 flex gap-1 items-center">
                                        <Calendar size={12} /> {story.date}
                                    </span>
                                </div>

                                <p className="text-base-content/70 leading-relaxed mb-6 italic">
                                    "{story.story}"
                                </p>

                                <div className="pt-6 border-t border-base-200">
                                    <button className="text-primary font-bold hover:underline flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Read Full Story <span className="text-xl">→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-20 text-center bg-gradient-to-br from-primary to-secondary p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                         <Heart size={300} />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Ready to start your own story?</h3>
                    <p className="mb-8 opacity-90 max-w-xl mx-auto">আপনার ভেরিফাইড SEU প্রোফাইল তৈরি করুন এবং খুঁজে নিন আপনার প্রিয় মানুষটিকে।</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="btn bg-white text-primary border-none hover:bg-base-200 px-8 rounded-full font-black">Register Free</button>
                        <button className="btn btn-outline border-white text-white hover:bg-white hover:text-primary px-8 rounded-full">Success Stories</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;