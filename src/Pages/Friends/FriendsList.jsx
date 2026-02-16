import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
    Users, 
    MessageCircle, 
    User, 
    Calendar, 
    MapPin, 
    GraduationCap,
    Heart,
    Search,
    UserMinus
} from 'lucide-react';
import UseAuth from '../../Hooks/UseAuth';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const { user } = UseAuth();
    const axiosSecure = UseAxiosSecure();
    const { t } = useTranslation();

    useEffect(() => {
        if (user?.email) {
            fetchFriends();
        }
    }, [user]);

    useEffect(() => {
        filterFriends();
    }, [friends, searchTerm]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/friends-list/${user.email}`);
            if (response.data.success) {
                console.log('Friends data received:', response.data.friends);
                setFriends(response.data.friends);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
            toast.error(t('friends.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const filterFriends = () => {
        if (!searchTerm) {
            setFilteredFriends(friends);
        } else {
            const filtered = friends.filter(friend =>
                friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                friend.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                friend.district.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    };

    const handleUnfriend = async (friend) => {
        // Show SweetAlert2 confirmation dialog
        const result = await Swal.fire({
            title: t('friends.unfriendConfirm'),
            text: t('friends.unfriendMessage', { name: friend.name }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('friends.yes'),
            cancelButtonText: t('friends.cancel'),
            background: '#f3f4f6',
            color: '#374151',
            customClass: {
                popup: 'rounded-2xl',
                title: 'text-lg font-bold',
                content: 'text-sm',
                confirmButton: 'rounded-xl px-6 py-2 font-semibold',
                cancelButton: 'rounded-xl px-6 py-2 font-semibold'
            }
        });

        if (!result.isConfirmed) return;

        try {
            const response = await axiosSecure.delete(`/unfriend-by-email/${user.email}/${friend.friendEmail}`);
            
            if (response.data.success) {
                toast.success(t('friends.unfriendSuccess'));
                setFriends(prev => prev.filter(f => f._id !== friend._id));
            } else {
                toast.error(response.data.message || t('friends.unfriendError'));
            }
        } catch (error) {
            console.error('Error unfriending:', error);
            toast.error(t('friends.unfriendError'));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">{t('friends.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label={t('friends.backToDashboard')} />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        {t('friends.title')}
                    </h1>
                    <p className="text-neutral/70 mt-2">{t('friends.subtitle')}</p>
                </div>

                {/* Stats */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-4 rounded-2xl">
                            <Heart className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-neutral">{friends.length}</h3>
                            <p className="text-neutral/70">{t('friends.connectedFriends')}</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                        <input
                            type="text"
                            placeholder={t('friends.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Friends Grid */}
                {filteredFriends.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-neutral mb-2">
                            {searchTerm ? t('friends.noSearchResults') : t('friends.noFriends')}
                        </h3>
                        <p className="text-neutral/70 mb-4">
                            {searchTerm ? t('friends.noSearchResultsDesc') : t('friends.noFriendsDesc')}
                        </p>
                        {!searchTerm && (
                            <Link 
                                to="/browse-matches" 
                                className="btn btn-primary gap-2"
                            >
                                <Search className="w-4 h-4" />
                                {t('friends.findMatches')}
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFriends.map((friend) => (
                            <div key={friend._id} className="bg-base-200 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                                {/* Profile Image */}
                                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden rounded-t-3xl">
                                    {friend.profileImage ? (
                                        <img 
                                            src={friend.profileImage} 
                                            alt={friend.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <User 
                                        className="w-20 h-20 text-primary" 
                                        style={{ display: friend.profileImage ? 'none' : 'block' }}
                                    />
                                </div>

                                {/* Friend Info */}
                                <div className="p-6">
                                    <div className="text-center mb-4">
                                        <h3 className="text-xl font-bold text-neutral mb-1">{friend.name}</h3>
                                        <p className="text-neutral/70">{friend.age} বছর</p>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-sm">
                                            <GraduationCap className="w-4 h-4 text-primary" />
                                            <span className="text-neutral">{friend.department}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span className="text-neutral">{friend.district}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span className="text-neutral/70">
                                                {new Date(friend.connectedAt).toLocaleDateString('bn-BD')} {t('friends.connectedOn')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <Link
                                            to={`/profile/${friend.friendObjectId || friend.biodataId}`}
                                            className="w-full bg-primary text-base-100 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all block text-center"
                                        >
                                            {t('friends.viewProfile')}
                                        </Link>
                                        
                                        <div className="flex gap-3">
                                            <Link
                                                to="/messages"
                                                className="flex-1 bg-success text-base-100 py-2 rounded-xl font-semibold hover:bg-success/90 transition-all flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                {t('friends.message')}
                                            </Link>
                                            
                                            <button
                                                onClick={() => handleUnfriend(friend)}
                                                className="flex-1 bg-warning text-base-100 py-2 rounded-xl font-semibold hover:bg-warning/90 transition-all flex items-center justify-center gap-2"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                {t('friends.unfriend')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsList;