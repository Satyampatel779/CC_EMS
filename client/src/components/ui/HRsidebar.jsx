import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import { NavLink, Link, useNavigate } from "react-router-dom"
import { handleLogout } from "@/apis/apiService"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { logoutHR } from "@/redux/Slices/HRSlice"
import { ThemeToggle } from "../common/ThemeToggle"

export function HRdashboardSidebar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleHRLogout = async () => {
        if (isLoggingOut) return
        
        setIsLoggingOut(true)
        try {
            await handleLogout('HR')
            // Clear HR specific tokens
            localStorage.removeItem('HRtoken')
            localStorage.removeItem('HRuser')
            
            // Clear Redux state
            dispatch(logoutHR())
            
            // Redirect to HR login page
            navigate("/auth/HR/login")
        } catch (error) {
            console.error('Logout error:', error)
            // Even if API fails, clear local storage and Redux state, then redirect
            localStorage.removeItem('HRtoken')
            localStorage.removeItem('HRuser')
            dispatch(logoutHR())
            navigate("/auth/HR/login")
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="border-b border-sidebar-border p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-sidebar-foreground">HR Dashboard</h2>
                    <ThemeToggle variant="ghost" size="sm" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>                        <SidebarMenu className="gap-3 p-2">

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/dashboard-data"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/dashboard.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Dashboard</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/employees"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/employee-2.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Employees</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/departments"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/department.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Departments</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/salaries"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/salary.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Salaries</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/attendances"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/attendance.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Attendances</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/leaves"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/leave.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Leaves</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/calendar"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/calendar.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Calendar</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/recruitment"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/recruitment.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Recruitment</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/interview-insights"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/interview.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Interview Insights</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/requests"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/request.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Requests</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/hr-profiles"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/HR-profiles.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">HR Profiles</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/HR/dashboard/settings"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/settings.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Settings</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>            <SidebarFooter className="p-2 border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            onClick={handleHRLogout}
                            disabled={isLoggingOut}
                            className="flex gap-4 w-full p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img 
                                src="/../../src/assets/HR-Dashboard/logout.png" 
                                alt="Logout" 
                                className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" 
                            />
                            <span className="text-[16px] text-red-600 dark:text-red-400 font-medium">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
