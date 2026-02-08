import { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Calendar, 
    Download,
    Users,
    FileText,
    MapPin,
    Activity,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Eye,
    RefreshCw,
    Filter,
    ArrowUp,
    ArrowDown
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
    Area,
    ComposedChart
} from 'recharts';
import { format, subDays } from 'date-fns';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AdminAnalytics = () => {
    const { t } = useTranslation();
    const [reportData, setReportData] = useState({
        userTrends: [],
        biodataTrends: [],
        departmentStats: [],
        districtStats: [],
        totalUsers: 0,
        totalBiodatas: 0,
        pendingBiodatas: 0,
        approvedBiodatas: 0
    });
    const [dateRange, setDateRange] = useState({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);
    
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        
        try {
            const response = await axiosSecure.get('/admin/detailed-report', {
                params: dateRange
            });
            
            if (response.data.success) {
                // Ensure all arrays are defined
                const report = response.data.report || {};
                setReportData({
                    userTrends: report.userTrends || [],
                    biodataTrends: report.biodataTrends || [],
                    departmentStats: report.departmentStats || [],
                    districtStats: report.districtStats || [],
                    totalUsers: report.totalUsers || 0,
                    totalBiodatas: report.totalBiodatas || 0,
                    pendingBiodatas: report.pendingBiodatas || 0,
                    approvedBiodatas: report.approvedBiodatas || 0
                });
                if (showRefresh) toast.success(t('admin.dataUpdated'));
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            // Set empty data on error
            setReportData({
                userTrends: [],
                biodataTrends: [],
                departmentStats: [],
                districtStats: [],
                totalUsers: 0,
                totalBiodatas: 0,
                pendingBiodatas: 0,
                approvedBiodatas: 0
            });
            toast.error(t('messages.error.loadError'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const exportReport = () => {
        const departmentStats = reportData.departmentStats || [];
        const csvData = [
            ['Department', 'Count'],
            ...departmentStats.map(item => [item._id, item.count])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success(t('admin.reportDownloaded'));
    };

    const formatTrendData = (trends) => {
        if (!trends || !Array.isArray(trends)) return [];
        return trends.map(item => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            count: item.count,
            label: `${item._id.year}/${String(item._id.month).padStart(2, '0')}`
        }));
    };

    // Enhanced color schemes for better theme support
    const CHART_COLORS = {
        primary: '#3B82F6',
        secondary: '#10B981', 
        accent: '#F59E0B',
        error: '#EF4444',
        warning: '#F97316',
        info: '#06B6D4',
        success: '#22C55E',
        purple: '#8B5CF6'
    };

    const PIE_COLORS = [
        CHART_COLORS.primary,
        CHART_COLORS.secondary,
        CHART_COLORS.accent,
        CHART_COLORS.error,
        CHART_COLORS.warning,
        CHART_COLORS.info,
        CHART_COLORS.success,
        CHART_COLORS.purple
    ];

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-base-100 border border-base-300 rounded-xl p-3 shadow-xl">
                    <p className="font-semibold text-neutral mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Calculate growth percentages
    const calculateGrowth = (data) => {
        if (!data || !Array.isArray(data) || data.length < 2) return 0;
        const current = data[data.length - 1]?.count || 0;
        const previous = data[data.length - 2]?.count || 0;
        if (previous === 0) return 0;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    const userGrowth = calculateGrowth(reportData.userTrends || []);
    const biodataGrowth = calculateGrowth(reportData.biodataTrends || []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-neutral/70 font-medium">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-300/20 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <BackButton to="/dashboard" label={t('common.back')} />
                    <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-6 sm:p-8 border border-primary/20 shadow-xl backdrop-blur-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral flex items-center gap-3 mb-2">
                                    <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl shadow-lg">
                                        <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                    </div>
                                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        {t('admin.analyticsAndReports')}
                                    </span>
                                </h1>
                                <p className="text-neutral/70 text-lg font-medium">{t('admin.detailedDataAnalysis')}</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => fetchReportData(true)}
                                    disabled={refreshing}
                                    className="btn btn-outline btn-primary gap-2 rounded-xl"
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    {t('common.refresh')}
                                </button>
                                <button
                                    onClick={exportReport}
                                    className="btn btn-primary gap-2 rounded-xl shadow-lg"
                                >
                                    <Download className="w-4 h-4" />
                                    {t('common.export')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Date Range Filter */}
                <div className="bg-base-100/80 backdrop-blur-sm border border-base-300/50 p-6 rounded-3xl shadow-xl mb-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-xl">
                                <Filter className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-bold text-neutral text-lg">{t('admin.dataFilter')}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">{t('admin.startDate')}</span>
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                                    className="input input-bordered input-primary rounded-xl focus:shadow-lg transition-all"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">{t('admin.endDate')}</span>
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                                    className="input input-bordered input-primary rounded-xl focus:shadow-lg transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/30 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-2xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                userGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {userGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(userGrowth)}%
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-neutral mb-1">
                            {reportData.userTrends.reduce((sum, item) => sum + item.count, 0)}
                        </h3>
                        <p className="text-neutral/70 font-medium">{t('admin.newUsers')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-200/30 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-500/20 p-3 rounded-2xl">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                biodataGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {biodataGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(biodataGrowth)}%
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-neutral mb-1">
                            {reportData.biodataTrends.reduce((sum, item) => sum + item.count, 0)}
                        </h3>
                        <p className="text-neutral/70 font-medium">{t('admin.newBiodatas')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200/30 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-500/20 p-3 rounded-2xl">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-neutral mb-1">
                            {reportData.departmentStats.length}
                        </h3>
                        <p className="text-neutral/70 font-medium">{t('admin.activeDepartments')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-200/30 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-orange-500/20 p-3 rounded-2xl">
                                <MapPin className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-neutral mb-1">
                            {reportData.districtStats.length}
                        </h3>
                        <p className="text-neutral/70 font-medium">{t('admin.representedDistricts')}</p>
                    </div>
                </div>

                {/* Enhanced Navigation Tabs */}
                <div className="bg-base-100/80 backdrop-blur-sm border border-base-300/50 p-2 rounded-3xl shadow-xl mb-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {[
                            { id: 'overview', label: t('dashboard.overview'), icon: Eye, color: 'primary' },
                            { id: 'trends', label: t('admin.trends'), icon: TrendingUp, color: 'secondary' },
                            { id: 'demographics', label: t('admin.demographics'), icon: Users, color: 'secondary' },
                            { id: 'geography', label: t('admin.geography'), icon: MapPin, color: 'info' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-4 px-4 rounded-2xl font-bold transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? `bg-${tab.color} text-${tab.color}-content shadow-lg scale-105`
                                        : 'text-neutral hover:bg-base-200 hover:scale-102'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Combined Overview Chart */}
                        <div className="bg-base-100/80 backdrop-blur-sm border border-base-300/50 p-8 rounded-3xl shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary/20 p-3 rounded-2xl">
                                    <BarChart3 className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-neutral">{t('admin.overallPerformance')}</h3>
                            </div>
                            {formatTrendData(reportData.userTrends).length > 0 || formatTrendData(reportData.biodataTrends).length > 0 ? (
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={formatTrendData(reportData.userTrends)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                                            <XAxis 
                                                dataKey="label" 
                                                fontSize={12}
                                                stroke="currentColor"
                                                opacity={0.7}
                                            />
                                            <YAxis 
                                                fontSize={12}
                                                stroke="currentColor"
                                                opacity={0.7}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Area 
                                                type="monotone" 
                                                dataKey="count" 
                                                stroke={CHART_COLORS.primary}
                                                fill={CHART_COLORS.primary}
                                                fillOpacity={0.1}
                                                name={t('admin.userRegistration')}
                                            />
                                            <Bar 
                                                dataKey="count" 
                                                fill={CHART_COLORS.secondary}
                                                name={t('admin.biodataSubmission')}
                                                data={formatTrendData(reportData.biodataTrends)}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-96 flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                        <p className="text-neutral/70">{t('admin.noDataAvailable')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'trends' && (
                    <div className="space-y-8">
                        {/* User Registration Trends */}
                        <div className="bg-base-100/80 backdrop-blur-sm border border-base-300/50 p-8 rounded-3xl shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-500/20 p-3 rounded-2xl">
                                    <LineChartIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-black text-neutral">{t('admin.userRegistrationTrend')}</h3>
                            </div>
                            {formatTrendData(reportData.userTrends).length > 0 ? (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={formatTrendData(reportData.userTrends)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                                            <XAxis 
                                                dataKey="label" 
                                                fontSize={12}
                                                stroke="currentColor"
                                                opacity={0.7}
                                            />
                                            <YAxis 
                                                fontSize={12}
                                                stroke="currentColor"
                                                opacity={0.7}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line 
                                                type="monotone" 
                                                dataKey="count" 
                                                stroke={CHART_COLORS.primary}
                                                strokeWidth={3}
                                                dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 6 }}
                                                activeDot={{ r: 8, stroke: CHART_COLORS.primary, strokeWidth: 2 }}
                                                name={t('admin.newUsers')}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center">
                                    <div className="text-center">
                                        <LineChartIcon className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                        <p className="text-neutral/70">{t('admin.noDataAvailable')}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Biodata Submission Trends */}
                        <div className="bg-base-100/80 backdrop-blur-sm border border-base-300/50 p-8 rounded-3xl shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-500/20 p-3 rounded-2xl">
                                    <BarChart3 className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-black text-neutral">{t('admin.biodataSubmissionTrend')}</h3>
                            </div>
                            {formatTrendData(reportData.biodataTrends).length > 0 ? (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={formatTrendData(reportData.biodataTrends)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                                            <XAxis 
                                                dataKey="label" 
                                                fontSize={12}
                                                stroke="currentColor"
                                                opacity={0.7}
                                            />
                                            <YAxis 
                                                fontSize={12}
                                                stroke="currentColor"
                                                opacity={0.7}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar 
                                                dataKey="count" 
                                                fill={CHART_COLORS.secondary}
                                                radius={[6, 6, 0, 0]}
                                                name={t('admin.newBiodatas')}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                        <p className="text-neutral/70">{t('admin.noDataAvailable')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'demographics' && (
                    <div className="space-y-8">
                        {/* Department Distribution */}
                        <div className="bg-base-100/80 backdrop-blur-sm border border-base-300/50 p-8 rounded-3xl shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-500/20 p-3 rounded-2xl">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-black text-neutral">{t('admin.departmentDistribution')}</h3>
                            </div>
                            {reportData.departmentStats && reportData.departmentStats.length > 0 ? (
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.departmentStats} layout="horizontal">
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                                            <XAxis 
                                                type="number" 
                                                fontSize={12}
                                                stroke="currentColor"
                                                opacity={0.7}
                                            />
                                            <YAxis 
                                                dataKey="_id" 
                                                type="category" 
                                                width={100}
                                                fontSize={11}
                                                stroke="currentColor"
                                                opacity={0.7}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar 
                                                dataKey="count" 
                                                fill={CHART_COLORS.accent}
                                                radius={[0, 6, 6, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-96 flex items-center justify-center">
                                    <div className="text-center">
                                        <Users className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                        <p className="text-neutral/70">{t('admin.noDataAvailable')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'geography' && (
                    <div className="space-y-8">
                        {/* District Distribution */}
                        <div className="bg-base-100/80 backdrop-blur-sm border border-base-300/50 p-8 rounded-3xl shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-orange-500/20 p-3 rounded-2xl">
                                    <MapPin className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-black text-neutral">{t('admin.districtDistribution')}</h3>
                            </div>
                            {reportData.districtStats && reportData.districtStats.length > 0 ? (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {/* Enhanced Bar Chart */}
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={reportData.districtStats}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                                                <XAxis 
                                                    dataKey="_id" 
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={80}
                                                    fontSize={10}
                                                    stroke="currentColor"
                                                    opacity={0.7}
                                                />
                                                <YAxis 
                                                    fontSize={12}
                                                    stroke="currentColor"
                                                    opacity={0.7}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar 
                                                    dataKey="count" 
                                                    fill={CHART_COLORS.info}
                                                    radius={[6, 6, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Enhanced Pie Chart */}
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={reportData.districtStats}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                                                    outerRadius="70%"
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                    fontSize={10}
                                                >
                                                    {reportData.districtStats.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-96 flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-16 h-16 text-neutral/30 mx-auto mb-4" />
                                        <p className="text-neutral/70">{t('admin.noDataAvailable')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;