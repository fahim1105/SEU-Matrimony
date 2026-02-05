import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import UseAuth from '../../Hooks/UseAuth';
import UseRole from '../../Hooks/UseRole';
import { Shield, AlertTriangle } from 'lucide-react';

const AdminRoute = ({ children }) => {
    const { user, loading: authLoading } = UseAuth();
    const { role, roleLoading, refetchRole } = UseRole();
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    // Auto-retry role fetch if it fails
    useEffect(() => {
        if (!authLoading && !roleLoading && role !== 'admin' && retryCount < 3) {
            const timer = setTimeout(() => {
                console.log(`🔄 AdminRoute: Retrying role fetch (attempt ${retryCount + 1})`);
                setIsRetrying(true);
                refetchRole().finally(() => {
                    setIsRetrying(false);
                    setRetryCount(prev => prev + 1);
                });
            }, 1000 * (retryCount + 1)); // Exponential backoff

            return () => clearTimeout(timer);
        }
    }, [authLoading, roleLoading, role, retryCount, refetchRole]);

    // Show loading while checking authentication and role
    if (authLoading || roleLoading || isRetrying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">
                        {authLoading && 'Checking authentication...'}
                        {roleLoading && 'Checking admin permissions...'}
                        {isRetrying && `Retrying... (${retryCount + 1}/3)`}
                    </p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    // Show forbidden access if not admin
    if (role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-base-200 p-8 rounded-3xl shadow-2xl text-center">
                    <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-neutral mb-4">অ্যাক্সেস নিষিদ্ধ</h2>
                    <p className="text-neutral/70 mb-6">
                        এই পেজ অ্যাক্সেস করার জন্য আপনার এডমিন অনুমতি প্রয়োজন।
                    </p>
                    <div className="bg-info/10 p-3 rounded-lg mb-6">
                        <p className="text-sm text-info">
                            বর্তমান ভূমিকা: <span className="font-bold">{role || 'user'}</span>
                        </p>
                        <p className="text-sm text-info">
                            ইমেইল: <span className="font-bold">{user?.email}</span>
                        </p>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                console.log('🔄 Manual role refresh from forbidden page');
                                setRetryCount(0);
                                setIsRetrying(true);
                                refetchRole().finally(() => setIsRetrying(false));
                            }}
                            disabled={isRetrying}
                            className={`w-full py-3 rounded-2xl font-semibold transition-all ${
                                isRetrying 
                                    ? 'bg-base-300 text-neutral/50 cursor-not-allowed' 
                                    : 'bg-primary text-base-100 hover:bg-primary/90'
                            }`}
                        >
                            {isRetrying ? 'পুনরায় চেক করা হচ্ছে...' : 'অনুমতি পুনরায় চেক করুন'}
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full bg-base-100 text-neutral py-3 rounded-2xl font-semibold hover:bg-base-300 transition-all border border-base-300"
                        >
                            ড্যাশবোর্ডে ফিরে যান
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // User is admin, render the protected content
    return (
        <div>
            {/* Admin indicator */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed top-4 right-4 z-50 bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Shield size={12} />
                    Admin Access
                </div>
            )}
            {children}
        </div>
    );
};

export default AdminRoute;