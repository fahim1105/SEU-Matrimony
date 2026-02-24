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
import Loader from '../../Components/Loader/Loader';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from '../../Context/UserProfileContext';

const MyProfile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [biodataInfo, setBiodataInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const { user, reloadUser, updateUserProfile } = UseAuth();
    const { getUserInfo } = UseUserManagement();
    const axiosSecure = UseAxiosSecure();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { updateProfilePhoto } = useUserProfile();

    useEffect(() => {
        if (user?.email) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            console.log('🔄 Fetching profile data for:', user?.email);
            
            // Get user info
            const userResult = await getUserInfo(user.email);
            if (userResult.success) {
                console.log('✅ User info fetched:', {
                    email: userResult.user.email,
                    photoURL: userResult.user.photoURL?.substring(0, 50) + '...'
                });
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

    const compressImage = (file, maxWidth = 800, quality = 0.8) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error(t('profile.invalidFileType') || 'Please select an image file');
            return;
        }

        // Validate file size (max 10MB before compression)
        if (file.size > 10 * 1024 * 1024) {
            toast.error(t('profile.fileTooLarge') || 'File size must be less than 10MB');
            return;
        }

        // Compress image
        const compressedImage = await compressImage(file, 800, 0.8);
        
        // Check compressed size
        const compressedSizeInMB = (compressedImage.length * 3) / 4 / 1024 / 1024;
        console.log('📷 Compressed image size:', compressedSizeInMB.toFixed(2), 'MB');

        setImagePreview(compressedImage);
        setSelectedImage(compressedImage);
        setShowConfirmModal(true);
    };

    const confirmPhotoUpload = async () => {
        if (!selectedImage) return;

        setUploadingPhoto(true);
        const toastId = toast.loading(t('profile.uploadingPhoto') || 'Uploading photo...');

        try {
            console.log('📤 Starting photo upload for:', user.email);
            console.log('📷 Image size:', selectedImage.length, 'characters');
            
            // Update profile photo in backend
            const response = await axiosSecure.post('/upload-profile-photo', {
                email: user.email,
                photoURL: selectedImage
            });

            console.log('📥 Upload response:', response.data);

            if (response.data.success) {
                toast.success(t('profile.photoUpdated') || 'Profile photo updated successfully!', { id: toastId });
                
                console.log('✅ Backend updated successfully');
                console.log('📊 Updated locations:', response.data.updatedLocations);
                
                // 1. Update UserProfileContext immediately (this updates all components)
                console.log('📸 Step 1: Updating UserProfileContext with new photo');
                updateProfilePhoto(selectedImage);
                
                // 2. Update local state
                console.log('📸 Step 2: Updating local state');
                setUserInfo(prev => ({
                    ...prev,
                    photoURL: selectedImage
                }));
                
                setShowConfirmModal(false);
                setSelectedImage(null);
                setImagePreview(null);
                
                // 3. Invalidate all React Query caches
                console.log('🔄 Step 3: Invalidating React Query caches');
                queryClient.invalidateQueries({ queryKey: ['matches'] });
                queryClient.invalidateQueries({ queryKey: ['friends'] });
                queryClient.invalidateQueries({ queryKey: ['users'] });
                queryClient.invalidateQueries({ queryKey: ['requests'] });
                
                // 4. Update Firebase user profile (optional, for persistence)
                try {
                    console.log('🔄 Step 4: Updating Firebase user profile (optional)...');
                    await updateUserProfile({ photoURL: selectedImage });
                    console.log('✅ Firebase user profile updated');
                    
                    // Reload user to refresh the context
                    if (reloadUser) {
                        console.log('🔄 Reloading user context...');
                        await reloadUser();
                        console.log('✅ User context reloaded');
                    }
                } catch (firebaseError) {
                    console.error('⚠️ Firebase update error (non-critical):', firebaseError);
                    // Continue even if Firebase update fails - backend is source of truth
                }
                
                // 5. Refetch profile data
                console.log('🔄 Step 5: Refetching profile data...');
                await fetchProfileData();
                
                console.log('✅ All steps completed - photo should be updated everywhere');
                setUploadingPhoto(false);
            } else {
                console.error('❌ Upload failed:', response.data.message);
                toast.error(response.data.message || t('profile.photoUpdateFailed') || 'Failed to update photo', { id: toastId });
                setUploadingPhoto(false);
            }
        } catch (error) {
            console.error('❌ Photo upload error:', error);
            console.error('Error details:', error.response?.data);
            
            let errorMessage = t('profile.photoUploadError') || 'Error uploading photo';
            
            // Handle specific error codes
            if (error.response?.status === 413) {
                errorMessage = error.response?.data?.message || t('profile.photoTooLargeServer') || 'Photo size too large. Please use a smaller image.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            toast.error(errorMessage, { id: toastId });
            setUploadingPhoto(false);
        }
    };

    const cancelPhotoUpload = () => {
        setShowConfirmModal(false);
        setSelectedImage(null);
        setImagePreview(null);
    };

    const triggerFileInput = () => {
        const input = document.getElementById('profile-photo-input');
        if (input) {
            input.value = ''; // Reset input to allow selecting the same file again
            input.click();
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-base-100 py-25">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 border border-primary/20"
                >
                    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative flex-shrink-0">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                id="profile-photo-input"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                onClick={(e) => e.stopPropagation()}
                                className="hidden"
                            />
                            
                            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/30 overflow-hidden">
                                {(userInfo?.photoURL || user?.photoURL) ? (
                                    <img 
                                        src={userInfo?.photoURL || user?.photoURL} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={40} className="text-primary sm:w-12 sm:h-12" />
                                )}
                            </div>
                            
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    triggerFileInput();
                                }}
                                disabled={uploadingPhoto}
                                className={`absolute bottom-0 right-0 bg-primary text-white p-1.5 sm:p-2 rounded-full hover:bg-primary/90 transition-all ${
                                    uploadingPhoto ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                                }`}
                                title={t('profile.changePhoto') || 'Change photo'}
                            >
                                {uploadingPhoto ? (
                                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Camera size={14} className="sm:w-4 sm:h-4" />
                                )}
                            </button>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left w-full md:w-auto">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral mb-1 sm:mb-2 truncate">
                                {user?.displayName || t('profile.name')}
                            </h1>
                            <p className="text-sm sm:text-base text-neutral/70 mb-3 sm:mb-4 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                                <Mail size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate max-w-full">{user?.email}</span>
                            </p>
                            
                            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                                {userInfo?.isEmailVerified ? (
                                    <span className="bg-success/20 text-success px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                                        <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                        {t('profile.verified')}
                                    </span>
                                ) : (
                                    <span className="bg-warning/20 text-warning px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                                        {t('profile.verificationPending')}
                                    </span>
                                )}
                                
                                {userInfo?.role === 'admin' && (
                                    <span className="bg-primary/20 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                                        <Shield size={12} className="sm:w-3.5 sm:h-3.5" />
                                        {t('profile.admin')}
                                    </span>
                                )}
                                
                                {biodataInfo?.status === 'approved' && (
                                    <span className="bg-success/20 text-success px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                                        <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                        {t('profile.profileApproved')}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                            <Link 
                                to="/dashboard/biodata-form" 
                                className="bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <Edit3 size={14} className="sm:w-4 sm:h-4" />
                                <span className="whitespace-nowrap">{t('profile.editProfile')}</span>
                            </Link>
                            <Link 
                                to="/dashboard/account-settings" 
                                className="bg-base-200 text-neutral px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-base-300 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <Settings size={14} className="sm:w-4 sm:h-4" />
                                <span className="whitespace-nowrap">{t('profile.settings')}</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 lg:mb-8">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${
                            activeTab === 'overview' 
                                ? 'bg-primary text-white' 
                                : 'bg-base-200 text-neutral hover:bg-base-300'
                        }`}
                    >
                        {t('profile.overview')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('biodata')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${
                            activeTab === 'biodata' 
                                ? 'bg-primary text-white' 
                                : 'bg-base-200 text-neutral hover:bg-base-300'
                        }`}
                    >
                        {t('profile.biodata')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('preview')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${
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
                        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Account Information */}
                            <div className="lg:col-span-2 bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                                <h2 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6 flex items-center gap-2">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                    <span className="truncate">{t('profile.accountInfo')}</span>
                                </h2>
                                
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl gap-2">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                            <span className="font-medium text-sm sm:text-base">{t('profile.email')}</span>
                                        </div>
                                        <span className="text-neutral/70 text-sm sm:text-base truncate pl-6 sm:pl-0">{user?.email}</span>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl gap-2">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                            <span className="font-medium text-sm sm:text-base">{t('profile.joinDate')}</span>
                                        </div>
                                        <span className="text-neutral/70 text-sm sm:text-base pl-6 sm:pl-0">
                                            {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl gap-2">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                            <span className="font-medium text-sm sm:text-base">{t('profile.accountType')}</span>
                                        </div>
                                        <span className="text-neutral/70 text-sm sm:text-base capitalize pl-6 sm:pl-0">{userInfo?.role || 'user'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                                <h2 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6 flex items-center gap-2">
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                    <span className="truncate">{t('profile.quickStats')}</span>
                                </h2>
                                
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="text-center p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                        <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                                            {biodataInfo ? '1' : '0'}
                                        </div>
                                        <div className="text-xs sm:text-sm text-neutral/70">{t('profile.biodataCount')}</div>
                                    </div>
                                    
                                    <div className="text-center p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                        <div className="text-xl sm:text-2xl font-bold text-success mb-1">0</div>
                                        <div className="text-xs sm:text-sm text-neutral/70">{t('profile.matches')}</div>
                                    </div>
                                    
                                    <div className="text-center p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                        <div className="text-xl sm:text-2xl font-bold text-warning mb-1">0</div>
                                        <div className="text-xs sm:text-sm text-neutral/70">{t('profile.requests')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'biodata' && (
                        <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                            {biodataInfo ? (
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                                        <h2 className="text-lg sm:text-xl font-bold text-neutral flex items-center gap-2">
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                            <span className="truncate">{t('profile.myBiodata')}</span>
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            {biodataInfo.status === 'approved' ? (
                                                <span className="bg-success/20 text-success px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                                                    <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                                    {t('profile.approved')}
                                                </span>
                                            ) : biodataInfo.status === 'pending' ? (
                                                <span className="bg-warning/20 text-warning px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                                                    <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                                                    {t('profile.pending')}
                                                </span>
                                            ) : (
                                                <span className="bg-error/20 text-error px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                                                    <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5" />
                                                    {t('profile.rejected')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Personal Information */}
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                                <h3 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profile.personalInfo')}</h3>
                                                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                                    <p className="break-words"><span className="font-medium">{t('profile.name') + ':'}</span> {biodataInfo.name}</p>
                                                    {biodataInfo.dateOfBirth && (
                                                        <p><span className="font-medium">{t('profileDetails.dateOfBirth') + ':'}</span> {new Date(biodataInfo.dateOfBirth).toLocaleDateString()}</p>
                                                    )}
                                                    <p><span className="font-medium">{t('profile.age') + ':'}</span> {biodataInfo.age} {t('profile.years')}</p>
                                                    <p><span className="font-medium">{t('profile.gender') + ':'}</span> {biodataInfo.gender === 'Male' ? t('profile.male') : t('profile.female')}</p>
                                                    {biodataInfo.height && (
                                                        <p className="break-words"><span className="font-medium">{t('profileDetails.height') + ':'}</span> {biodataInfo.height}</p>
                                                    )}
                                                    {biodataInfo.religion && (
                                                        <p className="break-words"><span className="font-medium">{t('profileDetails.religion') + ':'}</span> {biodataInfo.religion}</p>
                                                    )}
                                                    {biodataInfo.bloodGroup && (
                                                        <p><span className="font-medium">{t('profile.bloodGroup') + ':'}</span> {biodataInfo.bloodGroup}</p>
                                                    )}
                                                    {biodataInfo.district && (
                                                        <p className="break-words"><span className="font-medium">{t('profile.district') + ':'}</span> {biodataInfo.district}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Educational Information */}
                                            <div className="p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                                <h3 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profileDetails.educationalInfo')}</h3>
                                                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                                    {biodataInfo.department && (
                                                        <p className="break-words"><span className="font-medium">{t('profile.department') + ':'}</span> {biodataInfo.department}</p>
                                                    )}
                                                    {biodataInfo.batch && (
                                                        <p className="break-words"><span className="font-medium">{t('profileDetails.batch') + ':'}</span> {biodataInfo.batch}</p>
                                                    )}
                                                    {biodataInfo.semester && (
                                                        <p className="break-words"><span className="font-medium">{t('profileDetails.semester') + ':'}</span> {biodataInfo.semester}</p>
                                                    )}
                                                    {biodataInfo.currentOccupation && (
                                                        <p className="break-words"><span className="font-medium">{t('profileDetails.currentOccupation') + ':'}</span> {biodataInfo.currentOccupation}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                                <h3 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profile.contact')}</h3>
                                                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                                    <p className="break-words"><span className="font-medium">{t('profile.mobile') + ':'}</span> {biodataInfo.mobile || biodataInfo.mobileNumber || t('profile.noInfo')}</p>
                                                    <p className="break-all"><span className="font-medium">{t('profile.email') + ':'}</span> {biodataInfo.contactEmail}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Family Information */}
                                        <div className="space-y-3 sm:space-y-4">
                                            {(biodataInfo.fatherOccupation || biodataInfo.motherOccupation || biodataInfo.numberOfSiblings || biodataInfo.siblingPosition || biodataInfo.familyFinancialStatus) && (
                                                <div className="p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                                    <h3 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profileDetails.familyInformation')}</h3>
                                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                                        {biodataInfo.fatherOccupation && (
                                                            <p className="break-words"><span className="font-medium">{t('profileDetails.fatherOccupation') + ':'}</span> {biodataInfo.fatherOccupation}</p>
                                                        )}
                                                        {biodataInfo.motherOccupation && (
                                                            <p className="break-words"><span className="font-medium">{t('profileDetails.motherOccupation') + ':'}</span> {biodataInfo.motherOccupation}</p>
                                                        )}
                                                        {biodataInfo.numberOfSiblings && (
                                                            <p><span className="font-medium">{t('profileDetails.numberOfSiblings') + ':'}</span> {biodataInfo.numberOfSiblings}</p>
                                                        )}
                                                        {biodataInfo.siblingPosition && (
                                                            <p><span className="font-medium">{t('profileDetails.siblingPosition') + ':'}</span> {biodataInfo.siblingPosition}</p>
                                                        )}
                                                        {biodataInfo.familyFinancialStatus && (
                                                            <p className="break-words"><span className="font-medium">{t('profileDetails.familyFinancialStatus') + ':'}</span> {biodataInfo.familyFinancialStatus}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Address Information */}
                                            {(biodataInfo.presentAddress || biodataInfo.permanentAddress) && (
                                                <div className="p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                                    <h3 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profile.address')}</h3>
                                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                                        {biodataInfo.presentAddress && (
                                                            <p className="break-words"><span className="font-medium">{t('profile.presentAddress') + ':'}</span> {biodataInfo.presentAddress}</p>
                                                        )}
                                                        {biodataInfo.permanentAddress && (
                                                            <p className="break-words"><span className="font-medium">{t('profile.permanentAddress') + ':'}</span> {biodataInfo.permanentAddress}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Partner Preference */}
                                            {(biodataInfo.partnerAgeMin || biodataInfo.partnerAgeMax || biodataInfo.partnerHeight || biodataInfo.partnerOtherRequirements) && (
                                                <div className="p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                                    <h3 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profileDetails.partnerPreference')}</h3>
                                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                                        {(biodataInfo.partnerAgeMin || biodataInfo.partnerAgeMax) && (
                                                            <p><span className="font-medium">{t('profileDetails.partnerAge') + ':'}</span> {biodataInfo.partnerAgeMin || '?'} - {biodataInfo.partnerAgeMax || '?'} {t('profile.years')}</p>
                                                        )}
                                                        {biodataInfo.partnerHeight && (
                                                            <p className="break-words"><span className="font-medium">{t('profileDetails.partnerHeight') + ':'}</span> {biodataInfo.partnerHeight}</p>
                                                        )}
                                                        {biodataInfo.partnerOtherRequirements && (
                                                            <p className="break-words"><span className="font-medium">{t('profileDetails.otherRequirements') + ':'}</span> {biodataInfo.partnerOtherRequirements}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* About Me */}
                                            {biodataInfo.aboutMe && (
                                                <div className="p-3 sm:p-4 bg-base-100 rounded-xl sm:rounded-2xl">
                                                    <h3 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profileDetails.aboutMe')}</h3>
                                                    <p className="text-xs sm:text-sm text-neutral/70 break-words">{biodataInfo.aboutMe}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12 px-4">
                                    <User size={48} className="text-neutral/30 mx-auto mb-3 sm:mb-4 sm:w-16 sm:h-16" />
                                    <h3 className="text-lg sm:text-xl font-semibold text-neutral mb-2">{t('profile.noBiodata')}</h3>
                                    <p className="text-neutral/70 mb-4 sm:mb-6 text-sm sm:text-base">{t('profile.noBiodataDesc')}</p>
                                    <Link 
                                        to="/dashboard/biodata-form" 
                                        className="bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        <Edit3 size={14} className="sm:w-4 sm:h-4" />
                                        {t('profile.createBiodata')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'preview' && (
                        <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                                <h2 className="text-lg sm:text-xl font-bold text-neutral flex items-center gap-2">
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                    <span className="truncate">{t('profile.publicPreview')}</span>
                                </h2>
                                <p className="text-xs sm:text-sm text-neutral/70">{t('profile.previewDesc')}</p>
                            </div>
                            
                            {biodataInfo && biodataInfo.status === 'approved' ? (
                                <div className="bg-base-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-primary/30">
                                    {/* Profile Header */}
                                    <div className="text-center mb-4 sm:mb-6">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 overflow-hidden">
                                            {biodataInfo.profileImage ? (
                                                <img 
                                                    src={biodataInfo.profileImage} 
                                                    alt={biodataInfo.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={28} className="text-primary sm:w-8 sm:h-8" />
                                            )}
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-neutral mb-1 sm:mb-2 break-words px-2">{biodataInfo.name}</h3>
                                        <p className="text-neutral/70 text-sm sm:text-base">
                                            {biodataInfo.age} {t('profile.years')} • {biodataInfo.gender === 'Male' ? t('profile.male') : t('profile.female')}
                                        </p>
                                    </div>
                                    
                                    {/* Profile Details Grid */}
                                    <div className="grid md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4 sm:mb-6">
                                        {/* Personal Info */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            {biodataInfo.height && (
                                                <p className="break-words"><span className="font-medium">{t('profileDetails.height') + ':'}</span> {biodataInfo.height}</p>
                                            )}
                                            {biodataInfo.religion && (
                                                <p className="break-words"><span className="font-medium">{t('profileDetails.religion') + ':'}</span> {biodataInfo.religion}</p>
                                            )}
                                            {biodataInfo.bloodGroup && (
                                                <p><span className="font-medium">{t('profile.bloodGroup') + ':'}</span> {biodataInfo.bloodGroup}</p>
                                            )}
                                            {biodataInfo.district && (
                                                <p className="break-words"><span className="font-medium">{t('profile.district') + ':'}</span> {biodataInfo.district}</p>
                                            )}
                                        </div>
                                        
                                        {/* Education & Career */}
                                        <div className="space-y-1.5 sm:space-y-2">
                                            {biodataInfo.department && (
                                                <p className="break-words"><span className="font-medium">{t('profile.department') + ':'}</span> {biodataInfo.department}</p>
                                            )}
                                            {biodataInfo.batch && (
                                                <p className="break-words"><span className="font-medium">{t('profileDetails.batch') + ':'}</span> {biodataInfo.batch}</p>
                                            )}
                                            {biodataInfo.semester && (
                                                <p className="break-words"><span className="font-medium">{t('profileDetails.semester') + ':'}</span> {biodataInfo.semester}</p>
                                            )}
                                            {biodataInfo.currentOccupation && (
                                                <p className="break-words"><span className="font-medium">{t('profileDetails.currentOccupation') + ':'}</span> {biodataInfo.currentOccupation}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* About Me Section */}
                                    {biodataInfo.aboutMe && (
                                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-base-200 rounded-xl">
                                            <h4 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profileDetails.aboutMe')}</h4>
                                            <p className="text-neutral/70 text-xs sm:text-sm break-words">{biodataInfo.aboutMe}</p>
                                        </div>
                                    )}

                                    {/* Partner Preference */}
                                    {(biodataInfo.partnerAgeMin || biodataInfo.partnerAgeMax || biodataInfo.partnerHeight || biodataInfo.partnerOtherRequirements) && (
                                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-base-200 rounded-xl">
                                            <h4 className="font-semibold text-neutral mb-2 text-sm sm:text-base">{t('profileDetails.partnerPreference')}</h4>
                                            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                                {(biodataInfo.partnerAgeMin || biodataInfo.partnerAgeMax) && (
                                                    <p><span className="font-medium">{t('profileDetails.partnerAge') + ':'}</span> {biodataInfo.partnerAgeMin || '?'} - {biodataInfo.partnerAgeMax || '?'} {t('profile.years')}</p>
                                                )}
                                                {biodataInfo.partnerHeight && (
                                                    <p className="break-words"><span className="font-medium">{t('profileDetails.partnerHeight') + ':'}</span> {biodataInfo.partnerHeight}</p>
                                                )}
                                                {biodataInfo.partnerOtherRequirements && (
                                                    <p className="break-words"><span className="font-medium">{t('profileDetails.otherRequirements') + ':'}</span> {biodataInfo.partnerOtherRequirements}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Contact Info Note */}
                                    <div className="p-3 sm:p-4 bg-info/10 border border-info/20 rounded-xl sm:rounded-2xl">
                                        <p className="text-info text-xs sm:text-sm flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                            {t('profile.contactInfoNote')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12 px-4">
                                    <AlertTriangle size={48} className="text-neutral/30 mx-auto mb-3 sm:mb-4 sm:w-16 sm:h-16" />
                                    <h3 className="text-lg sm:text-xl font-semibold text-neutral mb-2">{t('profile.previewNotAvailable')}</h3>
                                    <p className="text-neutral/70 mb-4 sm:mb-6 text-sm sm:text-base">
                                        {!biodataInfo 
                                            ? t('profile.previewNoBiodata')
                                            : t('profile.previewPending')
                                        }
                                    </p>
                                    {!biodataInfo && (
                                        <Link 
                                            to="/dashboard/biodata-form" 
                                            className="bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2 text-sm sm:text-base"
                                        >
                                            <Edit3 size={14} className="sm:w-4 sm:h-4" />
                                            {t('profile.createBiodata')}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Photo Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-base-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-md w-full shadow-2xl"
                    >
                        <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 text-center">
                            {t('profile.confirmPhotoChange') || 'Confirm Photo Change'}
                        </h3>
                        
                        {/* Image Preview */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary/30 bg-primary/20">
                                {imagePreview && (
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        <p className="text-neutral/70 text-center mb-6 text-sm sm:text-base">
                            {t('profile.confirmPhotoText') || 'Do you want to update your profile photo with this image?'}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={cancelPhotoUpload}
                                disabled={uploadingPhoto}
                                className="flex-1 bg-base-300 text-neutral px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-base-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {t('profile.cancel') || 'Cancel'}
                            </button>
                            <button
                                onClick={confirmPhotoUpload}
                                disabled={uploadingPhoto}
                                className="flex-1 bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                {uploadingPhoto ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{t('profile.uploading') || 'Uploading...'}</span>
                                    </>
                                ) : (
                                    <span>{t('profile.confirm') || 'Confirm'}</span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;