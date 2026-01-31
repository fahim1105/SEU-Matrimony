import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import UseAuth from "../../Hooks/UseAuth";
import UseUserManagement from "../../Hooks/UseUserManagement";
import { Link, useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signinUser, signInGoogle } = UseAuth();
    const { getUserInfo, registerUser: registerUserInDB } = UseUserManagement();
    const location = useLocation();
    const navigate = useNavigate();

    const from = location?.state || "/dashboard";
    const verificationMessage = location.state?.message;
    const prefilledEmail = location.state?.email;

    // Show verification success message if present
    useEffect(() => {
        if (verificationMessage) {
            toast.success(verificationMessage);
        }
    }, [verificationMessage]);

    // const quickLogin = (email, password) => {
    //     setValue("email", email);
    //     setValue("password", password);
    //     handleLogin({ email, password });
    // };

    const handleLogin = async (data) => {
        const toastId = toast.loading("লগইন করা হচ্ছে...");
        
        try {
            // Check SEU email domain
            if (!data.email.endsWith('@seu.edu.bd')) {
                toast.error("শুধুমাত্র SEU ইমেইল (@seu.edu.bd) দিয়ে লগইন করুন", { id: toastId });
                return;
            }

            const userCredential = await signinUser(data.email, data.password);
            const user = userCredential.user;

            // Check user status in database
            const userInfoResult = await getUserInfo(user.email);
            
            if (!userInfoResult.success) {
                toast.error("ইউজার তথ্য পাওয়া যায়নি। রেজিস্ট্রেশন করুন।", { id: toastId });
                navigate("/auth/register");
                return;
            }

            const userInfo = userInfoResult.user;

            // Check if email is verified (skip for Google users)
            if (!userInfo.isGoogleUser && (!user.emailVerified || !userInfo.isEmailVerified)) {
                toast.error("প্রথমে ইমেইল ভেরিফাই করুন", { id: toastId });
                navigate("/auth/verify-email", { state: { email: user.email } });
                return;
            }

            // Check if account is active
            if (!userInfo.isActive) {
                toast.error("আপনার একাউন্ট নিষ্ক্রিয় রয়েছে। সাপোর্টের সাথে যোগাযোগ করুন।", { id: toastId });
                return;
            }

            toast.success("সফলভাবে লগইন হয়েছে!", { id: toastId });
            navigate(from, { replace: true });
            
        } catch (error) {
            console.error(error);
            let errorMessage = "ইমেইল বা পাসওয়ার্ড ভুল";
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = "এই ইমেইল দিয়ে কোনো একাউন্ট নেই";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "পাসওয়ার্ড ভুল";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর চেষ্টা করুন।";
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = "ইমেইল বা পাসওয়ার্ড ভুল";
            }
            
            toast.error(errorMessage, { id: toastId });
        }
    }

    const handleGoogleLogin = async () => {
        const toastId = toast.loading("Google দিয়ে লগইন করা হচ্ছে...");
        
        try {
            const result = await signInGoogle();
            
            if (!result || !result.user) {
                toast.error("Google লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", { id: toastId });
                return;
            }
            
            const user = result.user;
            console.log('✅ Google login successful:', user.email);

            // Check if user exists in database
            const userInfoResult = await getUserInfo(user.email);
            
            if (!userInfoResult.success) {
                // User doesn't exist, create new user
                const userInfo = {
                    email: user.email,
                    displayName: user.displayName,
                    uid: user.uid,
                    photoURL: user.photoURL,
                    isGoogleUser: true,
                    isEmailVerified: true
                };

                const response = await registerUserInDB(userInfo);
                if (response.success) {
                    toast.success("Google একাউন্ট তৈরি এবং লগইন সফল হয়েছে!", { id: toastId });
                } else {
                    toast.error(response.message || "একাউন্ট তৈরিতে সমস্যা হয়েছে", { id: toastId });
                    return;
                }
            } else {
                // Check if account is active
                const userInfo = userInfoResult.user;
                if (!userInfo.isActive) {
                    toast.error("আপনার একাউন্ট নিষ্ক্রিয় রয়েছে। সাপোর্টের সাথে যোগাযোগ করুন।", { id: toastId });
                    return;
                }
                
                toast.success("Google লগইন সফল হয়েছে!", { id: toastId });
            }

            navigate(from, { replace: true });

        } catch (error) {
            console.error('Google login error:', error);
            const errorMessage = error.message || "Google লগইন ব্যর্থ হয়েছে!";
            toast.error(errorMessage, { id: toastId });
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center md:px-4 py-10 ">
            <div className="w-full max-w-sm bg-base-200 p-8 rounded-[2.5rem] shadow-2xl border border-base-300/50 backdrop-blur-sm">
                <h1 className="text-3xl font-black mb-1 text-neutral italic uppercase tracking-tighter">Welcome Back</h1>
                <p className="text-base-content/50 mb-6 text-[10px] font-bold uppercase tracking-widest">Login to <span className="font-black text-neutral">SEU <span className="text-primary">Matrimony</span></span></p>

                <div className="flex items-center gap-2 mb-6">
                    <div className="flex-1 h-px bg-base-300"></div>
                    <span className="text-[10px] font-black text-neutral/30 uppercase tracking-widest italic">Email Login</span>
                    <div className="flex-1 h-px bg-base-300"></div>
                </div>

                <form onSubmit={handleSubmit(handleLogin)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">ইমেইল</label>
                            <input
                                type="email"
                                {...register("email", { required: "ইমেইল প্রয়োজন" })}
                                placeholder="আপনার@seu.edu.bd"
                                defaultValue={prefilledEmail || ""}
                                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                            {errors.email && <p className="text-error text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-neutral/50 mb-1.5 ml-1 italic">পাসওয়ার্ড</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", { required: "পাসওয়ার্ড প্রয়োজন" })}
                                    placeholder="পাসওয়ার্ড"
                                    className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-neutral/30 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-error text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.password.message}</p>}
                        </div>

                        <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-base-100 font-black text-xs uppercase tracking-[0.2em] italic shadow-xl hover:bg-neutral hover:-translate-y-0.5 transition-all active:scale-95">
                            লগইন করুন
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-base-300/50 text-center space-y-4">
                    <Link state={from} to="/auth/register" className="text-xs font-black text-neutral/40 uppercase tracking-widest hover:text-primary transition-colors block italic">
                        নতুন? <span className="text-primary underline decoration-2 underline-offset-4">একাউন্ট তৈরি করুন</span>
                    </Link>

                    <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 bg-base-100 border border-base-300 rounded-2xl hover:bg-neutral hover:text-base-100 transition-all font-black text-[10px] uppercase tracking-widest italic group">
                        <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-4 h-4 group-hover:invert transition-all" />
                        Google লগইন
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
