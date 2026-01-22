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
import toast from 'react-hot-toast';

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
                response = await axiosSecure.get(`/biodata-by-id/${biodataId}`);
            } catch (error) {
                // If biodataId fails, try using it as MongoDB _id
                response = await axiosSecure.get(`/biodata-by-objectid/${biodataId}`);
            }
            
            if (response.data.success) {
                setProfile(response.data.biodata);
            } else {
                toast.error('প্রোফাইল পাওয়া যায়নি');
                navigate('/browse-matches');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('প্রোফাইল লোড করতে সমস্যা হয়েছে');
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
            if (profile.biodataId) {
                requestData = {
                    senderEmail: user.email,
                    receiverBiodataId: profile.biodataId,
                    status: 'pending',
                    sentAt: new Date()
                };
            } else {
                requestData = {
                    senderEmail: user.email,
                    receiverObjectId: biodataId,
                    status: 'pending',
                    sentAt: new Date()
                };
            }

            const endpoint = profile.biodataId ? '/send-request-by-biodata' : '/send-request-by-objectid';
            const response = await axiosSecure.post(endpoint, requestData);
            
            if (response.data.success) {
                toast.success('কানেকশন রিকোয়েস্ট পাঠানো হয়েছে');
                // Update request status
                setRequestStatus({
                    hasRequest: true,
                    status: 'pending',
                    requestId: response.data.result.insertedId,
                    isInitiator: true
                });
            } else {
                toast.error(response.data.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            const message = error.response?.data?.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে';
            toast.error(message);
        } finally {
            setRequestLoading(false);
        }
    };

    const cancelConnectionRequest = async () => {
        if (!requestStatus.requestId || !requestStatus.isInitiator) {
            toast.error('শুধুমাত্র যিনি রিকোয়েস্ট পাঠিয়েছেন তিনি বাতিল করতে পারবেন');
            return;
        }
        
        setRequestLoading(true);
        try {
            const response = await axiosSecure.delete(`/cancel-request/${requestStatus.requestId}`);
            
            if (response.data.success) {
                toast.success('রিকোয়েস্ট বাতিল করা হয়েছে');
                // Update request status
                setRequestStatus({
                    hasRequest: false,
                    status: null,
                    requestId: null,
                    isInitiator: false
                });
            } else {
                toast.error(response.data.message || 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error canceling request:', error);
            const message = error.response?.data?.message || 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে';
            toast.error(message);
        } finally {
            setRequestLoading(false);
        }
    };

    const unfriendUser = async () => {
        if (!profile) return;
        
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
                            toast.success('আনফ্রেন্ড করা হয়েছে');
                            setRequestStatus({
                                hasRequest: false,
                                status: null,
                                requestId: null,
                                isInitiator: false
                            });
                        } else {
                            toast.error(response.data.message || 'আনফ্রেন্ড করতে সমস্যা হয়েছে');
                        }
                        return;
                    }
                }
            } catch (error) {
                // Fallback to requestId method
                if (requestStatus.requestId) {
                    const response = await axiosSecure.delete(`/unfriend/${requestStatus.requestId}`);
                    if (response.data.success) {
                        toast.success('আনফ্রেন্ড করা হয়েছে');
                        setRequestStatus({
                            hasRequest: false,
                            status: null,
                            requestId: null,
                            isInitiator: false
                        });
                    } else {
                        toast.error(response.data.message || 'আনফ্রেন্ড করতে সমস্যা হয়েছে');
                    }
                    return;
                }
            }

            if (receiverEmail) {
                const response = await axiosSecure.delete(`/unfriend-by-email/${user.email}/${receiverEmail}`);
                
                if (response.data.success) {
                    toast.success('আনফ্রেন্ড করা হয়েছে');
                    setRequestStatus({
                        hasRequest: false,
                        status: null,
                        requestId: null,
                        isInitiator: false
                    });
                } else {
                    toast.error(response.data.message || 'আনফ্রেন্ড করতে সমস্যা হয়েছে');
                }
            } else {
                toast.error('প্রোফাইল তথ্য পাওয়া যায়নি');
            }
        } catch (error) {
            console.error('Error unfriending:', error);
            const message = error.response?.data?.message || 'আনফ্রেন্ড করতে সমস্যা হয়েছে';
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
                    <p className="text-neutral/70">প্রোফাইল লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h3 className="text-xl font-semibold text-neutral mb-2">প্রোফাইল পাওয়া যায়নি</h3>
                    <button 
                        onClick={() => navigate('/browse-matches')}
                        className="btn btn-primary"
                    >
                        ফিরে যান
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8 lg:py-16">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/browse-matches')}
                        className="btn btn-ghost gap-2 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        ফিরে যান
                    </button>
                    
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-neutral mb-2">{profile.name}</h1>
                        <p className="text-neutral/70">বায়োডাটা নং: {profile.biodataId}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Image & Basic Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-base-200 rounded-3xl p-6 shadow-lg sticky top-8">
                            {/* Profile Image */}
                            <div className="text-center mb-6">
                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4 overflow-hidden">
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
                                        className="w-16 h-16 text-primary" 
                                        style={{ display: profile.profileImage ? 'none' : 'block' }}
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-neutral">{profile.name}</h2>
                                <p className="text-neutral/70">{profile.age} বছর</p>
                            </div>

                            {/* Quick Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                                    <GraduationCap className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="font-medium text-neutral">{profile.department}</p>
                                        {profile.batch && <p className="text-sm text-neutral/70">{profile.batch}</p>}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <p className="font-medium text-neutral">{profile.district}</p>
                                </div>
                                
                                {profile.bloodGroup && (
                                    <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                                        <Droplets className="w-5 h-5 text-primary" />
                                        <p className="font-medium text-neutral">{profile.bloodGroup}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {!requestStatus.hasRequest ? (
                                    <button
                                        onClick={sendConnectionRequest}
                                        disabled={requestLoading}
                                        className="w-full bg-primary text-base-100 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-4 h-4" />
                                        {requestLoading ? 'পাঠানো হচ্ছে...' : 'রিকোয়েস্ট পাঠান'}
                                    </button>
                                ) : requestStatus.status === 'pending' ? (
                                    // Show different buttons based on who initiated the request
                                    requestStatus.isInitiator ? (
                                        <button
                                            onClick={cancelConnectionRequest}
                                            disabled={requestLoading}
                                            className="w-full bg-error text-base-100 py-3 rounded-xl font-semibold hover:bg-error/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            {requestLoading ? 'বাতিল করা হচ্ছে...' : 'রিকোয়েস্ট বাতিল করুন'}
                                        </button>
                                    ) : (
                                        <div className="w-full bg-warning/20 text-warning py-3 rounded-xl font-semibold text-center border border-warning/30">
                                            ⏳ আপনার কাছে রিকোয়েস্ট এসেছে
                                        </div>
                                    )
                                ) : (requestStatus.status === 'accepted' || requestStatus.isMutualConnection) ? (
                                    <div className="space-y-3">
                                        <div className="w-full bg-success/20 text-success py-3 rounded-xl font-semibold text-center border border-success/30 flex item-center justify-center gap-2">
                                                <Workflow /> {requestStatus.isMutualConnection ? 'পরস্পর কানেক্টেড' : 'কানেক্টেড'}
                                        </div>
                                        <button
                                            onClick={unfriendUser}
                                            disabled={requestLoading}
                                            className="w-full bg-warning text-base-100 py-3 rounded-xl font-semibold hover:bg-warning/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            {requestLoading ? 'আনফ্রেন্ড করা হচ্ছে...' : 'আনফ্রেন্ড করুন'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full bg-error/20 text-error py-3 rounded-xl font-semibold text-center border border-error/30">
                                        ❌ রিকোয়েস্ট প্রত্যাখ্যাত
                                    </div>
                                )}
                                
                                <button className="w-full bg-base-100 text-neutral py-3 rounded-xl font-semibold hover:bg-base-300 transition-all border border-base-300 flex items-center justify-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    শর্টলিস্ট করুন
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-base-200 rounded-3xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                ব্যক্তিগত তথ্য
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-base-100 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span className="font-medium text-neutral">বয়স</span>
                                    </div>
                                    <p className="text-neutral/70">{profile.age} বছর</p>
                                </div>
                                
                                <div className="p-4 bg-base-100 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-primary" />
                                        <span className="font-medium text-neutral">জেন্ডার</span>
                                    </div>
                                    <p className="text-neutral/70">{profile.gender === 'Male' ? 'পুরুষ' : 'মহিলা'}</p>
                                </div>
                                
                                {profile.bloodGroup && (
                                    <div className="p-4 bg-base-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Droplets className="w-4 h-4 text-primary" />
                                            <span className="font-medium text-neutral">রক্তের গ্রুপ</span>
                                        </div>
                                        <p className="text-neutral/70">{profile.bloodGroup}</p>
                                    </div>
                                )}
                                
                                <div className="p-4 bg-base-100 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="font-medium text-neutral">জেলা</span>
                                    </div>
                                    <p className="text-neutral/70">{profile.district}</p>
                                </div>
                            </div>
                        </div>

                        {/* Educational Information */}
                        <div className="bg-base-200 rounded-3xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-primary" />
                                শিক্ষাগত তথ্য
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-base-100 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                        <span className="font-medium text-neutral">ডিপার্টমেন্ট</span>
                                    </div>
                                    <p className="text-neutral/70">{profile.department}</p>
                                </div>
                                
                                {profile.batch && (
                                    <div className="p-4 bg-base-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span className="font-medium text-neutral">ব্যাচ</span>
                                        </div>
                                        <p className="text-neutral/70">{profile.batch}</p>
                                    </div>
                                )}

                                {/* Semester info - show for all users (public info) */}
                                {profile.semester && (
                                    <div className="p-4 bg-base-100 rounded-xl md:col-span-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                            <span className="font-medium text-neutral">সেমিস্টার</span>
                                        </div>
                                        <p className="text-neutral/70">{profile.semester}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-base-200 rounded-3xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-primary" />
                                যোগাযোগের তথ্য
                            </h3>
                            
                            {(requestStatus.status === 'accepted' || requestStatus.isMutualConnection) ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
                                        <p className="text-success font-medium mb-3 flex items-center gap-2">
                                            🔓 যোগাযোগের তথ্য উন্মুক্ত
                                            <MessageCircle className="w-4 h-4" />
                                        </p>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                                                <Phone className="w-5 h-5 text-primary" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-neutral">মোবাইল নম্বর</p>
                                                    <p className="text-neutral/70">
                                                        {profile.mobile || profile.mobileNumber || profile.phone || 'তথ্য নেই'}
                                                    </p>
                                                </div>
                                                {(profile.mobile || profile.mobileNumber || profile.phone) && (
                                                    <a 
                                                        href={`tel:${profile.mobile || profile.mobileNumber || profile.phone}`}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        কল করুন
                                                    </a>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                                                <Mail className="w-5 h-5 text-primary" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-neutral">ইমেইল</p>
                                                    <p className="text-neutral/70">{profile.contactEmail || profile.email || 'তথ্য নেই'}</p>
                                                </div>
                                                {(profile.contactEmail || profile.email) && (
                                                    <a 
                                                        href={`mailto:${profile.contactEmail || profile.email}`}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        ইমেইল করুন
                                                    </a>
                                                )}
                                            </div>

                                            {/* Address Information - Only for connected users */}
                                            {profile.presentAddress && (
                                                <div className="p-3 bg-base-100 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="w-4 h-4 text-primary" />
                                                        <span className="font-medium text-neutral">বর্তমান ঠিকানা</span>
                                                    </div>
                                                    <p className="text-neutral/70 text-sm">{profile.presentAddress}</p>
                                                </div>
                                            )}

                                            {profile.permanentAddress && (
                                                <div className="p-3 bg-base-100 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="w-4 h-4 text-primary" />
                                                        <span className="font-medium text-neutral">স্থায়ী ঠিকানা</span>
                                                    </div>
                                                    <p className="text-neutral/70 text-sm">{profile.permanentAddress}</p>
                                                </div>
                                            )}

                                            {profile.semester && (
                                                <div className="p-3 bg-base-100 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <BookOpen className="w-4 h-4 text-primary" />
                                                        <span className="font-medium text-neutral">সেমিস্টার</span>
                                                    </div>
                                                    <p className="text-neutral/70 text-sm">{profile.semester}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-xl">
                                            <p className="text-info text-sm flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4" />
                                                {requestStatus.isMutualConnection 
                                                    ? 'আপনারা পরস্পর কানেক্টেড! এখন লাইভ মেসেজিং করতে পারেন।'
                                                    : 'আপনি এখন লাইভ মেসেজিং এর মাধ্যমে কথা বলতে পারেন!'
                                                }
                                            </p>
                                            <button 
                                                onClick={() => navigate(`/dashboard/messages?user=${encodeURIComponent(profile.contactEmail || profile.email)}`)}
                                                className="btn btn-sm btn-info mt-2"
                                            >
                                                মেসেজ পাঠান
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                                    <p className="text-warning font-medium mb-2 flex items-center gap-2">
                                        🔒 গোপনীয় তথ্য
                                    </p>
                                    <p className="text-neutral/70 text-sm mb-3">
                                        যোগাযোগের তথ্য এবং ঠিকানা শুধুমাত্র কানেকশন রিকোয়েস্ট গৃহীত হওয়ার পর দেখা যাবে।
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl text-neutral/50">
                                            <Phone className="w-5 h-5" />
                                            <span>••• •••• ••••</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl text-neutral/50">
                                            <Mail className="w-5 h-5" />
                                            <span>••••••@seu.edu.bd</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-base-100 rounded-xl text-neutral/50">
                                            <MapPin className="w-5 h-5" />
                                            <span>ঠিকানা গোপনীয়</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* About Me */}
                        {profile.aboutMe && (
                            <div className="bg-base-200 rounded-3xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    নিজের সম্পর্কে
                                </h3>
                                
                                <div className="p-4 bg-base-100 rounded-xl">
                                    <p className="text-neutral/70 leading-relaxed">{profile.aboutMe}</p>
                                </div>
                            </div>
                        )}

                        {/* Partner Expectation */}
                        {profile.partnerExpectation && (
                            <div className="bg-base-200 rounded-3xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    পার্টনার সম্পর্কে প্রত্যাশা
                                </h3>
                                
                                <div className="p-4 bg-base-100 rounded-xl">
                                    <p className="text-neutral/70 leading-relaxed">{profile.partnerExpectation}</p>
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