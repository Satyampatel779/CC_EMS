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
import { logoutEmployee } from "@/redux/Slices/EmployeeSlice"
import { ThemeToggle } from "../common/ThemeToggle"

export function EmployeeSidebar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleEmployeeLogout = async () => {
        if (isLoggingOut) return
        
        setIsLoggingOut(true)
        try {
            await handleLogout('Employee')
            // Clear Employee specific tokens
            localStorage.removeItem('EMtoken')
            localStorage.removeItem('EMuser')
            localStorage.removeItem('token')
            
            // Clear Redux state
            dispatch(logoutEmployee())
            
            // Redirect to Employee login page
            navigate("/auth/employee/login")
        } catch (error) {
            console.error('Logout error:', error)
            // Even if API fails, clear local storage and Redux state, then redirect
            localStorage.removeItem('EMtoken')
            localStorage.removeItem('EMuser')
            localStorage.removeItem('token')
            dispatch(logoutEmployee())
            navigate("/auth/employee/login")
        } finally {
            setIsLoggingOut(false)
        }
    };

    return (
        <Sidebar>            <SidebarHeader className="border-b border-sidebar-border dark:border-neutral-700 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-sidebar-foreground dark:text-neutral-200">Employee Portal</h2>
                    <ThemeToggle variant="ghost" size="sm" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>                        <SidebarMenu className="gap-3 p-2">                            <SidebarMenuItem>
                                <NavLink to={"/auth/employee/dashboard/overview"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/dashboard.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Dashboard</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/auth/employee/dashboard/profile"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/employee-2.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">My Profile</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/auth/employee/dashboard/attendance"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/attendance.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">My Attendance</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/auth/employee/dashboard/leaves"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/leave.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">My Leaves</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/auth/employee/dashboard/salary"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/salary.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">My Salary</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/auth/employee/dashboard/requests"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/request.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">My Requests</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/auth/employee/dashboard/calendar"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/calendar.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">Company Calendar</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NavLink to={"/auth/employee/dashboard/documents"} className={({ isActive }) => isActive ? "bg-blue-200 dark:bg-blue-800 rounded-lg" : ""}>
                                    <SidebarMenuButton className="flex gap-4 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 w-full">
                                        <img src="/../../src/assets/HR-Dashboard/settings.png" alt="" className="w-7 ms-2 my-1 dark:brightness-0 dark:invert" />
                                        <span className="text-[16px] text-neutral-700 dark:text-neutral-200">My Documents</span>
                                    </SidebarMenuButton>
                                </NavLink>
                            </SidebarMenuItem>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            onClick={handleEmployeeLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                        >
                            <span>👋</span>
                            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
