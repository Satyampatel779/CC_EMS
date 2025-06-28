import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "../../components/ui/EmployeeSidebar.jsx";
import { Outlet } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const EmployeeDashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // If on the base dashboard route, redirect to overview
        if (location.pathname === "/auth/employee/dashboard") {
            navigate("/auth/employee/dashboard/overview");
        }
    }, [location.pathname, navigate]);

    return (
        <div className="employee-dashboard-container flex">
            <div className="employee-dashboard-sidebar">
                <SidebarProvider>
                    {/* Single child wrapper for SidebarProvider */}
                    <div>
                        <EmployeeSidebar />
                        <div className="sidebar-container min-[250px]:absolute md:relative">
                            <SidebarTrigger />
                        </div>
                    </div>
                </SidebarProvider>
            </div>
            <div className="employee-dashboard-content h-screen w-full min-[250px]:mx-1 md:mx-2 flex flex-col">
                <Outlet />
            </div>
        </div>
    );
};

export default EmployeeDashboardLayout;
