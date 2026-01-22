import { useQuery } from '@tanstack/react-query';
import React from 'react';
import UseAuth from './UseAuth';
import UseAxiosSecure from './UseAxiosSecure';

const UseRole = () => {
    const { user, loading } = UseAuth();
    const axiosSecure = UseAxiosSecure();

    const { isLoading: roleLoading, data: role = 'user' } = useQuery({
        queryKey: ['user-role', user?.email],
        queryFn: async () => {
            if (!user?.email) return 'user';
            
            try {
                const res = await axiosSecure.get(`/user/${user.email}`);
                if (res.data.success) {
                    return res.data.user?.role || 'user';
                }
                return 'user';
            } catch (error) {
                console.error('Error fetching user role:', error);
                return 'user';
            }
        },
        enabled: !!user?.email && !loading,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
    });

    return { role, roleLoading };
};

export default UseRole;

