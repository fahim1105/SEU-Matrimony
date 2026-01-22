import { Link, useLocation } from 'react-router';
import { 
    BarChart3, 
    Clock, 
    Users, 
    Shield, 
    TrendingUp,
    FileText
} from 'lucide-react';

const AdminNavigation = () => {
    const location = useLocation();

    const adminNavItems = [
        { 
            path: '/admin/dashboard', 
            icon: BarChart3, 
            label: 'ড্যাশবোর্ড',
            description: 'সিস্টেম ওভারভিউ'
        },
        { 
            path: '/admin/pending-biodatas', 
            icon: Clock, 
            label: 'পেন্ডিং বায়োডাটা',
            description: 'অনুমোদনের অপেক্ষায়'
        },
        { 
            path: '/admin/user-management', 
            icon: Users, 
            label: 'ইউজার ম্যানেজমেন্ট',
            description: 'ইউজার পরিচালনা'
        },
        { 
            path: '/admin/analytics', 
            icon: TrendingUp, 
            label: 'অ্যানালিটিক্স',
            description: 'রিপোর্ট ও বিশ্লেষণ'
        }
    ];

    return (
        <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-neutral">এডমিন প্যানেল</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`p-4 rounded-2xl transition-all hover:scale-105 ${
                                isActive 
                                    ? 'bg-primary text-base-100 shadow-lg' 
                                    : 'bg-base-100 text-neutral hover:bg-base-300'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Icon className="w-5 h-5" />
                                <span className="font-semibold">{item.label}</span>
                            </div>
                            <p className={`text-sm ${
                                isActive ? 'text-base-100/80' : 'text-neutral/70'
                            }`}>
                                {item.description}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminNavigation;