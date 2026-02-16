import { useState, useEffect } from "react";
import {
    Menu, X, LogOut, LayoutDashboard, ChevronRight,
    User, ChevronDown, Settings, Heart, Sun, Moon
} from "lucide-react";
import logo from "../../assets/Logo.png";
import { Link, NavLink } from "react-router";
import UseAuth from "../../Hooks/UseAuth";
import toast from "react-hot-toast";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import { useTranslation } from "react-i18next";

const Navbar = () => {
    const { user, logout } = UseAuth();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    useEffect(() => {
        // স্ক্রল হ্যান্ডলার
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        // থিম অ্যাপ্লাই করা
        document.querySelector('html').setAttribute('data-theme', theme);
        localStorage.setItem("theme", theme);

        // মোবাইল সাইডবার ওপেন থাকলে স্ক্রল লক করার লজিক
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
            document.body.style.overflow = "auto"; // ক্লিনআপ
        };
    }, [theme, open]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const handleSignOut = () => {
        logout()
            .then(() => {
                toast.success(t('messages.success.logoutSuccess'));
                // Force navigation to home page
                window.location.href = '/';
            })
            .catch((error) => {
                console.error('Logout error:', error);
                toast.error("লগআউট করতে সমস্যা হয়েছে");
            });
        setOpen(false);
        setDropdownOpen(false);
    }

    const publicLinks = [
        { name: t('nav.home'), path: "/" },
        { name: t('nav.stories'), path: "/success-stories" },
        { name: t('nav.guidelines'), path: "/guidelines" },
    ];

    const privateLinks = [
        ...publicLinks,
        { name: t('nav.browseMatches'), path: "/browse-matches" },
        { name: t('nav.requests'), path: "/my-requests" },
        { name: t('nav.messages'), path: "/messages" },
    ];

    const navLinks = user ? privateLinks : publicLinks;

    // একটিভ লিঙ্ক স্টাইল (আপনার থিম ভেরিয়েবল অনুযায়ী)
    const linkStyles = ({ isActive }) =>
        `px-2.5 xl:px-3 py-2 rounded-full transition-all duration-300 font-bold text-[10px] xl:text-[11px] uppercase tracking-wider flex items-center gap-1 whitespace-nowrap ${isActive
            ? "bg-primary text-neutral shadow-lg shadow-primary/30"
            : "text-base-content/70 hover:text-primary hover:bg-primary/5"
        }`;

    return (
        <nav className={`w-full fixed top-0 left-0 transition-all duration-300 z-[100] ${scrolled
                ? "bg-base-100 py-2 shadow-lg border-b border-base-300/10"
                : "bg-base-100 py-4"
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center min-h-[60px]">

                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="bg-base-200 rounded-2xl shadow-sm group-hover:rotate-12 transition-transform border border-base-300/10 flex-shrink-0">
                            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <span className="text-lg xl:text-xl font-black tracking-tighter text-neutral italic whitespace-nowrap">
                            SEU <span className="text-primary">Matrimony</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-base-200/50 rounded-full p-1 border border-base-300/10 flex-shrink min-w-0 overflow-hidden">
                        {navLinks.map((link) => (
                            <NavLink key={link.path} to={link.path} className={linkStyles}>
                                <span className="whitespace-nowrap truncate">{link.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
                        {/* Language Toggle */}
                        <LanguageToggle className="scale-90 xl:scale-100" />

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 bg-base-200 rounded-full border border-base-300/10 text-neutral hover:text-primary transition-all active:scale-90 shadow-sm flex-shrink-0"
                        >
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {user ? (
                            <div className="relative flex items-center gap-2 xl:gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 p-1 pr-3 bg-base-200 rounded-full border border-base-300/10 hover:shadow-md transition-all active:scale-95 flex-shrink-0"
                                    >
                                        <img
                                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`}
                                            className="w-9 h-9 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
                                            alt="User"
                                        />
                                        <ChevronDown size={16} className={`text-base-content transition-transform flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-base-100 rounded-[2rem] shadow-2xl border border-base-300/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="px-3 pb-3 border-b border-base-300/10">
                                                <p className="font-black text-neutral truncate">{user?.displayName}</p>
                                                <p className="text-[10px] text-base-content/50 font-bold uppercase truncate">{user?.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-base-content font-bold text-sm transition-all group">
                                                    <LayoutDashboard size={18} className="group-hover:text-primary" /> {t('nav.dashboard')}
                                                </Link>
                                                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-base-content font-bold text-sm transition-all group">
                                                    <User size={18} className="group-hover:text-primary" /> {t('nav.profile')}
                                                </Link>
                                            </div>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-error text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                                            >
                                                <LogOut size={16} /> {t('nav.logout')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Link to="/auth/login" className="px-4 xl:px-6 py-2.5 text-sm font-black text-base-content uppercase tracking-widest hover:text-primary transition-all whitespace-nowrap">{t('nav.login')}</Link>
                                <Link to="/auth/register" className="bg-primary text-neutral px-5 xl:px-7 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 border-none whitespace-nowrap">{t('nav.register')}</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle Icons */}
                    <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
                        <LanguageToggle className="scale-75 sm:scale-90" />
                        <button onClick={toggleTheme} className="p-2 text-neutral hover:bg-base-200 rounded-xl transition-colors flex-shrink-0">
                            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button onClick={() => setOpen(!open)} className="p-2 text-neutral hover:bg-base-200 rounded-xl transition-colors flex-shrink-0">
                            {open ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay (স্ক্রল লক থাকায় এটি আরও স্মুথ হবে) */}
            <div className={`fixed inset-0 bg-neutral/20 backdrop-blur-md z-[110] lg:hidden transition-opacity duration-500 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setOpen(false)} />

            <aside className={`fixed top-0 right-0 h-full w-[300px] bg-base-100 z-[120] lg:hidden transform transition-transform duration-500 border-l border-base-300/10 shadow-2xl ${open ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10 pb-4 border-b border-base-300/10">
                        <span className="font-black text-base-content/40 uppercase tracking-[0.2em] text-xs">Menu Navigation</span>
                        <div onClick={() => setOpen(false)} className="p-2 bg-base-200 rounded-full cursor-pointer text-neutral hover:text-primary transition-colors"><X size={20} /></div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <NavLink key={link.path} to={link.path} onClick={() => setOpen(false)} className="flex justify-between items-center p-4 rounded-2xl hover:bg-primary/10 text-neutral font-black uppercase text-[11px] tracking-widest group transition-all border border-transparent hover:border-primary/20">
                                {link.name} <ChevronRight size={16} className="text-base-content/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </NavLink>
                        ))}
                    </div>

                    <div className="mt-auto">
                        {user ? (
                            <div className="bg-base-200 p-6 rounded-[2.5rem] border border-base-300/10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img src={user?.photoURL} className="w-14 h-14 rounded-2xl border-2 border-primary/20 shadow-xl object-cover" alt="" />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-200"></div>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-black text-neutral truncate leading-none mb-1 text-sm italic">{user?.displayName}</p>
                                        <p className="text-[9px] text-base-content/50 font-bold uppercase tracking-tighter truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-3 bg-base-100 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-neutral shadow-sm border border-base-300/10">
                                        <LayoutDashboard size={14} /> {t('nav.dashboard')}
                                    </Link>
                                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-3 bg-base-100 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-neutral shadow-sm border border-base-300/10">
                                        <User size={14} /> {t('nav.profile')}
                                    </Link>
                                    <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-4 bg-error text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-error/20 border-none">
                                        <LogOut size={14} /> {t('nav.logout')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/auth/login" onClick={() => setOpen(false)} className="w-full text-center py-4 bg-base-200 rounded-2xl font-black text-xs uppercase tracking-widest text-neutral border border-base-300/10">{t('nav.login')}</Link>
                                <Link to="/auth/register" onClick={() => setOpen(false)} className="w-full text-center py-4 bg-primary text-neutral rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 border-none">{t('nav.register')}</Link>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </nav>
    );
};

export default Navbar;