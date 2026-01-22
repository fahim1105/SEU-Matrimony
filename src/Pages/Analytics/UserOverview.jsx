import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaWallet, FaGraduationCap, FaStar, FaHistory, FaCheckCircle, FaSpinner } from "react-icons/fa";
import UseAxiosSecure from "../../Hooks/UseAxiosSecure";
import Loader from "../../Components/Loader/Loader";



const UserOverview = () => {
    const axiosSecure = UseAxiosSecure();

    // Fetching Overview Data
    const { data: overview = {}, isLoading } = useQuery({
        queryKey: ["user-overview"],
        queryFn: async () => {
            const res = await axiosSecure.get("/user-overview");
            return res.data;
        }
    });

    if (isLoading) return <Loader />;

    const stats = [
        {
            id: 1,
            label: "Total Spent",
            value: `$${overview.totalSpent || 0}`,
            icon: <FaWallet className="text-3xl" />,
            color: "bg-blue-500",
            shadow: "shadow-blue-200"
        },
        {
            id: 2,
            label: "Scholarships Applied",
            value: overview.totalApplied || 0,
            icon: <FaGraduationCap className="text-3xl" />,
            color: "bg-purple-500",
            shadow: "shadow-purple-200"
        },
        {
            id: 3,
            label: "Reviews Given",
            value: overview.totalReviews || 0,
            icon: <FaStar className="text-3xl" />,
            color: "bg-orange-500",
            shadow: "shadow-orange-200"
        }
    ];

    return (
        <div className="p-4 md:p-10 bg-base-100 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-[2.5rem] border border-primary/10">
                    <div className="avatar">
                        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={overview.userPhoto || "https://i.ibb.co/mJR7z81/user.png"} alt="User" />
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-neutral uppercase italic tracking-tighter">
                            Welcome Back, <span className="text-primary">{overview.userName}</span>
                        </h2>
                        <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">
                            Track your scholarship progress and finances
                        </p>
                    </div>
                </div>

                {/* Stat Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.id} className={`p-8 rounded-[2rem] bg-base-100 border border-base-200 shadow-xl hover:scale-105 transition-transform duration-300 relative overflow-hidden group`}>
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform`}>
                                {stat.icon}
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-base-content/50">{stat.label}</p>
                            <h3 className="text-4xl font-black mt-2 text-neutral italic">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Recent Activity / Applications Table */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <FaHistory className="text-primary" />
                        <h3 className="text-xl font-black uppercase italic text-neutral">Recent Applications</h3>
                    </div>

                    <div className="bg-base-200/50 rounded-[2rem] overflow-hidden border border-base-300/50">
                        {overview.recentApplications?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className="bg-neutral text-base-100 uppercase text-[10px] tracking-widest">
                                        <tr>
                                            <th className="py-5 pl-8">University</th>
                                            <th>Scholarship</th>
                                            <th>Status</th>
                                            <th className="text-right pr-8">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-base-300/20">
                                        {overview.recentApplications.map((app) => (
                                            <tr key={app._id} className="hover:bg-primary/5 transition-colors">
                                                <td className="py-4 pl-8 font-bold italic text-neutral">{app.universityName}</td>
                                                <td className="text-xs font-medium opacity-70">{app.scholarshipName}</td>
                                                <td>
                                                    <span className={`badge badge-sm font-black uppercase text-[9px] py-3 px-4 rounded-lg border-none ${app.status === 'completed' ? 'bg-success/20 text-success' :
                                                        app.status === 'rejected' ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'
                                                        }`}>
                                                        {app.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="text-right pr-8 text-[10px] font-bold opacity-50 uppercase">
                                                    {new Date(app.appliedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center opacity-40 italic font-bold">
                                No recent applications found. Start applying now!
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserOverview;