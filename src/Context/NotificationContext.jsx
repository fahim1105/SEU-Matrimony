import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import UseAuth from '../Hooks/UseAuth';
import UseAxiosSecure from '../Hooks/UseAxiosSecure';
import UseRole from '../Hooks/UseRole';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = UseAuth();
    const { role } = UseRole();
    const axiosSecure = UseAxiosSecure();
    
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!user?.email) return;

        try {
            setLoading(true);
            const endpoint = role === 'admin' 
                ? `/notifications/admin/${user.email}`
                : `/notifications/user/${user.email}`;
            
            console.log('🔔 Fetching notifications from:', endpoint);
            console.log('👤 User role:', role);
            
            const response = await axiosSecure.get(endpoint);
            
            console.log('📨 Notifications response:', response.data);
            
            if (response.data.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
                
                // Log admin notifications count
                const adminNotifs = response.data.notifications.filter(n => n.recipientRole === 'admin');
                console.log('👨‍💼 Admin notifications count:', adminNotifs.length);
                console.log('👤 Personal notifications count:', response.data.notifications.length - adminNotifs.length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.email, role, axiosSecure]);

    // Mark as read
    const markAsRead = async (notificationId) => {
        try {
            await axiosSecure.patch(`/notifications/${notificationId}/read`);
            
            // Update local state
            setNotifications(prev => 
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        if (!user?.email) return;

        try {
            await axiosSecure.patch(`/notifications/mark-all-read/${user.email}?role=${role}`);
            
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Auto-fetch on mount and every 10 seconds
    useEffect(() => {
        if (user?.email) {
            fetchNotifications();
            
            const interval = setInterval(() => {
                fetchNotifications();
            }, 10000); // 10 seconds
            
            return () => clearInterval(interval);
        }
    }, [user?.email, fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
