import { createSlice } from "@reduxjs/toolkit";
import { HREmployeesPageAsyncReducer } from "../AsyncReducers/asyncreducer.js";
import { HandleDeleteHREmployees, HandlePostHREmployees, HandleGetHREmployees, HandlePatchHREmployees } from "../Thunks/HREmployeesThunk.js";

const HREmployeesSlice = createSlice({
    name: "HREmployees",
    initialState: {
        data: [], 
        isLoading: false,
        success: false,
        fetchData : false, 
        employeeData : null,
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    extraReducers: (builder) => {
        HREmployeesPageAsyncReducer(builder, HandleGetHREmployees) 
        HREmployeesPageAsyncReducer(builder, HandlePostHREmployees)
        HREmployeesPageAsyncReducer(builder, HandleDeleteHREmployees)
        HREmployeesPageAsyncReducer(builder, HandlePatchHREmployees)
    }
})

export default HREmployeesSlice.reducer