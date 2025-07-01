import { configureStore } from '@reduxjs/toolkit'
import EmployeeReducer from "./Slices/EmployeeSlice.js"
import HRReducer from './Slices/HRSlice.js'
import DashbaordReducer from "./Slices/DashboardSlice.js"
import HREmployeesPageReducer from './Slices/HREmployeesPageSlice.js'
import HRDepartmentPageReducer from './Slices/HRDepartmentPageSlice.js'
import EMployeesIDReducer from './Slices/EmployeesIDsSlice.js'
import HRSalaryPageReducer from './Slices/HRSalaryPageSlice.js'
import RecruitmentReducer from './Slices/RecruitmentSlice.js'
import RequestManagementReducer from './Slices/RequestManagementSlice.js'
import InterviewInsightsReducer from './Slices/InterviewInsightsSlice.js'
import HRProfilesReducer from './Slices/HRProfilesSlice.js';

export const store = configureStore({
    reducer: {
        employeereducer: EmployeeReducer,
        HRReducer: HRReducer,
        dashboardreducer: DashbaordReducer,
        HREmployeesPageReducer : HREmployeesPageReducer,
        HRDepartmentPageReducer : HRDepartmentPageReducer,
        EMployeesIDReducer : EMployeesIDReducer,
        HRSalaryPageReducer: HRSalaryPageReducer,
        recruitmentReducer: RecruitmentReducer,
        requestManagementReducer: RequestManagementReducer,
        interviewInsightsReducer: InterviewInsightsReducer,
        hrProfilesReducer: HRProfilesReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})
