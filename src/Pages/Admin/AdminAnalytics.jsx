import { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Calendar, 
    Download, 
    Filter,
    Users,
    FileText,
    Heart,
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
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
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
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label="ড্যাশবোর্ডে ফিরে যান" />
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral flex items-center gap-3">
                                <BarChart3 className="w-8 h-8 text-primary" />
                                অ্যানালিটিক্স ও রিপোর্ট
                            </h1>
                            <p className="text-neutral/70 mt-2">বিস্তারিত ডেটা বিশ্লেষণ এবং ট্রেন্ড</p>
                        </div>
                        
                        <button
                            onClick={exportReport}
                            className="bg-primary text-base-100 px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            রিপোর্ট ডাউনলোড
                        </button>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-neutral">তারিখ পরিসীমা:</span>
                        </div>
                        
                        <div className="flex gap-4">
                            <div>
                                <label className="block text-sm text-neutral/70 mb-1">শুরুর তারিখ</label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                                    className="bg-base-100 border border-base-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral/70 mb-1">শেষ তারিখ</label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                                    className="bg-base-100 border border-base-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-base-200 p-2 rounded-3xl shadow-lg mb-8">
                    <div className="flex gap-2">
                        {[
                            { id: 'overview', label: 'ওভারভিউ', icon: BarChart3 },
                            { id: 'trends', label: 'ট্রেন্ড', icon: TrendingUp },
                            { id: 'demographics', label: 'ডেমোগ্রাফিক্স', icon: Users },
                            { id: 'geography', label: 'ভৌগোলিক', icon: MapPin }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-base-100'
                                        : 'text-neutral hover:bg-base-100'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* User vs Biodata Registration */}
                        <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                            <h3 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                ইউজার ও বায়োডাটা রেজিস্ট্রেশন তুলনা
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
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
                )}

                {activeTab === 'trends' && (
                    <div className="space-y-8">
                        {/* User Registration Trends */}
                        <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                            <h3 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                ইউজার রেজিস্ট্রেশন ট্রেন্ড
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={formatTrendData(reportData.userTrends)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#3B82F6" 
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                                        name="নতুন ইউজার"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Biodata Submission Trends */}
                        <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                            <h3 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                বায়োডাটা সাবমিশন ট্রেন্ড
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={formatTrendData(reportData.biodataTrends)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar 
                                        dataKey="count" 
                                        fill="#10B981" 
                                        radius={[4, 4, 0, 0]}
                                        name="নতুন বায়োডাটা"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeTab === 'demographics' && (
                    <div className="space-y-8">
                        {/* Department Distribution */}
                        <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                            <h3 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                ডিপার্টমেন্ট অনুযায়ী বিতরণ
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={reportData.departmentStats} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis 
                                        dataKey="_id" 
                                        type="category" 
                                        width={150}
                                        fontSize={12}
                                    />
                                    <Tooltip />
                                    <Bar 
                                        dataKey="count" 
                                        fill="#3B82F6" 
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeTab === 'geography' && (
                    <div className="space-y-8">
                        {/* District Distribution */}
                        <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                            <h3 className="text-xl font-bold text-neutral mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                জেলা অনুযায়ী বিতরণ
                            </h3>
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Bar Chart */}
                                <div>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={reportData.districtStats}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="_id" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                                fontSize={12}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar 
                                                dataKey="count" 
                                                fill="#10B981" 
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Pie Chart */}
                                <div>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.districtStats}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {reportData.districtStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 p-6 rounded-3xl shadow-lg border border-blue-200/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/20 p-3 rounded-2xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">
                                    {reportData.userTrends.reduce((sum, item) => sum + item.count, 0)}
                                </h3>
                                <p className="text-neutral/70 text-sm">নতুন ইউজার</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 p-6 rounded-3xl shadow-lg border border-green-200/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500/20 p-3 rounded-2xl">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">
                                    {reportData.biodataTrends.reduce((sum, item) => sum + item.count, 0)}
                                </h3>
                                <p className="text-neutral/70 text-sm">নতুন বায়োডাটা</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 p-6 rounded-3xl shadow-lg border border-purple-200/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500/20 p-3 rounded-2xl">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">
                                    {reportData.departmentStats.length}
                                </h3>
                                <p className="text-neutral/70 text-sm">সক্রিয় ডিপার্টমেন্ট</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 p-6 rounded-3xl shadow-lg border border-orange-200/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-2xl">
                                <MapPin className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral">
                                    {reportData.districtStats.length}
                                </h3>
                                <p className="text-neutral/70 text-sm">প্রতিনিধিত্বকারী জেলা</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;