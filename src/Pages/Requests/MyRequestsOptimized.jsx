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
    const { data: sentRequests = [], isLoading: loadingSent } = useQuery({
        queryKey: ['requests', 'sent', user?.email],
        queryFn: async () => {
            const response = await axiosSecure.get(`/sent-requests/${user.email}`);
            if (response.data.success) {
                // Enhance with biodata info
                const enhanced = await Promise.all(
                    response.data.requests.map(async (request) => {
                        try {
                            const biodataResponse = await axiosSecure.get(`/biodata/${request.receiverEmail}`);
                            return {
                                ...request,
                                receiverName: biodataResponse.data.success ? biodataResponse.data.biodata.name : 'SEU Member',
                                receiverProfileImage: biodataResponse.data.success ? biodataResponse.data.biodata.profileImage : null
                            };
                        } catch (error) {
                            return {
                                ...request,
                                receiverName: 'SEU Member',
                                receiverProfileImage: null
                            };
                        }
                    })
                );
                return enhanced;
            }
            return [];
        },
        enabled: !!user?.email,
        staleTime: 30000,
        placeholderData: []
    });

    // Fetch received requests with TanStack Query
    const { data: receivedRequests = [], isLoading: loadingReceived } = useQuery({
        queryKey: ['requests', 'received', user?.email],
        queryFn: async () => {
            const response = await axiosSecure.get(`/received-requests/${user.email}`);
            if (response.data.success) {
                // Enhance with biodata info
                const enhanced = await Promise.all(
                    response.data.requests.map(async (request) => {
                        try {
                            const biodataResponse = await axiosSecure.get(`/biodata/${request.senderEmail}`);
                            return {
                                ...request,
                                senderName: biodataResponse.data.success ? biodataResponse.data.biodata.name : 'SEU Member',
                                senderProfileImage: biodataResponse.data.success ? biodataResponse.data.biodata.profileImage : null
                            };
                        } catch (error) {
                            return {
                                ...request,
                                senderName: 'SEU Member',
                                senderProfileImage: null
                            };
                        }
                    })
                );
                return enhanced;
            }
            return [];
        },
        enabled: !!user?.email,
        staleTime: 30000,
        placeholderData: []
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
            title: 'রিকোয়েস্ট বাতিল করবেন?',
            text: `${request.receiverName} এর কাছে পাঠানো রিকোয়েস্ট বাতিল করতে চান?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'হ্যাঁ, বাতিল করুন',
            cancelButtonText: 'না',
            background: '#f3f4f6',
            color: '#374151'
        });

        if (result.isConfirmed) {
            cancelRequestMutation.mutate({ requestId: request._id });
        }
    };

    const handleAcceptRequest = async (request) => {
        const result = await Swal.fire({
            title: 'রিকোয়েস্ট গ্রহণ করবেন?',
            text: `${request.senderName} এর রিকোয়েস্ট গ্রহণ করতে চান?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'হ্যাঁ, গ্রহণ করুন',
            cancelButtonText: 'না',
            background: '#f3f4f6',
            color: '#374151'
        });

        if (result.isConfirmed) {
            acceptRequestMutation.mutate({ request });
        }
    };

    const handleRejectRequest = async (request) => {
        const result = await Swal.fire({
            title: 'রিকোয়েস্ট প্রত্যাখ্যান করবেন?',
            text: `${request.senderName} এর রিকোয়েস্ট প্রত্যাখ্যান করতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'হ্যাঁ, প্রত্যাখ্যান করুন',
            cancelButtonText: 'না',
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">{t('requests.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8 lg:py-16">
            <div className="max-w-6xl py-15 md:py-0 mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label={t('requests.backToDashboard')} />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <Heart className="w-8 h-8 text-primary" />
                        {t('requests.title')}
                    </h1>
                    <p className="text-neutral/70 mt-2">{t('requests.subtitle')}</p>
                </div>

                {/* Tabs */}
                <div className="bg-base-200 p-2 rounded-3xl mb-8 flex">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'received' 
                                ? 'bg-primary text-base-100 shadow-lg' 
                                : 'text-neutral hover:bg-base-300'
                        }`}
                    >
                        <Inbox className="w-5 h-5" />
                        {t('requests.receivedTab')} ({receivedRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'sent' 
                                ? 'bg-primary text-base-100 shadow-lg' 
                                : 'text-neutral hover:bg-base-300'
                        }`}
                    >
                        <Send className="w-5 h-5" />
                        {t('requests.sentTab')} ({sentRequests.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'received' ? (
                    <div>
                        <h2 className="text-xl font-bold text-neutral mb-6">{t('requests.receivedTitle')}</h2>
                        
                        {receivedRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <Inbox className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-neutral mb-2">{t('requests.noReceived')}</h3>
                                <p className="text-neutral/70">{t('requests.noReceivedDesc')}</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {receivedRequests.map((request) => {
                                    const isPending = pendingActions[request._id];
                                    
                                    return (
                                        <div key={request._id} className="bg-base-200 p-6 rounded-3xl shadow-lg">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/10">
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
                                                            className="w-8 h-8 text-primary" 
                                                            style={{ display: request.senderProfileImage ? 'none' : 'block' }}
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <User className="w-4 h-4 text-primary" />
                                                            <span className="font-semibold text-neutral">{request.senderName}</span>
                                                        </div>
                                                        <p className="text-sm text-neutral/70">
                                                            {formatDate(request.sentAt)} {t('requests.sentOn')}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {getStatusIcon(request.status)}
                                                            <span className={`font-medium ${getStatusColor(request.status)}`}>
                                                                {getStatusText(request.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {request.status === 'pending' && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleAcceptRequest(request)}
                                                            disabled={!!isPending}
                                                            className="bg-success text-base-100 px-6 py-2 rounded-xl font-semibold hover:bg-success/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                            className="bg-error text-base-100 px-6 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <h2 className="text-xl font-bold text-neutral mb-6">{t('requests.sentTitle')}</h2>
                        
                        {sentRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <Send className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-neutral mb-2">{t('requests.noSent')}</h3>
                                <p className="text-neutral/70">{t('requests.noSentDesc')}</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {sentRequests.map((request) => {
                                    const isPending = pendingActions[request._id];
                                    
                                    return (
                                        <div key={request._id} className="bg-base-200 p-6 rounded-3xl shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/10">
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
                                                            className="w-8 h-8 text-primary" 
                                                            style={{ display: request.receiverProfileImage ? 'none' : 'block' }}
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <User className="w-4 h-4 text-primary" />
                                                            <span className="font-semibold text-neutral">{request.receiverName}</span>
                                                        </div>
                                                        <p className="text-sm text-neutral/70">
                                                            {formatDate(request.sentAt)} {t('requests.sentOn')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(request.status)}
                                                        <span className={`font-medium ${getStatusColor(request.status)}`}>
                                                            {getStatusText(request.status)}
                                                        </span>
                                                    </div>
                                                    
                                                    {request.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancelRequest(request)}
                                                            disabled={!!isPending}
                                                            className="bg-warning text-base-100 px-4 py-2 rounded-xl font-semibold hover:bg-warning/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
