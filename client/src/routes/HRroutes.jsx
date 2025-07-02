import { HRSignupPage } from "../pages/HumanResources/HRSignup"
import { HRLogin } from "../pages/HumanResources/HRlogin"
import { HRDashbaord } from "../pages/HumanResources/HRdashbaord"
import { VerifyEmailPage } from "../pages/HumanResources/verifyemailpage.jsx"
// import { ResetEmailConfirm } from "../pages/Employees/resetemailconfirm.jsx"
// import { ResetEmailVerification } from "../pages/HumanResources/resendemailverificaiton.jsx"
import { HRForgotPasswordPage } from "../pages/HumanResources/forgotpassword.jsx"
import { ResetMailConfirmPage } from "../pages/HumanResources/resetmailconfirm.jsx"
import { ResetHRPasswordPage } from "../pages/HumanResources/resetpassword.jsx"
import { ResetHRVerifyEmailPage } from "../pages/HumanResources/resetemail.jsx"
import { HRDashboardPage } from "../pages/HumanResources/Dashboard Childs/dashboardpage.jsx"
import { HRProtectedRoutes } from "./HRprotectedroutes.jsx"
import { HREmployeesPage } from "../pages/HumanResources/Dashboard Childs/employeespage.jsx"
import { SimpleDepartmentPageNoLoading } from "../pages/HumanResources/Dashboard Childs/SimpleDepartmentPageNoLoading.jsx"
import { HRSalaryPage } from "../pages/HumanResources/Dashboard Childs/salarypage.jsx";
import { AttendancesPage } from "../pages/HumanResources/Dashboard Childs/attendances.jsx";
import EnhancedCalendarPage from "../pages/HumanResources/Dashboard Childs/EnhancedCalendarPage.jsx";
import { HRSettingsPage } from "../pages/HumanResources/HRSettingsPage.jsx";
import SimpleRecruitmentPage from "../pages/HumanResources/Dashboard Childs/SimpleRecruitmentPage.jsx";
import RequestManagementPage from "../pages/HumanResources/Dashboard Childs/RequestManagementPage.jsx";
import { InterviewInsightsPage } from "../pages/HumanResources/Dashboard Childs/InterviewInsightsPage.jsx";
import HRProfilesPage from "../pages/HumanResources/Dashboard Childs/HRProfilesPage.jsx";
import { LeavesPage } from "../pages/HumanResources/Dashboard Childs/LeavesPage.jsx";
import { Navigate } from "react-router-dom";
import { SimplifiedLogin } from "../components/auth/SimplifiedLogin";
import { AuthTestPage } from "../components/auth/AuthTestPage";

export const HRRoutes = [
    {
        path: "/auth/HR/signup",
        element: <HRSignupPage />
    },
    {
        path: "/auth/HR/login",
        element: <HRLogin />
    },
    {
        path: "/auth/test",
        element: <AuthTestPage />
    },
    {
        // Add a redirect from /auth/HR/dashboard to /HR/dashboard/dashboard-data
        path: "/auth/HR/dashboard",
        element: <Navigate to="/HR/dashboard/dashboard-data" replace />
    },
    {
        // Add a redirect from /auth/HR/employees to /HR/dashboard/employees
        path: "/auth/HR/employees",
        element: <Navigate to="/HR/dashboard/employees" replace />
    },
    {
        path: "/HR",
        element: <HRProtectedRoutes />
    },
    {
        path: "/HR/dashboard",
        element: <HRDashbaord />,
        children: [
            {
                path: "/HR/dashboard/dashboard-data",
                element: <HRDashboardPage />
            },
            {
                path: "/HR/dashboard/employees",
                element: <HREmployeesPage />
            },
            {
                path: "/HR/dashboard/departments",
                element: <SimpleDepartmentPageNoLoading />
            },
            {
                path: "/HR/dashboard/salaries",
                element: <HRSalaryPage />
            },
            {
                path: "/HR/dashboard/attendances",
                element: <AttendancesPage />
            },
            {
                path: "/HR/dashboard/leaves",
                element: <LeavesPage />
            },
            {
                path: "/HR/dashboard/calendar",
                element: <EnhancedCalendarPage />
            },
            {
                path: "/HR/dashboard/recruitment",
                element: <SimpleRecruitmentPage />
            },
            {
                path: "/HR/dashboard/requests",
                element: <RequestManagementPage />
            },
            {
                path: "/HR/dashboard/interview-insights",
                element: <InterviewInsightsPage />
            },
            {
                path: "/HR/dashboard/hr-profiles",
                element: <HRProfilesPage />
            },
            {
                path: "/HR/dashboard/settings",
                element: <HRSettingsPage />
            }
        ]
    },
    {
        path: "/auth/HR/verify-email",
        element: <VerifyEmailPage />
    },
    {
        path: "/auth/HR/reset-email-validation",
        element: <ResetHRVerifyEmailPage />
    },
    {
        path: "/auth/HR/forgot-password",
        element: <HRForgotPasswordPage />
    },
    {
        path: "/auth/HR/reset-email-confirmation",
        element: <ResetMailConfirmPage />
    },
    {
        path: "/auth/HR/resetpassword/:token",
        element: <ResetHRPasswordPage />
    },
    {
        path: "/debug/login",
        element: <SimplifiedLogin />
    }
]
