import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import UseAuth from './UseAuth';

const axiosSecure = axios.create({
    baseURL: "http://localhost:5000"
    // baseURL: "https://server-gold-nu.vercel.app"
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
                    // Enhanced token retrieval with multiple fallback methods
                    let token = null;
                    
                    // Method 1: Direct getIdToken call
                    if (typeof user.getIdToken === 'function') {
                        console.log('🔑 Getting token via getIdToken method');
                        token = await user.getIdToken();
                    }
                    // Method 2: Try getIdToken with force refresh
                    else if (user.getIdToken) {
                        console.log('🔑 Trying getIdToken with force refresh');
                        try {
                            token = await user.getIdToken(true);
                        } catch (refreshError) {
                            console.warn('Force refresh failed:', refreshError);
                        }
                    }
                    // Method 3: Access token from user object directly
                    else if (user.accessToken) {
                        console.log('🔑 Using accessToken from user object');
                        token = user.accessToken;
                    }
                    // Method 4: Try to get token from Firebase auth directly
                    else {
                        console.log('🔑 Attempting to get token from Firebase auth directly');
                        try {
                            // Import Firebase auth to get current user
                            const { auth } = await import('../Firebase/firebase.init');
                            const currentUser = auth.currentUser;
                            if (currentUser && typeof currentUser.getIdToken === 'function') {
                                token = await currentUser.getIdToken();
                                console.log('✅ Got token from Firebase auth.currentUser');
                            }
                        } catch (authError) {
                            console.warn('Firebase auth token retrieval failed:', authError);
                        }
                    }
                    
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                        console.log('✅ Authorization header set successfully');
                    } else {
                        console.warn('⚠️ No authentication token available');
                        // For Google users, we might still want to proceed without token for some endpoints
                        const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com') || 
                                           user.providerId === 'google.com';
                        if (isGoogleUser) {
                            console.log('🔍 Google user detected, proceeding without token for now');
                        }
                    }
                } catch (error) {
                    console.error('❌ Error in token retrieval process:', error);
                }
            } else {
                console.log('❌ No user object available for authentication');
            }
            return config;
        });

        // Response Interceptor
        const responseInterceptor = axiosSecure.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                console.log('Axios error:', error);

                const statusCode = error.response?.status;
                if (statusCode === 401 || statusCode === 403) {
                    // Only logout if user actually exists
                    if (user && typeof logout === 'function') {
                        logout()
                            .then(() => {
                                // Only navigate if navigate function is available
                                if (navigate) {
                                    navigate("/auth/login");
                                } else {
                                    // Fallback to window.location if navigate is not available
                                    window.location.href = "/auth/login";
                                }
                            })
                            .catch((logoutError) => {
                                console.error('Logout error:', logoutError);
                                // Fallback navigation
                                if (navigate) {
                                    navigate("/auth/login");
                                } else {
                                    window.location.href = "/auth/login";
                                }
                            });
                    } else {
                        // If no user, just redirect to login
                        if (navigate) {
                            navigate("/auth/login");
                        } else {
                            window.location.href = "/auth/login";
                        }
                    }
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