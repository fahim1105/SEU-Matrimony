import { ArrowLeft, Home, LockKeyhole, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import UseRole from '../../Hooks/UseRole';
import UseAuth from '../../Hooks/UseAuth';
import { useState, useEffect } from 'react';

const Forbidden = () => {
    const navigate = useNavigate();
    const { user } = UseAuth();
    const { role, refetchRole, roleError } = UseRole();
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Auto-navigate if role becomes admin
    useEffect(() => {
        if (role === 'admin') {
            console.log('✅ Forbidden: Role updated to admin, navigating back');
            setTimeout(() => {
                navigate(-1);
            }, 1000);
        }
    }, [role, navigate]);

    const handleRetryPermissions = async () => {
        if (isRetrying) return;
        
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        console.log(`🔄 Forbidden: Manual role refresh triggered (attempt ${retryCount + 1})`);
        
        try {
            await refetchRole();
            console.log('✅ Forbidden: Manual role refresh completed');
            
            // Give a moment for the role to update
            setTimeout(() => {
                if (role === 'admin') {
                    navigate(-1);
                }
            }, 500);
        } catch (error) {
            console.error('❌ Forbidden: Error refreshing role:', error);
        } finally {
            setTimeout(() => {
                setIsRetrying(false);
            }, 1000); // Minimum 1 second loading state
        }
    };

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

                    {/* Enhanced debug info in development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-xs text-slate-300 text-left">
                                <strong>🔍 Debug Info:</strong><br />
                                <span className="text-blue-300">User:</span> {user?.email}<br />
                                <span className="text-green-300">Current Role:</span> {role || 'loading...'}<br />
                                <span className="text-yellow-300">Expected:</span> admin<br />
                                <span className="text-red-300">Provider:</span> {user?.providerData?.[0]?.providerId || 'unknown'}<br />
                                <span className="text-purple-300">Retry Count:</span> {retryCount}<br />
                                {roleError && (
                                    <>
                                        <span className="text-red-400">Error:</span> {roleError.message}<br />
                                    </>
                                )}
                                <span className="text-gray-400">Timestamp:</span> {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    )}

                    {/* Error message if there's a role error */}
                    {roleError && (
                        <div className="bg-error/10 border border-error/30 rounded-lg p-4 max-w-md mx-auto">
                            <div className="flex items-center gap-2 text-error">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    অনুমতি যাচাইয়ে সমস্যা হয়েছে
                                </span>
                            </div>
                            <p className="text-xs text-error/70 mt-1">
                                নেটওয়ার্ক সংযোগ চেক করুন এবং পুনরায় চেষ্টা করুন
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                        <button 
                            onClick={handleRetryPermissions}
                            disabled={isRetrying}
                            className={`w-full sm:w-auto flex items-center justify-center px-8 py-3.5 rounded-2xl transition-all duration-300 border shadow-xl group ${
                                isRetrying 
                                    ? 'bg-slate-600 border-slate-500 text-slate-300 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]'
                            }`}
                        >
                            <RefreshCw className={`w-5 h-5 mr-2 transition-transform ${isRetrying ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                            {isRetrying ? 'চেক করা হচ্ছে...' : `অনুমতি পুনরায় চেক করুন ${retryCount > 0 ? `(${retryCount})` : ''}`}
                        </button>

                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all duration-300 border border-slate-700 shadow-xl group"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            ড্যাশবোর্ডে ফিরুন
                        </button>

                        <button 
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-[#EC4899] hover:bg-[#db2777] text-white rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] group"
                        >
                            <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            হোমে ফিরুন
                        </button>
                    </div>

                    {/* Auto-retry indicator */}
                    {role !== 'admin' && !isRetrying && (
                        <div className="text-xs text-neutral/50 mt-4">
                            স্বয়ংক্রিয় পুনরায় চেষ্টা চালু আছে...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Forbidden;