import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { APIsEndpoints } from '../apis/APIsEndpoints';
import { apiService } from '../apis/apiService';

// Async thunks for HR profiles management
export const fetchAllHRProfiles = createAsyncThunk(
  'hrProfiles/fetchAllHRProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getAllHRProfiles, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchHRProfileById = createAsyncThunk(
  'hrProfiles/fetchHRProfileById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(APIsEndpoints.getHRProfileById(id), {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createHRProfile = createAsyncThunk(
  'hrProfiles/createHRProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await apiService.post(APIsEndpoints.createHRProfile, profileData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateHRProfile = createAsyncThunk(
  'hrProfiles/updateHRProfile',
  async ({ id, profileData }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(APIsEndpoints.updateHRProfile(id), profileData, {
        withCredentials: true
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteHRProfile = createAsyncThunk(
  'hrProfiles/deleteHRProfile',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(APIsEndpoints.deleteHRProfile(id), {
        withCredentials: true
      });

      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateHRPermissions = createAsyncThunk(
  'hrProfiles/updateHRPermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(APIsEndpoints.updateHRPermissions(id), 
        { permissions }, 
        { withCredentials: true }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const changeHRPassword = createAsyncThunk(
  'hrProfiles/changeHRPassword',
  async ({ id, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(APIsEndpoints.changeHRPassword(id), 
        { currentPassword, newPassword }, 
        { withCredentials: true }
      );

      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  hrProfiles: [],
  selectedProfile: null,
  currentUser: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  passwordChangeLoading: false,
  filters: {
    department: 'all',
    role: 'all',
    status: 'all', // all, active, inactive
    search: '',
  },
  permissions: {
    canCreateHR: false,
    canEditHR: false,
    canDeleteHR: false,
    canManagePermissions: false,
    canViewAllProfiles: false,
  },
};

const hrProfilesSlice = createSlice({
  name: 'hrProfiles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProfile: (state, action) => {
      state.selectedProfile = action.payload;
    },
    clearSelectedProfile: (state) => {
      state.selectedProfile = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPermissions: (state, action) => {
      state.permissions = { ...state.permissions, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all HR profiles
      .addCase(fetchAllHRProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHRProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.hrProfiles = action.payload;
      })
      .addCase(fetchAllHRProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch HR profile by ID
      .addCase(fetchHRProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHRProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProfile = action.payload;
      })
      .addCase(fetchHRProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create HR profile
      .addCase(createHRProfile.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createHRProfile.fulfilled, (state, action) => {
        state.createLoading = false;
        state.hrProfiles.push(action.payload);
      })
      .addCase(createHRProfile.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Update HR profile
      .addCase(updateHRProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateHRProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.hrProfiles.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.hrProfiles[index] = action.payload;
        }
        if (state.selectedProfile && state.selectedProfile._id === action.payload._id) {
          state.selectedProfile = action.payload;
        }
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateHRProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Delete HR profile
      .addCase(deleteHRProfile.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteHRProfile.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.hrProfiles = state.hrProfiles.filter(p => p._id !== action.payload);
        if (state.selectedProfile && state.selectedProfile._id === action.payload) {
          state.selectedProfile = null;
        }
      })
      .addCase(deleteHRProfile.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })
      // Update HR permissions
      .addCase(updateHRPermissions.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateHRPermissions.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.hrProfiles.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.hrProfiles[index] = action.payload;
        }
        if (state.selectedProfile && state.selectedProfile._id === action.payload._id) {
          state.selectedProfile = action.payload;
        }
      })
      .addCase(updateHRPermissions.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Change HR password
      .addCase(changeHRPassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.error = null;
      })
      .addCase(changeHRPassword.fulfilled, (state) => {
        state.passwordChangeLoading = false;
      })
      .addCase(changeHRPassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedProfile, 
  clearSelectedProfile,
  setCurrentUser,
  setFilters,
  clearFilters,
  setPermissions,
} = hrProfilesSlice.actions;

export default hrProfilesSlice.reducer;
