import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HandleGetHRDepartments, HandlePostHRDepartments, HandlePatchHRDepartments, HandleDeleteHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk";
import { HandleGetHREmployees } from "../../../redux/Thunks/HREmployeesThunk";
import { HandleGetDashboard } from "../../../redux/Thunks/DashboardThunk";
import { 
    Building2, 
    Users, 
    Plus, 
    Search, 
    Grid3X3, 
    List, 
    Edit, 
    Trash2,
    X,
    Save,
    UserPlus,
    Check,
    Activity,
    TrendingUp,
    UserCheck,
    UserX,
    Filter,
    MapPin,
    Calendar
} from "lucide-react";

export const SimpleDepartmentPageNoLoading = () => {
    const dispatch = useDispatch();
    const departmentState = useSelector((state) => state.HRDepartmentPageReducer);
    const employeesState = useSelector((state) => state.HREmployeesPageReducer);
    const dashboardState = useSelector((state) => state.dashboardreducer);
    
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(null);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
    
    // Form states
    const [newDepartment, setNewDepartment] = useState({
        name: "",
        description: ""
    });

    // Fetch data on component mount
    useEffect(() => {
        console.log("🔄 Fetching data...");
        dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
        dispatch(HandleGetDashboard({ apiroute: "GETDATA" }));
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }));
    }, [dispatch]);

    // Get departments from available sources
    const getDepartments = () => {
        // Try department API first
        if (Array.isArray(departmentState.data) && departmentState.data.length > 0) {
            console.log("📊 Using Department API data");
            return departmentState.data;
        }
        
        // Fallback to dashboard data
        if (Array.isArray(dashboardState.data?.departments) && dashboardState.data.departments.length > 0) {
            console.log("📊 Using Dashboard fallback data");
            return dashboardState.data.departments;
        }
        
        console.log("📊 No department data available");
        return [];
    };

    const departments = getDepartments();
    const employees = Array.isArray(employeesState.data) ? employeesState.data : [];
    
    const filteredDepartments = departments.filter(dept =>
        dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle create department
    const handleCreateDepartment = async () => {
        if (!newDepartment.name.trim()) return;
        
        try {
            await dispatch(HandlePostHRDepartments({
                apiroute: "CREATE",
                data: newDepartment
            }));
            
            // Refresh departments list
            dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
            
            // Reset form and close modal
            setNewDepartment({ name: "", description: "" });
            setShowCreateModal(false);
        } catch (error) {
            console.error("Failed to create department:", error);
        }
    };

    // Handle add employees to department
    const handleAddEmployeesToDepartment = async () => {
        if (!showAddEmployeeModal || selectedEmployees.length === 0) return;
        
        try {
            console.log("🔄 Adding employees to department:", {
                departmentID: showAddEmployeeModal._id,
                employeeIDArray: selectedEmployees
            });
            
            const result = await dispatch(HandlePatchHRDepartments({
                apiroute: "UPDATE",
                data: { 
                    departmentID: showAddEmployeeModal._id,
                    employeeIDArray: selectedEmployees
                }
            })).unwrap();
            
            console.log("✅ Successfully added employees to department:", result);
            alert(`Successfully added ${selectedEmployees.length} employee(s) to ${showAddEmployeeModal.name}`);
            
            // Refresh departments list
            dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
            dispatch(HandleGetHREmployees({ apiroute: "GETALL" }));
            
            // Reset and close modal
            setSelectedEmployees([]);
            setEmployeeSearchQuery("");
            setShowAddEmployeeModal(null);
            
        } catch (error) {
            console.error("Failed to add employees to department:", error);
            const errorMessage = error?.message || error?.EmployeeList?.length 
                ? `Some employees are already in this department: ${error.EmployeeList?.join(', ')}`
                : "Failed to add employees to department. Please try again.";
            alert(errorMessage);
        }
    };

    // Handle remove employee from department
    const handleRemoveEmployeeFromDepartment = async (departmentId, employeeId, employeeName) => {
        if (!confirm(`Are you sure you want to remove ${employeeName} from this department?`)) {
            return;
        }

        try {
            console.log("🔄 Removing employee from department:", {
                departmentID: departmentId,
                employeeIDArray: [employeeId],
                action: "delete-employee"
            });
            
            const result = await dispatch(HandleDeleteHRDepartments({
                apiroute: "DELETE",
                data: {
                    departmentID: departmentId,
                    employeeIDArray: [employeeId],
                    action: "delete-employee"
                }
            })).unwrap();
            
            console.log("✅ Successfully removed employee from department:", result);
            alert(`Successfully removed ${employeeName} from the department`);
            
            // Refresh departments list
            dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
            dispatch(HandleGetHREmployees({ apiroute: "GETALL" }));
            
        } catch (error) {
            console.error("Failed to remove employee from department:", error);
            alert("Failed to remove employee from department. Please try again.");
        }
    };

    // Handle employee selection
    const handleEmployeeSelection = (employeeId) => {
        setSelectedEmployees(prev => {
            if (prev.includes(employeeId)) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const DepartmentCard = ({ department, index }) => {
        const colors = [
            "from-blue-500 to-purple-600",
            "from-green-500 to-teal-600", 
            "from-orange-500 to-red-600",
            "from-purple-500 to-pink-600"
        ];
        const color = colors[index % colors.length];

        // Get employee count for this department
        const employeeCount = department.employees?.length || 0;
        
        // Get employee details for this department
        const departmentEmployees = (department.employees || []).map(emp => {
            if (typeof emp === 'string') {
                return employees.find(e => e._id === emp) || { _id: emp, firstname: 'Unknown', lastname: 'Employee' };
            }
            return emp;
        }).filter(Boolean);

        return (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${color} shadow-lg`}>
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowAddEmployeeModal(department)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                            title="Add Employee"
                        >
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Department Info */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {department.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {department.description || "No description available"}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{employeeCount}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Employees</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{department.projects || 0}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Projects</p>
                    </div>
                </div>

                {/* Employee List */}
                {departmentEmployees.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Department Members</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {departmentEmployees.slice(0, 3).map((emp, idx) => (
                                <div key={emp._id || idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">
                                                {emp.firstname?.[0]}{emp.lastname?.[0]}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {emp.firstname} {emp.lastname}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveEmployeeFromDepartment(department._id, emp._id, `${emp.firstname} ${emp.lastname}`)}
                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Remove from department"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {departmentEmployees.length > 3 && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
                                    +{departmentEmployees.length - 3} more employees
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowAddEmployeeModal(department)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Employee</span>
                    </button>
                </div>
            </div>
        );
    };

    // Always render the page - no infinite loading
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 p-6 space-y-8">
                {/* Header Section */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                    Department Management
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                    Organize and manage your company departments efficiently
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create Department
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: "Total Departments",
                            value: departments.length,
                            icon: Building2,
                            color: "from-blue-500 to-indigo-500",
                            bgColor: "bg-blue-500/10",
                            textColor: "text-blue-600 dark:text-blue-400",
                            change: departments.length > 0 ? `+${Math.floor(Math.random() * 5) + 1}%` : "+0%"
                        },
                        {
                            title: "Total Employees",
                            value: employees.length,
                            icon: Users,
                            color: "from-green-500 to-emerald-500",
                            bgColor: "bg-green-500/10",
                            textColor: "text-green-600 dark:text-green-400",
                            change: employees.length > 0 ? `+${Math.floor(Math.random() * 15) + 5}%` : "+0%"
                        },
                        {
                            title: "Avg Dept Size",
                            value: Math.round(employees.length / Math.max(departments.length, 1)),
                            icon: UserCheck,
                            color: "from-purple-500 to-pink-500",
                            bgColor: "bg-purple-500/10",
                            textColor: "text-purple-600 dark:text-purple-400",
                            change: departments.length > 0 ? `+${Math.floor(Math.random() * 8) + 2}%` : "+0%"
                        },
                        {
                            title: "Active Projects",
                            value: departments.reduce((acc, dept) => acc + (dept.projects || 0), 0),
                            icon: TrendingUp,
                            color: "from-orange-500 to-red-500",
                            bgColor: "bg-orange-500/10",
                            textColor: "text-orange-600 dark:text-orange-400",
                            change: departments.length > 0 ? `+${Math.floor(Math.random() * 12) + 3}%` : "+0%"
                        }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                                </div>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                    {stat.value}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {stat.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters and Controls */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search departments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-500"
                                />
                            </div>

                            {/* Status Info */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl">
                                <Activity className="w-5 h-5 text-blue-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {departments.length} departments
                                    {departmentState.isLoading && " (Loading...)"}
                                </span>
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-2xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all duration-300 ${
                                    viewMode === 'grid' 
                                        ? 'bg-white dark:bg-slate-600 shadow-md text-blue-600 dark:text-blue-400' 
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                            >
                                <Grid3X3 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all duration-300 ${
                                    viewMode === 'list' 
                                        ? 'bg-white dark:bg-slate-600 shadow-md text-blue-600 dark:text-blue-400' 
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                            >
                                <List className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <p className="text-slate-600 dark:text-slate-400">
                        Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredDepartments.length}</span> of <span className="font-semibold text-slate-900 dark:text-slate-100">{departments.length}</span> departments
                    </p>
                </div>

                {/* Department List */}
                <div className="space-y-6">
                    {filteredDepartments.length === 0 ? (
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-16 shadow-xl text-center">
                            <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <Building2 className="h-10 w-10 text-slate-500 dark:text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-300 mb-3">
                                {departments.length === 0 ? "No departments found" : "No results found"}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                {searchQuery ? "Try adjusting your search criteria" : 
                                 departments.length === 0 ? "Create your first department to get started" : 
                                 "No departments match your search"}
                            </p>
                            {!searchQuery && departments.length === 0 && (
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create First Department
                                </button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDepartments.map((department, index) => (
                                <DepartmentCard key={department._id || index} department={department} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Department</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Employees</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Projects</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredDepartments.map((department, index) => {
                                            const employeeCount = department.employees?.length || 0;
                                            const colors = [
                                                "from-blue-500 to-purple-600",
                                                "from-green-500 to-teal-600", 
                                                "from-orange-500 to-red-600",
                                                "from-purple-500 to-pink-600"
                                            ];
                                            const color = colors[index % colors.length];
                                            
                                            return (
                                                <tr key={department._id || index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
                                                                <Building2 className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-slate-100">{department.name}</div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400">{department.description}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Users className="w-4 h-4 text-slate-400" />
                                                            <span className="text-slate-900 dark:text-slate-100">{employeeCount}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-slate-900 dark:text-slate-100">{department.projects || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => setShowAddEmployeeModal(department)}
                                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                title="Add Employee"
                                                            >
                                                                <UserPlus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

            {/* Create Department Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl max-w-md w-full shadow-2xl">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create Department</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Department Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newDepartment.name}
                                        onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                                        className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter department name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newDepartment.description}
                                        onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        placeholder="Department description (optional)"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateDepartment}
                                        disabled={!newDepartment.name.trim()}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Create Department</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {showAddEmployeeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add Employees</h2>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1">Add employees to {showAddEmployeeModal.name}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddEmployeeModal(null);
                                        setSelectedEmployees([]);
                                        setEmployeeSearchQuery("");
                                    }}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Employee Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={employeeSearchQuery}
                                        onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Selected Count */}
                            {selectedEmployees.length > 0 && (
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        {selectedEmployees.length} employee(s) selected
                                    </p>
                                </div>
                            )}

                            {/* Employee List */}
                            <div className="max-h-80 overflow-y-auto mb-6 space-y-2">
                                {employees
                                    .filter(employee => {
                                        // Get the current department's employee IDs
                                        const deptEmployeeIds = showAddEmployeeModal.employees || [];
                                        
                                        // Check if employee is already in this department
                                        const isInDepartment = deptEmployeeIds.some(empId => 
                                            (typeof empId === 'string' ? empId : empId._id || empId) === employee._id
                                        );
                                        
                                        // Also check if employee has this department set in their record
                                        const hasThisDepartment = employee.department === showAddEmployeeModal._id ||
                                                                 employee.department?._id === showAddEmployeeModal._id;
                                        
                                        // Filter by search query
                                        const matchesSearch = employee.firstname?.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                                                             employee.lastname?.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                                                             employee.email?.toLowerCase().includes(employeeSearchQuery.toLowerCase());
                                        
                                        return !isInDepartment && !hasThisDepartment && matchesSearch;
                                    })
                                    .map((employee) => (
                                        <div
                                            key={employee._id}
                                            onClick={() => handleEmployeeSelection(employee._id)}
                                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-md ${
                                                selectedEmployees.includes(employee._id)
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md'
                                                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                        selectedEmployees.includes(employee._id)
                                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                                    }`}>
                                                        {employee.firstname?.[0]}{employee.lastname?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                            {employee.firstname} {employee.lastname}
                                                        </p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">{employee.email}</p>
                                                        {employee.position && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-500">{employee.position}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedEmployees.includes(employee._id) && (
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                }
                                
                                {employees.filter(employee => {
                                    const deptEmployeeIds = showAddEmployeeModal.employees || [];
                                    const isInDepartment = deptEmployeeIds.some(empId => 
                                        (typeof empId === 'string' ? empId : empId._id || empId) === employee._id
                                    );
                                    const hasThisDepartment = employee.department === showAddEmployeeModal._id ||
                                                             employee.department?._id === showAddEmployeeModal._id;
                                    const matchesSearch = employee.firstname?.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                                                         employee.lastname?.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
                                                         employee.email?.toLowerCase().includes(employeeSearchQuery.toLowerCase());
                                    return !isInDepartment && !hasThisDepartment && matchesSearch;
                                }).length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <Users className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No employees available</h3>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            {employeeSearchQuery ? "No employees found matching your search" : "All employees are already assigned to departments"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => {
                                        setShowAddEmployeeModal(null);
                                        setSelectedEmployees([]);
                                        setEmployeeSearchQuery("");
                                    }}
                                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddEmployeesToDepartment}
                                    disabled={selectedEmployees.length === 0}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Add {selectedEmployees.length > 0 ? `${selectedEmployees.length} ` : ''}Employee{selectedEmployees.length !== 1 ? 's' : ''}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            </div>
        </div>
    );
};

export default SimpleDepartmentPageNoLoading;
