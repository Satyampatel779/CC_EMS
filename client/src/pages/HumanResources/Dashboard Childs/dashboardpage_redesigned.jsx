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
  Activity,
  Target,
  BarChart3,
  PieChart,
  Zap,
  Eye,
  UserCheck,
  DollarSign
} from "lucide-react";

import { HandleGetDashboard } from "../../../redux/Thunks/DashboardThunk.js";
import { Loading } from "../../../components/common/loading.jsx";
import { EnhancedGlassCard, MetricCard, GlassPanel } from "@/components/ui/EnhancedGlassCard";
import { RealTimeChart, RealTimeMetrics, ActivityFeed } from "@/components/ui/RealTimeAnalytics";

export const HRDashboardPage = () => {
    const DashboardState = useSelector((state) => state.dashboardreducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [realTimeData, setRealTimeData] = useState({});

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

    // Simulate real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeData(prev => ({
                ...prev,
                activeUsers: Math.floor(Math.random() * 50) + 100,
                serverLoad: Math.floor(Math.random() * 100),
                responseTime: Math.floor(Math.random() * 500) + 100
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Quick action items
    const quickActions = [
        {
            title: "View Employees",
            description: "Manage employee records",
            icon: <Users className="w-6 h-6" />,
            path: "/HR/dashboard/employees",
            color: "blue",
            count: DashboardState.data?.employees?.length || 0
        },
        {
            title: "Departments",
            description: "Organizational structure",
            icon: <Building2 className="w-6 h-6" />,
            path: "/HR/dashboard/departments",
            color: "green",
            count: DashboardState.data?.departments?.length || 0
        },
        {
            title: "Leave Requests",
            description: "Pending approvals",
            icon: <Calendar className="w-6 h-6" />,
            path: "/HR/dashboard/leaves",
            color: "orange",
            count: (Array.isArray(DashboardState.data?.leaves) ? 
                DashboardState.data.leaves.filter(leave => leave.status === 'pending') : []).length || 0
        },
        {
            title: "HR Requests",
            description: "System requests",
            icon: <FileText className="w-6 h-6" />,
            path: "/HR/dashboard/requests",
            color: "purple",
            count: (Array.isArray(DashboardState.data?.requests) ? 
                DashboardState.data.requests.filter(req => req.status === 'pending') : []).length || 0
        }
    ];

    // Performance metrics
    const performanceMetrics = [
        {
            label: "Employee Satisfaction",
            value: "94%",
            change: "+2.5%",
            trend: "up"
        },
        {
            label: "Attendance Rate",
            value: "97.2%",
            change: "+1.1%",
            trend: "up"
        },
        {
            label: "Turnover Rate",
            value: "3.1%",
            change: "-0.8%",
            trend: "down"
        },
        {
            label: "Productivity Index",
            value: "87.5%",
            change: "+3.2%",
            trend: "up"
        }
    ];

    // Chart data for analytics
    const employeeGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Employee Count',
                data: [120, 125, 130, 135, 142, 150],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }
        ]
    };

    const departmentDistribution = {
        labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'],
        datasets: [
            {
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 101, 101, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 101, 101)',
                    'rgb(139, 92, 246)',
                    'rgb(251, 191, 36)'
                ],
                borderWidth: 2
            }
        ]
    };

    const activityFeedData = [
        {
            id: 1,
            type: "employee",
            action: "New employee John Doe added to Engineering",
            time: "2 minutes ago",
            icon: "👨‍💼"
        },
        {
            id: 2,
            type: "leave",
            action: "Leave request approved for Sarah Wilson",
            time: "15 minutes ago",
            icon: "✅"
        },
        {
            id: 3,
            type: "request",
            action: "Equipment request submitted by Tech Team",
            time: "32 minutes ago",
            icon: "💻"
        },
        {
            id: 4,
            type: "department",
            action: "Marketing department budget updated",
            time: "1 hour ago",
            icon: "📊"
        }
    ];

    if (DashboardState.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
                <div className="absolute top-3/4 left-1/6 w-64 h-64 bg-pink-500/8 rounded-full blur-2xl animate-pulse delay-3000" />
                <div className="absolute top-1/6 right-1/6 w-64 h-64 bg-green-500/8 rounded-full blur-2xl animate-pulse delay-4000" />
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div className="mb-6 lg:mb-0">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
                            HR Command Center
                        </h1>
                        <p className="text-xl text-gray-300 mb-2">
                            Real-time insights into your organization's pulse
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span>System Online</span>
                            </div>
                            <span>•</span>
                            <span>{currentTime.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <EnhancedGlassCard variant="aurora" className="p-6 lg:w-80">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Welcome Back!</h3>
                            <p className="text-gray-300 text-sm mb-4">
                                Your organization is running smoothly
                            </p>
                            <div className="flex justify-center space-x-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">
                                        {DashboardState.data?.employees?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-400">Total Staff</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">
                                        {realTimeData.activeUsers || 127}
                                    </div>
                                    <div className="text-xs text-gray-400">Active Now</div>
                                </div>
                            </div>
                        </div>
                    </EnhancedGlassCard>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {quickActions.map((action, index) => (
                        <MetricCard
                            key={index}
                            title={action.title}
                            value={action.count}
                            change={`+${Math.floor(Math.random() * 10)}%`}
                            trend="up"
                            icon={action.icon}
                            color={action.color}
                            delay={index * 100}
                        />
                    ))}
                </div>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {performanceMetrics.map((metric, index) => (
                        <EnhancedGlassCard
                            key={index}
                            variant="neon"
                            animateIn={true}
                            delay={index * 150}
                            className="p-6 text-center"
                        >
                            <div className="text-3xl font-bold text-white mb-2">
                                {metric.value}
                            </div>
                            <div className="text-sm text-gray-300 mb-2">
                                {metric.label}
                            </div>
                            <div className={`text-sm font-medium ${
                                metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {metric.change}
                            </div>
                        </EnhancedGlassCard>
                    ))}
                </div>

                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                    {/* Employee Growth Chart */}
                    <div className="xl:col-span-2">
                        <RealTimeChart
                            type="area"
                            data={employeeGrowthData}
                            title="Employee Growth Trend"
                            height="400px"
                        />
                    </div>

                    {/* Department Distribution */}
                    <RealTimeChart
                        type="doughnut"
                        data={departmentDistribution}
                        title="Department Distribution"
                        height="400px"
                    />
                </div>

                {/* Live Dashboard Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Real-time Metrics */}
                    <div>
                        <RealTimeMetrics 
                            metrics={[
                                { label: "Active Sessions", value: realTimeData.activeUsers || 127, change: "+5%" },
                                { label: "Server Load", value: realTimeData.serverLoad || 45, change: "-2%" },
                                { label: "Response Time", value: `${realTimeData.responseTime || 245}ms`, change: "+1%" },
                                { label: "Uptime", value: "99.9%", change: "0%" }
                            ]}
                            updateInterval={3000}
                        />
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-2">
                        <ActivityFeed 
                            activities={activityFeedData}
                            realTime={true}
                        />
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <GlassPanel className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <Zap className="mr-3 text-yellow-400" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                className="group p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                                    action.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                    action.color === 'green' ? 'from-green-500 to-green-600' :
                                    action.color === 'orange' ? 'from-orange-500 to-orange-600' :
                                    'from-purple-500 to-purple-600'
                                } flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    {action.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {action.title}
                                </h3>
                                <p className="text-sm text-gray-400 mb-3">
                                    {action.description}
                                </p>
                                <div className="text-xl font-bold text-blue-400">
                                    {action.count}
                                </div>
                            </button>
                        ))}
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
};
