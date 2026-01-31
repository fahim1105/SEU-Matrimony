import { ArrowLeft, Home, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
            {/* Background Decorative Circles */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* Animation Container with Glow */}
                <div className="relative mb-4 flex justify-center group">
                    <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
                    <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                        <DotLottieReact
                            src="https://lottie.host/1456d27e-dbd0-4759-845b-a1036269cd8b/HbuIS7M2zq.lottie"
                            loop
                            autoplay
                            className="w-full h-full drop-shadow-2xl"
                        />
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-6">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-pink-500/30 bg-primary text-sm font-medium mb-2">
                        <LockKeyhole className="w-4 h-4 mr-2" />
                        Access Denied
                    </div>
                    
                    <h1 className="text-5xl sm:text-6xl font-black text-neutral/60 tracking-tight">
                        Forbidden Area
                    </h1>
                    
                    <p className="text-neutral/80 text-lg max-w-md mx-auto leading-relaxed">
                        দুঃখিত, আপনার কাছে এই পেজটি দেখার অনুমতি নেই। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all duration-300 border border-slate-700 shadow-xl group"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            পিছনে ফিরে যান
                        </button>

                        <button 
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-[#EC4899] hover:bg-[#db2777] text-white rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] group"
                        >
                            <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            হোমে ফিরুন
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;