import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import UseAuth from "../../Hooks/UseAuth";
import UseAxiosSecure from "../../Hooks/UseAxiosSecure";
import UseUserManagement from "../../Hooks/UseUserManagement";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { registerUser, signInGoogle, updateUserProfile, sendEmailVerification } = UseAuth();
    const { registerUser: registerUserInDB } = UseUserManagement();
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const from = location?.state || "/dashboard";
    const photoFile = watch("photo");

    const handleRegister = async (data) => {
        setLoading(true);
        const toastId = toast.loading("একাউন্ট তৈরি করা হচ্ছে...");

        try {
            // Validate SEU email
            if (!data.email.endsWith('@seu.edu.bd')) {
                toast.error("শুধুমাত্র SEU ইমেইল (@seu.edu.bd) দিয়ে রেজিস্ট্রেশন করুন", { id: toastId });
                return;
            }

            // Upload photo to imgbb if provided
            let photoURL = '';
            if (data.photo && data.photo[0]) {
                try {
                    const formData = new FormData();
                    formData.append("image", data.photo[0]);
                    const img_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_Host_Key}`;
                    const imgRes = await axios.post(img_API_URL, formData);
                    photoURL = imgRes.data.data.url;
                } catch (imgError) {
                    console.error('Image upload failed:', imgError);
                    // Continue without photo
                }
            }

            // Create Firebase user
            const userCredential = await registerUser(data.email, data.password);
            const user = userCredential.user;

            // Update Firebase profile
            await updateUserProfile({ displayName: data.name, photoURL });

            // Send email verification
            await sendEmailVerification();

            // Register user in database
            const userInfo = {
                email: data.email,
                displayName: data.name,
                uid: user.uid,
                photoURL,
            };

            const dbResult = await registerUserInDB(userInfo);
            
            if (dbResult.success) {
                toast.success("রেজিস্ট্রেশন সফল! ইমেইল ভেরিফিকেশন লিংক পাঠানো হয়েছে।", { id: toastId });
                navigate("/auth/verify-email", { state: { email: data.email } });
            } else {
                toast.error(dbResult.message || "ডাটাবেসে রেজিস্ট্রেশনে সমস্যা হয়েছে", { id: toastId });
            }

        } catch (error) {
            console.error(error);
            let errorMessage = "রেজিস্ট্রেশনে সমস্যা হয়েছে";
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট রয়েছে";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "পাসওয়ার্ড খুবই দুর্বল";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "ইমেইল ঠিকানা সঠিক নয়";
            }
            
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const toastId = toast.loading("Google দিয়ে রেজিস্ট্রেশন করা হচ্ছে...");
        
        try {
            const result = await signInGoogle();
            const user = result?.user;

            // Check if it's SEU email
            if (!user.email.endsWith('@seu.edu.bd')) {
                toast.error("শুধুমাত্র SEU ইমেইল (@seu.edu.bd) দিয়ে রেজিস্ট্রেশন করুন", { id: toastId });
                return;
            }

            const userInfo = {
                email: user?.email,
                displayName: user?.displayName,
                uid: user?.uid,
                photoURL: user?.photoURL,
            };

            // Register in database (will handle existing user)
            const dbResult = await registerUserInDB(userInfo);
            
            if (dbResult.success) {
                toast.success("Google রেজিস্ট্রেশন সফল হয়েছে!", { id: toastId });
                navigate(from, { replace: true });
            } else {
                toast.error(dbResult.message || "রেজিস্ট্রেশনে সমস্যা হয়েছে", { id: toastId });
            }
        } catch (error) {
            console.error("Google Registration Error:", error);
            toast.error("Google রেজিস্ট্রেশন ব্যর্থ হয়েছে!", { id: toastId });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center md:px-4 py-10">
            <div className="w-full max-w-md bg-base-200 p-8 rounded-[2.5rem] shadow-2xl border border-base-300/50 backdrop-blur-sm">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-neutral italic uppercase tracking-tighter">একাউন্ট তৈরি করুন</h1>
                    <p className="text-neutral/50 mt-2 text-[10px] font-bold uppercase tracking-widest">যোগ দিন <span className="font-black text-neutral italic">
                        SEU<span className="text-primary">Matrimony</span>
                    </span> এবং শুরু করুন আপনার যাত্রা</p>
                </div>

                <form onSubmit={handleSubmit(handleRegister)} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">পূর্ণ নাম</label>
                        <input
                            type="text"
                            {...register("name", { required: "নাম প্রয়োজন" })}
                            placeholder="আপনার নাম"
                            className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        {errors.name && <p className="text-error text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.name.message}</p>}
                    </div>

                    {/* Custom Photo Section */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">প্রোফাইল ছবি (ঐচ্ছিক)</label>
                        <div className="flex items-center gap-4 p-2 bg-base-100 border border-base-300 rounded-2xl">
                            <label
                                htmlFor="photo-upload"
                                className="px-4 py-2 bg-primary text-base-100 rounded-xl cursor-pointer hover:bg-neutral transition-all text-[10px] font-black uppercase tracking-widest italic"
                            >
                                ছবি নির্বাচন করুন
                            </label>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                {...register("photo")}
                                className="hidden"
                            />

                            <div className="h-12 w-12 rounded-full bg-base-200 overflow-hidden border-2 border-primary/20 ml-auto shadow-inner">
                                {photoFile?.[0] ? (
                                    <img src={URL.createObjectURL(photoFile[0])} alt="preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-neutral/30 text-[8px] font-black uppercase">ছবি নেই</div>
                                )}
                            </div>
                        </div>
                        {errors.photo && <p className="text-error text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.photo.message}</p>}
                    </div>

                    {/* Email Address */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">SEU ইমেইল ঠিকানা</label>
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
                            className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                        {errors.email && <p className="text-error text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.email.message}</p>}
                    </div>

                    {/* Password with Eye Toggle */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">পাসওয়ার্ড</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", {
                                    required: "পাসওয়ার্ড প্রয়োজন",
                                    minLength: { value: 6, message: "কমপক্ষে ৬ অক্ষর" },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
                                        message: "বড় হাতের অক্ষর, ছোট হাতের অক্ষর এবং সংখ্যা থাকতে হবে"
                                    }
                                })}
                                placeholder="পাসওয়ার্ড"
                                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-neutral/30 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-error text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter leading-tight">{errors.password.message}</p>}
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] italic transition-all shadow-xl active:scale-95 ${loading ? 'bg-base-300 cursor-not-allowed text-neutral/30' : 'bg-primary text-base-100 hover:bg-neutral hover:-translate-y-1'}`}
                    >
                        {loading ? "প্রক্রিয়াকরণ..." : "একাউন্ট তৈরি করুন"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-neutral/40 text-[10px] font-black uppercase tracking-widest italic">
                        ইতিমধ্যে একাউন্ট আছে?{" "}
                        <Link state={from} to="/auth/login" className="text-primary/90 font-black hover:underline decoration-2 underline-offset-4">লগইন করুন</Link>
                    </p>
                </div>

                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-base-300"></div>
                    <span className="text-neutral/30 text-[9px] font-black uppercase tracking-[0.3em] italic">অথবা</span>
                    <div className="flex-1 h-px bg-base-300"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-base-100 border border-base-300 py-3 rounded-2xl hover:bg-neutral hover:text-base-100 transition-all font-black text-[10px] uppercase tracking-widest italic group shadow-sm"
                >
                    <FcGoogle size={20} className="group-hover:scale-110 transition-transform" />
                    <span>Google দিয়ে রেজিস্ট্রেশন</span>
                </button>
            </div>
        </div>
    );
};

export default Register;