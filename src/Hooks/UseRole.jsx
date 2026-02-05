import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import UseAuth from './UseAuth';
import UseAxiosSecure from './UseAxiosSecure';

const UseRole = () => {
    const { user, loading } = UseAuth();
    const axiosSecure = UseAxiosSecure();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const { isLoading: roleLoading, data: role = 'user', refetch: refetchRole, error } = useQuery({
        queryKey: ['user-role', user?.email],
        queryFn: async () => {
            if (!user?.email) {
                console.log('❌ No user email available for role check');
                return 'user';
            }
            
            try {
                console.log('🔍 Fetching role for user:', user.email);
                
                // Enhanced token handling with multiple fallback strategies
                let token = null;
                let tokenAttempts = 0;
                const maxTokenAttempts = 3;
                
                while (!token && tokenAttempts < maxTokenAttempts) {
                    tokenAttempts++;
                    console.log(`🔑 Token attempt ${tokenAttempts}/${maxTokenAttempts}`);
                    
                    try {
                        if (typeof user.getIdToken === 'function') {
                            // Try force refresh first, then cached
                            token = await user.getIdToken(tokenAttempts === 1);
                            console.log(`✅ Got token via getIdToken (attempt ${tokenAttempts})`);
                            break;
                        }
                    } catch (tokenError) {
                        console.warn(`⚠️ Token attempt ${tokenAttempts} failed:`, tokenError.message);
                        
                        // Wait before retry
                        if (tokenAttempts < maxTokenAttempts) {
                            await new Promise(resolve => setTimeout(resolve, 500 * tokenAttempts));
                        }
                    }
                }
                
                if (!token) {
                    console.error('❌ Could not obtain authentication token after all attempts');
                    throw new Error('Authentication token unavailable');
                }
                
                // Make API request with enhanced error handling
                const res = await axiosSecure.get(`/user/${user.email}`);
                console.log('🔍 Role API Response:', res.data);
                
                if (res.data.success && res.data.user) {
                    const userRole = res.data.user.role || 'user';
                    console.log('✅ User role from API:', userRole);
                    
                    // Cache the role with timestamp for validation
                    const cacheData = {
                        role: userRole,
                        timestamp: Date.now(),
                        email: user.email
                    };
                    localStorage.setItem(`user_role_${user.email}`, JSON.stringify(cacheData));
                    
                    return userRole;
                } else {
                    console.warn('⚠️ API response indicates failure or no user data');
                    return 'user';
                }
            } catch (error) {
                console.error('❌ Error fetching user role:', error);
                console.error('Error details:', error.response?.data);
                
                // Enhanced fallback to cached role with validation
                try {
                    const cachedData = localStorage.getItem(`user_role_${user.email}`);
                    if (cachedData) {
                        const parsed = JSON.parse(cachedData);
                        const cacheAge = Date.now() - parsed.timestamp;
                        const maxCacheAge = 10 * 60 * 1000; // 10 minutes
                        
                        if (cacheAge < maxCacheAge && parsed.email === user.email) {
                            console.log('✅ Using valid cached role:', parsed.role);
                            return parsed.role;
                        } else {
                            console.log('⚠️ Cached role expired or invalid, clearing cache');
                            localStorage.removeItem(`user_role_${user.email}`);
                        }
                    }
                } catch (cacheError) {
                    console.error('❌ Error reading cached role:', cacheError);
                    localStorage.removeItem(`user_role_${user.email}`);
                }
                
                // If this is a network error and we're not on initial load, throw to trigger retry
                if (!isInitialLoad && (error.code === 'NETWORK_ERROR' || error.response?.status >= 500)) {
                    throw error;
                }
                
                return 'user';
            }
        },
        enabled: !!user?.email && !loading,
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
            // Don't retry on auth errors (401, 403)
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            // Retry up to 3 times for network errors
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        refetchOnWindowFocus: false, // Reduce unnecessary refetches
        refetchOnMount: true,
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });

    // Track initial load completion
    useEffect(() => {
        if (!roleLoading && isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [roleLoading, isInitialLoad]);

    // Enhanced refetch function with error handling
    const enhancedRefetchRole = async () => {
        try {
            console.log('🔄 Manual role refetch initiated');
            const result = await refetchRole();
            console.log('✅ Manual role refetch completed:', result.data);
            return result;
        } catch (error) {
            console.error('❌ Manual role refetch failed:', error);
            throw error;
        }
    };

    return { 
        role, 
        roleLoading, 
        refetchRole: enhancedRefetchRole,
        roleError: error,
        isInitialLoad
    };
};

export default UseRole;

