import React, { useState, useEffect } from "react";
import { HRDepartmentTabs } from "../../../components/common/Dashboard/departmenttabs";
import { useDispatch, useSelector } from "react-redux";
import { CreateDepartmentDialogBox } from "../../../components/common/Dashboard/dialogboxes";
import { HandleGetHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk";
import { Building2, Users, TrendingUp, Plus, Search, Filter, Grid, List, AlertCircle } from "lucide-react";
import { Loading } from "../../../components/common/loading.jsx";

export const HRDepartmentPage = () => {
    const dispatch = useDispatch();
    const departmentState = useSelector((state) => state.HRDepartmentPageReducer);
    // Grab departments from dashboard state as fallback
    const dashboardDepartments = useSelector((state) => state.dashboardreducer.data?.departments);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [animationDelay, setAnimationDelay] = useState(0);
    const [forceShowContent, setForceShowContent] = useState(false);

    // Debug logging
    console.log("Department State:", departmentState)
    console.log("Is Loading:", departmentState.isLoading)
    console.log("Data:", departmentState.data)
    console.log("Error:", departmentState.error)

    // Determine display data: prefer dashboard departments
    const displayData = dashboardDepartments?.length > 0
        ? dashboardDepartments
        : departmentState.data?.length > 0
            ? departmentState.data
            : (forceShowContent ? mockDepartments : null);

    useEffect(() => {
        if (dashboardDepartments?.length > 0) {
            // Use dashboard data, no fetch needed
            setForceShowContent(true);
        } else {
            // Fetch only if no dashboard data
            dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
        }
        setAnimationDelay(100);
        // Ensure content shows after timeout
        const timeoutId = setTimeout(() => setForceShowContent(true), 10000);
        return () => clearTimeout(timeoutId);
    }, [dispatch, dashboardDepartments])

    // Force show content if data exists but still loading
    useEffect(() => {
        if (departmentState.data && Array.isArray(departmentState.data) && departmentState.data.length > 0) {
            setForceShowContent(true)
        }
    }, [departmentState.data])

    // Mock data for fallback
    const mockDepartments = [
        {
            _id: "mock1",
            name: "Engineering",
            description: "Software development and technical infrastructure",
            employees: [
                { _id: "emp1", firstname: "John", lastname: "Doe", email: "john@company.com" },
                { _id: "emp2", firstname: "Jane", lastname: "Smith", email: "jane@company.com" }
            ],
            createdAt: new Date().toISOString()
        },
        {
            _id: "mock2", 
            name: "Human Resources",
            description: "Employee management and organizational development",
            employees: [
                { _id: "emp3", firstname: "Alice", lastname: "Johnson", email: "alice@company.com" }
            ],
            createdAt: new Date().toISOString()
        }
    ];

    const departmentStats = [
        {
            label: "Total Departments",
            value: displayData?.length || "0",
            icon: <Building2 className="w-6 h-6" />,
            color: "from-blue-500 to-blue-600",
            change: "+2%"
        },
        {
            label: "Total Employees",
            value: displayData?.reduce((acc, dept) => acc + (dept.employees?.length || 0), 0) || "0",
            icon: <Users className="w-6 h-6" />,
            color: "from-green-500 to-green-600",
            change: "+8%"
        },
        {
            label: "Average Size",
            value: displayData?.length ? Math.round(displayData.reduce((acc, dept) => acc + (dept.employees?.length || 0), 0) / displayData.length) : "0",
            icon: <TrendingUp className="w-6 h-6" />,
            color: "from-purple-500 to-purple-600",
            change: "+5%"
        }
    ]

    // Show loading only if truly loading and no data available and not forced
    if (departmentState.isLoading && !departmentState.data && !forceShowContent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loading />
                    <p className="text-white mt-4">Loading departments...</p>
                    <button 
                        onClick={() => setForceShowContent(true)}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Continue Anyway
                    </button>
                </div>
            </div>
        )
    }

    if (departmentState.error?.status) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Error Loading Departments</h2>
                    <p className="text-gray-300 mb-4">
                        {departmentState.error.type === 'PARSE_ERROR' 
                            ? "Server returned invalid data. This usually indicates an authentication issue."
                            : departmentState.error.message || "Unable to load department data."}
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                console.log("🔄 Retrying department fetch...")
                                dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }))
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition-all duration-200"
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => setForceShowContent(true)}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-xl transition-all duration-200"
                        >
                            Continue Anyway
                        </button>
                    </div>
                    <details className="mt-4 text-left">
                        <summary className="text-sm text-gray-400 cursor-pointer">Technical Details</summary>
                        <div className="mt-2 p-3 bg-gray-800 rounded-lg text-xs text-gray-300 font-mono">
                            {JSON.stringify(departmentState.error, null, 2)}
                        </div>
                    </details>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6 space-y-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Department Management
                        </h1>
                        <p className="text-lg text-gray-300">
                            Organize and manage your company departments efficiently
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Test API Button */}
                        <button
                            onClick={async () => {
                                console.log('🧪 Testing API directly...');
                                try {
                                    const response = await fetch('http://localhost:5001/api/v1/department/all', {
                                        method: 'GET',
                                        credentials: 'include',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        }
                                    });
                                    console.log('Response status:', response.status);
                                    const text = await response.text();
                                    console.log('Raw response:', text.substring(0, 200));
                                    try {
                                        const json = JSON.parse(text);
                                        console.log('✅ API Response JSON:', json);
                                    } catch (e) {
                                        console.log('❌ Failed to parse JSON:', text.substring(0, 100));
                                    }
                                } catch (error) {
                                    console.error('❌ Direct API test error:', error);
                                }
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                        >
                            Test API
                        </button>
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-white/10 backdrop-blur-xl rounded-xl p-1 border border-white/20 shadow-lg">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                    viewMode === "grid" 
                                    ? "bg-blue-500 text-white shadow-md" 
                                    : "text-gray-300 hover:bg-white/10"
                                }`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                    viewMode === "list" 
                                    ? "bg-blue-500 text-white shadow-md" 
                                    : "text-gray-300 hover:bg-white/10"
                                }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        <CreateDepartmentDialogBox />
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {departmentStats.map((stat, index) => (
                    <div 
                        key={index}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-300 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                                <p className="text-sm text-green-400">{stat.change} from last month</p>
                            </div>
                            <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl text-white shadow-lg hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-200 text-white">
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Department Content */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            All Departments
                        </h2>
                        <div className="text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                            {displayData?.length || 0} departments found
                            {forceShowContent && !departmentState.data ? " (Demo Data)" : ""}
                        </div>
                    </div>
                    
                    {/* Show message if no data but not loading */}
                    {(!displayData || displayData.length === 0) && !departmentState.isLoading ? (
                        <div className="text-center py-12">
                            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Departments Found</h3>
                            <p className="text-gray-300 mb-6">Create your first department to get started</p>
                            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200">
                                <Plus className="w-5 h-5 inline mr-2" />
                                Create Department
                            </button>
                        </div>
                    ) : (
                        <HRDepartmentTabs viewMode={viewMode} searchQuery={searchQuery} data={displayData} />
                    )}
                </div>
            </div>
        </div>
    )
}