import React from 'react';
// import LogoIMG from '../assets/logo.png'
import { Link, Outlet } from 'react-router';
// import AuthIMG from '../assets/Login:resisterImg.jpg'

const AuthLayout = () => {
    return (
        <div className='px-10 mx-auto bg-[#0d1233]'>
            <Link to="/">
                <div className='bg-base-200 px-5 py-2 rounded-3xl flex items-center gap-2'>
                    {/* <div className="p-1.5 bg-primary rounded-2xl text-white shadow-lg shrink-0 group-hover:rotate-12 transition-transform duration-500">
                        <img src={LogoIMG} className='w-8 rounded-lg' alt="" />
                    </div> */}
                    <span className="text-xl font-bold tracking-tight text-neutral">
                        Scholar<span className="text-primary">Stream</span>
                    </span>
                </div>
            </Link>
            <div className='md:flex md:items-center'>
                <div className='md:flex-1'>
                    <Outlet></Outlet>
                </div>
                {/* <div className='flex-1 hidden md:block'>
                    <img src={AuthIMG} alt="" />
                </div> */}
            </div>
        </div>
    );
};

export default AuthLayout;