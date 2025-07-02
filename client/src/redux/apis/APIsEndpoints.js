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
    DELETE: (EMID) => `/api/v1/employee/delete-employee/${EMID}`,
    UPDATE: (EMID) => `/api/v1/employee/update-employee/${EMID}`
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
    GETALL: "/api/v1/leave/all",
    CREATE: "/api/v1/leave/create-leave",
    GETONE: (leaveID) => `/api/v1/leave/${leaveID}`,
    EMPLOYEE_UPDATE: "/api/v1/leave/employee-update-leave",
    HR_UPDATE: "/api/v1/leave/HR-update-leave",
    DELETE: (leaveID) => `/api/v1/leave/delete-leave/${leaveID}`
};

export const AttendanceEndPoints = {
    GETALL: "/api/v1/attendance",
    CREATE: "/api/v1/attendance",
    GETONE: (attendanceID) => `/api/v1/attendance/${attendanceID}`,
    UPDATE: (attendanceID) => `/api/v1/attendance/${attendanceID}`,
    DELETE: (attendanceID) => `/api/v1/attendance/${attendanceID}`,
    GET_BY_EMPLOYEE: (employeeID) => `/api/v1/attendance/employee/${employeeID}`,
    GET_BY_DATE_RANGE: "/api/v1/attendance/date-range"
};

export const CorporateCalendarEndPoints = {
    GETALL: "/api/v1/corporate-calendar/all",
    CREATE: "/api/v1/corporate-calendar/create-event",
    UPDATE: "/api/v1/corporate-calendar/update-event",
    DELETE: (id) => `/api/v1/corporate-calendar/delete-event/${id}`
};

export const RecruitmentEndPoints = {
    GETALL: "/api/v1/recruitment/all",
    CREATE: "/api/v1/recruitment/create-recruitment",
    UPDATE: (id) => `/api/v1/recruitment/update-recruitment/${id}`,
    DELETE: (id) => `/api/v1/recruitment/delete-recruitment/${id}`,
    GETONE: (id) => `/api/v1/recruitment/${id}`,
    GET_APPLICANTS: (id) => `/api/v1/recruitment/${id}/applicants`
};

export const RequestManagementEndPoints = {
    GETALL: "/api/v1/generate-request/all",
    CREATE: "/api/v1/generate-request/create-request",
    CREATE_BY_HR: "/api/v1/generate-request/create-request-by-hr", 
    UPDATE_STATUS: "/api/v1/generate-request/update-request-status",
    UPDATE_CONTENT: "/api/v1/generate-request/update-request-content",
    CLOSE_REQUEST: "/api/v1/generate-request/close-request",
    UPDATE_PRIORITY: "/api/v1/generate-request/update-priority",
    DELETE: (id) => `/api/v1/generate-request/delete-request/${id}`,
    GETONE: (id) => `/api/v1/generate-request/${id}`,
    GET_EMPLOYEE_REQUESTS: (employeeId) => `/api/v1/generate-request/employee/${employeeId}`
};

export const InterviewInsightsEndPoints = {
    GETALL: "/api/v1/interview-insights/all",
    CREATE: "/api/v1/interview-insights/create-insight",
    UPDATE: (id) => `/api/v1/interview-insights/update-insight/${id}`,
    DELETE: (id) => `/api/v1/interview-insights/delete-insight/${id}`,
    GETONE: (id) => `/api/v1/interview-insights/${id}`,
    GET_BY_RECRUITMENT: (recruitmentId) => `/api/v1/interview-insights/recruitment/${recruitmentId}`,
    GET_BY_APPLICANT: (applicantId) => `/api/v1/interview-insights/applicant/${applicantId}`
};

export const HRProfilesEndPoints = {
    GETALL: "/api/v1/HR/all-profiles",
    CREATE: "/api/v1/HR/create-profile",
    UPDATE: (id) => `/api/v1/HR/update-profile/${id}`,
    DELETE: (id) => `/api/v1/HR/delete-profile/${id}`,
    GETONE: (id) => `/api/v1/HR/profile/${id}`,
    UPDATE_PERMISSIONS: (id) => `/api/v1/HR/update-permissions/${id}`,
    CHANGE_PASSWORD: (id) => `/api/v1/HR/change-password/${id}`
};

export const ApplicantEndPoints = {
    GETALL: "/api/v1/applicant/all",
    CREATE: "/api/v1/applicant/create-applicant",
    UPDATE: (id) => `/api/v1/applicant/update-applicant/${id}`,
    DELETE: (id) => `/api/v1/applicant/delete-applicant/${id}`,
    GETONE: (id) => `/api/v1/applicant/${id}`,
    GET_BY_RECRUITMENT: (recruitmentId) => `/api/v1/applicant/recruitment/${recruitmentId}`
};

export const OrganizationEndPoints = {
    GET_INFO: "/api/v1/organization/info",
    UPDATE_INFO: "/api/v1/organization/update"
}

export const ScheduleEndPoints = {
    GETALL: "/api/v1/schedule/all",
    CREATE: "/api/v1/schedule/create-schedule",
    UPDATE: (id) => `/api/v1/schedule/update-schedule/${id}`,
    DELETE: (id) => `/api/v1/schedule/delete-schedule/${id}`,
    GETONE: (id) => `/api/v1/schedule/${id}`,
    GET_BY_EMPLOYEE: (employeeId) => `/api/v1/schedule/employee/${employeeId}`,
    GET_BY_DATE_RANGE: "/api/v1/schedule/date-range"
};

// Combined export for easier access
export const APIsEndpoints = {
    // Employee Authentication
    employeeLogin: APIsEndPoints.LOGIN,
    employeeCheckLogin: APIsEndPoints.CHECKELOGIN,
    employeeForgotPassword: APIsEndPoints.FORGOT_PASSWORD,
    employeeResetPassword: APIsEndPoints.RESET_PASSWORD,

    // HR Authentication
    hrSignup: HREndPoints.SIGNUP,
    hrLogin: HREndPoints.LOGIN,
    hrCheckLogin: HREndPoints.CHECKLOGIN,
    hrVerifyEmail: HREndPoints.VERIFY_EMAIL,
    hrCheckVerifyEmail: HREndPoints.CHECK_VERIFY_EMAIL,
    hrResendVerifyEmail: HREndPoints.RESEND_VERIFY_EMAIL,
    hrForgotPassword: HREndPoints.FORGOT_PASSWORD,
    hrResetPassword: HREndPoints.RESET_PASSWORD,

    // Dashboard
    getDashboardData: DashboardEndPoints.GETDATA,

    // Employee Management
    getAllEmployees: HREmployeesPageEndPoints.GETALL,
    addEmployee: HREmployeesPageEndPoints.ADDEMPLOYEE,
    getEmployeeById: HREmployeesPageEndPoints.GETONE,
    deleteEmployee: HREmployeesPageEndPoints.DELETE,
    getAllEmployeeIds: EmployeesIDsEndPoints.GETALL,

    // Department Management
    getAllDepartments: HRDepartmentPageEndPoints.GETALL,
    createDepartment: HRDepartmentPageEndPoints.CREATE,
    updateDepartment: HRDepartmentPageEndPoints.UPDATE,
    deleteDepartment: HRDepartmentPageEndPoints.DELETE,

    // Salary Management
    getAllSalaries: HRSalaryPageEndPoints.GETALL,
    getSalaryById: HRSalaryPageEndPoints.GETONE,
    createSalary: HRSalaryPageEndPoints.CREATE,
    updateSalary: HRSalaryPageEndPoints.UPDATE,
    deleteSalary: HRSalaryPageEndPoints.DELETE,

    // Leave Management
    getAllLeaves: LeaveEndPoints.GETALL,
    createLeave: LeaveEndPoints.CREATE,
    getLeaveById: LeaveEndPoints.GETONE,
    employeeUpdateLeave: LeaveEndPoints.EMPLOYEE_UPDATE,
    hrUpdateLeave: LeaveEndPoints.HR_UPDATE,
    deleteLeave: LeaveEndPoints.DELETE,

    // Corporate Calendar
    getAllCalendarEvents: CorporateCalendarEndPoints.GETALL,
    createCalendarEvent: CorporateCalendarEndPoints.CREATE,
    updateCalendarEvent: CorporateCalendarEndPoints.UPDATE,
    deleteCalendarEvent: CorporateCalendarEndPoints.DELETE,

    // Schedule Management
    getAllSchedules: ScheduleEndPoints.GETALL,
    createSchedule: ScheduleEndPoints.CREATE,
    updateSchedule: ScheduleEndPoints.UPDATE,
    deleteSchedule: ScheduleEndPoints.DELETE,
    getScheduleById: ScheduleEndPoints.GETONE,
    getSchedulesByEmployee: ScheduleEndPoints.GET_BY_EMPLOYEE,
    getSchedulesByDateRange: ScheduleEndPoints.GET_BY_DATE_RANGE,

    // Recruitment Management
    getAllRecruitments: RecruitmentEndPoints.GETALL,
    createRecruitment: RecruitmentEndPoints.CREATE,
    updateRecruitment: RecruitmentEndPoints.UPDATE,
    deleteRecruitment: RecruitmentEndPoints.DELETE,
    getRecruitmentById: RecruitmentEndPoints.GETONE,
    getApplicantsByRecruitment: RecruitmentEndPoints.GET_APPLICANTS,

    // Request Management
    getAllRequests: RequestManagementEndPoints.GETALL,
    createRequest: RequestManagementEndPoints.CREATE,
    createRequestByHR: RequestManagementEndPoints.CREATE_BY_HR,
    updateRequestStatus: RequestManagementEndPoints.UPDATE_STATUS,
    updateRequestContent: RequestManagementEndPoints.UPDATE_CONTENT,
    closeRequest: RequestManagementEndPoints.CLOSE_REQUEST,
    updateRequestPriority: RequestManagementEndPoints.UPDATE_PRIORITY,
    deleteRequest: RequestManagementEndPoints.DELETE,
    getRequestById: RequestManagementEndPoints.GETONE,
    getEmployeeRequests: RequestManagementEndPoints.GET_EMPLOYEE_REQUESTS,

    // Interview Insights
    getAllInterviewInsights: InterviewInsightsEndPoints.GETALL,
    createInterviewInsight: InterviewInsightsEndPoints.CREATE,
    updateInterviewInsight: InterviewInsightsEndPoints.UPDATE,
    deleteInterviewInsight: InterviewInsightsEndPoints.DELETE,
    getInterviewInsightById: InterviewInsightsEndPoints.GETONE,
    getInterviewInsightsByRecruitment: InterviewInsightsEndPoints.GET_BY_RECRUITMENT,
    getInterviewInsightsByApplicant: InterviewInsightsEndPoints.GET_BY_APPLICANT,

    // HR Profiles Management
    getAllHRProfiles: HRProfilesEndPoints.GETALL,
    createHRProfile: HRProfilesEndPoints.CREATE,
    updateHRProfile: HRProfilesEndPoints.UPDATE,
    deleteHRProfile: HRProfilesEndPoints.DELETE,
    getHRProfileById: HRProfilesEndPoints.GETONE,
    updateHRPermissions: HRProfilesEndPoints.UPDATE_PERMISSIONS,
    changeHRPassword: HRProfilesEndPoints.CHANGE_PASSWORD,

    // Applicant Management
    getAllApplicants: ApplicantEndPoints.GETALL,
    createApplicant: ApplicantEndPoints.CREATE,
    updateApplicant: ApplicantEndPoints.UPDATE,
    deleteApplicant: ApplicantEndPoints.DELETE,
    getApplicantById: ApplicantEndPoints.GETONE,
    getApplicantsByRecruitmentId: ApplicantEndPoints.GET_BY_RECRUITMENT,

    // Organization Management
    getOrganizationInfo: OrganizationEndPoints.GET_INFO,
    updateOrganizationInfo: OrganizationEndPoints.UPDATE_INFO,
};