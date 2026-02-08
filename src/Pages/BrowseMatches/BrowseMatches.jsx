import { useState, useEffect } from 'react';
import { Search, Filter, Heart, Eye, MapPin, GraduationCap, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import { apiWithFallback } from '../../utils/apiChecker';
import { localStorageManager } from '../../utils/localStorageManager';
import toast from 'react-hot-toast';

const BrowseMatches = () => {
    const { t } = useTranslation();
    const [biodatas, setBiodatas] = useState([]);
    const [filteredBiodatas, setFilteredBiodatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingRequests, setSendingRequests] = useState({});
    const [requestStatuses, setRequestStatuses] = useState({}); // Track request status for each biodata
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

    useEffect(() => {
        // Check request statuses for all biodatas when they are loaded
        if (filteredBiodatas.length > 0 && user?.email) {
            checkAllRequestStatuses();
        }
    }, [filteredBiodatas, user]);

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

    const checkAllRequestStatuses = async () => {
        // Ensure filteredBiodatas is an array
        if (!Array.isArray(filteredBiodatas) || filteredBiodatas.length === 0) {
            return;
        }
        
        const statuses = {};
        
        for (const biodata of filteredBiodatas) {
            const biodataKey = biodata.biodataId || biodata._id;
            try {
                let response;
                
                // Try to check request status by biodata ID first
                if (biodata.biodataId) {
                    try {
                        response = await axiosSecure.get(`/request-status-by-biodata/${user.email}/${biodata.biodataId}`);
                    } catch (error) {
                        // If biodata method fails, try ObjectId method
                        if (biodata._id) {
                            try {
                                response = await axiosSecure.get(`/request-status-by-objectid/${user.email}/${biodata._id}`);
                            } catch (objectIdError) {
                                // If both server methods fail, check localStorage
                                console.log('Server request status check failed, checking localStorage');
                                const localStatus = localStorageManager.getRequestStatus(user.email, biodata.contactEmail);
                                if (localStatus.hasRequest) {
                                    statuses[biodataKey] = {
                                        hasRequest: true,
                                        status: localStatus.status,
                                        requestId: localStatus.requestId || `local_${biodataKey}`,
                                        isInitiator: true
                                    };
                                    continue;
                                }
                            }
                        }
                    }
                } else if (biodata._id) {
                    try {
                        response = await axiosSecure.get(`/request-status-by-objectid/${user.email}/${biodata._id}`);
                    } catch (error) {
                        // If server method fails, check localStorage
                        console.log('Server request status check failed, checking localStorage');
                        const localStatus = localStorageManager.getRequestStatus(user.email, biodata.contactEmail);
                        if (localStatus.hasRequest) {
                            statuses[biodataKey] = {
                                hasRequest: true,
                                status: localStatus.status,
                                requestId: localStatus.requestId || `local_${biodataKey}`,
                                isInitiator: true
                            };
                            continue;
                        }
                    }
                }
                
                if (response?.data?.success && response.data.hasRequest) {
                    statuses[biodataKey] = {
                        hasRequest: true,
                        status: response.data.status,
                        requestId: response.data.requestId,
                        isInitiator: response.data.isInitiator
                    };
                } else {
                    statuses[biodataKey] = {
                        hasRequest: false,
                        status: null,
                        requestId: null,
                        isInitiator: false
                    };
                }
            } catch (error) {
                console.log(`Request status check failed for ${biodataKey}:`, error);
                // Final fallback to localStorage
                const localStatus = localStorageManager.getRequestStatus(user.email, biodata.contactEmail);
                statuses[biodataKey] = {
                    hasRequest: localStatus.hasRequest,
                    status: localStatus.status,
                    requestId: localStatus.requestId || null,
                    isInitiator: localStatus.hasRequest
                };
            }
        }
        
        setRequestStatuses(statuses);
    };

    const cancelConnectionRequest = async (biodata) => {
        const biodataKey = biodata.biodataId || biodata._id;
        const requestStatus = requestStatuses[biodataKey];
        
        if (!requestStatus?.requestId || !requestStatus?.isInitiator) {
            toast.error('শুধুমাত্র যিনি রিকোয়েস্ট পাঠিয়েছেন তিনি বাতিল করতে পারবেন');
            return;
        }
        
        setSendingRequests(prev => ({ ...prev, [biodataKey]: true }));
        
        try {
            // Use enhanced cancel request with localStorage fallback
            const response = await apiWithFallback.cancelRequest(
                axiosSecure, 
                requestStatus.requestId, 
                user.email, 
                biodata.contactEmail
            );
            
            if (response.data.success) {
                toast.success('রিকোয়েস্ট বাতিল করা হয়েছে');
                // Update request status
                setRequestStatuses(prev => ({
                    ...prev,
                    [biodataKey]: {
                        hasRequest: false,
                        status: null,
                        requestId: null,
                        isInitiator: false
                    }
                }));
            } else {
                toast.error(response.data.message || 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error canceling request:', error);
            const message = error.response?.data?.message || error.message || 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে';
            toast.error(message);
        } finally {
            setSendingRequests(prev => ({ ...prev, [biodataKey]: false }));
        }
    };

    const fetchBiodatas = async () => {
        setLoading(true);
        try {
            // Use fallback system for browse matches
            const response = await apiWithFallback.browseMatches(axiosSecure, user.email);
            
            if (response.data.success) {
                // Backend returns 'biodatas' array
                const biodatasArray = response.data.biodatas || response.data.matches || [];
                
                // Ensure it's an array
                if (Array.isArray(biodatasArray)) {
                    setBiodatas(biodatasArray);
                } else {
                    console.error('Biodatas is not an array:', biodatasArray);
                    setBiodatas([]);
                }
            } else {
                setBiodatas([]);
                toast.error(response.data.message || 'বায়োডাটা লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching biodatas:', error);
            const message = error.response?.data?.message || error.message || 'বায়োডাটা লোড করতে সমস্যা হয়েছে';
            toast.error(message);
            setBiodatas([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        // Ensure biodatas is an array
        if (!Array.isArray(biodatas)) {
            console.error('Biodatas is not an array:', biodatas);
            setFilteredBiodatas([]);
            return;
        }
        
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

    const sendConnectionRequest = async (biodata) => {
        // Prevent multiple requests for the same user
        const requestKey = biodata.biodataId || biodata._id;
        if (sendingRequests[requestKey]) return;
        
        setSendingRequests(prev => ({ ...prev, [requestKey]: true }));
        
        try {
            let response;
            
            if (biodata.biodataId) {
                // Use biodata ID method (preferred)
                const requestData = {
                    senderEmail: user.email,
                    receiverBiodataId: biodata.biodataId,
                    receiverEmail: biodata.contactEmail, // Add receiverEmail for fallback
                    status: 'pending',
                    sentAt: new Date()
                };
                response = await apiWithFallback.sendRequestByBiodata(axiosSecure, requestData);
            } else if (biodata._id) {
                // Use ObjectId method as fallback
                const requestData = {
                    senderEmail: user.email,
                    receiverObjectId: biodata._id,
                    receiverEmail: biodata.contactEmail, // Add receiverEmail for fallback
                    status: 'pending',
                    sentAt: new Date()
                };
                response = await apiWithFallback.sendRequestByObjectId(axiosSecure, requestData);
            } else {
                throw new Error('বায়োডাটা আইডি পাওয়া যায়নি');
            }
            
            if (response.data.success) {
                toast.success('কানেকশন রিকোয়েস্ট পাঠানো হয়েছে');
                
                // Update request status immediately
                setRequestStatuses(prev => ({
                    ...prev,
                    [requestKey]: {
                        hasRequest: true,
                        status: 'pending',
                        requestId: response.data.result?.insertedId || response.data.requestId,
                        isInitiator: true
                    }
                }));
            } else {
                toast.error(response.data.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            const message = error.message || error.response?.data?.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে';
            toast.error(message);
        } finally {
            setSendingRequests(prev => ({ ...prev, [requestKey]: false }));
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
                    <p className="text-neutral/70">{t('browseMatches.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8 lg:py-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral mb-2">{t('browseMatches.title')}</h1>
                    <p className="text-neutral/70">{t('browseMatches.subtitle')}</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-neutral/50" />
                            <input
                                type="text"
                                placeholder={t('browseMatches.searchPlaceholder')}
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
                            {t('browseMatches.filterButton')}
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
                                <option value="">{t('browseMatches.allGenders')}</option>
                                <option value="Male">{t('browseMatches.male')}</option>
                                <option value="Female">{t('browseMatches.female')}</option>
                            </select>

                            <input
                                type="text"
                                placeholder={t('browseMatches.department')}
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="bg-base-100 border border-base-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />

                            <select
                                value={filters.bloodGroup}
                                onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                                className="bg-base-100 border border-base-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">{t('browseMatches.allBloodGroups')}</option>
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
                                {t('browseMatches.clearFilters')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-neutral/70">
                        {filteredBiodatas.length}{t('browseMatches.profilesFound')}
                    </p>
                </div>

                {/* Biodata Grid */}
                {filteredBiodatas.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-neutral mb-2">{t('browseMatches.noMatches')}</h3>
                        <p className="text-neutral/70">{t('browseMatches.noMatchesDesc')}</p>
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
                                            <span>{biodata.age} {t('browseMatches.years')} • {biodata.gender === 'Male' ? t('browseMatches.male') : t('browseMatches.female')}</span>
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
                                            {t('browseMatches.viewProfile')}
                                        </button>
                                        
                                        {(() => {
                                            const biodataKey = biodata.biodataId || biodata._id;
                                            const requestStatus = requestStatuses[biodataKey];
                                            const isLoading = sendingRequests[biodataKey];
                                            
                                            if (!requestStatus?.hasRequest) {
                                                // No request sent yet - show send request button
                                                return (
                                                    <button
                                                        onClick={() => sendConnectionRequest(biodata)}
                                                        disabled={isLoading}
                                                        className="flex-1 bg-primary text-base-100 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                        {isLoading ? t('browseMatches.sending') : t('browseMatches.sendRequest')}
                                                    </button>
                                                );
                                            } else if (requestStatus.status === 'pending' && requestStatus.isInitiator) {
                                                // Request sent by current user and pending - show cancel button
                                                return (
                                                    <button
                                                        onClick={() => cancelConnectionRequest(biodata)}
                                                        disabled={isLoading}
                                                        className="flex-1 bg-error text-base-100 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        {isLoading ? t('browseMatches.canceling') : t('browseMatches.cancelRequest')}
                                                    </button>
                                                );
                                            } else if (requestStatus.status === 'pending' && !requestStatus.isInitiator) {
                                                // Request received from this user - show pending status
                                                return (
                                                    <div className="flex-1 bg-warning/20 text-warning py-2 rounded-xl font-semibold text-center border border-warning/30 flex items-center justify-center gap-2">
                                                        ⏳ {t('browseMatches.requestReceived')}
                                                    </div>
                                                );
                                            } else if (requestStatus.status === 'accepted') {
                                                // Request accepted - show connected status
                                                return (
                                                    <div className="flex-1 bg-success/20 text-success py-2 rounded-xl font-semibold text-center border border-success/30 flex items-center justify-center gap-2">
                                                        ✅ {t('browseMatches.connected')}
                                                    </div>
                                                );
                                            } else if (requestStatus.status === 'rejected') {
                                                // Request rejected - show rejected status
                                                return (
                                                    <div className="flex-1 bg-error/20 text-error py-2 rounded-xl font-semibold text-center border border-error/30 flex items-center justify-center gap-2">
                                                        ❌ {t('browseMatches.rejected')}
                                                    </div>
                                                );
                                            }
                                            
                                            // Default fallback
                                            return (
                                                <button
                                                    onClick={() => sendConnectionRequest(biodata)}
                                                    disabled={isLoading}
                                                    className="flex-1 bg-primary text-base-100 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Heart className="w-4 h-4" />
                                                    {isLoading ? 'পাঠানো হচ্ছে...' : 'রিকোয়েস্ট পাঠান'}
                                                </button>
                                            );
                                        })()}
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