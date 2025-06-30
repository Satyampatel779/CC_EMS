import React, { useState, useEffect } from "react";
import { HRDepartmentTabs } from "../../../components/common/Dashboard/departmenttabs"
import { useDispatch, useSelector } from "react-redux"
import { CreateDepartmentDialogBox } from "../../../components/common/Dashboard/dialogboxes"
import { HandleGetHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk"
import { Building2, Users, TrendingUp, Plus, Search, Filter, Grid, List } from "lucide-react";
import { Loading } from "../../../components/common/loading.jsx"

export const HRDepartmentPage = () => {
    const dispatch = useDispatch()
    const departmentState = useSelector((state) => state.HRDepartmentPageReducer)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState("grid") // grid or list
    const [animationDelay, setAnimationDelay] = useState(0)

    useEffect(() => {
        dispatch(HandleGetHRDepartments({ apiroute: "GETDATA" }))
        setAnimationDelay(100)
    }, [dispatch])

    const departmentStats = [
        {
            label: "Total Departments",
            value: departmentState.data?.length || "0",
            icon: <Building2 className="w-6 h-6" />,
            color: "from-blue-500 to-blue-600",
            change: "+2%"
        },
        {
            label: "Total Employees",
            value: departmentState.data?.reduce((acc, dept) => acc + (dept.employees?.length || 0), 0) || "0",
            icon: <Users className="w-6 h-6" />,
            color: "from-green-500 to-green-600",
            change: "+8%"
        },
        {
            label: "Average Size",
            value: departmentState.data?.length ? Math.round(departmentState.data.reduce((acc, dept) => acc + (dept.employees?.length || 0), 0) / departmentState.data.length) : "0",
            icon: <TrendingUp className="w-6 h-6" />,
            color: "from-purple-500 to-purple-600",
            change: "+5%"
        }
    ]

    if (departmentState.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <Loading />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Department Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Organize and manage your company departments efficiently
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-1 border border-white/20 dark:border-gray-700/30 shadow-lg">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                    viewMode === "grid" 
                                    ? "bg-blue-500 text-white shadow-md" 
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                    viewMode === "list" 
                                    ? "bg-blue-500 text-white shadow-md" 
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                        className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                                <p className="text-sm text-green-500 mt-2">{stat.change} from last month</p>
                            </div>
                            <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Department Content */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            All Departments
                        </h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {departmentState.data?.length || 0} departments found
                        </div>
                    </div>
                    
                    {/* Department Tabs/Content */}
                    <HRDepartmentTabs viewMode={viewMode} searchQuery={searchQuery} />
                </div>
            </div>

            {/* Quick Actions Floating Panel */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-3 border border-white/20 dark:border-gray-700/30 shadow-xl">
                    <div className="flex flex-col gap-2">
                        <button className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 group">
                            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}