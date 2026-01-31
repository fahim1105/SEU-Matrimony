import React from 'react';
import { FileEdit } from 'lucide-react';
import { Link } from 'react-router';

const CreateBiodataCTA = () => (
    <section className="py-20">
        <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-10 md:p-20 rounded-[3rem] border border-primary/20 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl text-center md:text-left space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic">Ready to Create Your <br /> <span className="underline decoration-primary">BioData?</span></h2>
                        <p className="text-lg text-base-content/60 italic">আপনার সঠিক তথ্য দিয়ে একটি সুন্দর বায়োডাটা তৈরি করুন এবং আজই আপনার জীবনসঙ্গী খোঁজা শুরু করুন।</p>
                        <Link to="dashboard/biodata-form" className="btn btn-primary btn-lg rounded-full px-10 shadow-2xl shadow-primary/30">
                            <FileEdit size={20} /> Create BioData Now
                        </Link>
                    </div>
                    <div className="relative group-hover:scale-110 transition-transform duration-500">
                        <div className="w-48 h-64 bg-base-100 border-2 border-primary/20 rounded-2xl shadow-2xl p-4 rotate-6">
                            <div className="w-full h-4 bg-base-200 rounded mb-2"></div>
                            <div className="w-3/4 h-4 bg-base-200 rounded mb-4"></div>
                            <div className="w-full h-32 bg-primary/5 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default CreateBiodataCTA;