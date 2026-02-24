import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User, Heart, Phone, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UseAuth from '../../Hooks/UseAuth';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseUserManagement from '../../Hooks/UseUserManagement';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../Context/UserProfileContext';

const BiodataForm = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [existingBiodata, setExistingBiodata] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const { user } = UseAuth();
    const { profileData, loading: profileLoading } = useUserProfile();
    const { getUserInfo } = UseUserManagement();
    const axiosSecure = UseAxiosSecure();
    
    // Use profile photo from context (database), fallback to placeholder
    const displayPhoto = profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=random`;
    
    console.log('🖼️ BiodataForm - Photo source:', {
        hasContextPhoto: !!profileData.photoURL,
        contextPhotoPreview: profileData.photoURL?.substring(0, 50) + '...',
        usingPlaceholder: !profileData.photoURL,
        profileLoading
    });
    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
        defaultValues: {
            name: '',
            dateOfBirth: '',
            age: '',
            gender: '',
            height: '',
            bloodGroup: '',
            religion: '',
            presentAddress: '',
            permanentAddress: '',
            district: '',
            department: '',
            batch: '',
            semester: '',
            currentOccupation: '',
            mobile: '',
            fatherOccupation: '',
            motherOccupation: '',
            numberOfSiblings: '',
            siblingPosition: '',
            familyFinancialStatus: '',
            partnerAgeMin: '',
            partnerAgeMax: '',
            partnerHeight: '',
            partnerOtherRequirements: '',
            aboutMe: ''
        }
    });

    useEffect(() => {
        if (user?.email) {
            checkUserStatusAndFetchBiodata();
        }
    }, [user]);

    // Set form values when existing biodata is loaded
    useEffect(() => {
        if (existingBiodata && dataLoaded) {
            console.log('Setting individual form values from existing biodata');
            setValue('name', existingBiodata.name || '');
            setValue('dateOfBirth', existingBiodata.dateOfBirth || '');
            setValue('age', existingBiodata.age || '');
            setValue('gender', existingBiodata.gender || '');
            setValue('height', existingBiodata.height || '');
            setValue('bloodGroup', existingBiodata.bloodGroup || '');
            setValue('religion', existingBiodata.religion || '');
            setValue('presentAddress', existingBiodata.presentAddress || '');
            setValue('permanentAddress', existingBiodata.permanentAddress || '');
            setValue('district', existingBiodata.district || '');
            setValue('department', existingBiodata.department || '');
            setValue('batch', existingBiodata.batch || '');
            setValue('semester', existingBiodata.semester || '');
            setValue('currentOccupation', existingBiodata.currentOccupation || '');
            setValue('mobile', existingBiodata.mobile || '');
            setValue('fatherOccupation', existingBiodata.fatherOccupation || '');
            setValue('motherOccupation', existingBiodata.motherOccupation || '');
            setValue('numberOfSiblings', existingBiodata.numberOfSiblings || '');
            setValue('siblingPosition', existingBiodata.siblingPosition || '');
            setValue('familyFinancialStatus', existingBiodata.familyFinancialStatus || '');
            setValue('partnerAgeMin', existingBiodata.partnerAgeMin || '');
            setValue('partnerAgeMax', existingBiodata.partnerAgeMax || '');
            setValue('partnerHeight', existingBiodata.partnerHeight || '');
            setValue('partnerOtherRequirements', existingBiodata.partnerOtherRequirements || '');
            setValue('aboutMe', existingBiodata.aboutMe || '');
        }
    }, [existingBiodata, dataLoaded, setValue]);

    // Set default name when user is loaded (only if no existing data)
    useEffect(() => {
        if (user?.displayName && !existingBiodata && dataLoaded) {
            setValue('name', user.displayName);
        }
    }, [user, existingBiodata, dataLoaded, setValue]);

    // Watch date of birth to calculate age automatically
    const dateOfBirth = watch('dateOfBirth');
    useEffect(() => {
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            // Adjust age if birthday hasn't occurred this year
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // Only set age if it's a valid number and within reasonable range
            if (age >= 18 && age <= 100) {
                setValue('age', age);
            }
        }
    }, [dateOfBirth, setValue]);

    // Debug: Watch form values
    const formValues = watch();
    useEffect(() => {
        if (dataLoaded) {
            console.log('Current form values:', formValues);
            console.log('Form is dirty:', Object.keys(formValues).some(key => formValues[key] !== ''));
        }
    }, [formValues, dataLoaded]);

    const checkUserStatusAndFetchBiodata = async () => {
        try {
            console.log('Checking user status for:', user.email);
            
            // Check user verification status
            const userResult = await getUserInfo(user.email);
            
            if (!userResult.success) {
                toast.error(t('messages.error.userInfoNotFound', 'ইউজার তথ্য পাওয়া যায়নি'));
                return;
            }

            const userInfo = userResult.user;
            console.log('User info:', userInfo);

            if (!userInfo.isEmailVerified) {
                toast.error(t('messages.error.emailVerificationRequired', 'প্রথমে ইমেইল ভেরিফাই করুন'));
                return;
            }

            if (!userInfo.isActive) {
                toast.error(t('messages.error.accountInactive', 'আপনার একাউন্ট নিষ্ক্রিয় রয়েছে'));
                return;
            }

            // Try to fetch existing biodata
            await fetchExistingBiodata();
        } catch (error) {
            console.error('Error checking user status:', error);
            setDataLoaded(true); // Set loaded even on error so form shows
        }
    };

    const fetchExistingBiodata = async () => {
        try {
            console.log('Fetching existing biodata for:', user.email);
            const response = await axiosSecure.get(`/biodata/${user.email}`);
            console.log('Biodata response:', response.data);
            
            if (response.data.success && response.data.biodata) {
                const biodata = response.data.biodata;
                setExistingBiodata(biodata);
                
                console.log('Resetting form with biodata:', biodata);
                
                // Reset form with existing data - ensure all fields are populated
                const formData = {
                    name: biodata.name || '',
                    dateOfBirth: biodata.dateOfBirth || '',
                    age: biodata.age || '',
                    gender: biodata.gender || '',
                    height: biodata.height || '',
                    bloodGroup: biodata.bloodGroup || '',
                    religion: biodata.religion || '',
                    presentAddress: biodata.presentAddress || '',
                    permanentAddress: biodata.permanentAddress || '',
                    district: biodata.district || '',
                    department: biodata.department || '',
                    batch: biodata.batch || '',
                    semester: biodata.semester || '',
                    currentOccupation: biodata.currentOccupation || '',
                    mobile: biodata.mobile || '',
                    fatherOccupation: biodata.fatherOccupation || '',
                    motherOccupation: biodata.motherOccupation || '',
                    numberOfSiblings: biodata.numberOfSiblings || '',
                    siblingPosition: biodata.siblingPosition || '',
                    familyFinancialStatus: biodata.familyFinancialStatus || '',
                    partnerAgeMin: biodata.partnerAgeMin || '',
                    partnerAgeMax: biodata.partnerAgeMax || '',
                    partnerHeight: biodata.partnerHeight || '',
                    partnerOtherRequirements: biodata.partnerOtherRequirements || '',
                    aboutMe: biodata.aboutMe || ''
                };
                
                console.log('Form data to reset:', formData);
                reset(formData);
                setDataLoaded(true);
            } else {
                console.log('No existing biodata, setting default name:', user?.displayName);
                // If no existing biodata, set default name from user account
                if (user?.displayName) {
                    reset({ 
                        name: user.displayName,
                        dateOfBirth: '',
                        age: '',
                        gender: '',
                        height: '',
                        bloodGroup: '',
                        religion: '',
                        presentAddress: '',
                        permanentAddress: '',
                        district: '',
                        department: '',
                        batch: '',
                        semester: '',
                        currentOccupation: '',
                        mobile: '',
                        fatherOccupation: '',
                        motherOccupation: '',
                        numberOfSiblings: '',
                        siblingPosition: '',
                        familyFinancialStatus: '',
                        partnerAgeMin: '',
                        partnerAgeMax: '',
                        partnerHeight: '',
                        partnerOtherRequirements: '',
                        aboutMe: ''
                    });
                }
                setDataLoaded(true);
            }
        } catch (error) {
            // No existing biodata found, set default name from user account
            console.log('No existing biodata found, error:', error.message);
            if (user?.displayName) {
                reset({ 
                    name: user.displayName,
                    dateOfBirth: '',
                    age: '',
                    gender: '',
                    height: '',
                    bloodGroup: '',
                    religion: '',
                    tribe: '',
                    presentAddress: '',
                    permanentAddress: '',
                    district: '',
                    department: '',
                    batch: '',
                    semester: '',
                    currentOccupation: '',
                    mobile: '',
                    fatherOccupation: '',
                    motherOccupation: '',
                    siblings: '',
                    familyFinancialStatus: '',
                    partnerAgeMin: '',
                    partnerAgeMax: '',
                    partnerHeight: '',
                    partnerOtherRequirements: '',
                    aboutMe: ''
                });
            }
            setDataLoaded(true);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading(existingBiodata ? t('biodata.updating') : t('biodata.saving'));

        try {
            // Clean and prepare data - always use user's display name
            const cleanData = {
                name: user?.displayName || '', // Always use account name
                profileImage: displayPhoto, // Use photo from context
                dateOfBirth: data.dateOfBirth?.trim() || '',
                age: parseInt(data.age) || 0,
                gender: data.gender || '',
                height: data.height?.trim() || '',
                bloodGroup: data.bloodGroup || '',
                religion: data.religion?.trim() || '',
                presentAddress: data.presentAddress?.trim() || '',
                permanentAddress: data.permanentAddress?.trim() || '',
                district: data.district?.trim() || '',
                department: data.department?.trim() || '',
                batch: data.batch?.trim() || '',
                semester: data.semester?.trim() || '',
                currentOccupation: data.currentOccupation?.trim() || '',
                mobile: data.mobile?.trim() || '',
                fatherOccupation: data.fatherOccupation?.trim() || '',
                motherOccupation: data.motherOccupation?.trim() || '',
                numberOfSiblings: data.numberOfSiblings || '',
                siblingPosition: data.siblingPosition || '',
                familyFinancialStatus: data.familyFinancialStatus?.trim() || '',
                partnerAgeMin: parseInt(data.partnerAgeMin) || 0,
                partnerAgeMax: parseInt(data.partnerAgeMax) || 0,
                partnerHeight: data.partnerHeight?.trim() || '',
                partnerOtherRequirements: data.partnerOtherRequirements?.trim() || '',
                aboutMe: data.aboutMe?.trim() || '',
                contactEmail: user.email,
                submittedBy: user.displayName
            };

            console.log('Submitting biodata:', cleanData);

            const response = await axiosSecure.put('/biodata', cleanData);
            
            if (response.data.success) {
                toast.success(response.data.message, { id: toastId });
                
                // Update existing biodata state
                setExistingBiodata(prev => ({
                    ...prev,
                    ...cleanData,
                    updatedAt: new Date()
                }));
                
                // Refresh the form data to get the latest from server
                setTimeout(() => {
                    fetchExistingBiodata();
                }, 1000);
            } else {
                toast.error(response.data.message || t('messages.error.biodataSaveError', 'বায়োডাটা সেভ করতে সমস্যা হয়েছে'), { id: toastId });
            }
        } catch (error) {
            console.error('Error saving biodata:', error);
            const message = error.response?.data?.message || t('messages.error.biodataSaveError', 'বায়োডাটা সেভ করতে সমস্যা হয়েছে');
            toast.error(message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 py-8 rounded-3xl">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label={t('biodata.backToDashboard')} />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <User className="w-8 h-8 text-primary" />
                        {t('biodata.title')}
                    </h1>
                    <p className="text-neutral/70 mt-2">{t('biodata.subtitle')}</p>
                    
                    {existingBiodata && (
                        <div className={`mt-4 p-4 rounded-2xl border ${
                            existingBiodata.status === 'approved' 
                                ? 'bg-success/10 border-success/20' 
                                : existingBiodata.status === 'rejected'
                                ? 'bg-error/10 border-error/20'
                                : 'bg-info/10 border-info/20'
                        }`}>
                            <p className={`font-medium ${
                                existingBiodata.status === 'approved' 
                                    ? 'text-success' 
                                    : existingBiodata.status === 'rejected'
                                    ? 'text-error'
                                    : 'text-info'
                            }`}>
                                {existingBiodata.status === 'approved' ? '✅' : existingBiodata.status === 'rejected' ? '❌' : 'ℹ️'} {t('biodata.alreadySubmitted')} <span className="font-bold">
                                    {existingBiodata.status === 'pending' ? t('dashboard.pending') : 
                                     existingBiodata.status === 'approved' ? t('dashboard.approved') : 
                                     existingBiodata.status === 'rejected' ? t('dashboard.rejected') : existingBiodata.status}
                                </span>
                            </p>
                            <p className={`text-sm mt-1 ${
                                existingBiodata.status === 'approved' 
                                    ? 'text-success/70' 
                                    : existingBiodata.status === 'rejected'
                                    ? 'text-error/70'
                                    : 'text-info/70'
                            }`}>
                                {existingBiodata.status === 'approved' 
                                    ? t('biodata.canUpdateApproved')
                                    : existingBiodata.status === 'rejected'
                                    ? t('biodata.canUpdateRejected')
                                    : t('biodata.canUpdatePending')
                                }
                            </p>
                        </div>
                    )}

                    {!dataLoaded && (
                        <div className="mt-4 p-4 bg-base-300 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="loading loading-spinner loading-sm"></div>
                                <p className="text-neutral/70">{t('biodata.loading')}</p>
                            </div>
                        </div>
                    )}
                </div>

                <form key={existingBiodata?._id || 'new'} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {!dataLoaded ? (
                        <div className="text-center py-12">
                            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                            <p className="text-neutral/70">{t('biodata.loading')}</p>
                        </div>
                    ) : (
                        <>
                    {/* Personal Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            {t('biodata.personalInfo')}
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.name')} {t('biodata.fromAccount')}</label>
                                <div className="w-full p-3 border border-base-300 rounded-xl text-neutral/70 flex items-center gap-2">
                                    {displayPhoto && (
                                        <img 
                                            src={displayPhoto} 
                                            alt={user.displayName}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
                                    <span className='text-neutral'>{user?.displayName || 'নাম পাওয়া যায়নি'}</span>
                                </div>
                                <p className="text-xs text-neutral/50 mt-1">
                                    {t('biodata.nameChangeNote')}
                                </p>
                                {/* Hidden input for form submission */}
                                <input
                                    type="hidden"
                                    {...register("name")}
                                    value={user?.displayName || ''}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.age')} *</label>
                                <input
                                    type="number"
                                    {...register("age", { 
                                        required: t('biodata.ageRequired'),
                                        min: { value: 18, message: t('biodata.validAge') },
                                        max: { value: 60, message: t('biodata.validAge') }
                                    })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.agePlaceholder')}
                                    readOnly
                                />
                                {errors.age && <p className="text-error text-sm mt-1">{errors.age.message}</p>}
                                <p className="text-xs text-neutral/50 mt-1">{t('biodata.ageAutoCalculated')}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.gender')} *</label>
                                <select
                                    {...register("gender", { required: t('biodata.genderRequired') })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">{t('biodata.selectGender')}</option>
                                    <option value="Male">{t('biodata.male')}</option>
                                    <option value="Female">{t('biodata.female')}</option>
                                </select>
                                {errors.gender && <p className="text-error text-sm mt-1">{errors.gender.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.bloodGroup')}</label>
                                <select
                                    {...register("bloodGroup")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">{t('biodata.selectBloodGroup')}</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.dateOfBirth')} *</label>
                                <input
                                    type="date"
                                    {...register("dateOfBirth", { required: t('biodata.dateOfBirthRequired') })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                {errors.dateOfBirth && <p className="text-error text-sm mt-1">{errors.dateOfBirth.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.height')} *</label>
                                <input
                                    type="text"
                                    {...register("height", { required: t('biodata.heightRequired') })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.heightPlaceholder')}
                                />
                                {errors.height && <p className="text-error text-sm mt-1">{errors.height.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.religion')} *</label>
                                <select
                                    {...register("religion", { required: t('biodata.religionRequired') })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">{t('biodata.selectReligion')}</option>
                                    <option value="Islam">{t('biodata.islam')}</option>
                                    <option value="Hinduism">{t('biodata.hinduism')}</option>
                                    <option value="Buddhism">{t('biodata.buddhism')}</option>
                                    <option value="Christianity">{t('biodata.christianity')}</option>
                                    <option value="Other">{t('biodata.otherReligion')}</option>
                                </select>
                                {errors.religion && <p className="text-error text-sm mt-1">{errors.religion.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Educational Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {t('biodata.educationInfo')}
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.department')} *</label>
                                <select
                                    {...register("department", { required: t('biodata.departmentRequired') })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">{t('biodata.selectDepartment')}</option>
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
                                {errors.department && <p className="text-error text-sm mt-1">{errors.department.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.batch')}</label>
                                <input
                                    type="text"
                                    {...register("batch")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.batchPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.semester')}</label>
                                <select
                                    {...register("semester")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">{t('biodata.selectSemester')}</option>
                                    <option value="1st">1st Semester</option>
                                    <option value="2nd">2nd Semester</option>
                                    <option value="3rd">3rd Semester</option>
                                    <option value="4th">4th Semester</option>
                                    <option value="5th">5th Semester</option>
                                    <option value="6th">6th Semester</option>
                                    <option value="7th">7th Semester</option>
                                    <option value="8th">8th Semester</option>
                                    <option value="9th">9th Semester</option>
                                    <option value="10th">10th Semester</option>
                                    <option value="11th">11th Semester</option>
                                    <option value="12th">12th Semester</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.currentOccupation')}</label>
                                <input
                                    type="text"
                                    {...register("currentOccupation")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.currentOccupationPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            {t('biodata.contactInfo')}
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.mobile')} *</label>
                                <input
                                    type="tel"
                                    {...register("mobile", { 
                                        required: t('biodata.mobileRequired'),
                                        pattern: {
                                            value: /^01[3-9]\d{8}$/,
                                            message: t('biodata.validMobile')
                                        }
                                    })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.mobilePlaceholder')}
                                />
                                {errors.mobile && <p className="text-error text-sm mt-1">{errors.mobile.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.district')} *</label>
                                <input
                                    type="text"
                                    {...register("district", { required: t('biodata.districtRequired') })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.districtPlaceholder')}
                                />
                                {errors.district && <p className="text-error text-sm mt-1">{errors.district.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.presentAddress')} *</label>
                                <textarea
                                    {...register("presentAddress", { required: "বর্তমান ঠিকানা প্রয়োজন" })}
                                    rows="3"
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder={t('biodata.presentAddressPlaceholder')}
                                />
                                {errors.presentAddress && <p className="text-error text-sm mt-1">{errors.presentAddress.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.permanentAddress')} *</label>
                                <textarea
                                    {...register("permanentAddress", { required: "স্থায়ী ঠিকানা প্রয়োজন" })}
                                    rows="3"
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder={t('biodata.permanentAddressPlaceholder')}
                                />
                                {errors.permanentAddress && <p className="text-error text-sm mt-1">{errors.permanentAddress.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Family Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            {t('biodata.familyInfo')}
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.fatherOccupation')}</label>
                                <input
                                    type="text"
                                    {...register("fatherOccupation")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.fatherOccupationPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.motherOccupation')}</label>
                                <input
                                    type="text"
                                    {...register("motherOccupation")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.motherOccupationPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.numberOfSiblings')}</label>
                                <select
                                    {...register("numberOfSiblings")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">{t('biodata.selectNumber')}</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="5+">5+</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.siblingPosition')}</label>
                                <select
                                    {...register("siblingPosition")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">{t('biodata.selectPosition')}</option>
                                    <option value="1st">1st (First)</option>
                                    <option value="2nd">2nd (Second)</option>
                                    <option value="3rd">3rd (Third)</option>
                                    <option value="4th">4th (Fourth)</option>
                                    <option value="5th">5th (Fifth)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.familyFinancialStatus')}</label>
                                <select
                                    {...register("familyFinancialStatus")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">{t('biodata.selectFinancialStatus')}</option>
                                    <option value="Lower Class">Lower Class</option>
                                    <option value="Lower Middle Class">Lower Middle Class</option>
                                    <option value="Middle Class">Middle Class</option>
                                    <option value="Upper Middle Class">Upper Middle Class</option>
                                    <option value="Upper Class">Upper Class</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Partner Preference */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-primary" />
                            {t('biodata.partnerPreference')}
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.partnerAgeMin')}</label>
                                <input
                                    type="number"
                                    {...register("partnerAgeMin")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.partnerAgeMinPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.partnerAgeMax')}</label>
                                <input
                                    type="number"
                                    {...register("partnerAgeMax")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.partnerAgeMaxPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.partnerHeight')}</label>
                                <input
                                    type="text"
                                    {...register("partnerHeight")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder={t('biodata.partnerHeightPlaceholder')}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral mb-2">{t('biodata.partnerOtherRequirements')}</label>
                                <textarea
                                    {...register("partnerOtherRequirements")}
                                    rows="4"
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder={t('biodata.partnerOtherRequirementsPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Me */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            {t('biodata.aboutMe')}
                        </h2>
                        
                        <div>
                            <textarea
                                {...register("aboutMe")}
                                rows="5"
                                className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                placeholder={t('biodata.aboutMePlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-base-100 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg"
                        >
                            <Save className="w-5 h-5" />
                            {loading 
                                ? (existingBiodata?.status === 'rejected' 
                                    ? t('biodata.resubmitting') 
                                    : (existingBiodata ? t('biodata.updating') : t('biodata.saving')))
                                : (!existingBiodata
                                    ? t('biodata.saveBiodata')
                                    : (existingBiodata.status === 'rejected'
                                        ? t('biodata.resubmitBiodata')
                                        : t('biodata.updateBiodata')))
                            }
                        </button>
                    </div>
                    </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default BiodataForm;