import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
    Users, 
    Building2, 
    Calendar, 
    FileText, 
    TrendingUp, 
    Clock, 
    CheckCircle, 
    AlertCircle,
    BarChart3,
    Activity
} from "lucide-react";

import { HandleGetDashboard } from "../../../redux/Thunks/DashboardThunk.js";
import { Loading } from "../../../components/common/loading.jsx";
import { KeyDetailBoxContentWrapper } from "../../../components/common/Dashboard/contentwrappers.jsx";

export const HRDashboardPage = () => {
    const DashboardState = useSelector((state) => state.dashboardreducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Utility function to format time more professionally - moved to top to prevent hoisting issues
    function formatTimeAgo(date) {
        const now = new Date();
        const then = new Date(date);
        const diffInSeconds = Math.floor((now - then) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return then.toLocaleDateString();
    }

    // Real-time clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        dispatch(HandleGetDashboard({ apiroute: "GETDATA" }));
    }, [dispatch]);

    // Dashboard quick stats
    const quickStats = [
        { 
            label: "Total Employees", 
            value: Array.isArray(DashboardState.data?.employees) ? DashboardState.data.employees.length : DashboardState.data?.employees || "0", 
            trend: "+5%", 
            icon: <Users className="w-6 h-6" />,
            color: "from-blue-500 to-blue-600"
        },
        { 
            label: "Departments", 
            value: Array.isArray(DashboardState.data?.departments) ? DashboardState.data.departments.length : DashboardState.data?.departments || "0", 
            trend: "0%", 
            icon: <Building2 className="w-6 h-6" />,
            color: "from-green-500 to-green-600"
        },
        { 
            label: "Pending Leaves", 
            value: (Array.isArray(DashboardState.data?.leaves) ? 
                DashboardState.data.leaves.filter(leave => leave.status === 'Pending') : []).length || "0", 
            trend: "-2%", 
            icon: <Calendar className="w-6 h-6" />,
            color: "from-orange-500 to-orange-600"
        },
        { 
            label: "Open Requests", 
            value: (Array.isArray(DashboardState.data?.requests) ? 
                DashboardState.data.requests.filter(req => req.status === 'Pending') : []).length || "0", 
            trend: "+8%", 
            icon: <FileText className="w-6 h-6" />,
            color: "from-purple-500 to-purple-600"
        }
    ];

    // Quick action items for navigation
    const quickActions = [
        {
            title: "Manage Employees",
            description: "View and manage employee records",
            icon: <Users className="w-8 h-8" />,
            path: "/HR/dashboard/employees",
            color: "from-blue-500 to-blue-600",
            count: Array.isArray(DashboardState.data?.employees) ? DashboardState.data.employees.length : DashboardState.data?.employees || 0
        },
        {
            title: "Departments",
            description: "Organizational structure",
            icon: <Building2 className="w-8 h-8" />,
            path: "/HR/dashboard/departments",
            color: "from-green-500 to-green-600",
            count: Array.isArray(DashboardState.data?.departments) ? DashboardState.data.departments.length : DashboardState.data?.departments || 0
        },
        {
            title: "Leave Management",
            description: "Handle leave requests",
            icon: <Calendar className="w-8 h-8" />,
            path: "/HR/dashboard/leaves",
            color: "from-orange-500 to-orange-600",
            count: (Array.isArray(DashboardState.data?.leaves) ? 
                DashboardState.data.leaves.filter(leave => leave.status === 'Pending') : []).length || 0
        },
        {
            title: "Request Management",
            description: "Process HR requests",
            icon: <FileText className="w-8 h-8" />,
            path: "/HR/dashboard/requests",
            color: "from-purple-500 to-purple-600",
            count: (Array.isArray(DashboardState.data?.requests) ? 
                DashboardState.data.requests.filter(req => req.status === 'Pending') : []).length || 0
        }
    ];

    // Generate real recent activities from system data
    const generateRecentActivities = () => {
        const activities = [];
        
        // Recent notices
        if (DashboardState.data?.notices && Array.isArray(DashboardState.data.notices)) {
            DashboardState.data.notices.slice(0, 2).forEach(notice => {
                activities.push({
                    type: "notice",
                    action: `New notice: "${notice.title}"`,
                    time: formatTimeAgo(notice.createdAt),
                    icon: <FileText className="w-4 h-4 text-blue-400" />,
                    priority: "normal"
                });
            });
        }

        // Recent leaves
        if (DashboardState.data?.recentLeaves && Array.isArray(DashboardState.data.recentLeaves)) {
            DashboardState.data.recentLeaves.slice(0, 2).forEach(leave => {
                const employeeName = leave.employee ? `${leave.employee.firstname} ${leave.employee.lastname}` : 'Unknown Employee';
                activities.push({
                    type: "leave",
                    action: `Leave request ${leave.status.toLowerCase()} for ${employeeName}`,
                    time: formatTimeAgo(leave.updatedAt || leave.createdAt),
                    icon: leave.status === 'Approved' ? 
                        <CheckCircle className="w-4 h-4 text-green-400" /> : 
                        leave.status === 'Pending' ?
                        <Clock className="w-4 h-4 text-yellow-400" /> :
                        <AlertCircle className="w-4 h-4 text-red-400" />,
                    priority: leave.status === 'Pending' ? "high" : "normal"
                });
            });
        }

        // Recent requests
        if (DashboardState.data?.recentRequests && Array.isArray(DashboardState.data.recentRequests)) {
            DashboardState.data.recentRequests.slice(0, 2).forEach(request => {
                const employeeName = request.employee ? `${request.employee.firstname} ${request.employee.lastname}` : 'Unknown Employee';
                activities.push({
                    type: "request",
                    action: `${request.requesttitle} by ${employeeName}`,
                    time: formatTimeAgo(request.updatedAt || request.createdAt),
                    icon: <AlertCircle className="w-4 h-4 text-purple-400" />,
                    priority: request.priority === 'High' ? "high" : "normal"
                });
            });
        }

        // Recent employees
        if (DashboardState.data?.recentEmployees && Array.isArray(DashboardState.data.recentEmployees)) {
            DashboardState.data.recentEmployees.slice(0, 1).forEach(employee => {
                activities.push({
                    type: "employee",
                    action: `New employee: ${employee.firstname} ${employee.lastname}`,
                    time: formatTimeAgo(employee.createdAt),
                    icon: <Users className="w-4 h-4 text-green-400" />,
                    priority: "normal"
                });
            });
        }

        // System update
        activities.push({
            type: "system",
            action: "Dashboard data refreshed",
            time: new Date().toLocaleTimeString(),
            icon: <Activity className="w-4 h-4 text-green-400" />,
            priority: "low"
        });

        return activities.slice(0, 6); // Limit to 6 recent activities
    };

    const recentActivities = generateRecentActivities();

    if (DashboardState.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-6">
            {/* Header Section - Simple and Clear */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            HR Dashboard
                        </h1>
                        <p className="text-lg text-gray-300">
                            Welcome to the Human Resources management center
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span>System Online</span>
                            </div>
                            <span>•</span>
                            <span>{currentTime.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards - Clean and Simple */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickStats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-300 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                                <p className={`text-sm font-medium ${
                                    stat.trend.startsWith('+') ? 'text-green-400' : 
                                    stat.trend.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                    {stat.trend} from last month
                                </p>
                            </div>
                            <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl text-white shadow-lg hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid - Simplified Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                {/* Quick Access Panel */}
                <div className="xl:col-span-2">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Activity className="mr-3 text-blue-400" />
                            Quick Access
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(action.path)}
                                    className="group p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        {action.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {action.title}
                                    </h3>
                                    <p className="text-sm text-gray-300 mb-3">
                                        {action.description}
                                    </p>
                                    <div className="text-2xl font-bold text-blue-400">
                                        {action.count}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            {/* Recent Activity Feed - Enhanced */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Activity className="mr-3 text-green-400" />
                    Recent Activity
                </h2>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <div 
                                key={index} 
                                className={`activity-card flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 ${
                                    activity.priority === 'high' 
                                        ? 'priority-high' 
                                        : activity.priority === 'low'
                                        ? 'priority-low'
                                        : 'priority-normal'
                                }`}
                            >
                                <div className="p-2 bg-white/10 rounded-lg shadow-sm flex-shrink-0">
                                    {activity.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{activity.action}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-gray-400">{activity.time}</p>
                                        {activity.priority === 'high' && (
                                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                                                High Priority
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                <Activity className="w-12 h-12 mx-auto opacity-50" />
                            </div>
                            <p className="text-gray-400">No recent activities to display</p>
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* Latest Updates - Professional Design */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <BarChart3 className="mr-3 text-blue-400" />
                        Latest Updates & Notices
                    </h2>
                    <div className="text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-full">
                        {DashboardState.data?.notices?.length || 0} Total
                    </div>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {DashboardState.data?.notices && DashboardState.data.notices.length > 0 ? (
                        DashboardState.data.notices.map((notice, index) => (
                            <div 
                                key={notice._id || index}
                                className="notice-card p-4 rounded-xl dashboard-glass"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                                            {notice.title}
                                        </h3>
                                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                            {notice.content}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                                                <span className="flex items-center">
                                                    <Users className="w-3 h-3 mr-1" />
                                                    {notice.audience}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatTimeAgo(notice.createdAt)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
                                                By: {notice.createdby?.firstname} {notice.createdby?.lastname}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <FileText className="w-16 h-16 mx-auto opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">No Updates Available</h3>
                            <p className="text-sm text-gray-400">
                                New notices and updates will appear here when they are created.
                            </p>
                        </div>
                    )}
                </div>
                {DashboardState.data?.notices && DashboardState.data.notices.length > 3 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <button 
                            onClick={() => navigate('/HR/dashboard/notices')}
                            className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                            View All Notices →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};