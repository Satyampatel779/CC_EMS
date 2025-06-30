import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar"

import { NavLink, useNavigate } from "react-router-dom"
import { handleLogout } from "@/apis/apiService"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { logoutHR } from "@/redux/Slices/HRSlice"
import { ThemeToggle } from "../common/ThemeToggle"
import { 
    LayoutDashboard, 
    Users, 
    Building2, 
    DollarSign, 
    Clock, 
    Calendar, 
    CalendarDays, 
    UserPlus, 
    MessageSquare, 
    FileText, 
    Shield, 
    Settings, 
    LogOut,
    Crown,
    ChevronLeft,
    ChevronRight
} from "lucide-react"

export function HRdashboardSidebar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { open, setOpen, state } = useSidebar()

    const handleHRLogout = async () => {
        if (isLoggingOut) return
        
        setIsLoggingOut(true)
        try {
            await handleLogout('HR')
            localStorage.removeItem('HRtoken')
            localStorage.removeItem('HRuser')
            dispatch(logoutHR())
            navigate("/auth/HR/login")
        } catch (error) {
            console.error('Logout error:', error)
            localStorage.removeItem('HRtoken')
            localStorage.removeItem('HRuser')
            dispatch(logoutHR())
            navigate("/auth/HR/login")
        } finally {
            setIsLoggingOut(false)
        }
    }

    const menuItems = [
        { to: "/HR/dashboard/dashboard-data", icon: LayoutDashboard, label: "Dashboard", color: "from-blue-500 to-blue-600" },
        { to: "/HR/dashboard/employees", icon: Users, label: "Employees", color: "from-green-500 to-green-600" },
        { to: "/HR/dashboard/departments", icon: Building2, label: "Departments", color: "from-purple-500 to-purple-600" },
        { to: "/HR/dashboard/salaries", icon: DollarSign, label: "Salaries", color: "from-emerald-500 to-emerald-600" },
        { to: "/HR/dashboard/attendances", icon: Clock, label: "Attendances", color: "from-orange-500 to-orange-600" },
        { to: "/HR/dashboard/leaves", icon: Calendar, label: "Leaves", color: "from-red-500 to-red-600" },
        { to: "/HR/dashboard/calendar", icon: CalendarDays, label: "Calendar", color: "from-indigo-500 to-indigo-600" },
        { to: "/HR/dashboard/recruitment", icon: UserPlus, label: "Recruitment", color: "from-pink-500 to-pink-600" },
        { to: "/HR/dashboard/interview-insights", icon: MessageSquare, label: "Interview Insights", color: "from-cyan-500 to-cyan-600" },
        { to: "/HR/dashboard/requests", icon: FileText, label: "Requests", color: "from-yellow-500 to-yellow-600" },
        { to: "/HR/dashboard/hr-profiles", icon: Shield, label: "HR Profiles", color: "from-violet-500 to-violet-600" },
        { to: "/HR/dashboard/settings", icon: Settings, label: "Settings", color: "from-slate-500 to-slate-600" },
    ];

    const isCollapsed = state === "collapsed"

    return (
        <Sidebar 
            collapsible="icon"
            className="border-none shadow-none"
        > 
            {/* Glassmorphic Background Overlay */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-r border-gray-200 rounded-r-3xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-purple-50 to-cyan-50 rounded-r-3xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-r-3xl" />
            </div>

            {/* Header Section */}
            <SidebarHeader className={`relative z-10 border-b border-gray-200 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-6'}`}>
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-4 flex-1">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl ring-2 ring-blue-400/30 hover:ring-blue-400/50 transition-all duration-300 group">
                                <Crown className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    EMS Pro
                                </h2>
                                <p className="text-sm text-gray-600 font-medium">HR Dashboard</p>
                            </div>
                        </div>
                    )}

                    {/* Integrated Collapse Button */}
                    <button
                        onClick={() => setOpen(!open)}
                        className={`p-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-gray-200 hover:border-gray-300 transition-all duration-300 text-gray-700 hover:scale-105 group backdrop-blur-sm shadow-lg ${isCollapsed ? 'mx-auto' : ''}`}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 group-hover:text-blue-600 transition-colors duration-300" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 group-hover:text-blue-600 transition-colors duration-300" />
                        )}
                    </button>
                </div>
            </SidebarHeader>

            {/* Content Section */}
            <SidebarContent className={`relative z-10 flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                {!isCollapsed && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-2">
                                {menuItems.map((item, index) => (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton 
                                            asChild
                                            className="w-full h-auto p-0 bg-transparent hover:bg-transparent border-none"
                                        >
                                            <NavLink 
                                                to={item.to} 
                                                className={({ isActive }) => 
                                                    `flex items-center w-full p-3 rounded-xl transition-all duration-300 group space-x-3 ${
                                                        isActive 
                                                            ? 'bg-white/60 border border-gray-300 shadow-lg transform scale-105' 
                                                            : 'hover:bg-white/40 border border-transparent hover:border-gray-200 hover:transform hover:scale-102'
                                                    }`
                                                }
                                            >
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                                                    <item.icon className="w-5 h-5 text-white" />
                                                </div>
                                                
                                                <span className="text-gray-800 font-medium text-sm flex-1 min-w-0 truncate group-hover:text-gray-900 transition-colors duration-300">
                                                    {item.label}
                                                </span>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {/* Collapsed state - show only icons */}
                {isCollapsed && (
                    <div className="space-y-3">
                        {menuItems.map((item, index) => (
                            <div key={item.to} className="flex justify-center">
                                <NavLink 
                                    to={item.to} 
                                    title={item.label}
                                    className={({ isActive }) => 
                                        `flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group ${
                                            isActive 
                                                ? 'bg-white/60 border border-gray-300 shadow-lg transform scale-105' 
                                                : 'hover:bg-white/40 border border-transparent hover:border-gray-200 hover:transform hover:scale-110'
                                        }`
                                    }
                                >
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                                        <item.icon className="w-4 h-4 text-white" />
                                    </div>
                                </NavLink>
                            </div>
                        ))}
                    </div>
                )}
            </SidebarContent>

            {/* Footer Section */}
            <SidebarFooter className={`relative z-10 border-t border-gray-200 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                {/* Theme Toggle (only when expanded) */}
                {!isCollapsed && (
                    <div className="mb-4">
                        <div className="flex items-center justify-center p-3 rounded-xl bg-white/50 border border-gray-200 hover:bg-white/70 transition-all duration-300">
                            <ThemeToggle variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900" />
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <div className="flex justify-center">
                    {!isCollapsed ? (
                        <button
                            onClick={handleHRLogout}
                            disabled={isLoggingOut}
                            className={`flex items-center w-full p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 hover:border-red-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 transition-all duration-300 group space-x-3 ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 transition-all duration-300 shadow-lg group-hover:scale-110">
                                <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                            </div>
                            
                            <span className="text-red-700 font-medium text-sm flex-1 min-w-0 truncate group-hover:text-red-800 transition-colors duration-300">
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleHRLogout}
                            disabled={isLoggingOut}
                            title="Logout"
                            className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 hover:border-red-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 transition-all duration-300 group ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 transition-all duration-300">
                                <LogOut className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                            </div>
                        </button>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
