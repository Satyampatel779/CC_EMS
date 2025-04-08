import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../apis/apiService";
import { HRSalaryPageEndPoints } from "../apis/APIsEndpoints";

export const HandleGetHRSalaries = createAsyncThunk('HandleGetHRSalaries', async (HRSalaryPageData, { rejectWithValue }) => {
    try {
        const { apiroute } = HRSalaryPageData;
        const response = await apiService.get(`${HRSalaryPageEndPoints[apiroute]}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Failed to fetch salary data" });
    }
});

export const HandlePostHRSalaries = createAsyncThunk('HandlePostHRSalaries', async (HRSalaryPageData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = HRSalaryPageData;
        const response = await apiService.post(`${HRSalaryPageEndPoints[apiroute]}`, data, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Failed to create salary" });
    }
});

export const HandlePatchHRSalaries = createAsyncThunk('HandlePatchHRSalaries', async (HRSalaryPageData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = HRSalaryPageData;
        const response = await apiService.patch(`${HRSalaryPageEndPoints[apiroute]}`, data, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Failed to update salary" });
    }
});

export const HandleDeleteHRSalaries = createAsyncThunk('HandleDeleteHRSalaries', async (HRSalaryPageData, { rejectWithValue }) => {
    try {
        const { apiroute } = HRSalaryPageData;
        const response = await apiService.delete(`${HRSalaryPageEndPoints.DELETE(apiroute)}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Failed to delete salary" });
    }
});