import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { AsyncReducer } from "../AsyncReducers/asyncreducer"
import { HandlePostEmployees, HandleGetEmployees } from "../Thunks/EmployeeThunk"

const EmployeeSlice = createSlice({
    name: 'employees',
    initialState: {
        data: null, 
        isLoading: false,
        isAuthenticated: false,
        isAuthourized: false,
        isResetPasswords: false,
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    reducers: {
        logoutEmployee: (state) => {
            state.data = null;
            state.isAuthenticated = false;
            state.isAuthourized = false;
            state.isResetPasswords = false;
            state.error = {
                status: false,
                message: null,
                content: null
            };
        }
    },
    extraReducers: (builder) => {
        AsyncReducer(builder, HandlePostEmployees); 
        AsyncReducer(builder, HandleGetEmployees)
    }
})

export const { logoutEmployee } = EmployeeSlice.actions;
export default EmployeeSlice.reducer