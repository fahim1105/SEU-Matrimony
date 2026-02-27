import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, UserPlus, MessageSquare, FileText, CheckCircle, XCircle, Users, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router';
import { useNotifications } from '../../Context/NotificationContext';
import { useTranslation } from 'react-i18next';
import UseRole from '../../Hooks/UseRole';
import UseAuth from '../../Hooks/UseAuth';

const NotificationBell = () => {
    const { t } = useTranslation();
    const { role } = UseRole();
    const { user } = UseAuth();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAdminOnly, setShowAdminOnly] = useState(false);
    const dropdownRef = useRef(null);

    // Filter notifications based on admin toggle
    const filteredNotifications = showAdminOnly 
        ? notifications.filter(n => n.recipientRole === 'admin')
        : notifications.filter(n => n.recipientRole === 'user'); // Default: only personal

    // Count admin notifications
    const adminNotificationCount = notifications.filter(n => n.recipientRole === 'admin' && !n.isRead).length;
    const personalNotificationCount = notifications.filter(n => n.recipientRole === 'user' && !n.isRead).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleMarkAllAsRead = async () => {
        if (!user?.email) return;

        try {
            // If showing admin only, mark only admin notifications
            // If showing personal, mark only personal notifications
            if (showAdminOnly) {
                // Mark admin notifications as read
                const adminNotifIds = filteredNotifications
                    .filter(n => !n.isRead)
                    .map(n => n._id);
                
                for (const id of adminNotifIds) {
                    await markAsRead(id);
                }
            } else {
                // Mark personal notifications as read
                const personalNotifIds = filteredNotifications
                    .filter(n => !n.isRead)
                    .map(n => n._id);
                
                for (const id of personalNotifIds) {
                    await markAsRead(id);
                }
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        setShowDropdown(false);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'friend_request':
                return <UserPlus className="w-4 h-4 text-primary" />;
            case 'friend_accepted':
                return <CheckCircle className="w-4 h-4 text-success" />;
            case 'friend_rejected':
                return <XCircle className="w-4 h-4 text-error" />;
            case 'message':
                return <MessageSquare className="w-4 h-4 text-info" />;
            case 'biodata_approved':
                return <CheckCircle className="w-4 h-4 text-success" />;
            case 'biodata_rejected':
                return <XCircle className="w-4 h-4 text-error" />;
            case 'feedback_reply':
                return <Mail className="w-4 h-4 text-warning" />;
            case 'feedback_resolved':
                return <CheckCircle className="w-4 h-4 text-success" />;
            case 'pending_biodata':
                return <FileText className="w-4 h-4 text-warning" />;
            case 'new_user':
                return <Users className="w-4 h-4 text-info" />;
            case 'new_feedback':
                return <MessageSquare className="w-4 h-4 text-warning" />;
            default:
                return <Bell className="w-4 h-4 text-neutral" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'এখনই';
        if (diffMins < 60) return `${diffMins} মিনিট আগে`;
        if (diffHours < 24) return `${diffHours} ঘন্টা আগে`;
        if (diffDays < 7) return `${diffDays} দিন আগে`;
        return notifDate.toLocaleDateString('bn-BD');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 hover:bg-base-300 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-neutral" />
                {/* Show personal notification count by default */}
                {personalNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {personalNotificationCount > 9 ? '9+' : personalNotificationCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-base-100 rounded-2xl shadow-2xl border border-base-300/20 z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-base-300/20">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-sm text-neutral">
                                    {showAdminOnly ? 'Admin Notifications' : 'Notifications'}
                                </h3>
                                <p className="text-xs text-neutral/60">
                                    {showAdminOnly ? `${adminNotificationCount} unread` : `${personalNotificationCount} unread`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {(showAdminOnly ? adminNotificationCount : personalNotificationCount) > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="p-1 hover:bg-base-300 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Admin Filter Button - Only show for admins */}
                        {role === 'admin' && (
                            <button
                                onClick={() => setShowAdminOnly(!showAdminOnly)}
                                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                    showAdminOnly 
                                        ? 'bg-primary text-white' 
                                        : 'bg-base-200 text-neutral hover:bg-base-300'
                                }`}
                            >
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-semibold">
                                    {showAdminOnly ? 'Show Personal' : 'Show Admin'}
                                </span>
                                {!showAdminOnly && adminNotificationCount > 0 && (
                                    <span className="bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {adminNotificationCount > 9 ? '9+' : adminNotificationCount}
                                    </span>
                                )}
                                {showAdminOnly && personalNotificationCount > 0 && (
                                    <span className="bg-info text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {personalNotificationCount > 9 ? '9+' : personalNotificationCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="loading loading-spinner loading-md text-primary"></div>
                                <p className="text-xs text-neutral/60 mt-2">Loading...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center text-neutral/60">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">
                                    {showAdminOnly ? 'No admin notifications' : 'No notifications'}
                                </p>
                                <p className="text-xs mt-1">
                                    {showAdminOnly ? 'All admin notifications cleared!' : "You're all caught up!"}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-base-300/20">
                                {filteredNotifications.map((notification) => (
                                    <Link
                                        key={notification._id}
                                        to={notification.link || '#'}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`block p-4 hover:bg-base-200 transition-colors ${
                                            !notification.isRead ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral truncate">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-neutral/70 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-neutral/50 mt-2">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
