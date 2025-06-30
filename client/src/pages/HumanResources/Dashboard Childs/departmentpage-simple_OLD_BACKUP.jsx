import React, { useState, useEffect } from "react";
import { Building2, Users, TrendingUp, Plus, Search, Filter, Grid, List, AlertCircle, RefreshCw } from "lucide-react";
import { Loading } from "../../../components/common/loading.jsx"

export const HRDepartmentPageSimple = () => {
    const [departments, setDepartments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState("grid")

    const fetchDepartments = async () => {
        try {
            setIsLoading(true)
            setError(null)
            console.log("Fetching departments directly...")
            
            const response = await fetch('/api/v1/department/all', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log("Department API Response:", data)
            
            if (data.success && data.data) {
                setDepartments(data.data)
            } else {
                setError("Failed to load departments")
            }
        } catch (err) {
            console.error("Error fetching departments:", err)
            setError(err.message || "Failed to load departments")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDepartments()
    }, [])

    const departmentStats = [
        {
            label: "Total Departments",
            value: departments.length.toString(),
            icon: <Building2 className="w-6 h-6" />,
            color: "from-blue-500 to-blue-600",
            change: "+2%"
        },
        {
            label: "Total Employees",
            value: departments.reduce((acc, dept) => acc + (dept.employees?.length || 0), 0).toString(),
            icon: <Users className="w-6 h-6" />,
            color: "from-green-500 to-green-600",
            change: "+8%"
        },
        {
            label: "Average Size",
            value: departments.length ? Math.round(departments.reduce((acc, dept) => acc + (dept.employees?.length || 0), 0) / departments.length).toString() : "0",
            icon: <TrendingUp className="w-6 h-6" />,
            color: "from-purple-500 to-purple-600",
            change: "+5%"
        }
    ]

    const filteredDepartments = departments.filter(dept => 
        dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loading />
                    <p className="text-white mt-4">Loading departments...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Error Loading Departments</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={fetchDepartments}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
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
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                    viewMode === "list" 
                                    ? "bg-blue-500 text-white shadow-md" 
                                    : "text-gray-300 hover:bg-white/10"
                                }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Create Department Button */}
                        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span>Create Department</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {departmentStats.map((stat, index) => (
                    <div 
                        key={index}
                        className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
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
                    <button
                        onClick={fetchDepartments}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-200 text-white"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Refresh</span>
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
                            {filteredDepartments.length} departments found
                        </div>
                    </div>
                    
                    {/* Show message if no data */}
                    {filteredDepartments.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {departments.length === 0 ? "No Departments Found" : "No departments match your search"}
                            </h3>
                            <p className="text-gray-300 mb-6">
                                {departments.length === 0 ? "Create your first department to get started" : "Try adjusting your search criteria"}
                            </p>
                            {departments.length === 0 && (
                                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200">
                                    <Plus className="w-5 h-5 inline mr-2" />
                                    Create Department
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Department Grid/List */
                        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                            {filteredDepartments.map((department, index) => (
                                <div
                                    key={department._id}
                                    className={`bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                                        viewMode === "list" ? "flex items-center justify-between" : ""
                                    }`}
                                >
                                    <div className={viewMode === "list" ? "flex-1" : ""}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                                <Building2 className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">{department.name}</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{department.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Users className="w-4 h-4" />
                                                <span>{department.employees?.length || 0} employees</span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                Created {new Date(department.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {viewMode === "list" && (
                                        <div className="ml-4">
                                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
