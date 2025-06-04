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
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>HR-Dashboard EMS</SidebarGroupLabel> */}
                    <SidebarGroupContent>

                        <SidebarMenu className="gap-3 p-2">


                            <NavLink to={"/HR/dashboard/dashboard-data"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>

                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/dashboard.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Dashboard</button>
                                </SidebarMenuItem>

                            </NavLink>


                            <NavLink to={"/HR/dashboard/employees"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>

                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/employee-2.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Employees</button>
                                </SidebarMenuItem>

                            </NavLink>



                            <NavLink to={"/HR/dashboard/departments"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>

                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">

                                    <img src="/../../src/assets/HR-Dashboard/department.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Departments</button>

                                </SidebarMenuItem>

                            </NavLink>
                            <NavLink to={"/HR/dashboard/salaries"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/salary.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Salaries</button>
                                 </SidebarMenuItem>
                            </NavLink>
                            

                            <NavLink to={"/HR/dashboard/attendances"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/attendance.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Attendances</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/leaves"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/leave.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Leaves</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/calendar"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/calendar.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Calendar</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/recruitment"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/recruitment.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Recruitment</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/interview-insights"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/interview.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Interview Insights</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/requests"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/request.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Requests</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/hr-profiles"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/HR-profiles.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">HR Profiles</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to={"/HR/dashboard/settings"} className={({ isActive }) => { return isActive ? "bg-blue-200 rounded-lg" : "" }}>
                                <SidebarMenuItem className="flex gap-4 hover:bg-blue-200 rounded-lg">
                                    <img src="/../../src/assets/HR-Dashboard/settings.png" alt="" className="w-7 ms-2 my-1" />
                                    <button className="text-[16px]">Settings</button>
                                </SidebarMenuItem>
                            </NavLink>

                        </SidebarMenu>

                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <button 
                            onClick={handleHRLogout}
                            disabled={isLoggingOut}
                            className="flex gap-4 w-full p-2 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img 
                                src="/../../src/assets/HR-Dashboard/logout.png" 
                                alt="Logout" 
                                className="w-7 ms-2 my-1" 
                            />
                            <span className="text-[16px] text-red-600 font-medium">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </span>
                        </button>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )

}
