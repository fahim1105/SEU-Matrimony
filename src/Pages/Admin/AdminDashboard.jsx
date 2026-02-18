import { useState, useEffect } from 'react';
import { 
    Users, 
    UserCheck, 
    UserX, 
    FileText, 
    CheckCircle, 
    Clock, 
    TrendingUp,
    Heart,
    MessageCircle,
    Shield,
    BarChart3,
    PieChart,
    Calendar
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import AdminNavigation from '../../Components/Admin/AdminNavigation';
import BackButton from '../../Components/BackButton/BackButton';
import LoveLoader from '../../Components/LoveLoader/LoveLoader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalBiodata: 0,
        approvedBiodata: 0,
        pendingBiodata: 0,
        totalMale: 0,
        totalFemale: 0,
        totalUsers: 0,
        verifiedUsers: 0,
        activeUsers: 0,
        totalRequests: 0,
        acceptedRequests: 0
    });
    const [chartData, setChartData] = useState([]);
    const [genderData, setGenderData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        fetchAdminStats();
        fetchChartData();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const response = await axiosSecure.get('/admin-stats');
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            toast.error('স্ট্যাটিস্টিক্স লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchChartData = async () => {
        try {
            // Fetch additional data for charts
            const [biodataResponse, departmentResponse] = await Promise.all([
                axiosSecure.get('/all-biodata'),
                axiosSecure.get('/department-stats') // We'll need to create this endpoint
            ]);

            if (biodataResponse.data) {
                const biodatas = biodataResponse.data;
                
                // Gender distribution
                const maleCount = biodatas.filter(b => b.gender === 'Male').length;
                const femaleCount = biodatas.filter(b => b.gender === 'Female').length;
                
                setGenderData([
                    { name: 'পুরুষ', value: maleCount, color: '#3B82F6' },
                    { name: 'মহিলা', value: femaleCount, color: '#EC4899' }
                ]);

                // Department distribution (top 6)
                const deptCounts = {};
                biodatas.forEach(b => {
                    if (b.department) {
                        deptCounts[b.department] = (deptCounts[b.department] || 0) + 1;
                    }
                });
                
                const deptData = Object.entries(deptCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([dept, count]) => ({
                        department: dept.length > 15 ? dept.substring(0, 15) + '...' : dept,
                        count: count
                    }));
                
                setDepartmentData(deptData);

                // Monthly registration data (last 6 months)
                const monthlyStats = [];
                for (let i = 5; i >= 0; i--) {
                    const date = subDays(new Date(), i * 30);
                    const monthStart = startOfMonth(date);
                    const monthEnd = endOfMonth(date);
                    
                    const monthlyBiodatas = biodatas.filter(b => {
                        const submittedDate = new Date(b.submittedAt);
                        return submittedDate >= monthStart && submittedDate <= monthEnd;
                    }).length;
                    
                    monthlyStats.push({
                        month: format(date, 'MMM'),
                        biodatas: monthlyBiodatas,
                        users: Math.floor(monthlyBiodatas * 1.2) // Approximate users
                    });
                }
                
                setMonthlyData(monthlyStats);
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (loading) {
        return <LoveLoader />;
    }

    return (
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label="ড্যাশবোর্ডে ফিরে যান" />
                    <h1 className="text-3xl font-bold text-neutral mb-2 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        এডমিন ড্যাশবোর্ড
                    </h1>
                    <p className="text-neutral/70">সিস্টেম ওভারভিউ এবং রিপোর্ট</p>
                </div>

                {/* Admin Navigation */}
                <AdminNavigation />

                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 p-6 rounded-3xl shadow-lg border border-blue-200/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/20 p-3 rounded-2xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{stats.totalUsers}</h3>
                                <p className="text-neutral/70 text-sm">মোট ইউজার</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 p-6 rounded-3xl shadow-lg border border-green-200/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500/20 p-3 rounded-2xl">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{stats.verifiedUsers}</h3>
                                <p className="text-neutral/70 text-sm">ভেরিফাইড ইউজার</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 p-6 rounded-3xl shadow-lg border border-purple-200/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500/20 p-3 rounded-2xl">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{stats.totalBiodata}</h3>
                                <p className="text-neutral/70 text-sm">মোট বায়োডাটা</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 p-6 rounded-3xl shadow-lg border border-orange-200/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-2xl">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">{stats.pendingBiodata}</h3>
                                <p className="text-neutral/70 text-sm">পেন্ডিং বায়োডাটা</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-success/20 p-3 rounded-2xl">
                                <CheckCircle className="w-6 h-6 text-success" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral">{stats.approvedBiodata}</h3>
                                <p className="text-neutral/70 text-sm">অনুমোদিত বায়োডাটা</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-info/20 p-3 rounded-2xl">
                                <Heart className="w-6 h-6 text-info" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral">{stats.totalRequests}</h3>
                                <p className="text-neutral/70 text-sm">মোট রিকোয়েস্ট</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-warning/20 p-3 rounded-2xl">
                                <MessageCircle className="w-6 h-6 text-warning" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral">{stats.acceptedRequests}</h3>
                                <p className="text-neutral/70 text-sm">গৃহীত রিকোয়েস্ট</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Gender Distribution */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h3 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" />
                            জেন্ডার বিতরণ
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Department Distribution */}
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h3 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            ডিপার্টমেন্ট বিতরণ
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={departmentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="department" 
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={12}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Trends */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <h3 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        মাসিক ট্রেন্ড (শেষ ৬ মাস)
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="biodatas" 
                                stackId="1"
                                stroke="#3B82F6" 
                                fill="#3B82F6" 
                                fillOpacity={0.6}
                                name="বায়োডাটা"
                            />
                            <Area 
                                type="monotone" 
                                dataKey="users" 
                                stackId="1"
                                stroke="#10B981" 
                                fill="#10B981" 
                                fillOpacity={0.6}
                                name="ইউজার"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Stats Summary */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-3xl shadow-lg border border-primary/20">
                    <h3 className="text-xl font-bold text-neutral mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        আজকের সারসংক্ষেপ
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{stats.activeUsers}</div>
                            <div className="text-sm text-neutral/70">সক্রিয় ইউজার</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-success">{stats.approvedBiodata}</div>
                            <div className="text-sm text-neutral/70">অনুমোদিত প্রোফাইল</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-warning">{stats.pendingBiodata}</div>
                            <div className="text-sm text-neutral/70">পেন্ডিং রিভিউ</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-info">
                                {stats.totalRequests > 0 ? Math.round((stats.acceptedRequests / stats.totalRequests) * 100) : 0}%
                            </div>
                            <div className="text-sm text-neutral/70">সাকসেস রেট</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;