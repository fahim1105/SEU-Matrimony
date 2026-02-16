// Standalone axios instance for use outside React components
import axios from 'axios';

export const createAxiosInstance = (user) => {
    const axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_BackendURL
    });

    // Request interceptor to add auth token
    axiosInstance.interceptors.request.use(async (config) => {
        if (user && typeof user.getIdToken === 'function') {
            try {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error('Error getting Firebase token:', error);
            }
        }
        return config;
    });

    // Response interceptor for error handling
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            console.log('Axios error:', error);

            const statusCode = error.response?.status;
            if (statusCode === 401 || statusCode === 403) {
                // For standalone instance, just log the error
                console.warn('Authentication error in standalone axios instance');
                // Don't try to navigate here as we're outside React context
            }

            return Promise.reject(error);
        }
    );

    return axiosInstance;
};