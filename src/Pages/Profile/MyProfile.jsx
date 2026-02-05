import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Briefcase, 
    GraduationCap,
    Heart,
    Edit3,
    Eye,
    Shield,
    Clock,
    CheckCircle,
    AlertTriangle,
    Camera,
    Settings
} from 'lucide-react';
import UseAuth from '../../Hooks/UseAuth';
import UseUserManagement from '../../Hooks/UseUserManagement';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MyProfile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [biodataInfo, setBiodataInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    const { user } = UseAuth();
    const { getUserInfo } = UseUserManagement();
    const axiosSecure = UseAxiosSecure();
    const { t } = useTranslation();

    useEffect(() => {
        if (user?.email) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            // Get user info
            const userResult = await getUserInfo(user.email);
            if (userResult.success) {
                setUserInfo(userResult.user);
            }

            // Get biodata info
            try {
                const biodataResponse = await axiosSecure.get(`/biodata/${user.email}`);
                if (biodataResponse.data.success) {
                    setBiodataInfo(biodataResponse.data.biodata);
                }
            } catch (biodataError) {
                console.log('Biodata not found:', biodataError.message);
            }

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">{t('profile.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8 lg:py-16">
            <div className="max-w-6xl mx-auto p-6">
                {/* Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 mb-8 border border-primary/20"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/30">
                                {user?.photoURL ? (
                                    <img 
                                        src={user.photoURL} 
                                        alt="Profile" 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User size={48} className="text-primary" />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-all">
                                <Camera size={16} />
                            </button>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-neutral mb-2">
                                {user?.displayName || t('profile.name')}
                            </h1>
                            <p className="text-neutral/70 mb-4 flex items-center justify-center md:justify-start gap-2">
                                <Mail size={16} />
                                {user?.email}
                            </p>
                            
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                {userInfo?.isEmailVerified ? (
                                    <span className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        <CheckCircle size={14} />
                                        {t('profile.verified')}
                                    </span>
                                ) : (
                                    <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Clock size={14} />
                                        {t('profile.verificationPending')}
                                    </span>
                                )}
                                
                                {userInfo?.role === 'admin' && (
                                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Shield size={14} />
                                        {t('profile.admin')}
                                    </span>
                                )}
                                
                                {biodataInfo?.status === 'approved' && (
                                    <span className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        <CheckCircle size={14} />
                                        {t('profile.profileApproved')}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <Link 
                                to="/dashboard/biodata-form" 
                                className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                            >
                                <Edit3 size={16} />
                                {t('profile.editProfile')}
                            </Link>
                            <Link 
                                to="/dashboard/account-settings" 
                                className="bg-base-200 text-neutral px-6 py-3 rounded-2xl font-semibold hover:bg-base-300 transition-all flex items-center gap-2"
                            >
                                <Settings size={16} />
                                {t('profile.settings')}
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                            activeTab === 'overview' 
                                ? 'bg-primary text-white' 
                                : 'bg-base-200 text-neutral hover:bg-base-300'
                        }`}
                    >
                        {t('profile.overview')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('biodata')}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                            activeTab === 'biodata' 
                                ? 'bg-primary text-white' 
                                : 'bg-base-200 text-neutral hover:bg-base-300'
                        }`}
                    >
                        {t('profile.biodata')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('preview')}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                            activeTab === 'preview' 
                                ? 'bg-primary text-white' 
                                : 'bg-base-200 text-neutral hover:bg-base-300'
                        }`}
                    >
                        {t('profile.publicPreview')}
                    </button>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Account Information */}
                            <div className="lg:col-span-2 bg-base-200 p-6 rounded-3xl">
                                <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    {t('profile.accountInfo')}
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-primary" />
                                            <span className="font-medium">{t('profile.email')}</span>
                                        </div>
                                        <span className="text-neutral/70">{user?.email}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            <span className="font-medium">{t('profile.joinDate')}</span>
                                        </div>
                                        <span className="text-neutral/70">
                                            {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-primary" />
                                            <span className="font-medium">{t('profile.accountType')}</span>
                                        </div>
                                        <span className="text-neutral/70 capitalize">{userInfo?.role || 'user'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-base-200 p-6 rounded-3xl">
                                <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    {t('profile.quickStats')}
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="text-center p-4 bg-base-100 rounded-2xl">
                                        <div className="text-2xl font-bold text-primary mb-1">
                                            {biodataInfo ? '1' : '0'}
                                        </div>
                                        <div className="text-sm text-neutral/70">{t('profile.biodataCount')}</div>
                                    </div>
                                    
                                    <div className="text-center p-4 bg-base-100 rounded-2xl">
                                        <div className="text-2xl font-bold text-success mb-1">0</div>
                                        <div className="text-sm text-neutral/70">{t('profile.matches')}</div>
                                    </div>
                                    
                                    <div className="text-center p-4 bg-base-100 rounded-2xl">
                                        <div className="text-2xl font-bold text-warning mb-1">0</div>
                                        <div className="text-sm text-neutral/70">{t('profile.requests')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'biodata' && (
                        <div className="bg-base-200 p-6 rounded-3xl">
                            {biodataInfo ? (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-neutral flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" />
                                            {t('profile.myBiodata')}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            {biodataInfo.status === 'approved' ? (
                                                <span className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <CheckCircle size={14} />
                                                    {t('profile.approved')}
                                                </span>
                                            ) : biodataInfo.status === 'pending' ? (
                                                <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {t('profile.pending')}
                                                </span>
                                            ) : (
                                                <span className="bg-error/20 text-error px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <AlertTriangle size={14} />
                                                    {t('profile.rejected')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-base-100 rounded-2xl">
                                                <h3 className="font-semibold text-neutral mb-2">{t('profile.personalInfo')}</h3>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-medium">{t('profile.name') + ':'}</span> {biodataInfo.name}</p>
                                                    <p><span className="font-medium">{t('profile.age') + ':'}</span> {biodataInfo.age} {t('profile.years')}</p>
                                                    <p><span className="font-medium">{t('profile.gender') + ':'}</span> {biodataInfo.gender === 'male' ? t('profile.male') : t('profile.female')}</p>
                                                    <p><span className="font-medium">{t('profile.religion') + ':'}</span> {biodataInfo.religion}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 bg-base-100 rounded-2xl">
                                                <h3 className="font-semibold text-neutral mb-2">{t('profile.contact')}</h3>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-medium">{t('profile.mobile') + ':'}</span> {biodataInfo.mobile || biodataInfo.mobileNumber || t('profile.noInfo')}</p>
                                                    <p><span className="font-medium">{t('profile.email') + ':'}</span> {biodataInfo.contactEmail}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="p-4 bg-base-100 rounded-2xl">
                                                <h3 className="font-semibold text-neutral mb-2">{t('profile.educationCareer')}</h3>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-medium">{t('profile.education') + ':'}</span> {biodataInfo.education}</p>
                                                    <p><span className="font-medium">{t('profile.occupation') + ':'}</span> {biodataInfo.occupation}</p>
                                                    <p><span className="font-medium">{t('profile.department') + ':'}</span> {biodataInfo.department}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 bg-base-100 rounded-2xl">
                                                <h3 className="font-semibold text-neutral mb-2">{t('profile.address')}</h3>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-medium">{t('profile.presentAddress') + ':'}</span> {biodataInfo.presentAddress}</p>
                                                    <p><span className="font-medium">{t('profile.permanentAddress') + ':'}</span> {biodataInfo.permanentAddress}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <User size={64} className="text-neutral/30 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-neutral mb-2">{t('profile.noBiodata')}</h3>
                                    <p className="text-neutral/70 mb-6">{t('profile.noBiodataDesc')}</p>
                                    <Link 
                                        to="/dashboard/biodata-form" 
                                        className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                                    >
                                        <Edit3 size={16} />
                                        {t('profile.createBiodata')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'preview' && (
                        <div className="bg-base-200 p-6 rounded-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-neutral flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-primary" />
                                    {t('profile.publicPreview')}
                                </h2>
                                <p className="text-sm text-neutral/70">{t('profile.previewDesc')}</p>
                            </div>
                            
                            {biodataInfo && biodataInfo.status === 'approved' ? (
                                <div className="bg-base-100 p-6 rounded-2xl border-2 border-dashed border-primary/30">
                                    <div className="text-center mb-6">
                                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <User size={32} className="text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-neutral mb-2">{biodataInfo.name}</h3>
                                        <p className="text-neutral/70">{biodataInfo.age} {t('profile.years')} • {biodataInfo.occupation}</p>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><span className="font-medium">{t('profile.education') + ':'}</span> {biodataInfo.education}</p>
                                            <p><span className="font-medium">{t('profile.department') + ':'}</span> {biodataInfo.department}</p>
                                            <p><span className="font-medium">{t('profile.religion') + ':'}</span> {biodataInfo.religion}</p>
                                        </div>
                                        <div>
                                            <p><span className="font-medium">{t('profile.presentAddress') + ':'}</span> {biodataInfo.presentAddress}</p>
                                            <p><span className="font-medium">{t('profile.permanentAddress') + ':'}</span> {biodataInfo.permanentAddress}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-2xl">
                                        <p className="text-info text-sm">
                                            📞 {t('profile.contactInfoNote')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <AlertTriangle size={64} className="text-neutral/30 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-neutral mb-2">{t('profile.previewNotAvailable')}</h3>
                                    <p className="text-neutral/70 mb-6">
                                        {!biodataInfo 
                                            ? t('profile.previewNoBiodata')
                                            : t('profile.previewPending')
                                        }
                                    </p>
                                    {!biodataInfo && (
                                        <Link 
                                            to="/dashboard/biodata-form" 
                                            className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                                        >
                                            <Edit3 size={16} />
                                            {t('profile.createBiodata')}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default MyProfile;