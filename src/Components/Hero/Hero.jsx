import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Users, ArrowRight } from 'lucide-react';
import HeroVideo from '../../assets/VID_20260123205829.mp4'
import UseAuth from '../../Hooks/UseAuth';
import { useTheme } from '../../Context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Hero = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = UseAuth();
    const { theme } = useTheme();
    const [videoLoaded, setVideoLoaded] = useState(false);

    console.log('Current theme in Hero:', theme); // Debug log

    const handleFindPartner = () => {
        if (user) {
            navigate('/browse-matches');
        } else {
            navigate('/register');
        }
    };

    const handleSignIn = () => {
        navigate('/auth/login');
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 w-full h-full z-0">
                <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onLoadedData={() => setVideoLoaded(true)}
                >
                    <source 
                        src={HeroVideo}
                        type="video/mp4" 
                    />
                    {/* Fallback for browsers that don't support video */}
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600"></div>
                </video>
            </div>

            {/* Video Overlay - Theme-aware */}
            <div className="absolute inset-0 bg-base-200/40 z-10"></div>
            <div className="absolute inset-0 bg-primary/10 z-10"></div>
            
            {/* Animated Hearts Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                {[...Array(6)].map((_, i) => (
                    <Heart 
                        key={i}
                        className="absolute text-primary/30 animate-bounce"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                            fontSize: `${20 + Math.random() * 20}px`
                        }}
                    />
                ))}
            </div>

            {/* Hero Content (সবচেয়ে উপরে) */}
            <div className="relative z-30 text-center px-4 max-w-4xl mx-auto">
                {/* Main Heading */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                        <span className="bg-gradient-to-r from-base-content via-primary to-secondary bg-clip-text text-transparent drop-shadow-2xl">
                            SEU Matrimony
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 text-primary">
                        {t('home.hero.title')}
                    </p>
                    <p className="text-lg md:text-xl text-base-content/80 max-w-2xl mx-auto">
                        {t('home.hero.subtitle')}
                    </p>
                </div>

                {/* <div className="flex flex-wrap justify-center gap-8 mb-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Users className="w-6 h-6 text-pink-300 mr-2" />
                            <span className="text-2xl md:text-3xl font-bold text-pink-300">500+</span>
                        </div>
                        <p className="text-sm text-gray-300">সদস্য</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Heart className="w-6 h-6 text-pink-300 mr-2" />
                            <span className="text-2xl md:text-3xl font-bold text-pink-300">100+</span>
                        </div>
                        <p className="text-sm text-gray-300">সফল বিবাহ</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Search className="w-6 h-6 text-pink-300 mr-2" />
                            <span className="text-2xl md:text-3xl font-bold text-pink-300">24/7</span>
                        </div>
                        <p className="text-sm text-gray-300">সার্ভিস</p>
                    </div>
                </div> */}

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handleFindPartner}
                        className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 min-w-[200px]"
                    >
                        <Heart className="w-5 h-5 group-hover:animate-pulse" />
                        {user ? t('nav.browseMatches') : t('home.hero.cta')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {!user && (
                        <button
                            onClick={handleSignIn}
                            className="group bg-base-200/50 backdrop-blur-sm border-2 border-base-content/20 hover:bg-base-200/70 text-base-content font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3 min-w-[200px]"
                        >
                            <Users className="w-5 h-5" />
                            {t('nav.login')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>

                {/* Additional Info */}
                <div className="mt-12 text-center">
                    <p className="text-base-content/70 text-sm mb-4">
                        🔒 {t('home.hero.description')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-base-content/60">
                        <span>✓ {t('home.safety.verification.description')}</span>
                        <span>✓ {t('home.whySEU.privacy.title')}</span>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-base-content/50 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-base-content/70 rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>

            {/* Loading Fallback */}
            {!videoLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
                    <div className="text-white text-center">
                        <div className="loading loading-spinner loading-lg mb-4"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hero;