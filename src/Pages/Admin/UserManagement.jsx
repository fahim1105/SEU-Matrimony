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
    AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, verified, unverified
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(''); // activate, deactivate, verify, delete
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    
    // Format date based on current language
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const locale = i18n.language === 'bn' ? 'bn-BD' : 'en-US';
        return date.toLocaleDateString(locale);
    };

    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, filterStatus]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get('/admin/all-users');
            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                toast.error(t('admin.loadingUserList'));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(t('admin.loadingUserList'));
        } finally {
            setLoading(false);
        }
    };

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

    const handleAction = (user, action) => {
        setSelectedUser(user);
        setActionType(action);
        setShowModal(true);
    };

    const confirmAction = async () => {
        if (!selectedUser || !actionType) return;

        // Optimistic UI update
        const originalUsers = [...users];
        
        if (actionType === 'delete') {
            // Remove user from list immediately
            setUsers(users.filter(u => u.email !== selectedUser.email));
        } else if (actionType === 'activate' || actionType === 'deactivate') {
            // Update user status immediately
            setUsers(users.map(u => 
                u.email === selectedUser.email 
                    ? { ...u, isActive: actionType === 'activate' }
                    : u
            ));
        } else if (actionType === 'verify') {
            // Update verification status immediately
            setUsers(users.map(u => 
                u.email === selectedUser.email 
                    ? { ...u, isEmailVerified: true }
                    : u
            ));
        }

        setShowModal(false);

        try {
            let response;
            let successMessage = '';

            switch (actionType) {
                case 'activate':
                    response = await axiosSecure.patch(`/admin/user-status/${selectedUser.email}`, {
                        isActive: true
                    });
                    successMessage = t('userManagement.activateSuccess');
                    break;
                case 'deactivate':
                    response = await axiosSecure.patch(`/admin/user-status/${selectedUser.email}`, {
                        isActive: false,
                        reason: 'Admin action'
                    });
                    successMessage = t('userManagement.deactivateSuccess');
                    break;
                case 'verify':
                    response = await axiosSecure.patch('/verify-email', {
                        email: selectedUser.email
                    });
                    successMessage = t('userManagement.verifySuccess');
                    break;
                case 'delete':
                    response = await axiosSecure.delete(`/admin/user/${selectedUser.email}`);
                    successMessage = t('userManagement.deleteSuccess');
                    break;
                default:
                    return;
            }

            if (response.data.success) {
                toast.success(successMessage);
                // Refresh to get latest data from server
                fetchUsers();
            } else {
                // Revert optimistic update on error
                setUsers(originalUsers);
                toast.error(response.data.message || t('userManagement.actionError'));
            }
        } catch (error) {
            console.error('Error performing action:', error);
            // Revert optimistic update on error
            setUsers(originalUsers);
            toast.error(error.response?.data?.message || t('userManagement.actionError'));
        }
    };

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getStatusBadge = (user) => {
        if (!user.isActive) {
            return <span className="bg-error/20 text-error px-2 py-1 rounded-full text-xs font-semibold">{t('admin.inactive')}</span>;
        }
        if (!user.isEmailVerified) {
            return <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-semibold">{t('admin.unverified')}</span>;
        }
        return <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-semibold">{t('admin.active')}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">{t('admin.loadingUserList')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8">
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
                                                            onClick={() => handleAction(user, 'deactivate')}
                                                            className="bg-warning/20 text-warning px-3 py-1 rounded-lg text-sm font-semibold hover:bg-warning/30 transition-all"
                                                        >
                                                            {t('admin.deactivate')}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAction(user, 'activate')}
                                                            className="bg-success/20 text-success px-3 py-1 rounded-lg text-sm font-semibold hover:bg-success/30 transition-all"
                                                        >
                                                            {t('admin.activate')}
                                                        </button>
                                                    )}
                                                    
                                                    {!user.isEmailVerified && (
                                                        <button
                                                            onClick={() => handleAction(user, 'verify')}
                                                            className="bg-info/20 text-info px-3 py-1 rounded-lg text-sm font-semibold hover:bg-info/30 transition-all"
                                                        >
                                                            {t('admin.verify')}
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleAction(user, 'delete')}
                                                        className="bg-error/20 text-error px-3 py-1 rounded-lg text-sm font-semibold hover:bg-error/30 transition-all"
                                                    >
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

            {/* Action Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-200 p-6 rounded-3xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-neutral mb-4">
                            {actionType === 'activate' && t('admin.activateUser')}
                            {actionType === 'deactivate' && t('admin.deactivateUser')}
                            {actionType === 'verify' && t('admin.verifyUser')}
                            {actionType === 'delete' && t('admin.deleteUser')}
                        </h3>
                        
                        <p className="text-neutral/70 mb-6">
                            {t('admin.wantTo')} <strong>{selectedUser?.displayName || selectedUser?.email}</strong>{' '}
                            {actionType === 'activate' && t('admin.confirmActivate')}
                            {actionType === 'deactivate' && t('admin.confirmDeactivate')}
                            {actionType === 'verify' && t('admin.confirmVerify')}
                            {actionType === 'delete' && t('admin.confirmDelete')}
                        </p>

                        {actionType === 'delete' && (
                            <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2 text-error">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-semibold">{t('admin.deleteWarning')}</span>
                                </div>
                                <p className="text-error text-sm mt-1">
                                    {t('admin.deleteWarningText')}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-base-100 text-neutral py-2 rounded-xl font-semibold hover:bg-base-300 transition-all"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
                                    actionType === 'delete' 
                                        ? 'bg-error text-base-100 hover:bg-error/90'
                                        : actionType === 'deactivate'
                                        ? 'bg-warning text-base-100 hover:bg-warning/90'
                                        : 'bg-success text-base-100 hover:bg-success/90'
                                }`}
                            >
                                {t('admin.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;