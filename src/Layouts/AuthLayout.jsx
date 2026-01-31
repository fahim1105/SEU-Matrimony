import { Link, Outlet } from 'react-router';
import LogoIMG from '../assets/Southeast_University_Logo.png'
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
                <Link to="/">
                    <div className='bg-base-200/90 backdrop-blur-sm px-4 sm:px-5 py-2 rounded-2xl sm:rounded-3xl flex items-center gap-2 w-fit'>
                        <div className="p-1.5 bg-primary rounded-2xl text-white shadow-lg shrink-0 group-hover:rotate-12 transition-transform duration-500">
                            <img src={LogoIMG} className='w-6 sm:w-8 rounded-lg' alt="SEU Logo" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral">
                            SEU<span className="text-primary">Matrimony</span>
                        </span>
                    </div>
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