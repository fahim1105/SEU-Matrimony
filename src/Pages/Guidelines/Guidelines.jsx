import React from 'react';
import { ShieldCheck, Lock, EyeOff, UserCheck, AlertTriangle, MessageSquare, Heart } from 'lucide-react';

const Guidelines = () => {
    const rules = [
        {
            icon: <UserCheck className="text-primary" size={32} />,
            title: "Profile Verification",
            desc: "প্রতিটি প্রোফাইল অবশ্যই @seu.edu.bd ইমেইল দিয়ে ভেরিফাইড হতে হবে। ফেক তথ্য প্রদান করলে একাউন্ট স্থায়ীভাবে ব্যান করা হবে।"
        },
        {
            icon: <Lock className="text-secondary" size={32} />,
            title: "Privacy First",
            desc: "আপনার কন্টাক্ট নম্বর বা ব্যক্তিগত তথ্য কারো সাথে শেয়ার করার আগে নিশ্চিত হোন। আমরা রিকোয়েস্ট এক্সেপ্ট না করা পর্যন্ত চ্যাট অপশন হাইড রাখি।"
        },
        {
            icon: <EyeOff className="text-accent" size={32} />,
            title: "Photos & Media",
            desc: "শালীন এবং স্পষ্ট ছবি আপলোড করুন। স্ক্রিনশট প্রোটেকশন অন থাকলেও নিজের নিরাপত্তার স্বার্থে সংবেদনশীল ছবি শেয়ার করা থেকে বিরত থাকুন।"
        }
    ];

    return (
        <section className="py-20 bg-base-100">
            <div className="container mx-auto px-6 lg:px-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black mb-4 flex items-center justify-center gap-3">
                        <ShieldCheck className="text-primary" size={40} />
                        Safety & Usage Guidelines
                    </h2>
                    <p className="text-base-content/60 max-w-2xl mx-auto">
                        SEU Matrimony একটি নিরাপদ পরিবেশ বজায় রাখতে বদ্ধপরিকর। প্ল্যাটফর্মটি ব্যবহারের আগে নিচের নিয়মগুলো ভালো করে পড়ুন।
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
                                নিরাপদ থাকার কিছু টিপস
                            </h3>
                            <ul className="space-y-4 text-neutral">
                                <li className="flex gap-3">
                                    <div className="badge badge-primary badge-xs mt-2"></div>
                                    <p>প্রথম দেখাতেই কোনো আর্থিক লেনদেন করবেন না।</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="badge badge-primary badge-xs mt-2"></div>
                                    <p>সশরীরে দেখা করার আগে পরিবারের বড়দের জানিয়ে রাখুন এবং পাবলিক প্লেসে দেখা করুন।</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="badge badge-primary badge-xs mt-2"></div>
                                    <p>কারো আচরণ সন্দেহজনক মনে হলে সাথে সাথে 'Report' বাটন ব্যবহার করুন।</p>
                                </li>
                            </ul>
                        </div>
                        <div className="hidden lg:block">
                            <div className="mockup-phone border-primary">
                                <div className="camera"></div>
                                <div className="display">
                                    <div className="artboard artboard-demo phone-1 flex flex-col gap-4 p-6 justify-start bg-white text-base-content">
                                        <div className="chat chat-start w-full">
                                            <div className="chat-bubble chat-bubble-primary">Hello, I saw your profile!</div>
                                        </div>
                                        <div className="chat chat-end w-full ">
                                            <div className="chat-bubble bg-black/80 text-white">I accepted your request. Can we talk?</div>
                                        </div>
                                        <div className="alert alert-warning text-[10px] mt-10">
                                            <AlertTriangle size={12} /> Never share OTP or Money!
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
                    <p className="font-semibold italic">"আমাদের লক্ষ্য আপনার জীবনসঙ্গী খুঁজে পাওয়ার পথটি সহজ এবং নিরাপদ করা।"</p>
                </div>
            </div>
        </section>
    );
};

export default Guidelines;