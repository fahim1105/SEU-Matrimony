import { Link, Outlet } from 'react-router';
import LogoIMG from '../assets/Logo.png'
import AuthIMG from '../assets/Authpage.png'

const AuthLayout = () => {
    return (
        <div
            className='min-h-screen bg-cover bg-center bg-no-repeat relative'
            style={{
                backgroundImage: `url(${AuthIMG})`
            }}
        >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className='relative z-10 px-4 sm:px-6 lg:px-10 py-6'>
                {/* Logo Header */}
                <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="bg-base-200 rounded-2xl shadow-sm group-hover:rotate-12 transition-transform border border-base-300/10 flex-shrink-0">
                        <img src={LogoIMG} alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <span className="text-lg xl:text-xl font-black tracking-tighter text-neutral italic whitespace-nowrap">
                        SEU <span className="text-primary">Matrimony</span>
                    </span>
                </Link>

                {/* Auth Content */}
                <div className='flex items-center justify-center min-h-[calc(100vh-120px)] py-8'>
                    <div className='w-full max-w-md'>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;