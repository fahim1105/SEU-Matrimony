import { useState, useEffect } from 'react';
import { Heart, Send, Inbox, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import UseAuth from '../../Hooks/UseAuth';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';

const MyRequests = () => {
    const [activeTab, setActiveTab] = useState('received');
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { user } = UseAuth();
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        if (user?.email) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Fetch sent requests
            const sentResponse = await axiosSecure.get(`/sent-requests/${user.email}`);
            if (sentResponse.data.success) {
                // Enhance sent requests with user names and profile images
                const enhancedSentRequests = await Promise.all(
                    sentResponse.data.requests.map(async (request) => {
                        try {
                            // Get receiver's biodata for name and profile image
                            const biodataResponse = await axiosSecure.get(`/biodata/${request.receiverEmail}`);
                            const receiverName = biodataResponse.data.success ? biodataResponse.data.biodata.name : 'SEU Member';
                            const receiverProfileImage = biodataResponse.data.success ? biodataResponse.data.biodata.profileImage : null;
                            
                            return {
                                ...request,
                                receiverName,
                                receiverProfileImage
                            };
                        } catch (error) {
                            console.error('Error enhancing sent request:', error);
                            return {
                                ...request,
                                receiverName: 'SEU Member',
                                receiverProfileImage: null
                            };
                        }
                    })
                );
                setSentRequests(enhancedSentRequests);
            }

            // Fetch received requests
            const receivedResponse = await axiosSecure.get(`/received-requests/${user.email}`);
            if (receivedResponse.data.success) {
                // Enhance received requests with user names and profile images
                const enhancedReceivedRequests = await Promise.all(
                    receivedResponse.data.requests.map(async (request) => {
                        try {
                            // Get sender's biodata for name and profile image
                            const biodataResponse = await axiosSecure.get(`/biodata/${request.senderEmail}`);
                            const senderName = biodataResponse.data.success ? biodataResponse.data.biodata.name : 'SEU Member';
                            const senderProfileImage = biodataResponse.data.success ? biodataResponse.data.biodata.profileImage : null;
                            
                            return {
                                ...request,
                                senderName,
                                senderProfileImage
                            };
                        } catch (error) {
                            console.error('Error enhancing received request:', error);
                            return {
                                ...request,
                                senderName: 'SEU Member',
                                senderProfileImage: null
                            };
                        }
                    })
                );
                setReceivedRequests(enhancedReceivedRequests);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('রিকোয়েস্ট লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAction = async (requestId, action) => {
        try {
            const response = await axiosSecure.patch(`/request-status/${requestId}`, {
                status: action
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Update the request status in state
                setReceivedRequests(prev => 
                    prev.map(req => 
                        req._id === requestId 
                            ? { ...req, status: action }
                            : req
                    )
                );
            } else {
                toast.error(response.data.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            const message = error.response?.data?.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে';
            toast.error(message);
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
                return 'গৃহীত';
            case 'rejected':
                return 'প্রত্যাখ্যাত';
            default:
                return 'অপেক্ষমাণ';
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">রিকোয়েস্ট লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8 lg:py-16">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label="ড্যাশবোর্ডে ফিরে যান" />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <Heart className="w-8 h-8 text-primary" />
                        আমার রিকোয়েস্ট
                    </h1>
                    <p className="text-neutral/70 mt-2">পাঠানো এবং প্রাপ্ত কানেকশন রিকোয়েস্ট দেখুন</p>
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
                        প্রাপ্ত রিকোয়েস্ট ({receivedRequests.length})
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
                        পাঠানো রিকোয়েস্ট ({sentRequests.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'received' ? (
                    <div>
                        <h2 className="text-xl font-bold text-neutral mb-6">প্রাপ্ত রিকোয়েস্ট</h2>
                        
                        {receivedRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <Inbox className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-neutral mb-2">কোনো রিকোয়েস্ট নেই</h3>
                                <p className="text-neutral/70">আপনার কাছে এখনও কোনো কানেকশন রিকোয়েস্ট আসেনি</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {receivedRequests.map((request) => (
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
                                                        {new Date(request.sentAt).toLocaleDateString('bn-BD')} তারিখে পাঠানো
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
                                                        onClick={() => handleRequestAction(request._id, 'accepted')}
                                                        className="bg-success text-base-100 px-6 py-2 rounded-xl font-semibold hover:bg-success/90 transition-all flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        গ্রহণ করুন
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequestAction(request._id, 'rejected')}
                                                        className="bg-error text-base-100 px-6 py-2 rounded-xl font-semibold hover:bg-error/90 transition-all flex items-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        প্রত্যাখ্যান করুন
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold text-neutral mb-6">পাঠানো রিকোয়েস্ট</h2>
                        
                        {sentRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <Send className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-neutral mb-2">কোনো রিকোয়েস্ট পাঠাননি</h3>
                                <p className="text-neutral/70">আপনি এখনও কোনো কানেকশন রিকোয়েস্ট পাঠাননি</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {sentRequests.map((request) => (
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
                                                        {new Date(request.sentAt).toLocaleDateString('bn-BD')} তারিখে পাঠানো
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(request.status)}
                                                <span className={`font-medium ${getStatusColor(request.status)}`}>
                                                    {getStatusText(request.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRequests;