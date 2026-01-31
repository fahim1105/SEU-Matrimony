import { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Upload, X } from "lucide-react";
import UseAuth from "../../Hooks/UseAuth";
import UseUserManagement from "../../Hooks/UseUserManagement";
import { Link, useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { uploadImageToImageBB, validateImageFile, formatFileSize } from "../../utils/imageUpload";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { registerUser, signInGoogle, logout, updateUserProfile, sendEmailVerification } = UseAuth();
    const { registerUser: registerUserInDB, getUserInfo, sendVerificationEmail } = UseUserManagement();
    const location = useLocation();
    const navigate = useNavigate();

    const from = location?.state || "/dashboard";
    const password = watch("password");

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file
            const validation = validateImageFile(file);
            if (!validation.success) {
                toast.error(validation.message);
                return;
            }

            setProfileImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
            
            // Show file info
            toast.success(`ছবি নির্বাচিত: ${formatFileSize(file.size)}`);
        }
    };

    // Remove image
    const removeImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        // Reset file input
        const fileInput = document.getElementById('profileImage');
        if (fileInput) {
            fileInput.value = '';
        }
        toast.success("ছবি সরানো হয়েছে");
    };

    // Upload image to ImageBB
    const uploadProfileImage = async (imageFile) => {
        if (!imageFile) return null;
        
        try {
            const imageUrl = await uploadImageToImageBB(imageFile);
            return imageUrl;
        } catch (error) {
            console.error('Image upload error:', error);
            throw error;
        }
    };

    const handleRegister = async (data) => {
        setLoading(true);
        const toastId = toast.loading("রেজিস্ট্রেশন করা হচ্ছে...");

        try {
            // Check SEU email domain first
            if (!data.email.endsWith('@seu.edu.bd')) {
                toast.error("শুধুমাত্র SEU ইমেইল (@seu.edu.bd) দিয়ে রেজিস্ট্রেশন করুন", { id: toastId });
                setLoading(false);
                return;
            }

            // Upload profile image first if provided
            let photoURL = '';
            if (profileImage) {
                try {
                    toast.loading("ছবি আপলোড করা হচ্ছে...", { id: toastId });
                    photoURL = await uploadProfileImage(profileImage);
                    toast.loading("ব্যবহারকারী তৈরি করা হচ্ছে...", { id: toastId });
                } catch (imageError) {
                    console.error('Image upload error:', imageError);
                    toast.error(`ছবি আপলোড ব্যর্থ: ${imageError.message}`, { id: toastId });
                    setLoading(false);
                    return;
                }
            }

            // Create Firebase user
            const userCredential = await registerUser(data.email, data.password);
            const user = userCredential.user;

            // Update Firebase profile
            await updateUserProfile({
                displayName: data.displayName,
                photoURL: photoURL
            });

            console.log('✅ Firebase user created successfully');
            
            // Send Firebase email verification
            try {
                await sendEmailVerification();
                console.log('✅ Firebase verification email sent');
            } catch (emailError) {
                console.error('Email verification send failed:', emailError);
            }
            
            // Store user in database immediately (unverified)
            const userData = {
                email: data.email,
                displayName: data.displayName,
                uid: user.uid,
                photoURL: photoURL,
                isGoogleUser: false,
                isEmailVerified: false // Will be updated when email is verified
            };

            console.log('📤 Storing user in database:', userData);
            const dbResult = await registerUserInDB(userData);
            
            if (dbResult.success) {
                console.log('✅ User stored in database successfully');
                toast.success("রেজিস্ট্রেশন সফল! ইমেইল ভেরিফিকেশনের জন্য অপেক্ষা করুন।", { id: toastId });
                
                // Navigate to verification page with all necessary data
                navigate("/auth/verify-email", { 
                    state: { 
                        email: data.email,
                        displayName: data.displayName,
                        photoURL: photoURL,
                        uid: user.uid,
                        fromRegistration: true,
                        waitingForVerification: true,
                        isEmailUser: true, // Flag to indicate this is email registration
                        useFirebaseVerification: true // Use Firebase verification instead of custom
                    } 
                });
            } else {
                console.log('⚠️ Database storage failed:', dbResult.message);
                // Even if DB storage fails, proceed to verification
                toast.success("Firebase একাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফিকেশনের জন্য অপেক্ষা করুন।", { id: toastId });
                
                navigate("/auth/verify-email", { 
                    state: { 
                        email: data.email,
                        displayName: data.displayName,
                        photoURL: photoURL,
                        uid: user.uid,
                        fromRegistration: true,
                        waitingForVerification: true,
                        isEmailUser: true,
                        dbStorageFailed: true, // Flag to retry DB storage after verification
                        useFirebaseVerification: true // Use Firebase verification instead of custom
                    } 
                });
            }

        } catch (error) {
            console.error("Registration error:", error);
            let errorMessage = "রেজিস্ট্রেশনে সমস্যা হয়েছে";
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "পাসওয়ার্ড খুবই দুর্বল। কমপক্ষে ৬ অক্ষরের হতে হবে";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "ইমেইল ঠিকানা সঠিক নয়";
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = "ইমেইল/পাসওয়ার্ড রেজিস্ট্রেশন বন্ধ রয়েছে";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        const toastId = toast.loading("Google দিয়ে রেজিস্ট্রেশন করা হচ্ছে...");
        
        try {
            console.log('🚀 Starting Google registration...');
            const result = await signInGoogle();
            
            if (!result || !result.user) {
                toast.error("Google রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", { id: toastId });
                return;
            }

            const user = result.user;
            console.log('✅ Google user authenticated:', user.email);

            // Process the Google user
            await processGoogleUser(user, toastId);

        } catch (error) {
            console.error("Google Register Error:", error);
            let errorMessage = error.message || "Google রেজিস্ট্রেশন ব্যর্থ হয়েছে!";
            toast.error(errorMessage, { id: toastId });
        }
    };

    // Process Google user registration
    const processGoogleUser = async (user, toastId) => {
        try {
            console.log('🔄 Processing Google user:', user.email);
            
            // If no email, ask user to provide SEU email manually
            if (!user.email) {
                console.log('❌ No email in user object, requesting manual input');
                const manualEmail = prompt('Google থেকে ইমেইল পাওয়া যায়নি। আপনার SEU ইমেইল (@seu.edu.bd) লিখুন:');
                
                if (!manualEmail) {
                    toast.error("ইমেইল প্রয়োজন। রেজিস্ট্রেশন বাতিল করা হয়েছে।", { id: toastId });
                    return;
                }
                
                if (!manualEmail.endsWith('@seu.edu.bd')) {
                    toast.error("শুধুমাত্র SEU ইমেইল (@seu.edu.bd) দিয়ে রেজিস্ট্রেশন করুন", { id: toastId });
                    return;
                }
                
                // Update user object with manual email
                user.email = manualEmail;
                console.log('✅ Manual email added:', manualEmail);
            }
            
            // Check if user already exists in database
            const userInfo = await getUserInfo(user.email);
            
            if (userInfo.success) {
                // User already exists
                console.log('✅ User already exists in database');
                toast.success("Google একাউন্ট ইতিমধ্যে রেজিস্টার্ড! লগইন সফল হয়েছে।", { id: toastId });
                
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1000);
                return;
            }

            // User doesn't exist, create new user
            console.log('📝 Creating new Google user in database...');
            const newUserData = {
                email: user.email,
                displayName: user.displayName || 'SEU User',
                uid: user.uid,
                photoURL: user.photoURL || '',
                isGoogleUser: true,
                isEmailVerified: true
            };

            console.log('📤 Sending user data to database:', newUserData);

            const registerResult = await registerUserInDB(newUserData);
            
            if (registerResult.success) {
                console.log('✅ Google user registered successfully');
                toast.success("Google রেজিস্ট্রেশন সফল হয়েছে!", { id: toastId });
                
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1000);
            } else {
                console.error('❌ Database registration failed:', registerResult.message);
                toast.error(registerResult.message || "রেজিস্ট্রেশনে সমস্যা হয়েছে", { id: toastId });
            }

        } catch (error) {
            console.error('❌ Process Google user error:', error);
            toast.error("Google ইউজার প্রক্রিয়া করতে সমস্যা হয়েছে", { id: toastId });
        }
    };

    // No need for auth state listener since we're using popup-only approach
    // The processGoogleUser function will be called directly from handleGoogleRegister

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, text: "", color: "" };
        
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        strength = Object.values(checks).filter(Boolean).length;
        
        if (strength <= 2) return { strength, text: "দুর্বল", color: "text-error" };
        if (strength <= 3) return { strength, text: "মাঝারি", color: "text-warning" };
        if (strength <= 4) return { strength, text: "ভালো", color: "text-info" };
        return { strength, text: "খুব ভালো", color: "text-success" };
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-base-200 to-base-300">
            <div className="w-full max-w-md bg-base-100 p-8 rounded-[2.5rem] shadow-2xl border border-base-300/50 backdrop-blur-sm">
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-neutral italic uppercase tracking-tighter">রেজিস্ট্রেশন</h1>
                    <p className="text-neutral/50 mt-2 text-[10px] font-bold uppercase tracking-widest">
                        যোগ দিন <span className="font-black text-neutral italic">
                            SEU<span className="text-primary">Matrimony</span>
                        </span> তে
                    </p>
                </div>

                <form onSubmit={handleSubmit(handleRegister)} className="space-y-5">
                    {/* Profile Image Upload */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">
                            প্রোফাইল ছবি (ঐচ্ছিক)
                        </label>
                        <div className="relative">
                            {imagePreview ? (
                                <div className="relative w-24 h-24 mx-auto mb-3">
                                    <img 
                                        src={imagePreview} 
                                        alt="Profile Preview" 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 mx-auto mb-3 bg-base-200 rounded-full flex items-center justify-center border-2 border-dashed border-base-300">
                                    <Upload className="w-8 h-8 text-neutral/30" />
                                </div>
                            )}
                            
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="profileImage"
                            />
                            <label
                                htmlFor="profileImage"
                                className="w-full py-2 px-4 bg-base-200 border border-base-300 rounded-xl cursor-pointer hover:bg-base-300 transition-all text-center block text-sm font-medium text-neutral/70"
                            >
                                {profileImage ? "ছবি পরিবর্তন করুন" : "ছবি আপলোড করুন"}
                            </label>
                            <p className="text-[8px] text-neutral/40 mt-1 text-center">
                                সর্বোচ্চ ৩২ MB, JPG/PNG/GIF/WebP ফরম্যাট
                            </p>
                            {profileImage && (
                                <p className="text-[8px] text-success mt-1 text-center">
                                    নির্বাচিত: {profileImage.name} ({formatFileSize(profileImage.size)})
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">
                            পূর্ণ নাম
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 w-4 h-4 text-neutral/30" />
                            <input
                                type="text"
                                {...register("displayName", { 
                                    required: "নাম প্রয়োজন",
                                    minLength: {
                                        value: 2,
                                        message: "নাম কমপক্ষে ২ অক্ষরের হতে হবে"
                                    },
                                    maxLength: {
                                        value: 50,
                                        message: "নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে"
                                    }
                                })}
                                placeholder="আপনার পূর্ণ নাম"
                                className="w-full pl-12 pr-4 py-3 bg-base-200 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                        </div>
                        {errors.displayName && (
                            <div className="flex items-center gap-1 mt-1 ml-2">
                                <AlertCircle className="w-3 h-3 text-error" />
                                <p className="text-error text-[10px] font-black uppercase italic tracking-tighter">
                                    {errors.displayName.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Email Address */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">
                            SEU ইমেইল ঠিকানা
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral/30" />
                            <input
                                type="email"
                                {...register("email", { 
                                    required: "ইমেইল প্রয়োজন",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@seu\.edu\.bd$/,
                                        message: "শুধুমাত্র SEU ইমেইল (@seu.edu.bd) ব্যবহার করুন"
                                    }
                                })}
                                placeholder="আপনার.নাম@seu.edu.bd"
                                className="w-full pl-12 pr-4 py-3 bg-base-200 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                        </div>
                        {errors.email && (
                            <div className="flex items-center gap-1 mt-1 ml-2">
                                <AlertCircle className="w-3 h-3 text-error" />
                                <p className="text-error text-[10px] font-black uppercase italic tracking-tighter">
                                    {errors.email.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">
                            পাসওয়ার্ড
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral/30" />
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", {
                                    required: "পাসওয়ার্ড প্রয়োজন",
                                    minLength: {
                                        value: 6,
                                        message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
                                    }
                                })}
                                placeholder="পাসওয়ার্ড"
                                className="w-full pl-12 pr-12 py-3 bg-base-200 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-neutral/30 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {password && (
                            <div className="flex items-center gap-2 mt-1 ml-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`w-2 h-1 rounded-full ${
                                                i <= passwordStrength.strength 
                                                    ? passwordStrength.strength <= 2 
                                                        ? 'bg-error' 
                                                        : passwordStrength.strength <= 3 
                                                            ? 'bg-warning' 
                                                            : passwordStrength.strength <= 4 
                                                                ? 'bg-info' 
                                                                : 'bg-success'
                                                    : 'bg-base-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className={`text-[9px] font-bold ${passwordStrength.color}`}>
                                    {passwordStrength.text}
                                </span>
                            </div>
                        )}
                        {errors.password && (
                            <div className="flex items-center gap-1 mt-1 ml-2">
                                <AlertCircle className="w-3 h-3 text-error" />
                                <p className="text-error text-[10px] font-black uppercase italic tracking-tighter">
                                    {errors.password.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">
                            পাসওয়ার্ড নিশ্চিত করুন
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral/30" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                {...register("confirmPassword", {
                                    required: "পাসওয়ার্ড নিশ্চিত করুন",
                                    validate: value => value === password || "পাসওয়ার্ড মিলছে না"
                                })}
                                placeholder="পাসওয়ার্ড আবার লিখুন"
                                className="w-full pl-12 pr-12 py-3 bg-base-200 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-3.5 text-neutral/30 hover:text-primary transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <div className="flex items-center gap-1 mt-1 ml-2">
                                <AlertCircle className="w-3 h-3 text-error" />
                                <p className="text-error text-[10px] font-black uppercase italic tracking-tighter">
                                    {errors.confirmPassword.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Register Button */}
                    <button
                        disabled={loading}
                        type="submit"
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] italic transition-all shadow-xl active:scale-95 ${
                            loading 
                                ? 'bg-base-300 cursor-not-allowed text-neutral/30' 
                                : 'bg-primary text-base-100 hover:bg-neutral hover:-translate-y-1 shadow-primary/30'
                        }`}
                    >
                        {loading ? "প্রক্রিয়াকরণ..." : "রেজিস্ট্রেশন করুন"}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-neutral/40 text-[10px] font-black uppercase tracking-widest italic">
                        ইতিমধ্যে একাউন্ট আছে?{" "}
                        <Link 
                            state={from} 
                            to="/auth/login" 
                            className="text-primary/90 font-black hover:underline decoration-2 underline-offset-4"
                        >
                            লগইন করুন
                        </Link>
                    </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-base-300"></div>
                    <span className="text-neutral/30 text-[9px] font-black uppercase tracking-[0.3em] italic">অথবা</span>
                    <div className="flex-1 h-px bg-base-300"></div>
                </div>

                {/* Google Register */}
                <button
                    type="button"
                    onClick={handleGoogleRegister}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest italic group shadow-sm transition-all ${
                        loading 
                            ? 'bg-base-300 cursor-not-allowed text-neutral/30 border border-base-300' 
                            : 'bg-base-200 border border-base-300 hover:bg-neutral hover:text-base-100 hover:shadow-lg'
                    }`}
                >
                    <FcGoogle size={20} className="group-hover:scale-110 transition-transform" />
                    <span>{loading ? "প্রক্রিয়াকরণ..." : "Google দিয়ে রেজিস্ট্রেশন"}</span>
                </button>

                {/* Terms */}
                <div className="mt-4 text-center">
                    <p className="text-neutral/30 text-[9px] font-black uppercase tracking-widest italic">
                        রেজিস্ট্রেশন করে আপনি আমাদের শর্তাবলী ও গোপনীয়তা নীতি মেনে নিচ্ছেন
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;