import { useState, useEffect } from 'react';
import UseAuth from '../Hooks/UseAuth';
import UseRole from '../Hooks/UseRole';
import Loader from '../Components/Loader/Loader';
import Forbidden from '../Pages/Forbidden/Forbidden';

const AdminRoutes = ({ children }) => {
    const { user, loading } = UseAuth();
    const { role, roleLoading, refetchRole, roleError, isInitialLoad } = UseRole();
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const [lastRetryTime, setLastRetryTime] = useState(0);

    // Debug logging with more context
    useEffect(() => {
        console.log('🔍 AdminRoutes - Detailed State:', {
            user: user?.email,
            userProvider: user?.providerData?.[0]?.providerId,
            role,
            loading,
            roleLoading,
            roleError: roleError?.message,
            retryCount,
            isRetrying,
            isInitialLoad,
            timestamp: new Date().toISOString()
        });
    }, [user, role, loading, roleLoading, roleError, retryCount, isRetrying, isInitialLoad]);

    // Enhanced auto-retry logic with backoff and rate limiting
    useEffect(() => {
        const shouldRetry = !loading && 
                          user?.email && 
                          !roleLoading && 
                          !isRetrying &&
                          role !== 'admin' && 
                          retryCount < 5 && // Increased retry limit
                          !isInitialLoad; // Don't auto-retry on initial load

        if (shouldRetry) {
            const now = Date.now();
            const timeSinceLastRetry = now - lastRetryTime;
            const minRetryInterval = 2000; // Minimum 2 seconds between retries

            if (timeSinceLastRetry >= minRetryInterval) {
                const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
                
                console.log(`🔄 AdminRoutes: Scheduling auto-retry ${retryCount + 1}/5 in ${retryDelay}ms`);
                
                const timer = setTimeout(async () => {
                    setIsRetrying(true);
                    setLastRetryTime(Date.now());
                    
                    try {
                        await refetchRole();
                        console.log('✅ AdminRoutes: Auto-retry successful');
                    } catch (error) {
                        console.error('❌ AdminRoutes: Auto-retry failed:', error);
                    } finally {
                        setIsRetrying(false);
                        setRetryCount(prev => prev + 1);
                    }
                }, retryDelay);

                return () => clearTimeout(timer);
            }
        }
    }, [loading, user, roleLoading, role, retryCount, isRetrying, refetchRole, lastRetryTime, isInitialLoad]);

    // Reset retry count when user changes or role becomes admin
    useEffect(() => {
        if (role === 'admin' || !user) {
            setRetryCount(0);
            setIsRetrying(false);
        }
    }, [role, user]);

    // Show loader while checking authentication, role, or retrying
    if (loading || (roleLoading && isInitialLoad) || isRetrying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70 mb-2">
                        {loading && 'প্রমাণীকরণ চেক করা হচ্ছে...'}
                        {roleLoading && 'এডমিন অনুমতি যাচাই করা হচ্ছে...'}
                        {isRetrying && `পুনরায় চেষ্টা করা হচ্ছে... (${retryCount + 1}/5)`}
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-neutral/50 bg-base-200 p-2 rounded mt-2 max-w-sm mx-auto">
                            <div>User: {user?.email}</div>
                            <div>Role: {role || 'loading...'}</div>
                            <div>Error: {roleError?.message || 'none'}</div>
                            <div>Retries: {retryCount}/5</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Show forbidden if not admin after all attempts
    if (role !== 'admin') {
        console.log('❌ AdminRoutes: Access denied - Final state:', {
            role,
            retryCount,
            roleError: roleError?.message,
            user: user?.email
        });
        return <Forbidden />;
    }

    console.log('✅ AdminRoutes: Admin access granted for:', user?.email);
    return (
        <div>
            {/* Success indicator in development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed top-20 right-4 z-50 bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold">
                    ✅ Admin Access Active
                </div>
            )}
            {children}
        </div>
    );
};

export default AdminRoutes;