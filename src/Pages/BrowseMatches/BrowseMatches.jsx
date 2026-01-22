import { useState, useEffect } from 'react';
import { Search, Filter, Heart, Eye, MapPin, GraduationCap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import toast from 'react-hot-toast';

const BrowseMatches = () => {
    const [biodatas, setBiodatas] = useState([]);
    const [filteredBiodatas, setFilteredBiodatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingRequests, setSendingRequests] = useState({});
    const [filters, setFilters] = useState({
        gender: '',
        department: '',
        bloodGroup: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    const axiosSecure = UseAxiosSecure();
    const { user } = UseAuth();
    const { getUserInfo } = UseUserManagement();
    const navigate = useNavigate();

    useEffect(() => {
        checkUserStatusAndFetchBiodatas();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [biodatas, filters, searchTerm]);

    const checkUserStatusAndFetchBiodatas = async () => {
        if (!user?.email) return;

        try {
            // Check user verification status
            const userResult = await getUserInfo(user.email);
            
            if (!userResult.success) {
                toast.error('ইউজার তথ্য পাওয়া যায়নি');
                return;
            }

            const userInfo = userResult.user;

            if (!userInfo.isEmailVerified) {
                toast.error('প্রথমে ইমেইল ভেরিফাই করুন');
                return;
            }

            if (!userInfo.isActive) {
                toast.error('আপনার একাউন্ট নিষ্ক্রিয় রয়েছে');
                return;
            }

            // Fetch approved biodatas
            await fetchBiodatas();
        } catch (error) {
            console.error('Error checking user status:', error);
            toast.error('ইউজার স্ট্যাটাস চেক করতে সমস্যা হয়েছে');
        }
    };

    const fetchBiodatas = async () => {
        setLoading(true);
        try {
            // Use new endpoint that excludes connected users
            const response = await axiosSecure.get(`/browse-matches/${user.email}`);
            
            if (response.data.success) {
                setBiodatas(response.data.matches || []);
            } else {
                setBiodatas([]);
                toast.error(response.data.message || 'বায়োডাটা লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching biodatas:', error);
            const message = error.response?.data?.message || 'বায়োডাটা লোড করতে সমস্যা হয়েছে';
            toast.error(message);
            setBiodatas([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...biodatas];

        // Apply gender filter
        if (filters.gender) {
            filtered = filtered.filter(biodata => biodata.gender === filters.gender);
        }

        // Apply department filter
        if (filters.department) {
            filtered = filtered.filter(biodata => 
                biodata.department?.toLowerCase().includes(filters.department.toLowerCase())
            );
        }

        // Apply blood group filter
        if (filters.bloodGroup) {
            filtered = filtered.filter(biodata => biodata.bloodGroup === filters.bloodGroup);
        }

        // Apply search term
        if (searchTerm) {
            filtered = filtered.filter(biodata =>
                biodata.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                biodata.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                biodata.district?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBiodatas(filtered);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            gender: '',
            department: '',
            bloodGroup: ''
        });
        setSearchTerm('');
    };

    const sendConnectionRequest = async (receiverEmail) => {
        // Prevent multiple requests for the same user
        if (sendingRequests[receiverEmail]) return;
        
        setSendingRequests(prev => ({ ...prev, [receiverEmail]: true }));
        
        try {
            const requestData = {
                senderEmail: user.email,
                receiverEmail: receiverEmail,
                status: 'pending',
                sentAt: new Date()
            };

            const response = await axiosSecure.post('/send-request', requestData);
            
            if (response.data.success) {
                toast.success('কানেকশন রিকোয়েস্ট পাঠানো হয়েছে');
            } else {
                toast.error(response.data.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            const message = error.response?.data?.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে';
            toast.error(message);
        } finally {
            setSendingRequests(prev => ({ ...prev, [receiverEmail]: false }));
        }
    };

    const viewProfile = (biodataId) => {
        navigate(`/profile/${biodataId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">বায়োডাটা লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8 lg:py-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral mb-2">ম্যাচ খুঁজুন</h1>
                    <p className="text-neutral/70">আপনার জীবনসঙ্গী খুঁজে নিন</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-neutral/50" />
                            <input
                                type="text"
                                placeholder="নাম, ডিপার্টমেন্ট বা জেলা দিয়ে খুঁজুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-base-100 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-primary text-base-100 px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                            <Filter className="w-5 h-5" />
                            ফিল্টার
                        </button>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-base-300">
                            <select
                                value={filters.gender}
                                onChange={(e) => handleFilterChange('gender', e.target.value)}
                                className="bg-base-100 border border-base-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">সব জেন্ডার</option>
                                <option value="Male">পুরুষ</option>
                                <option value="Female">মহিলা</option>
                            </select>

                            <input
                                type="text"
                                placeholder="ডিপার্টমেন্ট"
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="bg-base-100 border border-base-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />

                            <select
                                value={filters.bloodGroup}
                                onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                                className="bg-base-100 border border-base-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">সব ব্লাড গ্রুপ</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>

                            <button
                                onClick={clearFilters}
                                className="bg-base-100 text-neutral border border-base-300 rounded-xl px-4 py-2 hover:bg-base-300 transition-all"
                            >
                                ক্লিয়ার করুন
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-neutral/70">
                        {filteredBiodatas.length} টি প্রোফাইল পাওয়া গেছে
                    </p>
                </div>

                {/* Biodata Grid */}
                {filteredBiodatas.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-neutral mb-2">কোনো ম্যাচ পাওয়া যায়নি</h3>
                        <p className="text-neutral/70">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBiodatas.map((biodata) => (
                            <div key={biodata._id} className="bg-base-200 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                                {/* Profile Image */}
                                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden rounded-t-3xl">
                                    {biodata.profileImage ? (
                                        <img 
                                            src={biodata.profileImage} 
                                            alt={biodata.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="w-full h-full flex items-center justify-center text-6xl" 
                                        style={{ display: biodata.profileImage ? 'none' : 'flex' }}
                                    >
                                        👤
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-neutral mb-2">{biodata.name}</h3>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-neutral/70">
                                            <Calendar className="w-4 h-4" />
                                            <span>{biodata.age} বছর • {biodata.gender === 'Male' ? 'পুরুষ' : 'মহিলা'}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-neutral/70">
                                            <GraduationCap className="w-4 h-4" />
                                            <span>{biodata.department}</span>
                                            {biodata.batch && <span> • {biodata.batch}</span>}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-neutral/70">
                                            <MapPin className="w-4 h-4" />
                                            <span>{biodata.district}</span>
                                        </div>

                                        {biodata.bloodGroup && (
                                            <div className="flex items-center gap-2 text-sm text-neutral/70">
                                                <span className="w-4 h-4 text-center">🩸</span>
                                                <span>{biodata.bloodGroup}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => viewProfile(biodata.biodataId || biodata._id)}
                                            className="flex-1 bg-base-100 text-neutral py-2 rounded-xl font-semibold hover:bg-base-300 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            দেখুন
                                        </button>
                                        
                                        <button
                                            onClick={() => sendConnectionRequest(biodata.contactEmail)}
                                            disabled={sendingRequests[biodata.contactEmail]}
                                            className="flex-1 bg-primary text-base-100 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Heart className="w-4 h-4" />
                                            {sendingRequests[biodata.contactEmail] ? 'পাঠানো হচ্ছে...' : 'রিকোয়েস্ট পাঠান'}
                                        </button>
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

export default BrowseMatches;