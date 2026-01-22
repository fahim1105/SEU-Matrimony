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
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';

const UserManagement = () => {
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
                toast.error('ইউজার তালিকা লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('ইউজার তালিকা লোড করতে সমস্যা হয়েছে');
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

        try {
            let response;
            let successMessage = '';

            switch (actionType) {
                case 'activate':
                    response = await axiosSecure.patch('/admin/activate-user', {
                        email: selectedUser.email
                    });
                    successMessage = 'ইউজার সক্রিয় করা হয়েছে';
                    break;
                case 'deactivate':
                    response = await axiosSecure.patch('/admin/deactivate-user', {
                        email: selectedUser.email,
                        reason: 'Admin action'
                    });
                    successMessage = 'ইউজার নিষ্ক্রিয় করা হয়েছে';
                    break;
                case 'verify':
                    response = await axiosSecure.patch('/admin/verify-user', {
                        email: selectedUser.email
                    });
                    successMessage = 'ইউজার ভেরিফাই করা হয়েছে';
                    break;
                case 'delete':
                    response = await axiosSecure.delete(`/admin/delete-user/${selectedUser.email}`);
                    successMessage = 'ইউজার ডিলিট করা হয়েছে';
                    break;
                default:
                    return;
            }

            if (response.data.success) {
                toast.success(successMessage);
                fetchUsers(); // Refresh the list
                setShowModal(false);
            } else {
                toast.error(response.data.message || 'অপারেশন সম্পন্ন করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error performing action:', error);
            toast.error('অপারেশন সম্পন্ন করতে সমস্যা হয়েছে');
        }
    };

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getStatusBadge = (user) => {
        if (!user.isActive) {
            return <span className="bg-error/20 text-error px-2 py-1 rounded-full text-xs font-semibold">নিষ্ক্রিয়</span>;
        }
        if (!user.isEmailVerified) {
            return <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-semibold">অভেরিফাইড</span>;
        }
        return <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-semibold">সক্রিয়</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">ইউজার তালিকা লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label="ড্যাশবোর্ডে ফিরে যান" />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        ইউজার ম্যানেজমেন্ট
                    </h1>
                    <p className="text-neutral/70 mt-2">সিস্টেমের সকল ইউজার পরিচালনা করুন</p>
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
                                <p className="text-neutral/70 text-sm">মোট ইউজার</p>
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
                                <p className="text-neutral/70 text-sm">সক্রিয় ইউজার</p>
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
                                <p className="text-neutral/70 text-sm">ভেরিফাইড ইউজার</p>
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
                                <p className="text-neutral/70 text-sm">নিষ্ক্রিয় ইউজার</p>
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
                                    placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
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
                                <option value="all">সব ইউজার</option>
                                <option value="active">সক্রিয় ইউজার</option>
                                <option value="inactive">নিষ্ক্রিয় ইউজার</option>
                                <option value="verified">ভেরিফাইড ইউজার</option>
                                <option value="unverified">অভেরিফাইড ইউজার</option>
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
                                    <th className="text-left p-4 font-semibold text-neutral">ইউজার</th>
                                    <th className="text-left p-4 font-semibold text-neutral">ইমেইল</th>
                                    <th className="text-left p-4 font-semibold text-neutral">স্ট্যাটাস</th>
                                    <th className="text-left p-4 font-semibold text-neutral">যোগদানের তারিখ</th>
                                    <th className="text-left p-4 font-semibold text-neutral">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="text-neutral/50">
                                                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                                <p>কোনো ইউজার পাওয়া যায়নি</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map((user) => (
                                        <tr key={user._id} className="border-b border-base-300 hover:bg-base-100 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-neutral">{user.displayName || 'নাম নেই'}</p>
                                                        <p className="text-sm text-neutral/70">ID: {user._id.slice(-6)}</p>
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
                                                        <span>{user.isEmailVerified ? 'ভেরিফাইড' : 'অভেরিফাইড'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-neutral/50" />
                                                    <span className="text-neutral">
                                                        {new Date(user.createdAt).toLocaleDateString('bn-BD')}
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
                                                            নিষ্ক্রিয় করুন
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAction(user, 'activate')}
                                                            className="bg-success/20 text-success px-3 py-1 rounded-lg text-sm font-semibold hover:bg-success/30 transition-all"
                                                        >
                                                            সক্রিয় করুন
                                                        </button>
                                                    )}
                                                    
                                                    {!user.isEmailVerified && (
                                                        <button
                                                            onClick={() => handleAction(user, 'verify')}
                                                            className="bg-info/20 text-info px-3 py-1 rounded-lg text-sm font-semibold hover:bg-info/30 transition-all"
                                                        >
                                                            ভেরিফাই করুন
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleAction(user, 'delete')}
                                                        className="bg-error/20 text-error px-3 py-1 rounded-lg text-sm font-semibold hover:bg-error/30 transition-all"
                                                    >
                                                        ডিলিট
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
                                    {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} ইউজার
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-base-100 text-neutral rounded-lg font-semibold hover:bg-base-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        পূর্ববর্তী
                                    </button>
                                    <span className="px-4 py-2 bg-primary text-base-100 rounded-lg font-semibold">
                                        {currentPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-base-100 text-neutral rounded-lg font-semibold hover:bg-base-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        পরবর্তী
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
                            {actionType === 'activate' && 'ইউজার সক্রিয় করুন'}
                            {actionType === 'deactivate' && 'ইউজার নিষ্ক্রিয় করুন'}
                            {actionType === 'verify' && 'ইউজার ভেরিফাই করুন'}
                            {actionType === 'delete' && 'ইউজার ডিলিট করুন'}
                        </h3>
                        
                        <p className="text-neutral/70 mb-6">
                            আপনি কি নিশ্চিত যে আপনি <strong>{selectedUser?.displayName || selectedUser?.email}</strong> কে{' '}
                            {actionType === 'activate' && 'সক্রিয় করতে'}
                            {actionType === 'deactivate' && 'নিষ্ক্রিয় করতে'}
                            {actionType === 'verify' && 'ভেরিফাই করতে'}
                            {actionType === 'delete' && 'ডিলিট করতে'}
                            {' '}চান?
                        </p>

                        {actionType === 'delete' && (
                            <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2 text-error">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-semibold">সতর্কতা!</span>
                                </div>
                                <p className="text-error text-sm mt-1">
                                    এই অপারেশন পূর্বাবস্থায় ফেরানো যাবে না। ইউজারের সকল ডেটা স্থায়ীভাবে মুছে যাবে।
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-base-100 text-neutral py-2 rounded-xl font-semibold hover:bg-base-300 transition-all"
                            >
                                বাতিল
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
                                নিশ্চিত করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;