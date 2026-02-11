import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import UseAuth from './UseAuth';

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_BackendURL
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
            console.log('🔐 UseAxiosSecure: Preparing request to', config.url);
            
            if (user) {
                try {
                    let token = null;

                    // Try to get Firebase ID token
                    if (typeof user.getIdToken === 'function') {
                        try {
                            // Try without force refresh first (faster)
                            token = await user.getIdToken(false);
                            console.log('✅ Got token from user.getIdToken(false)');
                        } catch (error) {
                            console.log('⚠️ Failed to get token without refresh, trying with refresh...');
                            // If that fails, try with force refresh
                            try {
                                token = await user.getIdToken(true);
                                console.log('✅ Got token from user.getIdToken(true)');
                            } catch (refreshError) {
                                console.error('❌ Failed to get token with refresh:', refreshError.message);
                            }
                        }
                    }

                    // Fallback: Try accessToken from user object
                    if (!token && user.accessToken) {
                        token = user.accessToken;
                        console.log('✅ Got token from user.accessToken');
                    }

                    // Fallback: Try to get from Firebase auth directly
                    if (!token) {
                        try {
                            const { auth } = await import('../Firebase/firebase.init');
                            const currentUser = auth.currentUser;
                            if (currentUser && typeof currentUser.getIdToken === 'function') {
                                token = await currentUser.getIdToken(false);
                                console.log('✅ Got token from auth.currentUser');
                            }
                        } catch (authError) {
                            console.error('❌ Failed to get token from auth.currentUser:', authError.message);
                        }
                    }

                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                        console.log('✅ Token attached to request');
                    } else {
                        console.warn('⚠️ No token available for request');
                    }
                    
                    // Add user email to headers and body for admin routes
                    if (user.email && config.url?.includes('/admin/')) {
                        config.headers['X-Admin-Email'] = user.email;
                        
                        // For GET requests, add as query parameter (only if not already present)
                        if (config.method === 'get') {
                            if (!config.url.includes('adminEmail=')) {
                                const separator = config.url.includes('?') ? '&' : '?';
                                config.url = `${config.url}${separator}adminEmail=${encodeURIComponent(user.email)}`;
                                console.log('✅ Added adminEmail to query params');
                            } else {
                                console.log('⚠️ adminEmail already in URL, skipping');
                            }
                        }
                        
                        // For POST/PATCH/PUT requests, add to body
                        if (['post', 'patch', 'put'].includes(config.method) && config.data) {
                            if (typeof config.data === 'object' && !config.data.adminEmail) {
                                config.data.adminEmail = user.email;
                                console.log('✅ Added adminEmail to request body');
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ Error in request interceptor:', error.message);
                }
            } else {
                console.log('⚠️ No user available for token');
            }
            return config;
        });

        // Response Interceptor
        const responseInterceptor = axiosSecure.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                const statusCode = error.response?.status;
                console.log('❌ Request failed:', {
                    url: error.config?.url,
                    status: statusCode,
                    message: error.response?.data?.message
                });
                
                if (statusCode === 401 || statusCode === 403) {
                    console.warn('⚠️ Unauthorized/Forbidden - NOT logging out automatically');
                    // Don't automatically logout - let the user see the error
                    // Only logout if user actually exists
                    // if (user && typeof logout === 'function') {
                    //     logout()
                    //         .then(() => {
                    //             if (navigate) {
                    //                 navigate("/auth/login");
                    //             } else {
                    //                 window.location.href = "/auth/login";
                    //             }
                    //         })
                    //         .catch(() => {
                    //             if (navigate) {
                    //                 navigate("/auth/login");
                    //             } else {
                    //                 window.location.href = "/auth/login";
                    //             }
                    //         });
                    // } else {
                    //     if (navigate) {
                    //         navigate("/auth/login");
                    //     } else {
                    //         window.location.href = "/auth/login";
                    //     }
                    // }
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