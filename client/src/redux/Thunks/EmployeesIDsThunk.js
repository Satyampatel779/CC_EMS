import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../apis/apiService";
import { EmployeeIDsEndPoints } from "../apis/APIsEndpoints";

export const HandleGetEmployeeIDs = createAsyncThunk('HandleGetEmployeeIDs', async (_, { rejectWithValue }) => {
    try {
        const response = await apiService.get(EmployeeIDsEndPoints.GETALL || "/api/v1/employee/all-employees-ids", {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Failed to fetch employee IDs" });
    }
});
export const fetchEmployeesIDs = HandleGetEmployeeIDs;