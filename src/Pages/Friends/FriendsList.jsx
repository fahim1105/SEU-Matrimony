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

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [showUnfriendModal, setShowUnfriendModal] = useState(false);
    
    const { user } = UseAuth();
    const axiosSecure = UseAxiosSecure();

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
            toast.error('ফ্রেন্ডস লিস্ট লোড করতে সমস্যা হয়েছে');
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

    const handleUnfriend = (friend) => {
        setSelectedFriend(friend);
        setShowUnfriendModal(true);
    };

    const confirmUnfriend = async () => {
        if (!selectedFriend) return;

        try {
            const response = await axiosSecure.delete(`/unfriend-by-email/${user.email}/${selectedFriend.friendEmail}`);
            
            if (response.data.success) {
                toast.success('সফলভাবে আনফ্রেন্ড করা হয়েছে');
                setFriends(prev => prev.filter(f => f._id !== selectedFriend._id));
                setShowUnfriendModal(false);
            } else {
                toast.error(response.data.message || 'আনফ্রেন্ড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error unfriending:', error);
            toast.error('আনফ্রেন্ড করতে সমস্যা হয়েছে');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">ফ্রেন্ডস লিস্ট লোড হচ্ছে...</p>
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
                        আমার ফ্রেন্ডস
                    </h1>
                    <p className="text-neutral/70 mt-2">আপনার কানেক্টেড ম্যাচসমূহ</p>
                </div>

                {/* Stats */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-4 rounded-2xl">
                            <Heart className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-neutral">{friends.length}</h3>
                            <p className="text-neutral/70">জন কানেক্টেড ফ্রেন্ড</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                        <input
                            type="text"
                            placeholder="নাম, ডিপার্টমেন্ট বা জেলা দিয়ে খুঁজুন..."
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
                            {searchTerm ? 'কোনো ফ্রেন্ড পাওয়া যায়নি' : 'এখনও কোনো ফ্রেন্ড নেই'}
                        </h3>
                        <p className="text-neutral/70 mb-4">
                            {searchTerm ? 'অন্য নাম দিয়ে খুঁজে দেখুন' : 'ম্যাচ খুঁজুন এবং কানেকশন রিকোয়েস্ট পাঠান'}
                        </p>
                        {!searchTerm && (
                            <Link 
                                to="/browse-matches" 
                                className="btn btn-primary gap-2"
                            >
                                <Search className="w-4 h-4" />
                                ম্যাচ খুঁজুন
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
                                                {new Date(friend.connectedAt).toLocaleDateString('bn-BD')} এ কানেক্ট হয়েছেন
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {friend.biodataId ? (
                                            <Link
                                                to={`/profile/${friend.biodataId}`}
                                                className="w-full bg-primary text-base-100 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all block text-center"
                                            >
                                                প্রোফাইল দেখুন
                                            </Link>
                                        ) : friend.friendEmail ? (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        // Get friend's biodata using their email
                                                        const biodataResponse = await axiosSecure.get(`/biodata/${friend.friendEmail}`);
                                                        if (biodataResponse.data.success && biodataResponse.data.biodata.biodataId) {
                                                            // Navigate to profile using the found biodataId
                                                            window.location.href = `/profile/${biodataResponse.data.biodata.biodataId}`;
                                                        } else {
                                                            toast.error('প্রোফাইল তথ্য পাওয়া যায়নি');
                                                        }
                                                    } catch (error) {
                                                        console.error('Error getting biodata:', error);
                                                        toast.error('প্রোফাইল লোড করতে সমস্যা হয়েছে');
                                                    }
                                                }}
                                                className="w-full bg-primary text-base-100 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all block text-center"
                                            >
                                                প্রোফাইল দেখুন
                                            </button>
                                        ) : (
                                            <div className="w-full bg-base-300 text-neutral/50 py-3 rounded-xl font-semibold text-center cursor-not-allowed">
                                                প্রোফাইল উপলব্ধ নয়
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-3">
                                            <Link
                                                to="/dashboard/messages"
                                                className="flex-1 bg-success text-base-100 py-2 rounded-xl font-semibold hover:bg-success/90 transition-all flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                মেসেজ
                                            </Link>
                                            
                                            <button
                                                onClick={() => handleUnfriend(friend)}
                                                className="flex-1 bg-warning text-base-100 py-2 rounded-xl font-semibold hover:bg-warning/90 transition-all flex items-center justify-center gap-2"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                আনফ্রেন্ড
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Unfriend Modal */}
            {showUnfriendModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-200 p-6 rounded-3xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-neutral mb-4">আনফ্রেন্ড করুন</h3>
                        
                        <p className="text-neutral/70 mb-6">
                            আপনি কি নিশ্চিত যে আপনি <strong>{selectedFriend?.name}</strong> কে আনফ্রেন্ড করতে চান?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUnfriendModal(false)}
                                className="flex-1 bg-base-100 text-neutral py-2 rounded-xl font-semibold hover:bg-base-300 transition-all"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={confirmUnfriend}
                                className="flex-1 bg-warning text-base-100 py-2 rounded-xl font-semibold hover:bg-warning/90 transition-all"
                            >
                                আনফ্রেন্ড করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendsList;