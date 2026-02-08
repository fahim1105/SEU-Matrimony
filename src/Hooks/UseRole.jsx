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
                return 'user';
            }
            
            try {
                // Make API request to get user role
                const res = await axiosSecure.get(`/user/${user.email}`);
                
                if (res.data.success && res.data.user) {
                    const userRole = res.data.user.role || 'user';
                    
                    // Cache the role with timestamp
                    const cacheData = {
                        role: userRole,
                        timestamp: Date.now(),
                        email: user.email
                    };
                    localStorage.setItem(`user_role_${user.email}`, JSON.stringify(cacheData));
                    
                    return userRole;
                } else {
                    return 'user';
                }
            } catch (error) {
                console.error('Error fetching user role:', error.message);
                
                // Fallback to cached role
                try {
                    const cachedData = localStorage.getItem(`user_role_${user.email}`);
                    if (cachedData) {
                        const parsed = JSON.parse(cachedData);
                        const cacheAge = Date.now() - parsed.timestamp;
                        const maxCacheAge = 10 * 60 * 1000; // 10 minutes
                        
                        if (cacheAge < maxCacheAge && parsed.email === user.email) {
                            return parsed.role;
                        } else {
                            localStorage.removeItem(`user_role_${user.email}`);
                        }
                    }
                } catch (cacheError) {
                    localStorage.removeItem(`user_role_${user.email}`);
                }
                
                // Default to 'user' role on error
                return 'user';
            }
        },
        enabled: !!user?.email && !loading,
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
            // Don't retry on auth errors
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            // Retry up to 2 times for network errors
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });

    // Track initial load completion
    useEffect(() => {
        if (!roleLoading && isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [roleLoading, isInitialLoad]);

    return { 
        role, 
        roleLoading, 
        refetchRole,
        roleError: error,
        isInitialLoad
    };
};

export default UseRole;

