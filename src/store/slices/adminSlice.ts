import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminState, ConfirmUserResponse, User } from '../../types/user';
import { adminAPI } from '../../services/adminApi';

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
};

export const getUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'admin/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllUsers();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const confirmUser = createAsyncThunk<ConfirmUserResponse, string, { rejectValue: string }>(
  'admin/confirmUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.confirmUser(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm user');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserStatus: (state, action: PayloadAction<{ userId: string; isConfirmed: boolean }>) => {
      const user = state.users.find(u => u._id === action.payload.userId);
      if (user) {
        user.isConfirmed = action.payload.isConfirmed;
      }
    },
    updateUserOnlineStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      // This would be handled by socket updates
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm User
      .addCase(confirmUser.fulfilled, (state, action) => {
        const user = state.users.find(u => u._id === action.payload._id);
        if (user) {
          user.isConfirmed = true;
        }
      })
      .addCase(confirmUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateUserStatus, updateUserOnlineStatus } = adminSlice.actions;
export default adminSlice.reducer;