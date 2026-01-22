import { useQuery } from "@tanstack/react-query";
import { 
    LineChart, Line, AreaChart, Area, BarChart, Bar, 
    CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, 
    Cell, PieChart, Pie, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis 
} from "recharts";
import UseAxiosSecure from "../../../Hooks/UseAxiosSecure";
import Loader from "../../../Components/Loader/Loader";
import { Users, GraduationCap, DollarSign, TrendingUp, PieChart as PieIcon, Activity, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const AdminAnalytics = () => {
    const axiosSecure = UseAxiosSecure();

    const { data: summary = {}, isLoading: isSummaryLoading } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: async () => {
            const res = await axiosSecure.get("/admin/analytics");
            return res.data;
        },
    });

    const { data: chartData = [], isLoading: isChartLoading } = useQuery({
        queryKey: ["application-stats"],
        queryFn: async () => {
            const res = await axiosSecure.get("/admin/application-stats");
            return res.data;
        },
    });

    const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

    const axisStyle = {
        fontSize: '9px', // মোবাইলের জন্য একটু ছোট করা হয়েছে
        fontWeight: '900',
        fontStyle: 'italic',
        fill: '#94a3b8',
        textTransform: 'uppercase'
    };

    if (isSummaryLoading || isChartLoading) return <Loader />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto mb-20 overflow-hidden"
        >
            {/* --- Header --- */}
            <div className="px-2">
                <h2 className="text-3xl md:text-6xl font-black text-neutral italic uppercase tracking-tighter flex items-center gap-3 md:gap-4 leading-none">
                    <div className="p-3 md:p-4 bg-primary/10 rounded-2xl md:rounded-[2rem] text-primary shadow-inner">
                        <Activity className="w-6 h-6 md:w-9 md:h-9" />
                    </div>
                    <span>System <span className="text-primary underline decoration-primary/10">Metrics</span></span>
                </h2>
                <p className="text-base-content/40 mt-3 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.4em] italic">Comprehensive platform data visualization</p>
            </div>

            {/* --- KPI CARDS (Grid Fix) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Users Card */}
                <div className="bg-base-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-base-300/10 relative overflow-hidden group">
                    <Users size={20} className="text-blue-500 mb-3 md:mb-4" />
                    <h3 className="text-[9px] md:text-[10px] font-black uppercase text-base-content/30 tracking-widest italic">Total Registered</h3>
                    <p className="text-3xl md:text-5xl font-black text-neutral mt-2 italic tracking-tighter">{summary.totalUsers?.toLocaleString() || 0}</p>
                    <Users size={100} className="absolute -right-4 -bottom-4 text-blue-500/5 group-hover:scale-110 transition-transform hidden sm:block" />
                </div>
                {/* Scholarship Card */}
                <div className="bg-base-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-base-300/10 relative overflow-hidden group">
                    <GraduationCap size={20} className="text-green-500 mb-3 md:mb-4" />
                    <h3 className="text-[9px] md:text-[10px] font-black uppercase text-base-content/30 tracking-widest italic">Total Scholarships</h3>
                    <p className="text-3xl md:text-5xl font-black text-neutral mt-2 italic tracking-tighter">{summary.totalScholarships?.toLocaleString() || 0}</p>
                    <GraduationCap size={100} className="absolute -right-4 -bottom-4 text-green-500/5 group-hover:scale-110 transition-transform hidden sm:block" />
                </div>
                {/* Fees Card */}
                <div className="bg-base-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-base-300/10 relative overflow-hidden group">
                    <DollarSign size={20} className="text-primary mb-3 md:mb-4" />
                    <h3 className="text-[9px] md:text-[10px] font-black uppercase text-base-content/30 tracking-widest italic">Revenue Stream</h3>
                    <p className="text-3xl md:text-5xl font-black text-neutral mt-2 italic tracking-tighter">${summary.totalFees?.toLocaleString() || 0}</p>
                    <DollarSign size={100} className="absolute -right-4 -bottom-4 text-primary/5 group-hover:scale-110 transition-transform hidden sm:block" />
                </div>
            </div>

            {/* --- GRAPHS GRID (Responsive Gap & Padding) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                
                {/* 1. AREA CHART */}
                <div className="bg-base-100 p-5 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-xl border border-base-300/10">
                    <div className="flex items-center gap-3 mb-6 md:mb-10">
                        <TrendingUp size={16} className="text-primary" />
                        <h3 className="text-[10px] md:text-xs font-black uppercase italic tracking-widest text-neutral">Growth Trend</h3>
                    </div>
                    
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ left: -25, right: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                <XAxis dataKey="category" tick={axisStyle} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: '900', fontSize: '12px'}} />
                                <Area type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={3} fill="url(#colorApps)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. PIE CHART */}
                <div className="bg-base-100 p-5 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-xl border border-base-300/10 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-6 md:mb-10 self-start">
                        <PieIcon size={16} className="text-purple-500" />
                        <h3 className="text-[10px] md:text-xs font-black uppercase italic tracking-widest text-neutral">User Segments</h3>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={summary.userRoleStats || []} 
                                    innerRadius="60%" 
                                    outerRadius="80%" 
                                    paddingAngle={5} 
                                    dataKey="value" 
                                    stroke="none"
                                >
                                    {(summary.userRoleStats || []).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '8px', fontWeight: '900', paddingTop: '20px'}} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. BAR CHART */}
                <div className="bg-base-100 p-5 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-xl border border-base-300/10">
                    <div className="flex items-center gap-3 mb-6 md:mb-10">
                        <BarChart3 size={16} className="text-orange-500" />
                        <h3 className="text-[10px] md:text-xs font-black uppercase italic tracking-widest text-neutral">Performance</h3>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis dataKey="category" tick={axisStyle} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'rgba(0,0,0,0.03)'}} />
                                <Bar dataKey="applications" radius={[10, 10, 0, 0]} barSize={25}>
                                    {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. RADAR CHART */}
                <div className="bg-base-100 p-5 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-xl border border-base-300/10">
                    <div className="flex items-center gap-3 mb-6 md:mb-10">
                        <Activity size={16} className="text-green-500" />
                        <h3 className="text-[10px] md:text-xs font-black uppercase italic tracking-widest text-neutral">Balance</h3>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid strokeOpacity={0.1} />
                                <PolarAngleAxis dataKey="category" tick={{fontSize: 8, fontWeight: '700', fill: '#64748b'}} />
                                <Radar name="Apps" dataKey="applications" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.3} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default AdminAnalytics;