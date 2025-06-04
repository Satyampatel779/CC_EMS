import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiService } from '../apis/apiService'
import { APIsEndPoints } from '../apis/APIsEndpoints.js'


export const HandleGetEmployees = createAsyncThunk("handleGetEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute } = EmployeeData
        const response = await apiService.get(`${APIsEndPoints[apiroute]}`, { 
            withCredentials: true
        })
        return response.data
    } catch (error) { 
        return rejectWithValue(error.response.data);
    }
})

export const HandlePostEmployees = createAsyncThunk("HandlePostEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute, data, type } = EmployeeData
        if (type == "resetpassword") {
            const response = await apiService.post(`${APIsEndPoints.RESET_PASSWORD(apiroute)}`, data, {
                withCredentials: true
            })
            return response.data
        }
        else {
            const response = await apiService.post(`${APIsEndPoints[apiroute]}`, data, {
                withCredentials: true
            })
            return response.data
        }
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
})

export const HandlePutEmployees = createAsyncThunk(
  "HandlePutEmployees",
  async (_, { rejectWithValue }) => {
    return rejectWithValue({ message: "Not implemented" });
  }
)

export const HandlePatchEmployees = createAsyncThunk(
  "HandlePatchEmployees",
  async (_, { rejectWithValue }) => {
    return rejectWithValue({ message: "Not implemented" });
  }
)

export const HandleDeleteEmployees = createAsyncThunk(
  "HandleDeleteEmployees",
  async (_, { rejectWithValue }) => {
    return rejectWithValue({ message: "Not implemented" });
  }
)
