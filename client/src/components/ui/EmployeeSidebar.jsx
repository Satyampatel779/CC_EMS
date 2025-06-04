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
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>                        <SidebarMenu className="gap-3 p-2">

                            <NavLink to={"/auth/employee/dashboard/overview"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/dashboard.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Dashboard</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/dashboard/profile"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/employee-2.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">My Profile</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/dashboard/attendance"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/attendance.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">My Attendance</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/dashboard/leaves"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/leave.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">My Leaves</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/dashboard/salary"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/salary.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">My Salary</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/dashboard/requests"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/request.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">My Requests</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/dashboard/calendar"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/calendar.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Company Calendar</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/auth/employee/dashboard/documents"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/settings.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">My Documents</button>
                                </SidebarMenuItem>
                            </NavLink>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <button 
                                onClick={handleEmployeeLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                                <span>👋</span>
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
