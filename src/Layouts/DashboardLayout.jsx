import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { MdLogout } from "react-icons/md";
import { useTranslation } from 'react-i18next';
import DashboardIMG from '../assets/Logo.png'
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
    Shield,
    Clock,
    Mail,
    AlertTriangle,
    Users,
    FileText,
    Heart,
    MessageSquare
} from 'lucide-react';
import UseRole from '../Hooks/UseRole';
import UseAuth from '../Hooks/UseAuth';
import UseUserManagement from '../Hooks/UseUserManagement';
import LanguageToggle from '../Components/LanguageToggle/LanguageToggle';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import SyncStatus from '../Components/SyncStatus/SyncStatus';
import UseSyncService from '../Hooks/UseSyncService';
import Loader from '../Components/Loader/Loader';
import { useTheme } from '../Context/ThemeContext';
import FeedbackButton from '../Components/FeedbackButton/FeedbackButton';
import { NotificationProvider } from '../Context/NotificationContext';

const DashboardLayout = () => {
    const { t } = useTranslation();
    const { role, roleLoading } = UseRole();
    const { user, logout, loading } = UseAuth();
    const { getUserInfo } = UseUserManagement();
    const { theme, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userStatus, setUserStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);

    // Initialize sync service for dashboard users with error handling
    try {
        UseSyncService();
    } catch (error) {
        console.error('Error initializing sync service in dashboard:', error);
    }

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

    const handleSignOut = () => {
        logout()
            .then(() => {
                toast.success(t('dashboard.logoutSuccess'));
                // Force navigation to home page
                window.location.href = '/';
            })
            .catch((error) => {
                console.error('Logout error:', error);
                toast.error(t('dashboard.logoutError'));
            });
    }

    const activeLink = "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02] rounded-2xl transition-all duration-300";
    const normalLink = "text-base-content/50 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all duration-200";

    if (loading || statusLoading || roleLoading) {
        return <Loader />;
    }

    return (
        <NotificationProvider>
            <div className="drawer xl:drawer-open">
                <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col min-h-screen bg-base-100 overflow-x-hidden">
                {/* Status Banners */}
                {userStatus && !userStatus.isEmailVerified && (
                    <div className="bg-warning text-warning-content p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Mail className="w-5 h-5" />
                            <span className="font-semibold">{t('dashboard.emailVerificationRequired')}</span>
                            <Link to="/auth/verify-email" className="underline hover:no-underline ml-2">
                                {t('dashboard.verifyNow')}
                            </Link>
                        </div>
                    </div>
                )}

                {userStatus && !userStatus.isActive && (
                    <div className="bg-error text-error-content p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">{t('dashboard.accountInactiveMessage')}</span>
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
                            <p className="text-xs md:text-sm font-black text-neutral italic uppercase tracking-tighter truncate max-w-[120px] md:max-w-none">Dashboard</p>
                        </div>
                    </div>
                    <div className="flex gap-10 items-center">
                        {/* Language Toggle */}
                        <LanguageToggle />

                        {/* Theme Toggle */}
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
                        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                            <div className="bg-base-200 rounded-2xl shadow-sm group-hover:rotate-12 transition-transform border border-base-300/10 flex-shrink-0">
                                <img src={DashboardIMG} alt="Logo" className="w-12 h-12 object-contain" />
                            </div>
                            <span className="text-lg xl:text-xl font-black tracking-tighter text-neutral italic whitespace-nowrap">
                                SEU <span className="text-primary">Matrimony</span>
                            </span>
                        </Link>
                        <label htmlFor="mobile-drawer" className="xl:hidden btn btn-ghost btn-circle btn-sm text-error">
                            <X size={20} />
                        </label>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide">
                        {/* 1. Main Menu */}
                        <ul className="menu p-0 w-full space-y-1.5">
                            <p className={`text-[10px] font-black text-base-content/20 uppercase tracking-[0.3em] my-4 px-4 italic ${isCollapsed ? "hidden" : "block"}`}>{t('dashboard.mainMenu')}</p>
                            <SidebarItem to="/" icon={<Home size={20} />} label={t('dashboard.landingHome')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label={t('dashboard.overview')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} end />
                            <SidebarItem to="/dashboard/friends" icon={<Users size={20} />} label={t('dashboard.friends')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            <SidebarItem to="/dashboard/my-feedbacks" icon={<MessageSquare size={20} />} label={t('dashboard.myFeedbacks')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            <SidebarItem to="/dashboard/biodata-form" icon={<FileText size={20} />} label={t('dashboard.biodataForm')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            <SidebarItem to="/dashboard/account-settings" icon={<Settings size={20} />} label={t('dashboard.settings')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                        </ul>

                        {/* 2. Admin Panel */}
                        {role === 'admin' && (
                            <ul className="menu p-0 w-full space-y-1.5 mt-6">
                                {!isCollapsed && (
                                    <div className="flex items-center justify-between px-4 mb-2">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-50 italic">
                                            {t('dashboard.adminPanel')}
                                        </p>
                                    </div>
                                )}

                                <SidebarItem to="/dashboard/admin/pending-biodatas" icon={<Clock size={20} />} label={t('dashboard.pendingBiodatas')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                                <SidebarItem to="/dashboard/admin/user-management" icon={<Users size={20} />} label={t('dashboard.userManagement')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                                <SidebarItem to="/dashboard/admin/analytics" icon={<Shield size={20} />} label={t('dashboard.analytics')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                                <SidebarItem to="/dashboard/admin/success-stories" icon={<Heart size={20} />} label={t('dashboard.successStories')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                                <SidebarItem to="/dashboard/admin/feedbacks" icon={<MessageSquare size={20} />} label={t('dashboard.feedbacks')} isCollapsed={isCollapsed} activeLink={activeLink} normalLink={normalLink} />
                            </ul>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 md:p-6 border-t border-base-300/10 bg-base-100 shrink-0 space-y-3">
                        <button onClick={() => setIsCollapsed(!isCollapsed)} className="btn btn-ghost w-full justify-start gap-4 text-base-content/40 hover:text-primary rounded-2xl hidden xl:flex px-4 border-none transition-all duration-300">
                            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                            {!isCollapsed && <span className="font-bold uppercase text-[10px] tracking-widest">{t('dashboard.collapseView')}</span>}
                        </button>
                        <button onClick={handleSignOut} className="btn bg-error/10 border-none hover:bg-error hover:text-white w-full justify-start gap-4 text-error rounded-2xl transition-all duration-300 px-4">
                            <MdLogout size={20} className="shrink-0" />
                            {!isCollapsed && <span className="font-black uppercase text-[10px] tracking-widest">{t('dashboard.logout')}</span>}
                        </button>
                    </div>
                </aside>
            </div>

            {/* Sync Status Indicator */}
            <SyncStatus />
            
            {/* Feedback Button */}
            <FeedbackButton />
        </div>
        </NotificationProvider>
    );
};

// Sidebar Item Component
const SidebarItem = ({ to, icon, label, isCollapsed, activeLink, normalLink, end = false }) => (
    <li className="w-full">
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `flex items-center gap-4 py-3.5 px-4 w-full transition-all duration-500 no-underline ${isActive ? activeLink : normalLink
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