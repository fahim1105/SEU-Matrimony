import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { MdLogout } from "react-icons/md";
import DashboardIMG from '../assets/Southeast_University_Logo.png'
import {
    LayoutDashboard,
    Home,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    Sun,
    Moon,
    X,
    Settings,
    User,
    Shield,
    Clock,
    BarChart3,
    Mail,
    AlertTriangle,
    Users,
    FileText
} from 'lucide-react';
import UseRole from '../Hooks/UseRole';
import UseAuth from '../Hooks/UseAuth';
import UseUserManagement from '../Hooks/UseUserManagement';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
    const { role } = UseRole();
    const { user, logout, loading } = UseAuth();
    const { getUserInfo } = UseUserManagement();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [userStatus, setUserStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.querySelector("html").setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        if (user?.email && !loading) {
            checkUserStatus();
        } else if (!loading && !user) {
            setStatusLoading(false);
        }
    }, [user, loading]);

    const checkUserStatus = async () => {
        try {
            const result = await getUserInfo(user.email);
            if (result.success) {
                setUserStatus(result.user);
            }
        } catch (error) {
            console.error('Error checking user status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    const handleSignOut = () => {
        logout()
            .then(() => toast.success("Logout successful"))
            .catch((error) => console.error(error));
    }

    const activeLink = "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02] rounded-2xl transition-all duration-300";
    const normalLink = "text-base-content/50 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all duration-200";

    if (loading || statusLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">ড্যাশবোর্ড লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="drawer xl:drawer-open">
            <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
            
            <div className="drawer-content flex flex-col min-h-screen bg-base-100 overflow-x-hidden">
                {/* Status Banners */}
                {userStatus && !userStatus.isEmailVerified && (
                    <div className="bg-warning text-warning-content p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Mail className="w-5 h-5" />
                            <span className="font-semibold">ইমেইল ভেরিফিকেশন প্রয়োজন!</span>
                            <Link to="/auth/verify-email" className="underline hover:no-underline ml-2">
                                এখনই ভেরিফাই করুন
                            </Link>
                        </div>
                    </div>
                )}

                {userStatus && !userStatus.isActive && (
                    <div className="bg-error text-error-content p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">আপনার একাউন্ট নিষ্ক্রিয় রয়েছে</span>
                        </div>
                    </div>
                )}

                {/* --- Navbar --- */}
                <nav className="navbar sticky top-0 z-30 bg-base-100/60 backdrop-blur-2xl border-b border-base-300/10 px-4 md:px-10 h-20">
                    <div className="flex-1 gap-2 md:gap-4">
                        <label htmlFor="mobile-drawer" className="btn btn-ghost btn-circle xl:hidden text-primary">
                            <Menu size={24} />
                        </label>
                        <div className="flex flex-col">
                            <h2 className="text-[8px] md:text-[10px] font-black text-base-content/30 uppercase tracking-[0.2em] md:tracking-[0.4em] leading-none mb-1">Navigation</h2>
                            <p className="text-xs md:text-sm font-black text-neutral italic uppercase tracking-tighter truncate max-w-[120px] md:max-w-none">Dash <span className="hidden md:inline">/</span> <span className="text-primary uppercase">{role}</span></p>
                        </div>
                    </div>
                    <div className="flex-none gap-2">
                        <div onClick={toggleTheme} className="relative flex items-center w-20 md:w-24 h-9 md:h-11 p-1 bg-base-200/80 rounded-2xl border border-base-300/20 cursor-pointer shadow-inner overflow-hidden transition-all duration-300">
                            <div className={`absolute top-1 bottom-1 w-8 md:w-11 rounded-xl shadow-sm transition-all duration-500 ease-in-out ${theme === 'light' ? 'left-1 bg-white' : 'left-[calc(100%-36px)] md:left-[calc(100%-48px)] bg-primary'}`}></div>
                            <div className={`relative z-10 flex-1 flex justify-center items-center ${theme === 'light' ? 'text-primary' : 'text-base-content/20'}`}>
                                <Sun size={18} />
                            </div>
                            <div className={`relative z-10 flex-1 flex justify-center items-center ${theme === 'dark' ? 'text-white' : 'text-base-content/20'}`}>
                                <Moon size={18} />
                            </div>
                        </div>
                    </div>
                </nav>

                {/* --- Main Area --- */}
                <main className="p-3 md:p-6 xl:p-10 flex-grow w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-base-200/50 rounded-[2rem] md:rounded-[3.5rem] p-4 md:p-8 min-h-[calc(100vh-140px)] border border-base-300/10 shadow-inner"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>

            {/* --- Sidebar --- */}
            <div className="drawer-side z-50">
                <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
                <aside className={`bg-base-100 border-r border-base-300/10 h-screen flex flex-col transition-all duration-500 ease-in-out ${isCollapsed ? "xl:w-24" : "w-72 md:w-80"}`}>
                    {/* Header */}
                    <div className={`p-6 md:p-8 flex items-center shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="p-1.5 bg-primary rounded-2xl text-white shadow-lg shrink-0 group-hover:rotate-12 transition-transform duration-500">
                                <img src={DashboardIMG} className='w-8 rounded-lg' alt="" />
                            </div>
                            {!isCollapsed && (
                                <span className="text-xl font-black text-neutral italic tracking-tighter whitespace-nowrap">SEU<span className="text-primary">Matrimony</span></span>
                            )}
                        </Link>
                        <label htmlFor="mobile-drawer" className="xl:hidden btn btn-ghost btn-circle btn-sm text-error">
                            <X size={20} />
                        </label>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide">
                        {/* 1. Main Menu */}
                        <ul className="menu p-0 w-full space-y-1.5">
                            <p className={`text-[10px] font-black text-base-content/20 uppercase tracking-[0.3em] my-4 px-4 italic ${isCollapsed ? "hidden" : "block"}`}>Main Menu</p>
                            <SidebarItem to="/" icon={<Home size={20} />} label="Landing Home" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} end />
                            <SidebarItem to="/dashboard/friends" icon={<Users size={20} />} label="Friends" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            <SidebarItem to="/dashboard/biodata-form" icon={<FileText size={20} />} label="Biodata Form" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            <SidebarItem to="/dashboard/account-settings" icon={<Settings size={20} />} label="Settings" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                        </ul>

                        {/* 2. Admin Panel (Conditional) */}
                        {role === 'admin' && (
                            <ul className="menu p-0 w-full space-y-1.5 mt-6">
                                {!isCollapsed && <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-4 mb-2 opacity-50 italic">Admin Panel</p>}
                                {/* <SidebarItem to="/dashboard/admin/dashboard" icon={<BarChart3 size={20} />} label="Admin Dashboard" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} /> */}
                                <SidebarItem to="/dashboard/admin/pending-biodatas" icon={<Clock size={20} />} label="Pending Biodatas" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                                <SidebarItem to="/dashboard/admin/user-management" icon={<Users size={20} />} label="User Management" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                                <SidebarItem to="/dashboard/admin/analytics" icon={<Shield size={20} />} label="Analytics" isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            </ul>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 md:p-6 border-t border-base-300/10 bg-base-100 shrink-0 space-y-3">
                        <button onClick={() => setIsCollapsed(!isCollapsed)} className="btn btn-ghost w-full justify-start gap-4 text-base-content/40 hover:text-primary rounded-2xl hidden xl:flex px-4 border-none transition-all duration-300">
                            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                            {!isCollapsed && <span className="font-bold uppercase text-[10px] tracking-widest">Collapse View</span>}
                        </button>
                        <button onClick={handleSignOut} className="btn bg-error/10 border-none hover:bg-error hover:text-white w-full justify-start gap-4 text-error rounded-2xl transition-all duration-300 px-4">
                            <MdLogout size={20} className="shrink-0" />
                            {!isCollapsed && <span className="font-black uppercase text-[10px] tracking-widest">Logout</span>}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

// Sidebar Item Component
const SidebarItem = ({ to, icon, label, isCollapsed, activeLink, normalLink, end = false }) => (
    <li className="w-full">
        <NavLink 
            to={to} 
            end={end} 
            className={({ isActive }) => 
                `flex items-center gap-4 py-3.5 px-4 w-full transition-all duration-500 no-underline ${
                    isActive ? activeLink : normalLink
                } ${isCollapsed ? "justify-center px-0" : "justify-start"}`
            }
        >
            <span className="shrink-0">{icon}</span>
            {!isCollapsed && (
                <span className="font-black uppercase text-[10px] tracking-[0.15em] italic whitespace-nowrap truncate">
                    {label}
                </span>
            )}
        </NavLink>
    </li>
);

export default DashboardLayout;