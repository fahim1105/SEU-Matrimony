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
import Loader from '../../Components/Loader/Loader';
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
    const [userBiodata, setUserBiodata] = useState(null);
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
        if (user?.email) {
            fetchUserBiodata();
        }
    }, [user]);

    useEffect(() => {
        if (profile && user?.email) {
            checkRequestStatus();
        }
    }, [profile, user]);

    const fetchUserBiodata = async () => {
        try {
            const response = await axiosSecure.get(`/biodata/${user.email}`);
            if (response.data.success) {
                setUserBiodata(response.data.biodata);
            }
        } catch (error) {
            console.log('No biodata found for user');
        }
    };

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
        if (!profile?.contactEmail || !user?.email) {
            console.log('❌ Missing required data for status check');
            return;
        }

        try {
            console.log('🔍 Checking request status between:', user.email, 'and', profile.contactEmail);

            // Check for any request between these two users
            const response = await axiosSecure.get(`/check-request-status/${user.email}/${profile.contactEmail}`);
            
            console.log('✅ Request status response:', response.data);

            if (response.data.success) {
                if (response.data.hasRequest) {
                    setRequestStatus({
                        hasRequest: true,
                        status: response.data.status,
                        requestId: response.data.requestId,
                        isInitiator: response.data.isInitiator
                    });
                } else {
                    setRequestStatus({
                        hasRequest: false,
                        status: null,
                        requestId: null,
                        isInitiator: false
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error checking request status:', error);
            setRequestStatus({
                hasRequest: false,
                status: null,
                requestId: null,
                isInitiator: false
            });
        }
    };

    const sendConnectionRequest = async () => {
        if (!profile) return;

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

        // Send request
        setRequestLoading(true);
        try {
            const response = await axiosSecure.post('/send-connection-request', {
                senderEmail: user.email,
                receiverEmail: profile.contactEmail
            });

            if (response.data.success) {
                toast.success(t('browseMatches.sendRequest'));
                // Update state immediately
                setRequestStatus({
                    hasRequest: true,
                    status: 'pending',
                    requestId: response.data.requestId,
                    isInitiator: true
                });
            } else {
                toast.error(response.data.message || t('profileDetails.sendRequestError'));
            }
        } catch (error) {
            console.error('Error sending request:', error);
            toast.error(error.response?.data?.message || t('profileDetails.sendRequestError'));
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
        if (!profile || !requestStatus.requestId) return;

        // Show confirmation dialog
        const result = await Swal.fire({
            title: t('profileDetails.unfriendConfirm'),
            text: t('profileDetails.unfriendMessage').replace('{name}', profile.name),
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
            const response = await axiosSecure.delete(`/unfriend/${requestStatus.requestId}`);

            if (response.data.success) {
                toast.success(t('friends.unfriendSuccess'));
                // Update state immediately
                setRequestStatus({
                    hasRequest: false,
                    status: null,
                    requestId: null,
                    isInitiator: false
                });
            } else {
                toast.error(response.data.message || t('friends.unfriendError'));
            }
        } catch (error) {
            console.error('Error unfriending:', error);
            toast.error(error.response?.data?.message || t('friends.unfriendError'));
        } finally {
            setRequestLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
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
        <div className="min-h-screen bg-base-100 py-20 lg:py-16">
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
                                ) : (requestStatus.status === 'accepted') ? (
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="w-full bg-success/20 text-success py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-center border border-success/30 flex items-center justify-center gap-2">
                                            <Workflow className="w-4 h-4" />
                                            {t('profileDetails.connected')}
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
                                {profile.dateOfBirth && (
                                    <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                            <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.dateOfBirth')}</span>
                                        </div>
                                        <p className="text-neutral/70 text-sm sm:text-base">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                                    </div>
                                )}

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

                                {profile.height && (
                                    <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                            <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.height')}</span>
                                        </div>
                                        <p className="text-neutral/70 text-sm sm:text-base">{profile.height}</p>
                                    </div>
                                )}

                                {profile.religion && (
                                    <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                            <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.religion')}</span>
                                        </div>
                                        <p className="text-neutral/70 text-sm sm:text-base">{profile.religion}</p>
                                    </div>
                                )}

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

                                {profile.semester && (
                                    <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                            <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.semester')}</span>
                                        </div>
                                        <p className="text-neutral/70 text-sm sm:text-base">{profile.semester}</p>
                                    </div>
                                )}

                                {profile.currentOccupation && (
                                    <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                            <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.currentOccupation')}</span>
                                        </div>
                                        <p className="text-neutral/70 text-sm sm:text-base">{profile.currentOccupation}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Family Information - Mobile Optimized */}
                        {(profile.fatherOccupation || profile.motherOccupation || profile.numberOfSiblings || profile.siblingPosition || profile.familyFinancialStatus) && (
                            <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                                <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    {t('profileDetails.familyInformation')}
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {profile.fatherOccupation && (
                                        <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.fatherOccupation')}</span>
                                            </div>
                                            <p className="text-neutral/70 text-sm sm:text-base">{profile.fatherOccupation}</p>
                                        </div>
                                    )}

                                    {profile.motherOccupation && (
                                        <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.motherOccupation')}</span>
                                            </div>
                                            <p className="text-neutral/70 text-sm sm:text-base">{profile.motherOccupation}</p>
                                        </div>
                                    )}

                                    {profile.numberOfSiblings && (
                                        <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.numberOfSiblings')}</span>
                                            </div>
                                            <p className="text-neutral/70 text-sm sm:text-base">{profile.numberOfSiblings}</p>
                                        </div>
                                    )}

                                    {profile.siblingPosition && (
                                        <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.siblingPosition')}</span>
                                            </div>
                                            <p className="text-neutral/70 text-sm sm:text-base">{profile.siblingPosition}</p>
                                        </div>
                                    )}

                                    {profile.familyFinancialStatus && (
                                        <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl sm:col-span-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.familyFinancialStatus')}</span>
                                            </div>
                                            <p className="text-neutral/70 text-sm sm:text-base">{profile.familyFinancialStatus}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contact Information - Mobile Optimized */}
                        <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                {t('profileDetails.contactInfo')}
                            </h3>

                            {(requestStatus.status === 'accepted') ? (
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
                                                {t('profileDetails.liveMessaging')}
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

                        {/* Partner Preference - Mobile Optimized */}
                        {(profile.partnerAgeMin || profile.partnerAgeMax || profile.partnerHeight || profile.partnerOtherRequirements) && (
                            <div className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
                                <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    {t('profileDetails.partnerPreference')}
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {(profile.partnerAgeMin || profile.partnerAgeMax) && (
                                        <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.partnerAge')}</span>
                                            </div>
                                            <p className="text-neutral/70 text-sm sm:text-base">
                                                {profile.partnerAgeMin || '?'} - {profile.partnerAgeMax || '?'} {t('profileDetails.years')}
                                            </p>
                                        </div>
                                    )}

                                    {profile.partnerHeight && (
                                        <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.partnerHeight')}</span>
                                            </div>
                                            <p className="text-neutral/70 text-sm sm:text-base">{profile.partnerHeight}</p>
                                        </div>
                                    )}

                                    {profile.partnerOtherRequirements && (
                                        <div className="p-3 sm:p-4 bg-base-100 rounded-lg sm:rounded-xl sm:col-span-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-medium text-neutral text-sm sm:text-base">{t('profileDetails.otherRequirements')}</span>
                                            </div>
                                            <p className="text-neutral/70 text-sm sm:text-base break-words">{profile.partnerOtherRequirements}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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