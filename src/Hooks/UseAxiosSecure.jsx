import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import UseAuth from './UseAuth';

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});
const UseAxiosSecure = () => {
    const { user, signOutUser } = UseAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Request Interceptor
        const requestInterceptor = axiosSecure.interceptors.request.use(config => {
            config.headers.Authorization = `Bearer ${user?.accessToken}`
            return config;
        })

        // Response Interceptor
        const responseInterceptor = axiosSecure.interceptors.response.use(
            (response) => {
                return response
            },
            (error) => {
                console.log(error)

                const statusCode = error.status;
                if (statusCode === 401 || statusCode === 403) {
                    signOutUser()
                        .then(() => {
                            navigate("/auth/login")
                        })
                }

                return Promise.reject(error);
            }
        )

        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
        }
    }, [user, navigate, signOutUser])

    return axiosSecure
};

export default UseAxiosSecure;