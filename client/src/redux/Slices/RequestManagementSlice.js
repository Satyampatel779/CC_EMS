import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { APIsEndpoints } from '../apis/APIsEndpoints';
import { apiService } from '../apis/apiService';

// Async thunks for request management
export const fetchAllRequests = createAsyncThunk(
  'requestManagement/fetchAllRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getAllRequests, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchEmployeeRequests = createAsyncThunk(
  'requestManagement/fetchEmployeeRequests',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getEmployeeRequests(employeeId), {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createRequestByHR = createAsyncThunk(
  'requestManagement/createRequestByHR',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(APIsEndpoints.createRequestByHR, requestData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateRequestContent = createAsyncThunk(
  'requestManagement/updateRequestContent',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(APIsEndpoints.updateRequestContent, requestData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const closeRequest = createAsyncThunk(
  'requestManagement/closeRequest',
  async ({ id, closedBy, hrComments }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(APIsEndpoints.closeRequest, 
        { requestID: id, closedBy, hrComments }, 
        { withCredentials: true }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateRequestPriority = createAsyncThunk(
  'requestManagement/updateRequestPriority',
  async ({ id, priority, updatedBy }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(APIsEndpoints.updateRequestPriority, 
        { requestID: id, priority, updatedBy }, 
        { withCredentials: true }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'requestManagement/updateRequestStatus',
  async ({ id, status, comments }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(APIsEndpoints.updateRequestStatus, 
        { requestID: id, status, approvedby: comments }, 
        { withCredentials: true }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteRequest = createAsyncThunk(
  'requestManagement/deleteRequest',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(APIsEndpoints.deleteRequest(id), {
        withCredentials: true
      });

      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRequestById = createAsyncThunk(
  'requestManagement/fetchRequestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getRequestById(id), {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createRequest = createAsyncThunk(
  'requestManagement/createRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(APIsEndpoints.createRequest, requestData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  requests: [],
  employeeRequests: [],
  selectedRequest: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  hrCreateLoading: false,
  closeLoading: false,
  priorityUpdateLoading: false,
  filters: {
    status: 'all', // all, pending, approved, rejected, closed
    type: 'all', // all, IT Support, HR Support, Facilities, Finance, General
    priority: 'all', // all, low, medium, high
    dateFrom: null,
    dateTo: null,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
    limit: 10,
  },
};

const requestManagementSlice = createSlice({
  name: 'requestManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearEmployeeRequests: (state) => {
      state.employeeRequests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all requests
      .addCase(fetchAllRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch employee requests
      .addCase(fetchEmployeeRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeRequests = action.payload;
      })
      .addCase(fetchEmployeeRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create request
      .addCase(createRequest.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.createLoading = false;
        state.requests.unshift(action.payload);
        state.employeeRequests.unshift(action.payload);
      })      .addCase(createRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Create request by HR
      .addCase(createRequestByHR.pending, (state) => {
        state.hrCreateLoading = true;
        state.error = null;
      })
      .addCase(createRequestByHR.fulfilled, (state, action) => {
        state.hrCreateLoading = false;
        state.requests.unshift(action.payload);
      })
      .addCase(createRequestByHR.rejected, (state, action) => {
        state.hrCreateLoading = false;
        state.error = action.payload;
      })
      // Update request content
      .addCase(updateRequestContent.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateRequestContent.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.requests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        const empIndex = state.employeeRequests.findIndex(r => r._id === action.payload._id);
        if (empIndex !== -1) {
          state.employeeRequests[empIndex] = action.payload;
        }
      })
      .addCase(updateRequestContent.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Close request
      .addCase(closeRequest.pending, (state) => {
        state.closeLoading = true;
        state.error = null;
      })
      .addCase(closeRequest.fulfilled, (state, action) => {
        state.closeLoading = false;
        const index = state.requests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        const empIndex = state.employeeRequests.findIndex(r => r._id === action.payload._id);
        if (empIndex !== -1) {
          state.employeeRequests[empIndex] = action.payload;
        }
        if (state.selectedRequest && state.selectedRequest._id === action.payload._id) {
          state.selectedRequest = action.payload;
        }
      })
      .addCase(closeRequest.rejected, (state, action) => {
        state.closeLoading = false;
        state.error = action.payload;
      })
      // Update request priority
      .addCase(updateRequestPriority.pending, (state) => {
        state.priorityUpdateLoading = true;
        state.error = null;
      })
      .addCase(updateRequestPriority.fulfilled, (state, action) => {
        state.priorityUpdateLoading = false;
        const index = state.requests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        const empIndex = state.employeeRequests.findIndex(r => r._id === action.payload._id);
        if (empIndex !== -1) {
          state.employeeRequests[empIndex] = action.payload;
        }
        if (state.selectedRequest && state.selectedRequest._id === action.payload._id) {
          state.selectedRequest = action.payload;
        }
      })
      .addCase(updateRequestPriority.rejected, (state, action) => {
        state.priorityUpdateLoading = false;
        state.error = action.payload;
      })
      // Update request status
      .addCase(updateRequestStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.requests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        const empIndex = state.employeeRequests.findIndex(r => r._id === action.payload._id);
        if (empIndex !== -1) {
          state.employeeRequests[empIndex] = action.payload;
        }
        if (state.selectedRequest && state.selectedRequest._id === action.payload._id) {
          state.selectedRequest = action.payload;
        }
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Delete request
      .addCase(deleteRequest.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.requests = state.requests.filter(r => r._id !== action.payload);
        state.employeeRequests = state.employeeRequests.filter(r => r._id !== action.payload);
        if (state.selectedRequest && state.selectedRequest._id === action.payload) {
          state.selectedRequest = null;
        }
      })
      .addCase(deleteRequest.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      // Fetch request by ID
      .addCase(fetchRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRequest = action.payload;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedRequest, 
  clearSelectedRequest,
  setFilters,
  clearFilters,
  setPagination,
  clearEmployeeRequests,
} = requestManagementSlice.actions;

export default requestManagementSlice.reducer;
