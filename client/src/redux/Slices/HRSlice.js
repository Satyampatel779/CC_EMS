import { createSlice } from "@reduxjs/toolkit";
import { HRAsyncReducer } from "../AsyncReducers/asyncreducer.js";
import { HandlePostHumanResources, HandleGetHumanResources } from "../Thunks/HRThunk.js";

const HRSlice = createSlice({
    name: "HumanResources",
    initialState: {
        data: null,
        isLoading: false,
        isAuthenticated: false,
        isSignUp: false,
        isAuthourized: false,
        isVerified: false,
        isVerifiedEmailAvailable : false, 
        isResetPassword: false,
        error: {
            status: false,  
            message: null,
            content: null
        }
    },
    reducers: {
        logoutHR: (state) => {
            state.data = null;
            state.isAuthenticated = false;
            state.isAuthourized = false;
            state.isVerified = false;
            state.isVerifiedEmailAvailable = false;
            state.isResetPassword = false;
            state.error = {
                status: false,
                message: null,
                content: null
            };
        }
    },
    extraReducers: (builder) => {
        HRAsyncReducer(builder, HandlePostHumanResources)
        HRAsyncReducer(builder, HandleGetHumanResources)
    }
})

export const { logoutHR } = HRSlice.actions;
export default HRSlice.reducer