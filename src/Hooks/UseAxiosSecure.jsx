import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import UseAuth from './UseAuth';

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://server-gold-nu.vercel.app"
});

const UseAxiosSecure = () => {
    const { user, logout } = UseAuth();
    
    // Safely get navigate function - it might not be available in all contexts
    let navigate;
    try {
        navigate = useNavigate();
    } catch (error) {
        console.warn('useNavigate not available in this context:', error.message);
        navigate = null;
    }

    useEffect(() => {
        // Request Interceptor
        const requestInterceptor = axiosSecure.interceptors.request.use(async (config) => {
            if (user) {
                try {
                    let token = null;
                    
                    console.log('🔑 UseAxiosSecure: Getting token for request to', config.url);
                    
                    // Primary: Try to get from Firebase auth directly (most reliable)
                    try {
                        const { auth } = await import('../Firebase/firebase.init');
                        const currentUser = auth.currentUser;
                        if (currentUser && typeof currentUser.getIdToken === 'function') {
                            token = await currentUser.getIdToken(false);
                            console.log('✅ Token obtained from Firebase auth.currentUser');
                        }
                    } catch (authError) {
                        console.warn('⚠️ Could not get token from Firebase auth:', authError.message);
                    }
                    
                    // Fallback: Try from user object
                    if (!token && typeof user.getIdToken === 'function') {
                        try {
                            token = await user.getIdToken(false);
                            console.log('✅ Token obtained from user context');
                        } catch (error) {
                            console.warn('⚠️ Could not get token from user context:', error.message);
                        }
                    }
                    
                    // Last resort: Try accessToken from user object
                    if (!token && user.accessToken) {
                        token = user.accessToken;
                        console.log('✅ Using accessToken from user object');
                    }
                    
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                        console.log('✅ Authorization header set');
                    } else {
                        console.warn('⚠️ No token available for request');
                    }
                } catch (error) {
                    console.error('❌ Error getting token:', error);
                    // Silent fail - request will proceed without token
                }
            } else {
                console.warn('⚠️ No user available for token');
            }
            return config;
        });

        // Response Interceptor
        const responseInterceptor = axiosSecure.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const statusCode = error.response?.status;
                const originalRequest = error.config;
                
                // Handle 401 errors with token refresh attempt
                if (statusCode === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    console.log('🔄 Got 401 error, attempting token refresh...');
                    
                    // Try to refresh the token and retry the request
                    if (user) {
                        try {
                            console.log('🔄 Refreshing Firebase token...');
                            
                            // Force refresh the Firebase token - try multiple methods
                            let newToken = null;
                            
                            // Method 1: Get from Firebase auth directly (most reliable)
                            try {
                                const { auth } = await import('../Firebase/firebase.init');
                                const currentUser = auth.currentUser;
                                if (currentUser && typeof currentUser.getIdToken === 'function') {
                                    newToken = await currentUser.getIdToken(true); // Force refresh
                                    console.log('✅ Token refreshed from Firebase auth.currentUser');
                                }
                            } catch (authError) {
                                console.warn('⚠️ Method 1 failed:', authError.message);
                            }
                            
                            // Method 2: Try from user context
                            if (!newToken && typeof user.getIdToken === 'function') {
                                try {
                                    newToken = await user.getIdToken(true); // Force refresh
                                    console.log('✅ Token refreshed from user context');
                                } catch (userError) {
                                    console.warn('⚠️ Method 2 failed:', userError.message);
                                }
                            }
                            
                            if (newToken) {
                                console.log('✅ Token refreshed successfully, retrying request...');
                                // Update the authorization header with new token
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                // Retry the original request
                                return axiosSecure(originalRequest);
                            } else {
                                console.error('❌ Could not refresh token - no token obtained');
                            }
                        } catch (refreshError) {
                            console.error('❌ Token refresh failed:', refreshError.message);
                        }
                    } else {
                        console.warn('⚠️ No user available for token refresh');
                    }
                    
                    // If token refresh failed, logout
                    console.log('❌ Token refresh failed, logging out user...');
                    if (user && typeof logout === 'function') {
                        logout()
                            .then(() => {
                                if (navigate) {
                                    navigate("/auth/login");
                                } else {
                                    window.location.href = "/auth/login";
                                }
                            })
                            .catch(() => {
                                if (navigate) {
                                    navigate("/auth/login");
                                } else {
                                    window.location.href = "/auth/login";
                                }
                            });
                    } else {
                        if (navigate) {
                            navigate("/auth/login");
                        } else {
                            window.location.href = "/auth/login";
                        }
                    }
                }
                
                // Handle 403 errors (forbidden - don't auto-logout, user might just lack permissions)
                if (statusCode === 403) {
                    console.warn('⚠️ Access forbidden - insufficient permissions');
                    // Don't auto-logout on 403, just reject the error
                    // The component can handle showing appropriate error message
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
        };
    }, [user, navigate, logout]);

    return axiosSecure;
};

export default UseAxiosSecure;