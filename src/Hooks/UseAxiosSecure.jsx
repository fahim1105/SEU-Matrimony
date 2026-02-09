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
                    
                    // Try to get Firebase ID token
                    if (typeof user.getIdToken === 'function') {
                        try {
                            // Try without force refresh first (faster)
                            token = await user.getIdToken(false);
                        } catch (error) {
                            // If that fails, try with force refresh
                            try {
                                token = await user.getIdToken(true);
                            } catch (refreshError) {
                                // Silent fail
                            }
                        }
                    }
                    
                    // Fallback: Try accessToken from user object
                    if (!token && user.accessToken) {
                        token = user.accessToken;
                    }
                    
                    // Fallback: Try to get from Firebase auth directly
                    if (!token) {
                        try {
                            const { auth } = await import('../Firebase/firebase.init');
                            const currentUser = auth.currentUser;
                            if (currentUser && typeof currentUser.getIdToken === 'function') {
                                token = await currentUser.getIdToken(false);
                            }
                        } catch (authError) {
                            // Silent fail
                        }
                    }
                    
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    // Silent fail - request will proceed without token
                }
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
                    
                    // Try to refresh the token and retry the request
                    if (user) {
                        try {
                            console.log('🔄 Token expired, attempting refresh...');
                            
                            // Force refresh the Firebase token
                            let newToken = null;
                            if (typeof user.getIdToken === 'function') {
                                newToken = await user.getIdToken(true); // Force refresh
                            } else {
                                // Try to get from Firebase auth directly
                                const { auth } = await import('../Firebase/firebase.init');
                                const currentUser = auth.currentUser;
                                if (currentUser && typeof currentUser.getIdToken === 'function') {
                                    newToken = await currentUser.getIdToken(true);
                                }
                            }
                            
                            if (newToken) {
                                console.log('✅ Token refreshed successfully, retrying request...');
                                // Update the authorization header with new token
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                // Retry the original request
                                return axiosSecure(originalRequest);
                            }
                        } catch (refreshError) {
                            console.error('❌ Token refresh failed:', refreshError.message);
                            // If refresh fails, proceed to logout
                        }
                    }
                    
                    // If token refresh failed or no user, logout
                    console.log('❌ User logged out due to authentication failure');
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