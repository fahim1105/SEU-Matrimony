import { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Calendar, 
    Download,
    Users,
    FileText,
    MapPin
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
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { format, subDays } from 'date-fns';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
    const [reportData, setReportData] = useState({
        userTrends: [],
        biodataTrends: [],
        departmentStats: [],
        districtStats: []
    });
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get('/admin/detailed-report', {
                params: dateRange
            });
            
            if (response.data.success) {
                setReportData(response.data.report);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('রিপোর্ট ডেটা লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const exportReport = () => {
        // Create CSV data
        const csvData = [
            ['Department', 'Count'],
            ...reportData.departmentStats.map(item => [item._id, item.count])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('রিপোর্ট ডাউনলোড হয়েছে');
    };

    const formatTrendData = (trends) => {
        return trends.map(item => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            count: item.count
        }));
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70">অ্যানালিটিক্স লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header - Mobile Optimized */}
                <div className="mb-6 sm:mb-8">
                    <BackButton to="/dashboard" label="ড্যাশবোর্ডে ফিরে যান" />
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral flex items-center gap-2 sm:gap-3">
                                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                <span className="break-words">অ্যানালিটিক্স ও রিপোর্ট</span>
                            </h1>
                            <p className="text-neutral/70 mt-1 sm:mt-2 text-sm sm:text-base">বিস্তারিত ডেটা বিশ্লেষণ এবং ট্রেন্ড</p>
                        </div>
                        
                        <button
                            onClick={exportReport}
                            className="bg-primary text-base-100 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <Download className="w-4 h-4" />
                            রিপোর্ট ডাউনলোড
                        </button>
                    </div>
                </div>

                {/* Date Range Filter - Mobile Optimized */}
                <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg mb-6 sm:mb-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <span className="font-semibold text-neutral text-sm sm:text-base">তারিখ পরিসীমা:</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm text-neutral/70 mb-1">শুরুর তারিখ</label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                                    className="w-full bg-base-100 border border-base-300 rounded-lg sm:rounded-xl px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm text-neutral/70 mb-1">শেষ তারিখ</label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                                    className="w-full bg-base-100 border border-base-300 rounded-lg sm:rounded-xl px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Mobile Optimized */}
                <div className="bg-base-200 p-2 rounded-2xl sm:rounded-3xl shadow-lg mb-6 sm:mb-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2">
                        {[
                            { id: 'overview', label: 'ওভারভিউ', icon: BarChart3 },
                            { id: 'trends', label: 'ট্রেন্ড', icon: TrendingUp },
                            { id: 'demographics', label: 'ডেমোগ্রাফিক্স', icon: Users },
                            { id: 'geography', label: 'ভৌগোলিক', icon: MapPin }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-base-100'
                                        : 'text-neutral hover:bg-base-100'
                                }`}
                            >
                                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-center leading-tight">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 sm:space-y-8">
                        {/* User vs Biodata Registration */}
                        <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6 flex items-center gap-2">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                <span className="break-words">ইউজার ও বায়োডাটা রেজিস্ট্রেশন তুলনা</span>
                            </h3>
                            <div className="h-64 sm:h-80 lg:h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="month" 
                                            fontSize={10}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))',
                                                border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend 
                                            wrapperStyle={{ fontSize: '12px' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="users" 
                                            stackId="1"
                                            stroke="#3B82F6" 
                                            fill="#3B82F6" 
                                            fillOpacity={0.6}
                                            name="ইউজার রেজিস্ট্রেশন"
                                            data={formatTrendData(reportData.userTrends)}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="biodatas" 
                                            stackId="1"
                                            stroke="#10B981" 
                                            fill="#10B981" 
                                            fillOpacity={0.6}
                                            name="বায়োডাটা সাবমিশন"
                                            data={formatTrendData(reportData.biodataTrends)}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'trends' && (
                    <div className="space-y-6 sm:space-y-8">
                        {/* User Registration Trends */}
                        <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                <span className="break-words">ইউজার রেজিস্ট্রেশন ট্রেন্ড</span>
                            </h3>
                            <div className="h-64 sm:h-80 lg:h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={formatTrendData(reportData.userTrends)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="month" 
                                            fontSize={10}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))',
                                                border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Line 
                                            type="monotone" 
                                            dataKey="count" 
                                            stroke="#3B82F6" 
                                            strokeWidth={2}
                                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            name="নতুন ইউজার"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Biodata Submission Trends */}
                        <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6 flex items-center gap-2">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                <span className="break-words">বায়োডাটা সাবমিশন ট্রেন্ড</span>
                            </h3>
                            <div className="h-64 sm:h-80 lg:h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={formatTrendData(reportData.biodataTrends)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="month" 
                                            fontSize={10}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))',
                                                border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Bar 
                                            dataKey="count" 
                                            fill="#10B981" 
                                            radius={[2, 2, 0, 0]}
                                            name="নতুন বায়োডাটা"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'demographics' && (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Department Distribution */}
                        <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6 flex items-center gap-2">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                <span className="break-words">ডিপার্টমেন্ট অনুযায়ী বিতরণ</span>
                            </h3>
                            <div className="h-64 sm:h-80 lg:h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.departmentStats} layout="horizontal">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" fontSize={10} />
                                        <YAxis 
                                            dataKey="_id" 
                                            type="category" 
                                            width={80}
                                            fontSize={8}
                                            interval={0}
                                        />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))',
                                                border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Bar 
                                            dataKey="count" 
                                            fill="#3B82F6" 
                                            radius={[0, 2, 2, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'geography' && (
                    <div className="space-y-6 sm:space-y-8">
                        {/* District Distribution */}
                        <div className="bg-base-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4 sm:mb-6 flex items-center gap-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                <span className="break-words">জেলা অনুযায়ী বিতরণ</span>
                            </h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                                {/* Bar Chart */}
                                <div className="h-64 sm:h-80 lg:h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.districtStats}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="_id" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                fontSize={8}
                                                interval={0}
                                            />
                                            <YAxis fontSize={10} />
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))',
                                                    border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Bar 
                                                dataKey="count" 
                                                fill="#10B981" 
                                                radius={[2, 2, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Pie Chart */}
                                <div className="h-64 sm:h-80 lg:h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={reportData.districtStats}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius="80%"
                                                fill="#8884d8"
                                                dataKey="count"
                                                fontSize={10}
                                            >
                                                {reportData.districtStats.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))',
                                                    border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Cards - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-blue-200/20">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xl sm:text-2xl font-bold text-neutral truncate">
                                    {reportData.userTrends.reduce((sum, item) => sum + item.count, 0)}
                                </h3>
                                <p className="text-neutral/70 text-xs sm:text-sm">নতুন ইউজার</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-green-200/20">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-green-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xl sm:text-2xl font-bold text-neutral truncate">
                                    {reportData.biodataTrends.reduce((sum, item) => sum + item.count, 0)}
                                </h3>
                                <p className="text-neutral/70 text-xs sm:text-sm">নতুন বায়োডাটা</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-purple-200/20">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-purple-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xl sm:text-2xl font-bold text-neutral truncate">
                                    {reportData.departmentStats.length}
                                </h3>
                                <p className="text-neutral/70 text-xs sm:text-sm">সক্রিয় ডিপার্টমেন্ট</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-orange-200/20">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-orange-500/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xl sm:text-2xl font-bold text-neutral truncate">
                                    {reportData.districtStats.length}
                                </h3>
                                <p className="text-neutral/70 text-xs sm:text-sm">প্রতিনিধিত্বকারী জেলা</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;