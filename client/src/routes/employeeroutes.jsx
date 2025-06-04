import { EmployeeLogin } from "../pages/Employees/emplyoeelogin.jsx"
import { EmployeeDashboard } from "../pages/Employees/employeedashboard.jsx"
import EmployeeDashboardLayout from "../pages/Employees/EmployeeDashboardLayout.jsx"
import EmployeeDashboardOverview from "../pages/Employees/Dashboard Pages/EmployeeDashboardOverview.jsx"
import EmployeeProfile from "../pages/Employees/Dashboard Pages/EmployeeProfile.jsx"
import EmployeeAttendance from "../pages/Employees/Dashboard Pages/EmployeeAttendance.jsx"
import EmployeeLeaves from "../pages/Employees/Dashboard Pages/EmployeeLeaves.jsx"
import EmployeeSalary from "../pages/Employees/Dashboard Pages/EmployeeSalary.jsx"
import EmployeeRequests from "../pages/Employees/Dashboard Pages/EmployeeRequests.jsx"
import CompanyCalendar from "../pages/Employees/Dashboard Pages/CompanyCalendar.jsx"
import MyDocuments from "../pages/Employees/Dashboard Pages/MyDocuments.jsx"
import { ProtectedRoutes } from "./protectedroutes.jsx"
import { ForgotPassword } from "../pages/Employees/forgotpassword.jsx"
import { ResetEmailConfirm } from "../pages/Employees/resetemailconfirm.jsx"
import { ResetPassword } from "../pages/Employees/resetpassword.jsx"
import { EntryPage } from "../pages/Employees/EntryPage.jsx"
// import { VerifyEmailPage } from "../pages/common/verifyemailpage.jsx"

export const EmployeeRoutes = [
    {
        path: "/",
        element: <EntryPage />
    },
    {
        path: "/auth/employee/login",
        element: <EmployeeLogin />
    },
    // {
    //     path: "/auth/employee/verify-email", 
    //     element: <VerifyEmailPage />
    // },
    {
        path: "/auth/employee/employee-dashboard",
        element: <ProtectedRoutes> <EmployeeDashboard /> </ProtectedRoutes>
    },
    {
        path: "/auth/employee/dashboard",
        element: <ProtectedRoutes> <EmployeeDashboardLayout /> </ProtectedRoutes>,
        children: [
            {
                index: true,
                element: <EmployeeDashboardOverview />
            },
            {
                path: "overview",
                element: <EmployeeDashboardOverview />
            },
            {
                path: "profile",
                element: <EmployeeProfile />
            },
            {
                path: "attendance",
                element: <EmployeeAttendance />
            },
            {
                path: "leaves",
                element: <EmployeeLeaves />
            },
            {
                path: "salary",
                element: <EmployeeSalary />
            },
            {
                path: "requests",
                element: <EmployeeRequests />
            },
            {
                path: "calendar",
                element: <CompanyCalendar />
            },
            {
                path: "documents",
                element: <MyDocuments />
            }
        ]
    },
    {
        path: "/auth/employee/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/auth/employee/reset-email-confirmation",
        element: <ResetEmailConfirm />
    },
    {
        path: "/auth/employee/resetpassword/:token",
        element: <ResetPassword /> 
    },
]

