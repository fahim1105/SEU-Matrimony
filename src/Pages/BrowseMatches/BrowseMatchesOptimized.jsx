import { useState, useEffect } from 'react';
import { Search, Filter, Heart, Eye, MapPin, GraduationCap, Calendar, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseAuth from '../../Hooks/UseAuth';
import toast from 'react-hot-toast';

const BrowseMatchesOptimized = () => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        gender: '',
        department: '',
        bloodGroup: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [pendingActions, setPendingActions] = useState({});

    const axiosSecure = UseAxiosSecure();
    const { user } = UseAuth();
    const queryClient = useQueryClient();

    // Fetch matches with TanStack Query
    const { data: matches = [], isLoading } = useQuery({
        queryKey: ['matches', user?.email],
        queryFn: async () => {
            const response = await axiosSecure.get(`/browse-matches/${user.email}`);
            if (response.data.success) {
                return response.data.biodatas || [];
            }
            throw new Error(response.data.message || 'Failed to fetch matches');
        },
        enabled: !!user?.email,
        staleTime: 30000, // Consider data fresh for 30 seconds
        placeholderData: [] // Show empty array while loading
    });

    // Send connection request mutation with optimistic update
    const sendRequestMutation = useMutation({
        mutationFn: async ({ biodata }) => {
            const requestData = {
                senderEmail: user.email,
                receiverEmail: biodata.contactEmail,
                receiverBiodataId: biodata.biodataId,
                receiverObjectId: biodata._id,
                status: 'pending',
                sentAt: new Date()
            };
            
            const response = await axiosSecure.post('/send-request', requestData);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to send request');
            }
            return { ...response.data, biodataId: biodata._id };
        },
        onMutate: async ({ biodata }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['matches', user.email] });
            await queryClient.cancelQueries({ queryKey: ['requests', 'sent', user.email] });

            // Snapshot previous value
            const previousMatches = queryClient.getQueryData(['matches', user.email]);

            // Optimistically update matches - mark as pending
            queryClient.setQueryData(['matches', user.email], (old = []) =>
                old.map((match) =>
                    match._id === biodata._id
                        ? { ...match, requestStatus: 'pending', isInitiator: true }
                        : match
                )
            );

            // Mark as pending
            setPendingActions(prev => ({ ...prev, [biodata._id]: 'sending' }));

            return { previousMatches };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousMatches) {
                queryClient.setQueryData(['matches', user.email], context.previousMatches);
            }
            toast.error(error.message || t('browseMatches.sendError'));
        },
        onSuccess: (data, variables) => {
            toast.success(t('browseMatches.sendSuccess'));
        },
        onSettled: (data, error, variables) => {
            // Remove pending state
            setPendingActions(prev => {
                const newState = { ...prev };
                delete newState[variables.biodata._id];
                return newState;
            });
            // Invalidate and refetch in background
            queryClient.invalidateQueries({ queryKey: ['matches', user.email] });
            queryClient.invalidateQueries({ queryKey: ['requests', 'sent', user.email] });
        }
    });

    // Cancel connection request mutation with optimistic update
    const cancelRequestMutation = useMutation({
        mutationFn: async ({ biodata, requestId }) => {
            const response = await axiosSecure.delete(`/cancel-request/${requestId}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to cancel request');
            }
            return { biodataId: biodata._id };
        },
        onMutate: async ({ biodata }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['matches', user.email] });
            await queryClient.cancelQueries({ queryKey: ['requests', 'sent', user.email] });

            // Snapshot previous value
            const previousMatches = queryClient.getQueryData(['matches', user.email]);

            // Optimistically update matches - remove request status
            queryClient.setQueryData(['matches', user.email], (old = []) =>
                old.map((match) =>
                    match._id === biodata._id
                        ? { ...match, requestStatus: null, isInitiator: false }
                        : match
                )
            );

            // Mark as pending
            setPendingActions(prev => ({ ...prev, [biodata._id]: 'canceling' }));

            return { previousMatches };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousMatches) {
                queryClient.setQueryData(['matches', user.email], context.previousMatches);
            }
            toast.error(error.message || t('browseMatches.cancelError'));
        },
        onSuccess: () => {
            toast.success(t('browseMatches.cancelSuccess'));
        },
        onSettled: (data, error, variables) => {
            // Remove pending state
            setPendingActions(prev => {
                const newState = { ...prev };
                delete newState[variables.biodata._id];
                return newState;
            });
            // Invalidate and refetch in background
            queryClient.invalidateQueries({ queryKey: ['matches', user.email] });
            queryClient.invalidateQueries({ queryKey: ['requests', 'sent', user.email] });
        }
    });

    // Apply filters and search
    const filteredMatches = matches.filter(biodata => {
        // Gender filter
        if (filters.gender && biodata.gender !== filters.gender) return false;
        
        // Department filter
        if (filters.department && !biodata.department?.toLowerCase().includes(filters.department.toLowerCase())) return false;
        
        // Blood group filter
        if (filters.bloodGroup && biodata.bloodGroup !== filters.bloodGroup) return false;
        
        // Search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                biodata.name?.toLowerCase().includes(searchLower) ||
                biodata.department?.toLowerCase().includes(searchLower) ||
                biodata.district?.toLowerCase().includes(searchLower)
            );
        }
        
        return true;
    });

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

    const handleSendRequest = (biodata) => {
        sendRequestMutation.mutate({ biodata });
    };

    const handleCancelRequest = (biodata) => {
        // Find request ID from biodata
        const requestId = biodata.requestId || biodata._id;
        cancelRequestMutation.mutate({ biodata, requestId });
    };

    if (isLoading) {
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
        <div className="min-h-screen bg-base-100 py-4 sm:py-6 lg:py-8">
            <div className="md:py-10 py-20 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral mb-2">{t('browseMatches.title')}</h1>
                    <p className="text-neutral/70 text-sm sm:text-base">{t('browseMatches.subtitle')}</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral/50" />
                            <input
                                type="text"
                                placeholder={t('browseMatches.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-base-100 border border-base-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-primary text-base-100 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                            {t('browseMatches.filterButton')}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-base-300">
                            <select
                                value={filters.gender}
                                onChange={(e) => handleFilterChange('gender', e.target.value)}
                                className="bg-base-100 border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
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
                                className="bg-base-100 border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                            />

                            <select
                                value={filters.bloodGroup}
                                onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                                className="bg-base-100 border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
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
                                className="bg-base-100 text-neutral border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-2 hover:bg-base-300 transition-all text-sm sm:text-base font-medium"
                            >
                                {t('browseMatches.clearFilters')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-4 sm:mb-6">
                    <p className="text-neutral/70 text-sm sm:text-base">
                        {filteredMatches.length} {t('browseMatches.profilesFound')}
                    </p>
                </div>

                {/* Biodata Grid */}
                {filteredMatches.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 px-4">
                        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
                        <h3 className="text-lg sm:text-xl font-semibold text-neutral mb-2">{t('browseMatches.noMatches')}</h3>
                        <p className="text-neutral/70 text-sm sm:text-base">{t('browseMatches.noMatchesDesc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredMatches.map((biodata) => {
                            const isPending = pendingActions[biodata._id];
                            const requestStatus = biodata.requestStatus;
                            const isInitiator = biodata.isInitiator;

                            return (
                                <div key={biodata._id} className="bg-base-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all flex flex-col">
                                    {/* Profile Image */}
                                    <div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                            className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl"
                                            style={{ display: biodata.profileImage ? 'none' : 'flex' }}
                                        >
                                            👤
                                        </div>
                                    </div>

                                    {/* Profile Info */}
                                    <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg sm:text-xl font-bold text-neutral mb-2 sm:mb-3 line-clamp-1">{biodata.name}</h3>

                                        <div className="space-y-1.5 sm:space-y-2 mb-4 flex-grow">
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral/70">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span className="truncate">{biodata.age} {t('browseMatches.years')} • {biodata.gender === 'Male' ? t('browseMatches.male') : t('browseMatches.female')}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral/70">
                                                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span className="truncate">{biodata.department}</span>
                                                {biodata.batch && <span className="flex-shrink-0"> • {biodata.batch}</span>}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral/70">
                                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span className="truncate">{biodata.district}</span>
                                            </div>

                                            {biodata.bloodGroup && (
                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral/70">
                                                    <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-center flex-shrink-0">🩸</span>
                                                    <span>{biodata.bloodGroup}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                                            <Link to={`/profile/${biodata._id}`} className="flex-1">
                                                <button className="w-full bg-base-100 text-neutral py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold hover:bg-base-300 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    {t('browseMatches.viewProfile')}
                                                </button>
                                            </Link>

                                            {!requestStatus ? (
                                                <button
                                                    onClick={() => handleSendRequest(biodata)}
                                                    disabled={!!isPending}
                                                    className="flex-1 bg-primary text-base-100 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                                >
                                                    {isPending === 'sending' ? (
                                                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                                    ) : (
                                                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    )}
                                                    {isPending === 'sending' ? t('browseMatches.sending') : t('browseMatches.sendRequest')}
                                                </button>
                                            ) : requestStatus === 'pending' && isInitiator ? (
                                                <button
                                                    onClick={() => handleCancelRequest(biodata)}
                                                    disabled={!!isPending}
                                                    className="flex-1 bg-error text-base-100 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold hover:bg-error/90 transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                                >
                                                    {isPending === 'canceling' ? (
                                                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                                    ) : (
                                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    )}
                                                    {isPending === 'canceling' ? t('browseMatches.canceling') : t('browseMatches.cancelRequest')}
                                                </button>
                                            ) : requestStatus === 'pending' && !isInitiator ? (
                                                <div className="flex-1 bg-warning/20 text-warning py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-center border border-warning/30 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                                                    ⏳ {t('browseMatches.requestReceived')}
                                                </div>
                                            ) : requestStatus === 'accepted' ? (
                                                <div className="flex-1 bg-success/20 text-success py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-center border border-success/30 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                                                    ✅ {t('browseMatches.connected')}
                                                </div>
                                            ) : requestStatus === 'rejected' ? (
                                                <div className="flex-1 bg-error/20 text-error py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-center border border-error/30 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                                                    ❌ {t('browseMatches.rejected')}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseMatchesOptimized;
