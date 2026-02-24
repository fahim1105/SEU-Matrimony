import { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    UserCheck, 
    UserX, 
    Mail, 
    Shield, 
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoveLoader from '../../Components/LoveLoader/LoveLoader';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const UserManagement = () => {
    const { t, i18n } = useTranslation();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, verified, unverified
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(20);
    const [pendingActions, setPendingActions] = useState({}); // Track pending actions per user
    
    const axiosSecure = UseAxiosSecure();
    const queryClient = useQueryClient();
    
    // Format date based on current language
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const locale = i18n.language === 'bn' ? 'bn-BD' : 'en-US';
        return date.toLocaleDateString(locale);
    };

    // Fetch users with React Query
    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await axiosSecure.get('/admin/all-users');
            if (response.data.success) {
                // Sort by createdAt descending (latest first)
                const sortedUsers = response.data.users.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                return sortedUsers;
            }
            throw new Error(response.data.message || 'Failed to fetch users');
        },
        staleTime: 30000, // Consider data fresh for 30 seconds
        refetchOnWindowFocus: false
    });

    // Toggle user status mutation with optimistic update
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ email, isActive, reason }) => {
            const response = await axiosSecure.patch(`/admin/user-status/${email}`, {
                isActive,
                reason
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update status');
            }
            return response.data;
        },
        onMutate: async ({ email, isActive }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['users'] });

            // Snapshot previous value
            const previousUsers = queryClient.getQueryData(['users']);

            // Optimistically update to the new value
            queryClient.setQueryData(['users'], (old) =>
                old.map((user) =>
                    user.email === email
                        ? { ...user, isActive }
                        : user
                )
            );

            // Mark as pending
            setPendingActions(prev => ({ ...prev, [email]: 'status' }));

            // Return context with previous value
            return { previousUsers };
        },
        onError: (error, variables, context) => {
            // Rollback to previous value on error
            if (context?.previousUsers) {
                queryClient.setQueryData(['users'], context.previousUsers);
            }
            toast.error(error.message || t('userManagement.actionError'));
        },
        onSuccess: (data, variables) => {
            const message = variables.isActive 
                ? t('userManagement.activateSuccess')
                : t('userManagement.deactivateSuccess');
            toast.success(message);
        },
        onSettled: (data, error, variables) => {
            // Remove pending state
            setPendingActions(prev => {
                const newState = { ...prev };
                delete newState[variables.email];
                return newState;
            });
            // Invalidate and refetch in background (don't reset pagination)
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    // Delete user mutation with optimistic update
    const deleteUserMutation = useMutation({
        mutationFn: async (email) => {
            const response = await axiosSecure.delete(`/admin/user/${email}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete user');
            }
            return response.data;
        },
        onMutate: async (email) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['users'] });

            // Snapshot previous value
            const previousUsers = queryClient.getQueryData(['users']);

            // Optimistically remove user from list
            queryClient.setQueryData(['users'], (old) =>
                old.filter((user) => user.email !== email)
            );

            // Mark as pending
            setPendingActions(prev => ({ ...prev, [email]: 'delete' }));

            // Return context with previous value
            return { previousUsers };
        },
        onError: (error, email, context) => {
            // Rollback to previous value on error
            if (context?.previousUsers) {
                queryClient.setQueryData(['users'], context.previousUsers);
            }
            toast.error(error.message || t('userManagement.actionError'));
        },
        onSuccess: () => {
            toast.success(t('userManagement.deleteSuccess'));
        },
        onSettled: (data, error, email) => {
            // Remove pending state
            setPendingActions(prev => {
                const newState = { ...prev };
                delete newState[email];
                return newState;
            });
            // Invalidate and refetch in background (don't reset pagination)
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    // Verify user mutation
    const verifyUserMutation = useMutation({
        mutationFn: async (email) => {
            const response = await axiosSecure.patch('/verify-email', { email });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to verify user');
            }
            return response.data;
        },
        onMutate: async (email) => {
            await queryClient.cancelQueries({ queryKey: ['users'] });
            const previousUsers = queryClient.getQueryData(['users']);

            queryClient.setQueryData(['users'], (old) =>
                old.map((user) =>
                    user.email === email
                        ? { ...user, isEmailVerified: true }
                        : user
                )
            );

            setPendingActions(prev => ({ ...prev, [email]: 'verify' }));
            return { previousUsers };
        },
        onError: (error, email, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(['users'], context.previousUsers);
            }
            toast.error(error.message || t('userManagement.actionError'));
        },
        onSuccess: () => {
            toast.success(t('userManagement.verifySuccess'));
        },
        onSettled: (data, error, email) => {
            setPendingActions(prev => {
                const newState = { ...prev };
                delete newState[email];
                return newState;
            });
            // Invalidate and refetch in background (don't reset pagination)
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, filterStatus]);

    const filterUsers = () => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        switch (filterStatus) {
            case 'active':
                filtered = filtered.filter(user => user.isActive);
                break;
            case 'inactive':
                filtered = filtered.filter(user => !user.isActive);
                break;
            case 'verified':
                filtered = filtered.filter(user => user.isEmailVerified);
                break;
            case 'unverified':
                filtered = filtered.filter(user => !user.isEmailVerified);
                break;
            default:
                break;
        }

        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handleToggleStatus = async (user) => {
        const newStatus = !user.isActive;
        const actionText = newStatus ? t('admin.activate') : t('admin.deactivate');
        const confirmText = newStatus ? t('admin.confirmActivate') : t('admin.confirmDeactivate');

        const result = await Swal.fire({
            title: `${actionText} ${user.displayName || user.email}?`,
            text: confirmText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus ? '#10b981' : '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('admin.confirm'),
            cancelButtonText: t('admin.cancel'),
            background: '#f3f4f6',
            color: '#374151'
        });

        if (result.isConfirmed) {
            toggleStatusMutation.mutate({
                email: user.email,
                isActive: newStatus,
                reason: 'Admin action'
            });
        }
    };

    const handleDelete = async (user) => {
        const result = await Swal.fire({
            title: t('admin.deleteUser'),
            html: `
                <p>${t('admin.wantTo')} <strong>${user.displayName || user.email}</strong> ${t('admin.confirmDelete')}</p>
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-top: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #dc2626; font-weight: 600;">
                        <span>⚠️</span>
                        <span>${t('admin.deleteWarning')}</span>
                    </div>
                    <p style="color: #dc2626; font-size: 14px; margin-top: 4px;">
                        ${t('admin.deleteWarningText')}
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('admin.confirm'),
            cancelButtonText: t('admin.cancel'),
            background: '#f3f4f6',
            color: '#374151'
        });

        if (result.isConfirmed) {
            deleteUserMutation.mutate(user.email);
        }
    };

    const handleVerify = async (user) => {
        const result = await Swal.fire({
            title: t('admin.verifyUser'),
            text: `${t('admin.wantTo')} ${user.displayName || user.email} ${t('admin.confirmVerify')}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('admin.confirm'),
            cancelButtonText: t('admin.cancel'),
            background: '#f3f4f6',
            color: '#374151'
        });

        if (result.isConfirmed) {
            verifyUserMutation.mutate(user.email);
        }
    };

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getStatusBadge = (user) => {
        const isPending = pendingActions[user.email] === 'status';
        
        if (!user.isActive) {
            return (
                <span className="bg-error/20 text-error px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    {t('admin.inactive')}
                </span>
            );
        }
        if (!user.isEmailVerified) {
            return (
                <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    {t('admin.unverified')}
                </span>
            );
        }
        return (
            <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                {t('admin.active')}
            </span>
        );
    };

    if (isLoading) {
        return <LoveLoader />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
                    <p className="text-error font-semibold">{t('admin.loadingUserList')}</p>
                    <button 
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
                        className="btn btn-primary mt-4"
                    >
                        {t('admin.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8 rounded-3xl">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label={t('common.back')} />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        {t('admin.userManagement')}
                    </h1>
                    <p className="text-neutral/70 mt-2">{t('admin.manageAllUsers')}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/20 p-3 rounded-2xl">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{users.length}</h3>
                                <p className="text-neutral/70 text-sm">{t('admin.totalUsers')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-success/20 p-3 rounded-2xl">
                                <UserCheck className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">
                                    {users.filter(u => u.isActive).length}
                                </h3>
                                <p className="text-neutral/70 text-sm">{t('admin.activeUsers')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-info/20 p-3 rounded-2xl">
                                <Shield className="w-6 h-6 text-info" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">
                                    {users.filter(u => u.isEmailVerified).length}
                                </h3>
                                <p className="text-neutral/70 text-sm">{t('admin.verifiedUsers')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-warning/20 p-3 rounded-2xl">
                                <UserX className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">
                                    {users.filter(u => !u.isActive).length}
                                </h3>
                                <p className="text-neutral/70 text-sm">{t('admin.inactiveUsers')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                                <input
                                    type="text"
                                    placeholder={t('admin.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="lg:w-64">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full py-3 px-4 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">{t('admin.allUsers')}</option>
                                <option value="active">{t('admin.activeUsers')}</option>
                                <option value="inactive">{t('admin.inactiveUsers')}</option>
                                <option value="verified">{t('admin.verifiedUsers')}</option>
                                <option value="unverified">{t('admin.unverifiedUsers')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-base-200 rounded-3xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary/80">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-neutral">{t('admin.user')}</th>
                                    <th className="text-left p-4 font-semibold text-neutral">{t('admin.email')}</th>
                                    <th className="text-left p-4 font-semibold text-neutral">{t('admin.status')}</th>
                                    <th className="text-left p-4 font-semibold text-neutral">{t('admin.joinDate')}</th>
                                    <th className="text-left p-4 font-semibold text-neutral">{t('admin.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="text-neutral/50">
                                                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                                <p>{t('admin.noUsers')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map((user) => (
                                        <tr key={user._id} className="border-b border-base-300 hover:bg-base-100 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center overflow-hidden">
                                                        {user.photoURL ? (
                                                            <img
                                                                src={user.photoURL}
                                                                alt={user.displayName}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <Users 
                                                            className="w-5 h-5 text-primary" 
                                                            style={{ display: user.photoURL ? 'none' : 'block' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-neutral">{user.displayName || t('admin.noName')}</p>
                                                        <p className="text-sm text-neutral/70">
                                                            {user.role === 'admin' && (
                                                                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-semibold mr-1">
                                                                    Admin
                                                                </span>
                                                            )}
                                                            ID: {user._id.slice(-6)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-neutral/50" />
                                                    <span className="text-neutral">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    {getStatusBadge(user)}
                                                    <div className="flex items-center gap-1 text-xs text-neutral/50">
                                                        {user.isEmailVerified ? (
                                                            <CheckCircle className="w-3 h-3 text-success" />
                                                        ) : (
                                                            <XCircle className="w-3 h-3 text-error" />
                                                        )}
                                                        <span>{user.isEmailVerified ? t('admin.verified') : t('admin.unverified')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-neutral/50" />
                                                    <span className="text-neutral">
                                                        {formatDate(user.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {user.isActive ? (
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            disabled={!!pendingActions[user.email]}
                                                            className="bg-warning/20 text-warning px-3 py-1 rounded-lg text-sm font-semibold hover:bg-warning/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                        >
                                                            {pendingActions[user.email] === 'status' && (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            )}
                                                            {t('admin.deactivate')}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            disabled={!!pendingActions[user.email]}
                                                            className="bg-success/20 text-success px-3 py-1 rounded-lg text-sm font-semibold hover:bg-success/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                        >
                                                            {pendingActions[user.email] === 'status' && (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            )}
                                                            {t('admin.activate')}
                                                        </button>
                                                    )}
                                                    
                                                    {!user.isEmailVerified && (
                                                        <button
                                                            onClick={() => handleVerify(user)}
                                                            disabled={!!pendingActions[user.email]}
                                                            className="bg-info/20 text-info px-3 py-1 rounded-lg text-sm font-semibold hover:bg-info/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                        >
                                                            {pendingActions[user.email] === 'verify' && (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            )}
                                                            {t('admin.verify')}
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        disabled={!!pendingActions[user.email]}
                                                        className="bg-error/20 text-error px-3 py-1 rounded-lg text-sm font-semibold hover:bg-error/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                    >
                                                        {pendingActions[user.email] === 'delete' ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3 h-3" />
                                                        )}
                                                        {t('admin.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-base-300">
                            <div className="flex items-center justify-between">
                                <p className="text-neutral/70">
                                    {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} {t('admin.of')} {filteredUsers.length} {t('admin.users')}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-base-100 text-neutral rounded-lg font-semibold hover:bg-base-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('admin.previous')}
                                    </button>
                                    <span className="px-4 py-2 bg-primary text-base-100 rounded-lg font-semibold">
                                        {currentPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-base-100 text-neutral rounded-lg font-semibold hover:bg-base-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('admin.next')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;