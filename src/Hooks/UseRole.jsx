import { useQuery } from '@tanstack/react-query';
import UseAuth from './UseAuth';
import UseAxiosSecure from './UseAxiosSecure';

const UseRole = () => {
    const { user, loading } = UseAuth();
    const axiosSecure = UseAxiosSecure();

    const { isLoading: roleLoading, data: role = 'user' } = useQuery({
        queryKey: ['user-role', user?.email],
        queryFn: async () => {
            if (!user?.email || !user.getIdToken) return 'user';
            
            try {
                const res = await axiosSecure.get(`/user/${user.email}`);
                if (res.data.success) {
                    return res.data.user?.role || 'user';
                }
                return 'user';
            } catch (error) {
                console.error('Error fetching user role:', error);
                // Enhanced fallback for Google users
                if (user.email && user.email.endsWith('@seu.edu.bd')) {
                    const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com');
                    if (isGoogleUser) {
                        console.log('Using fallback role for Google user');
                        return 'user'; // Default role for Google users
                    }
                }
                return 'user';
            }
        },
        enabled: !!user?.email && !loading && typeof user?.getIdToken === 'function',
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
    });

    return { role, roleLoading };
};

export default UseRole;

