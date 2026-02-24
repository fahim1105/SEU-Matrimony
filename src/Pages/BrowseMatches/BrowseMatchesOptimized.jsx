import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Heart, Eye, MapPin, GraduationCap, Calendar, X, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseAuth from '../../Hooks/UseAuth';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const BrowseMatchesOptimized = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        gender: '',
        department: '',
        bloodGroup: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [pendingActions, setPendingActions] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 12; // 12 cards per page (3 rows × 4 cards)

    const axiosSecure = UseAxiosSecure();
    const { user } = UseAuth();
    const queryClient = useQueryClient();

    // Fetch user's own biodata status
    const { data: userBiodata } = useQuery({
        queryKey: ['userBiodata', user?.email],
        queryFn: async () => {
            const response = await axiosSecure.get(`/biodata/${user.email}`);
            if (response.data.success) {
                return response.data.biodata;
            }
            return null;
        },
        enabled: !!user?.email,
        staleTime: 60000 // Cache for 1 minute
    });

    // Fetch matches with TanStack Query
    const { data: matches = [], isLoading, isFetching } = useQuery({
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
        placeholderData: (previousData) => previousData // Keep showing old data while fetching new
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

    // Apply filters and search with useMemo for performance
    const filteredMatches = useMemo(() => {
        return matches.filter(biodata => {
            // Gender filter
            if (filters.gender && biodata.gender !== filters.gender) return false;
            
            // Department filter (exact match)
            if (filters.department && biodata.department !== filters.department) return false;
            
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
    }, [matches, filters, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredMatches.length / cardsPerPage);
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = filteredMatches.slice(indexOfFirstCard, indexOfLastCard);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchTerm]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const handleSendRequest = async (biodata) => {
        // Validation 1: Check if user has biodata
        if (!userBiodata) {
            const result = await Swal.fire({
                title: t('browseMatches.noBiodataTitle'),
                text: t('browseMatches.noBiodataMessage'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280',
                confirmButtonText: t('browseMatches.goToBiodata'),
                cancelButtonText: t('common.cancel'),
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#f3f4f6',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f3f4f6' : '#374151',
                customClass: {
                    popup: 'rounded-2xl',
                    title: 'text-lg font-bold',
                    content: 'text-sm',
                    confirmButton: 'rounded-xl px-6 py-2 font-semibold',
                    cancelButton: 'rounded-xl px-6 py-2 font-semibold'
                }
            });

            if (result.isConfirmed) {
                navigate('/dashboard/biodata-form');
            }
            return;
        }

        // Validation 2: Check if biodata is approved
        if (userBiodata.status !== 'approved') {
            let title, text;
            
            if (userBiodata.status === 'pending') {
                title = t('browseMatches.biodataPendingTitle');
                text = t('browseMatches.biodataPendingMessage');
            } else if (userBiodata.status === 'rejected') {
                title = t('browseMatches.biodataRejectedTitle');
                text = t('browseMatches.biodataRejectedMessage');
            } else {
                title = t('browseMatches.biodataNotApprovedTitle');
                text = t('browseMatches.biodataNotApprovedMessage');
            }

            await Swal.fire({
                title,
                text,
                icon: 'info',
                confirmButtonColor: '#f59e0b',
                confirmButtonText: t('common.ok'),
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#f3f4f6',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f3f4f6' : '#374151',
                customClass: {
                    popup: 'rounded-2xl',
                    title: 'text-lg font-bold',
                    content: 'text-sm',
                    confirmButton: 'rounded-xl px-6 py-2 font-semibold'
                }
            });
            return;
        }

        // All validations passed, send request
        sendRequestMutation.mutate({ biodata });
    };

    const handleCancelRequest = (biodata) => {
        // Find request ID from biodata
        const requestId = biodata.requestId || biodata._id;
        cancelRequestMutation.mutate({ biodata, requestId });
    };

    // Skeleton loader component
    const SkeletonLoader = () => (
        <div className="min-h-screen bg-base-100 py-4 sm:py-6 lg:py-8">
            <div className="md:py-10 py-20 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Header Skeleton */}
                <div className="mb-6 sm:mb-8">
                    <div className="h-8 sm:h-10 bg-base-300 rounded-xl w-64 mb-2 animate-pulse"></div>
                    <div className="h-4 sm:h-5 bg-base-300 rounded-lg w-96 animate-pulse"></div>
                </div>

                {/* Search and Filters Skeleton */}
                <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 h-12 bg-base-300 rounded-xl animate-pulse"></div>
                        <div className="w-full sm:w-32 h-12 bg-base-300 rounded-xl animate-pulse"></div>
                    </div>
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(12)].map((_, index) => (
                        <div key={index} className="bg-base-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                            <div className="h-48 sm:h-56 lg:h-64 bg-base-300 animate-pulse"></div>
                            <div className="p-4 sm:p-5 lg:p-6 space-y-3">
                                <div className="h-6 bg-base-300 rounded-lg w-3/4 animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-base-300 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-base-300 rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-base-300 rounded w-4/6 animate-pulse"></div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <div className="flex-1 h-10 bg-base-300 rounded-xl animate-pulse"></div>
                                    <div className="flex-1 h-10 bg-base-300 rounded-xl animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Show skeleton loader while loading OR if no data yet
    if (isLoading || (isFetching && matches.length === 0)) {
        return <SkeletonLoader />;
    }

    return (
        <div className="min-h-screen bg-base-100 py-4 sm:py-6 lg:py-12">
            {/* Refetching Indicator */}
            {isFetching && matches.length > 0 && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-base-100 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">{t('common.loading')}</span>
                </div>
            )}
            
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

                            <select
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="bg-base-100 border border-base-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                            >
                                <option value="">{t('browseMatches.allDepartments')}</option>
                                <option value="CSE">CSE</option>
                                <option value="EEE">EEE</option>
                                <option value="Textile">Textile</option>
                                <option value="Architecture">Architecture</option>
                                <option value="Pharmacy">Pharmacy</option>
                                <option value="BBA">BBA</option>
                                <option value="English">English</option>
                                <option value="Law">Law</option>
                                <option value="Bangla">Bangla</option>
                                <option value="ICT">ICT</option>
                            </select>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {currentCards.map((biodata) => {
                            const isPending = pendingActions[biodata._id];
                            const requestStatus = biodata.requestStatus;
                            const isInitiator = biodata.isInitiator;

                            return (
                                <div key={biodata._id} className="bg-base-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all flex flex-col">
                                    {/* Profile Image */}
                                    <div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                        {biodata.profileImage ? (
                                            <>
                                                <img
                                                    src={biodata.profileImage}
                                                    alt={biodata.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl"
                                                    style={{ display: 'none' }}
                                                >
                                                    👤
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl">
                                                👤
                                            </div>
                                        )}
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
                                        <div className="flex gap-2 mt-auto">
                                            <Link to={`/profile/${biodata._id}`} className="flex-shrink-0">
                                                <button className="px-3 sm:px-4 bg-base-100 text-neutral py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold hover:bg-base-300 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
                                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    {t('browseMatches.viewProfile')}
                                                </button>
                                            </Link>

                                            {!requestStatus ? (
                                                <button
                                                    onClick={() => handleSendRequest(biodata)}
                                                    disabled={!!isPending}
                                                    className="flex-1 bg-primary text-base-100 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
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
                                                    className="flex-1 bg-error text-base-100 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold hover:bg-error/90 transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
                                                >
                                                    {isPending === 'canceling' ? (
                                                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                                    ) : (
                                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    )}
                                                    {isPending === 'canceling' ? t('browseMatches.canceling') : t('browseMatches.cancelRequest')}
                                                </button>
                                            ) : requestStatus === 'pending' && !isInitiator ? (
                                                <div className="flex-1 bg-warning/20 text-warning py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-center border border-warning/30 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
                                                    ⏳ {t('browseMatches.requestReceived')}
                                                </div>
                                            ) : requestStatus === 'accepted' ? (
                                                <div className="flex-1 bg-success/20 text-success py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-center border border-success/30 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
                                                    ✅ {t('browseMatches.connected')}
                                                </div>
                                            ) : requestStatus === 'rejected' ? (
                                                <div className="flex-1 bg-error/20 text-error py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-center border border-error/30 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
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

                {/* Pagination */}
                {filteredMatches.length > cardsPerPage && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-200 p-4 sm:p-6 rounded-3xl">
                        <div className="text-neutral/70 text-sm">
                            {t('browseMatches.showing')} {indexOfFirstCard + 1}-{Math.min(indexOfLastCard, filteredMatches.length)} {t('browseMatches.of')} {filteredMatches.length} {t('browseMatches.matches')}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 sm:px-4 py-2 bg-base-100 text-neutral rounded-xl font-semibold hover:bg-base-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {t('browseMatches.previous')}
                            </button>
                            
                            <div className="flex items-center gap-1 sm:gap-2">
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    // Show first page, last page, current page, and pages around current
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-semibold transition-all text-sm ${
                                                    currentPage === pageNumber
                                                        ? 'bg-primary text-white shadow-lg'
                                                        : 'bg-base-100 text-neutral hover:bg-base-300'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    } else if (
                                        pageNumber === currentPage - 2 ||
                                        pageNumber === currentPage + 2
                                    ) {
                                        return <span key={pageNumber} className="text-neutral/50">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 sm:px-4 py-2 bg-base-100 text-neutral rounded-xl font-semibold hover:bg-base-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {t('browseMatches.next')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseMatchesOptimized;
