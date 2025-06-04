import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { APIsEndpoints } from '../apis/APIsEndpoints';
import { apiService } from '../apis/apiService';

// Async thunks for interview insights management
export const fetchInterviewInsights = createAsyncThunk(
  'interviewInsights/fetchInterviewInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getAllInterviewInsights, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createInterviewInsight = createAsyncThunk(
  'interviewInsights/createInterviewInsight',
  async (insightData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(APIsEndpoints.createInterviewInsight, insightData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateInterviewInsight = createAsyncThunk(
  'interviewInsights/updateInterviewInsight',
  async ({ id, insightData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(APIsEndpoints.updateInterviewInsight(id), insightData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteInterviewInsight = createAsyncThunk(
  'interviewInsights/deleteInterviewInsight',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(APIsEndpoints.deleteInterviewInsight(id), {
        withCredentials: true
      });

      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchInterviewInsightsByRecruitment = createAsyncThunk(
  'interviewInsights/fetchInterviewInsightsByRecruitment',
  async (recruitmentId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getInterviewInsightsByRecruitment(recruitmentId), {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchInterviewInsightsByApplicant = createAsyncThunk(
  'interviewInsights/fetchInterviewInsightsByApplicant',
  async (applicantId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getInterviewInsightsByApplicant(applicantId), {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  insights: [],
  selectedInsight: null,
  recruitmentInsights: [],
  applicantInsights: [],
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  filters: {
    recruitment: null,
    applicant: null,
    status: 'all', // all, scheduled, completed, cancelled
    interviewType: 'all', // all, phone, video, in-person, technical
    dateFrom: null,
    dateTo: null,
  },
  statistics: {
    totalInterviews: 0,
    completedInterviews: 0,
    averageRating: 0,
    topPerformers: [],
  },
};

const interviewInsightsSlice = createSlice({
  name: 'interviewInsights',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedInsight: (state, action) => {
      state.selectedInsight = action.payload;
    },
    clearSelectedInsight: (state) => {
      state.selectedInsight = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearRecruitmentInsights: (state) => {
      state.recruitmentInsights = [];
    },
    clearApplicantInsights: (state) => {
      state.applicantInsights = [];
    },
    updateStatistics: (state) => {
      const insights = state.insights;
      const completed = insights.filter(i => i.status === 'completed');
      
      state.statistics.totalInterviews = insights.length;
      state.statistics.completedInterviews = completed.length;
      
      if (completed.length > 0) {
        const totalRating = completed.reduce((sum, insight) => {
          const rating = insight.overallRating || 0;
          return sum + rating;
        }, 0);
        state.statistics.averageRating = totalRating / completed.length;
      } else {
        state.statistics.averageRating = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch interview insights
      .addCase(fetchInterviewInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
        interviewInsightsSlice.caseReducers.updateStatistics(state);
      })
      .addCase(fetchInterviewInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create interview insight
      .addCase(createInterviewInsight.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createInterviewInsight.fulfilled, (state, action) => {
        state.createLoading = false;
        state.insights.push(action.payload);
        interviewInsightsSlice.caseReducers.updateStatistics(state);
      })
      .addCase(createInterviewInsight.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Update interview insight
      .addCase(updateInterviewInsight.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateInterviewInsight.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.insights.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.insights[index] = action.payload;
        }
        if (state.selectedInsight && state.selectedInsight._id === action.payload._id) {
          state.selectedInsight = action.payload;
        }
        interviewInsightsSlice.caseReducers.updateStatistics(state);
      })
      .addCase(updateInterviewInsight.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Delete interview insight
      .addCase(deleteInterviewInsight.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteInterviewInsight.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.insights = state.insights.filter(i => i._id !== action.payload);
        if (state.selectedInsight && state.selectedInsight._id === action.payload) {
          state.selectedInsight = null;
        }
        interviewInsightsSlice.caseReducers.updateStatistics(state);
      })
      .addCase(deleteInterviewInsight.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      // Fetch insights by recruitment
      .addCase(fetchInterviewInsightsByRecruitment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewInsightsByRecruitment.fulfilled, (state, action) => {
        state.loading = false;
        state.recruitmentInsights = action.payload;
      })
      .addCase(fetchInterviewInsightsByRecruitment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch insights by applicant
      .addCase(fetchInterviewInsightsByApplicant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewInsightsByApplicant.fulfilled, (state, action) => {
        state.loading = false;
        state.applicantInsights = action.payload;
      })
      .addCase(fetchInterviewInsightsByApplicant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedInsight, 
  clearSelectedInsight,
  setFilters,
  clearFilters,
  clearRecruitmentInsights,
  clearApplicantInsights,
  updateStatistics,
} = interviewInsightsSlice.actions;

export default interviewInsightsSlice.reducer;
