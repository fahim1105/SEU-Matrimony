import { useState } from 'react';
import { Heart, Send, Inbox, CheckCircle, XCircle, Clock, User, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UseAuth from '../../Hooks/UseAuth';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import i18n from '../../i18n/i18n';

const MyRequestsOptimized = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('received');
    const [pendingActions, setPendingActions] = useState({});
    
    const { user } = UseAuth();
    const axiosSecure = UseAxiosSecure();
    const queryClient = useQueryClient();

    // Fetch sent requests with TanStack Query
    const { data: sentRequests = [], isLoading: loadingSent, isFetching: fetchingSent } = useQuery({
        queryKey: ['requests', 'sent', user?.email],
        queryFn: async () => {
            const response = await axiosSecure.get(`/sent-requests/${user.email}`);
            if (response.data.success) {
                return response.data.requests;
            }
            return [];
        },
        enabled: !!user?.email,
        staleTime: 30000,
        placeholderData: (previousData) => previousData // Keep old data while fetching
    });

    // Fetch received requests with TanStack Query
    const { data: receivedRequests = [], isLoading: loadingReceived, isFetching: fetchingReceived } = useQuery({
        queryKey: ['requests', 'received', user?.email],
        queryFn: async () => {
            const response = await axiosSecure.get(`/received-requests/${user.email}`);
            if (response.data.success) {
                return response.data.requests;
            }
            return [];
        },
        enabled: !!user?.email,
        staleTime: 30000,
        placeholderData: (previousData) => previousData // Keep old data while fetching
    });

    // Cancel sent request mutation
    const cancelRequestMutation = useMutation({
        mutationFn: async ({ requestId }) => {
            const response = await axiosSecure.delete(`/cancel-request/${requestId}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to cancel request');
            }
            return response.data;
        },
        onMutate: async ({ requestId }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['requests', 'sent', user.email] });

            // Snapshot previous value
            const previousSent = queryClient.getQueryData(['requests', 'sent', user.email]);

            // Optimistically remove from sent requests
            queryClient.setQueryData(['requests', 'sent', user.email], (old = []) =>
                old.filter(r => r._id !== requestId)
            );

            // Mark as pending
            setPendingActions(prev => ({ ...prev, [requestId]: 'canceling' }));

            return { previousSent };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousSent) {
                queryClient.setQueryData(['requests', 'sent', user.email], context.previousSent);
            }
            toast.error(error.message || 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে');
        },
        onSuccess: () => {
            toast.success('রিকোয়েস্ট বাতিল করা হয়েছে');
        },
        onSettled: (data, error, variables) => {
            // Remove pending state
            setPendingActions(prev => {
                const newState = { ...prev };
                delete newState[variables.requestId];
                return newState;
            });
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['requests', 'sent', user.email] });
            queryClient.invalidateQueries({ queryKey: ['matches', user.email] });
        }
    });

    // Accept request mutation
    const acceptRequestMutation = useMutation({
        mutationFn: async ({ request }) => {
            const response = await axiosSecure.patch(`/request-status/${request._id}`, {
                status: 'accepted'
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to accept request');
            }
            return response.data;
        },
        onMutate: async ({ request }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['requests', 'received', user.email] });

            // Snapshot previous value
            const previousReceived = queryClient.getQueryData(['requests', 'received', user.email]);

            // Optimistically remove from received requests
            queryClient.setQueryData(['requests', 'received', user.email], (old = []) =>
                old.filter(r => r._id !== request._id)
            );

            // Add to friends list
            queryClient.setQueryData(['friends', user.email], (old = []) => [
                ...(old || []),
                {
                    _id: request._id,
                    friendEmail: request.senderEmail,
                    name: request.senderName,
                    profileImage: request.senderProfileImage,
                    connectedAt: new Date()
                }
            ]);

            // Remove from browse matches
            queryClient.setQueryData(['matches', user.email], (old = []) =>
                (old || []).filter(m => m.contactEmail !== request.senderEmail)
            );

            // Mark as pending
            setPendingActions(prev => ({ ...prev, [request._id]: 'accepting' }));

            return { previousReceived };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousReceived) {
                queryClient.setQueryData(['requests', 'received', user.email], context.previousReceived);
            }
            toast.error(error.message || 'রিকোয়েস্ট গ্রহণ করতে সমস্যা হয়েছে');
        },
        onSuccess: () => {
            toast.success('রিকোয়েস্ট গ্রহণ করা হয়েছে');
        },
        onSettled: (data, error, variables) => {
            // Remove pending state
            setPendingActions(prev => {
                const newState = { ...prev };
                delete newState[variables.request._id];
                return newState;
            });
            // Invalidate all related queries
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            queryClient.invalidateQueries({ queryKey: ['friends', user.email] });
            queryClient.invalidateQueries({ queryKey: ['matches', user.email] });
        }
    });

    // Reject request mutation
    const rejectRequestMutation = useMutation({
        mutationFn: async ({ requestId }) => {
            const response = await axiosSecure.patch(`/request-status/${requestId}`, {
                status: 'rejected'
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to reject request');
            }
            return response.data;
        },
        onMutate: async ({ request }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['requests', 'received', user.email] });

            // Snapshot previous value
            const previousReceived = queryClient.getQueryData(['requests', 'received', user.email]);

            // Optimistically remove from received requests
            queryClient.setQueryData(['requests', 'received', user.email], (old = []) =>
                old.filter(r => r._id !== request._id)
            );

            // Add back to browse matches (since request is deleted, user can send again)
            queryClient.setQueryData(['matches', user.email], (old = []) => {
                // Check if already exists
                const exists = (old || []).some(m => m.contactEmail === request.senderEmail);
                if (!exists) {
                    // Add the sender back to matches
                    return [
                        ...(old || []),
                        {
                            contactEmail: request.senderEmail,
                            name: request.senderName,
                            profileImage: request.senderProfileImage
                        }
                    ];
                }
                return old;
            });

            // Mark as pending
            setPendingActions(prev => ({ ...prev, [request._id]: 'rejecting' }));

            return { previousReceived };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousReceived) {
                queryClient.setQueryData(['requests', 'received', user.email], context.previousReceived);
            }
            toast.error(error.message || 'রিকোয়েস্ট প্রত্যাখ্যান করতে সমস্যা হয়েছে');
        },
        onSuccess: () => {
            toast.success('রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে');
        },
        onSettled: (data, error, variables) => {
            // Remove pending state
            setPendingActions(prev => {
                const newState = { ...prev };
                delete newState[variables.request._id];
                return newState;
            });
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['requests', 'received', user.email] });
            queryClient.invalidateQueries({ queryKey: ['matches', user.email] });
        }
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const locale = i18n.language === 'bn' ? 'bn-BD' : 'en-US';
        return date.toLocaleDateString(locale);
    };

    const handleCancelRequest = async (request) => {
        const result = await Swal.fire({
            title: t('sweetAlert.cancelRequest'),
            text: t('sweetAlert.cancelRequestText').replace('{name}', request.receiverName),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('sweetAlert.yesButton'),
            cancelButtonText: t('sweetAlert.noButton'),
            background: '#f3f4f6',
            color: '#374151'
        });

        if (result.isConfirmed) {
            cancelRequestMutation.mutate({ requestId: request._id });
        }
    };

    const handleAcceptRequest = async (request) => {
        const result = await Swal.fire({
            title: t('sweetAlert.acceptRequest'),
            text: t('sweetAlert.acceptRequestText').replace('{name}', request.senderName),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('sweetAlert.yesButton'),
            cancelButtonText: t('sweetAlert.noButton'),
            background: '#f3f4f6',
            color: '#374151'
        });

        if (result.isConfirmed) {
            acceptRequestMutation.mutate({ request });
        }
    };

    const handleRejectRequest = async (request) => {
        const result = await Swal.fire({
            title: t('sweetAlert.rejectRequest'),
            text: t('sweetAlert.rejectRequestText').replace('{name}', request.senderName),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('sweetAlert.yesButton'),
            cancelButtonText: t('sweetAlert.noButton'),
            background: '#f3f4f6',
            color: '#374151'
        });

        if (result.isConfirmed) {
            rejectRequestMutation.mutate({ request, requestId: request._id });
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="w-5 h-5 text-success" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-error" />;
            default:
                return <Clock className="w-5 h-5 text-warning" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'accepted':
                return t('requests.accepted');
            case 'rejected':
                return t('requests.rejected');
            default:
                return t('requests.pending');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'text-success';
            case 'rejected':
                return 'text-error';
            default:
                return 'text-warning';
        }
    };

    const loading = loadingSent || loadingReceived;
    const fetching = fetchingSent || fetchingReceived;
    const hasData = sentRequests.length > 0 || receivedRequests.length > 0;

    // Show skeleton only when loading AND no data exists
    if (loading || (fetching && !hasData)) {
        return (
            <div className="min-h-screen bg-base-100 py-4 sm:py-6 md:py-8 lg:py-16 rounded-3xl">
                <div className="max-w-6xl py-8 sm:py-10 md:py-0 mx-auto px-3 sm:px-4 md:px-6">
                    {/* Header Skeleton */}
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <div className="h-6 sm:h-8 w-24 sm:w-32 bg-base-300 rounded-xl mb-3 sm:mb-4 animate-pulse"></div>
                        <div className="h-8 sm:h-10 w-48 sm:w-64 bg-base-300 rounded-xl mb-2 animate-pulse"></div>
                        <div className="h-4 sm:h-5 w-64 sm:w-96 bg-base-300 rounded-lg animate-pulse"></div>
                    </div>

                    {/* Tabs Skeleton */}
                    <div className="bg-base-200 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 md:mb-8 flex gap-1.5 sm:gap-2">
                        <div className="flex-1 h-10 sm:h-12 bg-base-300 rounded-xl sm:rounded-2xl animate-pulse"></div>
                        <div className="flex-1 h-10 sm:h-12 bg-base-300 rounded-xl sm:rounded-2xl animate-pulse"></div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="bg-base-200 p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-base-300 rounded-xl sm:rounded-2xl animate-pulse flex-shrink-0"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 sm:h-5 w-24 sm:w-32 bg-base-300 rounded animate-pulse"></div>
                                            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-base-300 rounded animate-pulse"></div>
                                            <div className="h-3 sm:h-4 w-16 sm:w-20 bg-base-300 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                                        <div className="flex-1 h-9 sm:h-10 bg-base-300 rounded-xl animate-pulse"></div>
                                        <div className="flex-1 h-9 sm:h-10 bg-base-300 rounded-xl animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-4 sm:py-6 md:py-8 lg:py-16 rounded-3xl">
            {/* Refetching Indicator */}
            {fetching && hasData && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-base-100 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">{t('common.loading')}</span>
                </div>
            )}
            
            <div className="max-w-6xl py-8 sm:py-10 md:py-0 mx-auto px-3 sm:px-4 md:px-6">
                {/* Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <BackButton label={t('requests.backToDashboard')} />
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                        <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary flex-shrink-0" />
                        <span className="break-words">{t('requests.title')}</span>
                    </h1>
                    <p className="text-neutral/70 mt-1 sm:mt-2 text-sm sm:text-base">{t('requests.subtitle')}</p>
                </div>

                {/* Tabs */}
                <div className="bg-base-200 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 md:mb-8 flex gap-1.5 sm:gap-2">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`flex-1 py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base ${
                            activeTab === 'received' 
                                ? 'bg-primary text-base-100 shadow-lg' 
                                : 'text-neutral hover:bg-base-300'
                        }`}
                    >
                        <Inbox className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="hidden xs:inline">{t('requests.receivedTab')}</span>
                        <span className="xs:hidden">{t('requests.received')}</span>
                        <span>({receivedRequests.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base ${
                            activeTab === 'sent' 
                                ? 'bg-primary text-base-100 shadow-lg' 
                                : 'text-neutral hover:bg-base-300'
                        }`}
                    >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="hidden xs:inline">{t('requests.sentTab')}</span>
                        <span className="xs:hidden">{t('requests.sent')}</span>
                        <span>({sentRequests.length})</span>
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'received' ? (
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6">{t('requests.receivedTitle')}</h2>
                        
                        {receivedRequests.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <Inbox className="w-12 h-12 sm:w-16 sm:h-16 text-neutral/30 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-lg sm:text-xl font-semibold text-neutral mb-2">{t('requests.noReceived')}</h3>
                                <p className="text-neutral/70 text-sm sm:text-base">{t('requests.noReceivedDesc')}</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:gap-4 md:gap-6">
                                {receivedRequests.map((request) => {
                                    const isPending = pendingActions[request._id];
                                    
                                    return (
                                        <div key={request._id} className="bg-base-200 p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                                            <div className="flex flex-col gap-3 sm:gap-4">
                                                {/* User Info */}
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/10 flex-shrink-0">
                                                        {request.senderProfileImage ? (
                                                            <img 
                                                                src={request.senderProfileImage} 
                                                                alt={request.senderName}
                                                                className="w-full h-full rounded-xl object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <User 
                                                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" 
                                                            style={{ display: request.senderProfileImage ? 'none' : 'block' }}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                                            <span className="font-semibold text-neutral text-sm sm:text-base truncate">{request.senderName}</span>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-neutral/70">
                                                            {formatDate(request.sentAt)} {t('requests.sentOn')}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                                                            {getStatusIcon(request.status)}
                                                            <span className={`font-medium text-xs sm:text-sm ${getStatusColor(request.status)}`}>
                                                                {getStatusText(request.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                {request.status === 'pending' && (
                                                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                                                        <button
                                                            onClick={() => handleAcceptRequest(request)}
                                                            disabled={!!isPending}
                                                            className="flex-1 bg-success text-base-100 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold hover:bg-success/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                                        >
                                                            {isPending === 'accepting' ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4" />
                                                            )}
                                                            {t('requests.accept')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectRequest(request)}
                                                            disabled={!!isPending}
                                                            className="flex-1 bg-error text-base-100 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold hover:bg-error/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                                        >
                                                            {isPending === 'rejecting' ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4" />
                                                            )}
                                                            {t('requests.reject')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6">{t('requests.sentTitle')}</h2>
                        
                        {sentRequests.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <Send className="w-12 h-12 sm:w-16 sm:h-16 text-neutral/30 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-lg sm:text-xl font-semibold text-neutral mb-2">{t('requests.noSent')}</h3>
                                <p className="text-neutral/70 text-sm sm:text-base">{t('requests.noSentDesc')}</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:gap-4 md:gap-6">
                                {sentRequests.map((request) => {
                                    const isPending = pendingActions[request._id];
                                    
                                    return (
                                        <div key={request._id} className="bg-base-200 p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                                            <div className="flex flex-col gap-3 sm:gap-4">
                                                {/* User Info */}
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/10 flex-shrink-0">
                                                        {request.receiverProfileImage ? (
                                                            <img 
                                                                src={request.receiverProfileImage} 
                                                                alt={request.receiverName}
                                                                className="w-full h-full rounded-xl object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <User 
                                                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" 
                                                            style={{ display: request.receiverProfileImage ? 'none' : 'block' }}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                                                            <span className="font-semibold text-neutral text-sm sm:text-base truncate">{request.receiverName}</span>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-neutral/70">
                                                            {formatDate(request.sentAt)} {t('requests.sentOn')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status and Action */}
                                                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 sm:gap-3">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        {getStatusIcon(request.status)}
                                                        <span className={`font-medium text-xs sm:text-sm ${getStatusColor(request.status)}`}>
                                                            {getStatusText(request.status)}
                                                        </span>
                                                    </div>
                                                    
                                                    {request.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancelRequest(request)}
                                                            disabled={!!isPending}
                                                            className="w-full xs:w-auto bg-warning text-base-100 px-4 sm:px-5 py-2 rounded-xl font-semibold hover:bg-warning/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                                        >
                                                            {isPending === 'canceling' ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                            বাতিল করুন
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRequestsOptimized;
