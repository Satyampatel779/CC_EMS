import { createSlice } from "@reduxjs/toolkit";
import { HandleGetHRSalaries, HandlePostHRSalaries, HandlePatchHRSalaries, HandleDeleteHRSalaries } from "../Thunks/HRSalaryThunk";

const HRSalaryPageSlice = createSlice({
    name: "HRSalaryPage",
    initialState: {
        data: null,
        isLoading: false,
        fetchData: false,
        success: {
            status: false,
            message: null,
            content: null
        },
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    reducers: {
        clearSalaryError: (state) => {
            state.error = {
                status: false,
                message: null,
                content: null
            };
        },
        clearSalarySuccess: (state) => {
            state.success = {
                status: false,
                message: null,
                content: null
            };
        }
    },
    extraReducers: (builder) => {
        // Handle GET requests
        builder.addCase(HandleGetHRSalaries.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(HandleGetHRSalaries.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload.data;
            state.fetchData = true;
            state.error = {
                status: false,
                message: null,
                content: null
            };
        });
        builder.addCase(HandleGetHRSalaries.rejected, (state, action) => {
            state.isLoading = false;
            state.error = {
                status: true,
                message: action.payload?.message || "Failed to fetch salary data",
                content: action.payload
            };
        });

        // Handle POST requests
        builder.addCase(HandlePostHRSalaries.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(HandlePostHRSalaries.fulfilled, (state, action) => {
            state.isLoading = false;
            state.success = {
                status: true,
                message: action.payload.message,
                content: action.payload
            };
            state.fetchData = false;
            state.error = {
                status: false,
                message: null,
                content: null
            };
        });
        builder.addCase(HandlePostHRSalaries.rejected, (state, action) => {
            state.isLoading = false;
            state.error = {
                status: true,
                message: action.payload?.message || "Failed to create salary",
                content: action.payload
            };
        });

        // Handle PATCH requests
        builder.addCase(HandlePatchHRSalaries.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(HandlePatchHRSalaries.fulfilled, (state, action) => {
            state.isLoading = false;
            state.success = {
                status: true,
                message: action.payload.message,
                content: action.payload
            };
            state.fetchData = false;
            state.error = {
                status: false,
                message: null,
                content: null
            };
        });
        builder.addCase(HandlePatchHRSalaries.rejected, (state, action) => {
            state.isLoading = false;
            state.error = {
                status: true,
                message: action.payload?.message || "Failed to update salary",
                content: action.payload
            };
        });

        // Handle DELETE requests
        builder.addCase(HandleDeleteHRSalaries.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(HandleDeleteHRSalaries.fulfilled, (state, action) => {
            state.isLoading = false;
            state.success = {
                status: true,
                message: action.payload.message,
                content: action.payload
            };
            state.fetchData = false;
            state.error = {
                status: false,
                message: null,
                content: null
            };
        });
        builder.addCase(HandleDeleteHRSalaries.rejected, (state, action) => {
            state.isLoading = false;
            state.error = {
                status: true,
                message: action.payload?.message || "Failed to delete salary",
                content: action.payload
            };
        });
    }
});

export const { clearSalaryError, clearSalarySuccess } = HRSalaryPageSlice.actions;
export default HRSalaryPageSlice.reducer;