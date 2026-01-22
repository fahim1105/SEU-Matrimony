import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User, Heart, Phone, Calendar } from 'lucide-react';
import UseAuth from '../../Hooks/UseAuth';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import UseUserManagement from '../../Hooks/UseUserManagement';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';

const BiodataForm = () => {
    const [loading, setLoading] = useState(false);
    const [existingBiodata, setExistingBiodata] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const { user } = UseAuth();
    const { getUserInfo } = UseUserManagement();
    const axiosSecure = UseAxiosSecure();
    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
        defaultValues: {
            name: '',
            age: '',
            gender: '',
            bloodGroup: '',
            department: '',
            batch: '',
            semester: '',
            mobile: '',
            presentAddress: '',
            permanentAddress: '',
            district: '',
            aboutMe: '',
            partnerExpectation: ''
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
            setValue('age', existingBiodata.age || '');
            setValue('gender', existingBiodata.gender || '');
            setValue('bloodGroup', existingBiodata.bloodGroup || '');
            setValue('department', existingBiodata.department || '');
            setValue('batch', existingBiodata.batch || '');
            setValue('semester', existingBiodata.semester || '');
            setValue('mobile', existingBiodata.mobile || '');
            setValue('presentAddress', existingBiodata.presentAddress || '');
            setValue('permanentAddress', existingBiodata.permanentAddress || '');
            setValue('district', existingBiodata.district || '');
            setValue('aboutMe', existingBiodata.aboutMe || '');
            setValue('partnerExpectation', existingBiodata.partnerExpectation || '');
        }
    }, [existingBiodata, dataLoaded, setValue]);

    // Set default name when user is loaded (only if no existing data)
    useEffect(() => {
        if (user?.displayName && !existingBiodata && dataLoaded) {
            setValue('name', user.displayName);
        }
    }, [user, existingBiodata, dataLoaded, setValue]);

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
                toast.error('ইউজার তথ্য পাওয়া যায়নি');
                return;
            }

            const userInfo = userResult.user;
            console.log('User info:', userInfo);

            if (!userInfo.isEmailVerified) {
                toast.error('প্রথমে ইমেইল ভেরিফাই করুন');
                return;
            }

            if (!userInfo.isActive) {
                toast.error('আপনার একাউন্ট নিষ্ক্রিয় রয়েছে');
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
                    age: biodata.age || '',
                    gender: biodata.gender || '',
                    bloodGroup: biodata.bloodGroup || '',
                    department: biodata.department || '',
                    batch: biodata.batch || '',
                    semester: biodata.semester || '',
                    mobile: biodata.mobile || '',
                    presentAddress: biodata.presentAddress || '',
                    permanentAddress: biodata.permanentAddress || '',
                    district: biodata.district || '',
                    aboutMe: biodata.aboutMe || '',
                    partnerExpectation: biodata.partnerExpectation || ''
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
                        age: '',
                        gender: '',
                        bloodGroup: '',
                        department: '',
                        batch: '',
                        semester: '',
                        mobile: '',
                        presentAddress: '',
                        permanentAddress: '',
                        district: '',
                        aboutMe: '',
                        partnerExpectation: ''
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
                    age: '',
                    gender: '',
                    bloodGroup: '',
                    department: '',
                    batch: '',
                    semester: '',
                    mobile: '',
                    presentAddress: '',
                    permanentAddress: '',
                    district: '',
                    aboutMe: '',
                    partnerExpectation: ''
                });
            }
            setDataLoaded(true);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading('বায়োডাটা সেভ করা হচ্ছে...');

        try {
            // Clean and prepare data - always use user's display name
            const cleanData = {
                name: user?.displayName || '', // Always use account name
                profileImage: user?.photoURL || '', // Always use account photo
                age: parseInt(data.age) || 0,
                gender: data.gender || '',
                bloodGroup: data.bloodGroup || '',
                department: data.department?.trim() || '',
                batch: data.batch?.trim() || '',
                semester: data.semester?.trim() || '',
                mobile: data.mobile?.trim() || '',
                presentAddress: data.presentAddress?.trim() || '',
                permanentAddress: data.permanentAddress?.trim() || '',
                district: data.district?.trim() || '',
                aboutMe: data.aboutMe?.trim() || '',
                partnerExpectation: data.partnerExpectation?.trim() || '',
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
                toast.error(response.data.message || 'বায়োডাটা সেভ করতে সমস্যা হয়েছে', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving biodata:', error);
            const message = error.response?.data?.message || 'বায়োডাটা সেভ করতে সমস্যা হয়েছে';
            toast.error(message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label="ড্যাশবোর্ডে ফিরে যান" />
                    <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                        <User className="w-8 h-8 text-primary" />
                        বায়োডাটা ফর্ম
                    </h1>
                    <p className="text-neutral/70 mt-2">আপনার সম্পূর্ণ তথ্য দিয়ে বায়োডাটা তৈরি করুন</p>
                    
                    {existingBiodata && (
                        <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-2xl">
                            <p className="text-info font-medium">
                                ℹ️ আপনার বায়োডাটা ইতিমধ্যে জমা দেওয়া হয়েছে। 
                                স্ট্যাটাস: <span className="font-bold">
                                    {existingBiodata.status === 'pending' ? 'অনুমোদনের অপেক্ষায়' : 
                                     existingBiodata.status === 'approved' ? 'অনুমোদিত' : 
                                     existingBiodata.status === 'rejected' ? 'প্রত্যাখ্যাত' : existingBiodata.status}
                                </span>
                            </p>
                            <p className="text-info/70 text-sm mt-1">
                                আপনি যেকোনো সময় আপনার তথ্য আপডেট করতে পারেন।
                            </p>
                            {/* <button
                                onClick={() => {
                                    console.log('Manual refresh triggered');
                                    fetchExistingBiodata();
                                }}
                                className="mt-2 text-xs bg-info/20 text-info px-3 py-1 rounded-lg hover:bg-info/30 transition-all mr-2"
                            >
                                ডেটা রিফ্রেশ করুন
                            </button>
                            <button
                                onClick={() => {
                                    console.log('Current form values:', formValues);
                                    console.log('Existing biodata:', existingBiodata);
                                }}
                                className="mt-2 text-xs bg-warning/20 text-warning px-3 py-1 rounded-lg hover:bg-warning/30 transition-all"
                            >
                                ডিবাগ তথ্য
                            </button> */}
                        </div>
                    )}

                    {!dataLoaded && (
                        <div className="mt-4 p-4 bg-base-300 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="loading loading-spinner loading-sm"></div>
                                <p className="text-neutral/70">বায়োডাটা তথ্য লোড হচ্ছে...</p>
                            </div>
                        </div>
                    )}
                </div>

                <form key={existingBiodata?._id || 'new'} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {!dataLoaded ? (
                        <div className="text-center py-12">
                            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                            <p className="text-neutral/70">ফর্ম লোড হচ্ছে...</p>
                        </div>
                    ) : (
                        <>
                    {/* Personal Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            ব্যক্তিগত তথ্য
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">নাম (একাউন্ট থেকে)</label>
                                <div className="w-full p-3 border border-base-300 rounded-xl text-neutral/70 flex items-center gap-2">
                                    {user?.photoURL && (
                                        <img 
                                            src={user.photoURL} 
                                            alt={user.displayName}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
                                    <span className='text-neutral'>{user?.displayName || 'নাম পাওয়া যায়নি'}</span>
                                </div>
                                <p className="text-xs text-neutral/50 mt-1">
                                    নাম পরিবর্তন করতে একাউন্ট সেটিংস থেকে প্রোফাইল আপডেট করুন
                                </p>
                                {/* Hidden input for form submission */}
                                <input
                                    type="hidden"
                                    {...register("name")}
                                    value={user?.displayName || ''}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">বয়স *</label>
                                <input
                                    type="number"
                                    {...register("age", { 
                                        required: "বয়স প্রয়োজন",
                                        min: { value: 18, message: "কমপক্ষে ১৮ বছর হতে হবে" },
                                        max: { value: 60, message: "সর্বোচ্চ ৬০ বছর" }
                                    })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="২৫"
                                />
                                {errors.age && <p className="text-error text-sm mt-1">{errors.age.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">জেন্ডার *</label>
                                <select
                                    {...register("gender", { required: "জেন্ডার নির্বাচন করুন" })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">নির্বাচন করুন</option>
                                    <option value="Male">পুরুষ</option>
                                    <option value="Female">মহিলা</option>
                                </select>
                                {errors.gender && <p className="text-error text-sm mt-1">{errors.gender.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">রক্তের গ্রুপ</label>
                                <select
                                    {...register("bloodGroup")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">নির্বাচন করুন</option>
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
                        </div>
                    </div>

                    {/* Educational Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            শিক্ষাগত তথ্য
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">ডিপার্টমেন্ট *</label>
                                <input
                                    type="text"
                                    {...register("department", { required: "ডিপার্টমেন্ট প্রয়োজন" })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Computer Science & Engineering"
                                />
                                {errors.department && <p className="text-error text-sm mt-1">{errors.department.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">ব্যাচ</label>
                                <input
                                    type="text"
                                    {...register("batch")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Spring 2020"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral mb-2">সেমিস্টার</label>
                                <input
                                    type="text"
                                    {...register("semester")}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="১২তম সেমিস্টার / সম্পন্ন"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            যোগাযোগের তথ্য
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">মোবাইল নম্বর *</label>
                                <input
                                    type="tel"
                                    {...register("mobile", { 
                                        required: "মোবাইল নম্বর প্রয়োজন",
                                        pattern: {
                                            value: /^01[3-9]\d{8}$/,
                                            message: "সঠিক বাংলাদেশী মোবাইল নম্বর দিন"
                                        }
                                    })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="01XXXXXXXXX"
                                />
                                {errors.mobile && <p className="text-error text-sm mt-1">{errors.mobile.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">জেলা *</label>
                                <input
                                    type="text"
                                    {...register("district", { required: "জেলা প্রয়োজন" })}
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="ঢাকা"
                                />
                                {errors.district && <p className="text-error text-sm mt-1">{errors.district.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">বর্তমান ঠিকানা *</label>
                                <textarea
                                    {...register("presentAddress", { required: "বর্তমান ঠিকানা প্রয়োজন" })}
                                    rows="3"
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="বর্তমান ঠিকানা লিখুন..."
                                />
                                {errors.presentAddress && <p className="text-error text-sm mt-1">{errors.presentAddress.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">স্থায়ী ঠিকানা *</label>
                                <textarea
                                    {...register("permanentAddress", { required: "স্থায়ী ঠিকানা প্রয়োজন" })}
                                    rows="3"
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="স্থায়ী ঠিকানা লিখুন..."
                                />
                                {errors.permanentAddress && <p className="text-error text-sm mt-1">{errors.permanentAddress.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-primary" />
                            অতিরিক্ত তথ্য
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">নিজের সম্পর্কে</label>
                                <textarea
                                    {...register("aboutMe")}
                                    rows="4"
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="নিজের সম্পর্কে কিছু লিখুন..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">পার্টনার সম্পর্কে প্রত্যাশা</label>
                                <textarea
                                    {...register("partnerExpectation")}
                                    rows="4"
                                    className="w-full p-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="আপনার জীবনসঙ্গী সম্পর্কে প্রত্যাশা লিখুন..."
                                />
                            </div>
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
                            {loading ? 'সেভ করা হচ্ছে...' : 'বায়োডাটা সেভ করুন'}
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