import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowLeft,
    User,
    Calendar,
    GraduationCap,
    MapPin,
    Phone,
    Mail,
    Heart,
    Droplets,
    BookOpen,
    MessageCircle,
    X,
    Workflow
} from 'lucide-react';
import UseAuth from '../../Hooks/UseAuth';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import { apiWithFallback } from '../../utils/apiChecker';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const ProfileDetails = () => {
    const { biodataId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestStatus, setRequestStatus] = useState({
        hasRequest: false,
        status: null,
        requestId: null,
        isInitiator: false
    });

    const { user } = UseAuth();
    const axiosSecure = UseAxiosSecure();
    const { t } = useTranslation();

    useEffect(() => {
        if (biodataId) {
            fetchProfileDetails();
        }
    }, [biodataId]);

    useEffect(() => {
        if (profile && user?.email) {
            checkRequestStatus();
        }
    }, [profile, user]);

    const fetchProfileDetails = async () => {
        setLoading(true);
        try {
            // Try biodataId first, then fallback to _id
            let response;
            try {
                response = await axiosSecure.get(`/biodata-by-objectid/${biodataId}`);
                console.log(response)
            } catch (error) {
                // If biodataId fails, try using it as MongoDB _id
                // response = await axiosSecure.get(`/biodata-by-id/${biodataId}`);
                const errMessage = error.message;
                console.log(errMessage)
            }

            if (response.data.success) {
                setProfile(response.data.biodata);
            } else {
                toast.error(t('profileDetails.notFound'));
                navigate('/browse-matches');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(t('profileDetails.loading'));
            navigate('/browse-matches');
        } finally {
            setLoading(false);
        }
    };

    const checkRequestStatus = async () => {
        try {
            console.log('Checking request status for:', { userEmail: user.email, biodataId, profileContactEmail: profile?.contactEmail });

            // First, try to check direct request status
            let response;
            let directRequestFound = false;

            try {
                response = await axiosSecure.get(`/request-status-by-biodata/${user.email}/${biodataId}`);
                if (response.data.success && response.data.hasRequest) {
                    console.log('Direct request found:', response.data);
                    setRequestStatus(response.data);
                    directRequestFound = true;
                }
            } catch (error) {
                console.log('Biodata request check failed, trying ObjectId');
                try {
                    response = await axiosSecure.get(`/request-status-by-objectid/${user.email}/${biodataId}`);
                    if (response.data.success && response.data.hasRequest) {
                        console.log('ObjectId request found:', response.data);
                        setRequestStatus(response.data);
                        directRequestFound = true;
                    }
                } catch (objectIdError) {
                    console.log('ObjectId request check also failed');
                }
            }

            // If no direct request found, check for mutual connection
            if (!directRequestFound && profile?.contactEmail) {
                console.log('Checking mutual connection with profile email:', profile.contactEmail);
                try {
                    const mutualResponse = await axiosSecure.get(`/check-mutual-connection/${user.email}/${profile.contactEmail}`);
                    console.log('Mutual connection response:', mutualResponse.data);

                    if (mutualResponse.data.success && mutualResponse.data.isConnected) {
                        console.log('Mutual connection found!');
                        setRequestStatus({
                            hasRequest: true,
                            status: 'accepted',
                            requestId: mutualResponse.data.connectionId,
                            isInitiator: false,
                            isMutualConnection: true
                        });
                    } else {
                        console.log('No mutual connection found');
                        // Also try with biodataId as fallback
                        try {
                            const mutualByIdResponse = await axiosSecure.get(`/check-mutual-connection/${user.email}/${biodataId}`);
                            console.log('Mutual connection by ID response:', mutualByIdResponse.data);

                            if (mutualByIdResponse.data.success && mutualByIdResponse.data.isConnected) {
                                console.log('Mutual connection found by ID!');
                                setRequestStatus({
                                    hasRequest: true,
                                    status: 'accepted',
                                    requestId: mutualByIdResponse.data.connectionId,
                                    isInitiator: false,
                                    isMutualConnection: true
                                });
                            }
                        } catch (mutualByIdError) {
                            console.log('Mutual connection by ID also failed');
                        }
                    }
                } catch (mutualError) {
                    console.log('Mutual connection check failed:', mutualError);
                }
            }
        } catch (error) {
            console.error('Error checking request status:', error);
        }
    };

    const sendConnectionRequest = async () => {
        if (!profile) return;

        setRequestLoading(true);
        try {
            // Try with biodataId first, then fallback to ObjectId
            let requestData;
            let response;
            
            if (profile.biodataId) {
                requestData = {
                    senderEmail: user.email,
                    receiverBiodataId: profile.biodataId,
                    status: 'pending',
                    sentAt: new Date()
                };

                // Use fallback system for biodata-based requests
                response = await apiWithFallback.sendRequestByBiodata(axiosSecure, requestData);
            } else {
                requestData = {
                    senderEmail: user.email,
                    receiverObjectId: biodataId,
                    receiverEmail: profile.contactEmail,
                    status: 'pending',
                    sentAt: new Date()
                };

                // Use fallback system for ObjectId-based requests
                response = await apiWithFallback.sendRequestByObjectId(axiosSecure, requestData);
            }

            if (response.data.success) {
                toast.success(t('browseMatches.sendRequest'));
                
                // Immediately update request status state
                const newRequestStatus = {
                    hasRequest: true,
                    status: 'pending',
                    requestId: response.data.result?.insertedId || response.data.requestId,
                    isInitiator: true
                };
                
                console.log('✅ Request sent successfully, updating state:', newRequestStatus);
                setRequestStatus(newRequestStatus);
            } else {
                toast.error(response.data.message || t('profileDetails.sendRequestError'));
            }
        } catch (error) {
            console.error('Error sending request:', error);
            const message = error.message || error.response?.data?.message || t('profileDetails.sendRequestError');
            toast.error(message);
        } finally {
            setRequestLoading(false);
        }
    };

    const cancelConnectionRequest = async () => {
        if (!requestStatus.requestId) {
            toast.error(t('profileDetails.cancelRequestError'));
            return;
        }

        setRequestLoading(true);
        try {
            const response = await axiosSecure.delete(`/cancel-request/${requestStatus.requestId}`);

            if (response.data.success) {
                toast.success(t('browseMatches.cancelRequest'));
                
                // Immediately update request status state
                const newRequestStatus = {
                    hasRequest: false,
                    status: null,
                    requestId: null,
                    isInitiator: false
                };
                
                console.log('✅ Request canceled successfully, updating state:', newRequestStatus);
                setRequestStatus(newRequestStatus);
            } else {
                toast.error(response.data.message || t('profileDetails.cancelRequestFailed'));
            }
        } catch (error) {
            console.error('Error canceling request:', error);
            const message = error.response?.data?.message || t('profileDetails.cancelRequestFailed');
            toast.error(message);
        } finally {
            setRequestLoading(false);
        }
    };

    const unfriendUser = async () => {
        if (!profile) return;

        // Show SweetAlert2 confirmation dialog
        const result = await Swal.fire({
            title: t('profileDetails.unfriendConfirm'),
            text: t('profileDetails.unfriendMessage', { name: profile.name }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('profileDetails.yes'),
            cancelButtonText: t('profileDetails.cancel'),
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

        setRequestLoading(true);
        try {
            // We need to get the actual contact email for this profile
            // Since we're viewing by biodataId/ObjectId, we need to fetch the full profile first
            let receiverEmail;

            try {
                // Try to get the full biodata with contact email
                const fullProfileResponse = await axiosSecure.get(`/biodata/${profile.contactEmail || 'temp'}`);
                if (fullProfileResponse.data.success) {
                    receiverEmail = fullProfileResponse.data.biodata.contactEmail;
                } else {
                    // Fallback: use the unfriend by requestId
                    if (requestStatus.requestId) {
                        const response = await axiosSecure.delete(`/unfriend/${requestStatus.requestId}`);
                        if (response.data.success) {
                            toast.success(t('friends.unfriendSuccess'));
                            setRequestStatus({
                                hasRequest: false,
                                status: null,
                                requestId: null,
                                isInitiator: false
                            });
                        } else {
                            toast.error(response.data.message || t('friends.unfriendError'));
                        }
                        return;
                    }
                }
            } catch (error) {
                // Fallback to requestId method
                if (requestStatus.requestId) {
                    const response = await axiosSecure.delete(`/unfriend/${requestStatus.requestId}`);
                    if (response.data.success) {
                        toast.success(t('friends.unfriendSuccess'));
                        setRequestStatus({
                            hasRequest: false,
                            status: null,
                            requestId: null,
                            isInitiator: false
                        });
                    } else {
                        toast.error(response.data.message || t('friends.unfriendError'));
                    }
                    return;
                }
            }

            if (receiverEmail) {
                const response = await axiosSecure.delete(`/unfriend-by-email/${user.email}/${receiverEmail}`);

                if (response.data.success) {
                    toast.success(t('friends.unfriendSuccess'));
                    setRequestStatus({
                        hasRequest: false,
                        status: null,
                        requestId: null,
                        isInitiator: false
                    });
                } else {
                    toast.error(response.data.message || t('friends.unfriendError'));
                }
            } else {
                toast.error(t('profileDetails.profileNotAvailable'));
            }
        } catch (error) {
            console.error('Error unfriending:', error);
            const message = error.response?.data?.message || t('friends.unfriendError');
            toast.error(message);
        } finally {
            setRequestLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">{t('profileDetails.loading')}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h3 className="text-xl font-semibold text-neutral mb-2">{t('profileDetails.notFound')}</h3>
                    <button
                        onClick={() => navigate('/browse-matches')}
                        className="btn btn-primary"
                    >
                        {t('profileDetails.goBack')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-4 sm:py-6 lg:py-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Header - Mobile Optimized */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => navigate('/browse-matches')}
                        className="btn btn-ghost btn-sm sm:btn-md gap-2 mb-4 -ml-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('profileDetails.goBack')}</span>
                    </button>

                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral mb-2">{profile.name}</h1>
                        <p className="text-sm sm:text-base text-neutral/70">{t('profileDetails.biodataNumber')}: {profile.biodataId}</p>
                    </div>
                </div>

                {/* Mobile-First Layout */}
                <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
                    {/* Profile Sidebar - Mobile: Full width, Desktop: 4 columns */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg lg:sticky lg:top-8">
                            {/* Profile Image - Responsive */}
                            <div className="text-center mb-4 sm:mb-6">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
                                    {profile.profileImage ? (
                                        <img
                                            src={profile.profileImage}
                                            alt={profile.name}
                                            className="w-full h-full rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <User
                                        className="w-12 h-12 sm:w-16 sm:h-16 text-primary"
                                        style={{ display: profile.profileImage ? 'none' : 'block' }}
                                    />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-neutral">{profile.name}</h2>
                                <p className="text-sm sm:text-base text-neutral/70">{profile.age} {t('profileDetails.years')}</p>
                            </div>

                            {/* Quick Info - Mobile Optimized */}
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl">
                                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-neutral text-sm sm:text-base truncate">{profile.department}</p>
                                        {profile.batch && <p className="text-xs sm:text-sm text-neutral/70 truncate">{profile.batch}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                    <p className="font-medium text-neutral text-sm sm:text-base truncate">{profile.district}</p>
                                </div>

                                {profile.bloodGroup && (
                                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl">
                                        <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                        <p className="font-medium text-neutral text-sm sm:text-base">{profile.bloodGroup}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons - Mobile Optimized */}
                            <div className="space-y-2 sm:space-y-3">
                                {(() => {
                                    console.log('🔍 Button rendering - requestStatus:', requestStatus);
                                    return null;
                                })()}
                                
                                {!requestStatus.hasRequest ? (
                                    <button
                                        onClick={sendConnectionRequest}
                                        disabled={requestLoading}
                                        className="w-full bg-primary text-base-100 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-4 h-4" />
                                        {requestLoading ? t('profileDetails.sending') : t('profileDetails.sendRequest')}
                                    </button>
                                ) : requestStatus.status === 'pending' ? (
                                    requestStatus.isInitiator ? (
                                        <button
                                            onClick={cancelConnectionRequest}
                                            disabled={requestLoading}
                                            className="w-full bg-error text-base-100 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-error/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            {requestLoading ? t('profileDetails.canceling') : t('profileDetails.cancelRequest')}
                                        </button>
                                    ) : (
                                        <div className="w-full bg-warning/20 text-warning py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-center border border-warning/30">
                                            ⏳ {t('profileDetails.requestPending')}
                                        </div>
                                    )
                                ) : (requestStatus.status === 'accepted' || requestStatus.isMutualConnection) ? (
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="w-full bg-success/20 text-success py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-center border border-success/30 flex items-center justify-center gap-2">
                                            <Workflow className="w-4 h-4" />
                                            {requestStatus.isMutualConnection ? t('profileDetails.mutuallyConnected') : t('profileDetails.connected')}
                                        </div>
                                        <button
                                            onClick={unfriendUser}
                                            disabled={requestLoading}
                                            className="w-full bg-warning text-base-100 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-warning/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            {requestLoading ? t('profileDetails.unfriending') : t('profileDetails.unfriend')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full bg-error/20 text-error py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-center border border-error/30">
                                        ❌ {t('profileDetails.requestRejected')}
                                    </div>
                                )}

                                {/* <button className="w-full bg-base-100 text-neutral py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-base-300 transition-all border border-base-300 flex items-center justify-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    শর্টলিস্ট করুন
                                </button> */}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Mobile: Full width, Desktop: 8 columns */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6">
                        {/* Personal Information - Mobile Optimized */}
                        <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                {t('profileDetails.personalInfo')}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                        <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.age')}</span>
                                    </div>
                                    <p className="text-neutral/70 text-sm sm:text-base">{profile.age} {t('profileDetails.years')}</p>
                                </div>

                                <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                        <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.gender')}</span>
                                    </div>
                                    <p className="text-neutral/70 text-sm sm:text-base">{profile.gender === 'Male' ? t('profileDetails.male') : t('profileDetails.female')}</p>
                                </div>

                                {profile.bloodGroup && (
                                    <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                            <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.bloodGroup')}</span>
                                        </div>
                                        <p className="text-neutral/70 text-sm sm:text-base">{profile.bloodGroup}</p>
                                    </div>
                                )}

                                <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                        <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.district')}</span>
                                    </div>
                                    <p className="text-neutral/70 text-sm sm:text-base">{profile.district}</p>
                                </div>
                            </div>
                        </div>

                        {/* Educational Information - Mobile Optimized */}
                        <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                {t('profileDetails.educationalInfo')}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                        <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.department')}</span>
                                    </div>
                                    <p className="text-neutral/70 text-sm sm:text-base break-words">{profile.department}</p>
                                </div>

                                {profile.batch && (
                                    <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                            <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.batch')}</span>
                                        </div>
                                        <p className="text-neutral/70 text-sm sm:text-base">{profile.batch}</p>
                                    </div>
                                )}

                                {/* Semester info - show for all users (public info) */}
                                {profile.semester && (
                                    <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl sm:col-span-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                            <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.semester')}</span>
                                        </div>
                                        <p className="text-neutral/70 text-sm sm:text-base">{profile.semester}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information - Mobile Optimized */}
                        <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                {t('profileDetails.contactInfo')}
                            </h3>

                            {(requestStatus.status === 'accepted' || requestStatus.isMutualConnection) ? (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="p-3 sm:p-4 bg-success/10 border border-success/20 rounded-lg sm:rounded-xl">
                                        <p className="text-success font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
                                            🔓 {t('profileDetails.contactUnlocked')}
                                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </p>

                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl">
                                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.mobileNumber')}</p>
                                                    <p className="text-neutral/70 text-sm sm:text-base break-all">
                                                        {profile.mobile || profile.mobileNumber || profile.phone || t('profileDetails.noInfo')}
                                                    </p>
                                                </div>
                                                {(profile.mobile || profile.mobileNumber || profile.phone) && (
                                                    <a
                                                        href={`tel:${profile.mobile || profile.mobileNumber || profile.phone}`}
                                                        className="btn btn-sm btn-primary flex-shrink-0"
                                                    >
                                                        <span className="hidden sm:inline">{t('profileDetails.callNow')}</span>
                                                        <Phone className="w-4 h-4 sm:hidden" />
                                                    </a>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl">
                                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.email')}</p>
                                                    <p className="text-neutral/70 text-sm sm:text-base break-all">{profile.contactEmail || profile.email || t('profileDetails.noInfo')}</p>
                                                </div>
                                                {(profile.contactEmail || profile.email) && (
                                                    <a
                                                        href={`mailto:${profile.contactEmail || profile.email}`}
                                                        className="btn btn-sm btn-primary flex-shrink-0"
                                                    >
                                                        <span className="hidden sm:inline">{t('profileDetails.sendEmail')}</span>
                                                        <Mail className="w-4 h-4 sm:hidden" />
                                                    </a>
                                                )}
                                            </div>

                                            {/* Address Information - Only for connected users */}
                                            {profile.presentAddress && (
                                                <div className="p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                        <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.presentAddress')}</span>
                                                    </div>
                                                    <p className="text-neutral/70 text-xs sm:text-sm break-words">{profile.presentAddress}</p>
                                                </div>
                                            )}

                                            {profile.permanentAddress && (
                                                <div className="p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                        <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.permanentAddress')}</span>
                                                    </div>
                                                    <p className="text-neutral/70 text-xs sm:text-sm break-words">{profile.permanentAddress}</p>
                                                </div>
                                            )}

                                            {/* {profile.semester && (
                                                <div className="p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                        <span className="font-medium text-neutral text-sm sm:text-base">সেমিস্টার</span>
                                                    </div>
                                                    <p className="text-neutral/70 text-xs sm:text-sm">{profile.semester}</p>
                                                </div>
                                            )} */}
                                        </div>

                                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-info/10 border border-info/20 rounded-lg sm:rounded-xl">
                                            <p className="text-info text-xs sm:text-sm flex items-center gap-2">
                                                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                {requestStatus.isMutualConnection
                                                    ? t('profileDetails.mutualConnection')
                                                    : t('profileDetails.liveMessaging')
                                                }
                                            </p>
                                            <button
                                                onClick={() => navigate(`/messages?user=${encodeURIComponent(profile.contactEmail || profile.email)}`)}
                                                className="btn btn-sm btn-info mt-2 w-full sm:w-auto"
                                            >
                                                {t('profileDetails.sendMessage')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 sm:p-4 bg-warning/10 border border-warning/20 rounded-lg sm:rounded-xl">
                                    <p className="text-warning font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
                                        🔒 {t('profileDetails.privateInfo')}
                                    </p>
                                    <p className="text-neutral/70 text-xs sm:text-sm mb-3">
                                        {t('profileDetails.privateInfoDesc')}
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl text-neutral/50">
                                            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="text-sm sm:text-base">{t('profileDetails.hiddenPhone')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl text-neutral/50">
                                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="text-sm sm:text-base">{t('profileDetails.hiddenEmail')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-100 rounded-lg sm:rounded-xl text-neutral/50">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="text-sm sm:text-base">{t('profileDetails.hiddenAddress')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* About Me - Mobile Optimized */}
                        {profile.aboutMe && (
                            <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                                <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    {t('profileDetails.aboutMe')}
                                </h3>

                                <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                    <p className="text-neutral/70 leading-relaxed text-sm sm:text-base break-words">{profile.aboutMe}</p>
                                </div>
                            </div>
                        )}

                        {/* Partner Expectation - Mobile Optimized */}
                        {profile.partnerExpectation && (
                            <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                                <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    {t('profileDetails.partnerExpectation')}
                                </h3>

                                <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                    <p className="text-neutral/70 leading-relaxed text-sm sm:text-base break-words">{profile.partnerExpectation}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;