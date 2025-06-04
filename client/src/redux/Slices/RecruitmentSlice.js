import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { APIsEndpoints } from '../apis/APIsEndpoints';
import { apiService } from '../apis/apiService';

// Async thunks for recruitment management
export const fetchRecruitments = createAsyncThunk(
  'recruitment/fetchRecruitments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getAllRecruitments, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createRecruitment = createAsyncThunk(
  'recruitment/createRecruitment',
  async (recruitmentData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(APIsEndpoints.createRecruitment, recruitmentData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateRecruitment = createAsyncThunk(
  'recruitment/updateRecruitment',
  async ({ id, recruitmentData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(APIsEndpoints.updateRecruitment(id), recruitmentData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteRecruitment = createAsyncThunk(
  'recruitment/deleteRecruitment',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(APIsEndpoints.deleteRecruitment(id), {
        withCredentials: true
      });

      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchApplicantsByRecruitment = createAsyncThunk(
  'recruitment/fetchApplicantsByRecruitment',
  async (recruitmentId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getApplicantsByRecruitment(recruitmentId), {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  recruitments: [],
  selectedRecruitment: null,
  applicants: [],
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

const recruitmentSlice = createSlice({
  name: 'recruitment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRecruitment: (state, action) => {
      state.selectedRecruitment = action.payload;
    },
    clearSelectedRecruitment: (state) => {
      state.selectedRecruitment = null;
    },
    clearApplicants: (state) => {
      state.applicants = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recruitments
      .addCase(fetchRecruitments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruitments.fulfilled, (state, action) => {
        state.loading = false;
        state.recruitments = action.payload;
      })
      .addCase(fetchRecruitments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create recruitment
      .addCase(createRecruitment.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createRecruitment.fulfilled, (state, action) => {
        state.createLoading = false;
        state.recruitments.push(action.payload);
      })
      .addCase(createRecruitment.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Update recruitment
      .addCase(updateRecruitment.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateRecruitment.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.recruitments.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.recruitments[index] = action.payload;
        }
        if (state.selectedRecruitment && state.selectedRecruitment._id === action.payload._id) {
          state.selectedRecruitment = action.payload;
        }
      })
      .addCase(updateRecruitment.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Delete recruitment
      .addCase(deleteRecruitment.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteRecruitment.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.recruitments = state.recruitments.filter(r => r._id !== action.payload);
        if (state.selectedRecruitment && state.selectedRecruitment._id === action.payload) {
          state.selectedRecruitment = null;
        }
      })
      .addCase(deleteRecruitment.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      // Fetch applicants by recruitment
      .addCase(fetchApplicantsByRecruitment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicantsByRecruitment.fulfilled, (state, action) => {
        state.loading = false;
        state.applicants = action.payload;
      })
      .addCase(fetchApplicantsByRecruitment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedRecruitment, 
  clearSelectedRecruitment, 
  clearApplicants 
} = recruitmentSlice.actions;

export default recruitmentSlice.reducer;
