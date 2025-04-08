export const APIsEndPoints = {
    LOGIN: "/api/auth/employee/login",
    CHECKELOGIN: "/api/auth/employee/check-login",
    FORGOT_PASSWORD: "/api/auth/employee/forgot-password",
    RESET_PASSWORD: (token) => `/api/auth/employee/reset-password/${token}`
}

export const HREndPoints = {
    SIGNUP: "/api/auth/HR/signup",
    CHECKLOGIN: "/api/auth/HR/check-login",
    LOGIN: "/api/auth/HR/login",
    VERIFY_EMAIL: "/api/auth/HR/verify-email",
    CHECK_VERIFY_EMAIL: "/api/auth/HR/check-verify-email",
    RESEND_VERIFY_EMAIL: "/api/auth/HR/resend-verify-email",
    FORGOT_PASSWORD: "/api/auth/HR/forgot-password",
    RESET_PASSWORD: (token) => `/api/auth/HR/reset-password/${token}` 
}

export const DashboardEndPoints = {
    GETDATA: "/api/v1/dashboard/HR-dashboard"
}

export const HREmployeesPageEndPoints = {
    GETALL: "/api/v1/employee/all",
    ADDEMPLOYEE: "/api/auth/employee/signup",
    GETONE: (EMID) => `/api/v1/employee/by-HR/${EMID}`,
    DELETE: (EMID) => `/api/v1/employee/delete-employee/${EMID}`
}

export const HRDepartmentPageEndPoints = {
    GETALL: "/api/v1/department/all",
    CREATE: "/api/v1/department/create-department",
    UPDATE: "/api/v1/department/update-department",
    DELETE: "/api/v1/department/delete-department"
}

export const EmployeesIDsEndPoints = {
    GETALL: "/api/v1/employee/all-employees-ids",
} 

export const HRSalaryPageEndPoints = {
    GETALL: "/api/v1/salary/all",
    GETONE: (id) => `/api/v1/salary/${id}`,
    CREATE: "/api/v1/salary/create-salary",
    UPDATE: "/api/v1/salary/update-salary",
    DELETE: (id) => `/api/v1/salary/delete-salary/${id}`
  };

export const EmployeeIDsEndPoints = {
    GETALL: "/api/v1/employee/all-employees-ids"
};

export const LeaveEndPoints = {
    GETALL: "/api/leave/all",
    CREATE: "/api/leave/create-leave",
    GETONE: (leaveID) => `/api/leave/${leaveID}`,
    EMPLOYEE_UPDATE: "/api/leave/employee-update-leave",
    HR_UPDATE: "/api/leave/HR-update-leave",
    DELETE: (leaveID) => `/api/leave/delete-leave/${leaveID}`
};