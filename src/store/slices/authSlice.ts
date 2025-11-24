import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../../types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userAPI } from "../../services/userApi";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  pendingConfirmationEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  pendingConfirmationEmail: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response;
    } catch (error: any) {
      const data = error.response?.data;
      let errorMessage = "Login failed";

      if (data) {
        if (Array.isArray(data.message)) {
          errorMessage = data.message.join(", ");
        } else if (typeof data.message === "string") {
          errorMessage = data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (errorMessage.includes("Account pending admin confirmation")) {
        return rejectWithValue({
          message: errorMessage,
          type: "CONFIRMATION_REQUIRED",
          email: credentials.email,
        });
      }

      return rejectWithValue({
        message: errorMessage,
        type: "LOGIN_ERROR",
      });
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(credentials);
      return { ...response, email: credentials.email };
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || "Registration failed",
        type: "REGISTRATION_ERROR",
      });
    }
  }
);

// Check for existing token on app start
export const checkAuthToken = createAsyncThunk(
  "auth/checkToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        return { accessToken: token };
      }
      return rejectWithValue("No token found");
    } catch (error: any) {
      return rejectWithValue(error.message || "Token check failed");
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const user = await userAPI.getMyProfile();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      state.pendingConfirmationEmail = null;
      AsyncStorage.removeItem("accessToken");
    },
    clearError: (state) => {
      state.error = null;
    },
    setPendingConfirmationEmail: (state, action: PayloadAction<string>) => {
      state.pendingConfirmationEmail = action.payload;
    },
    clearPendingConfirmation: (state) => {
      state.pendingConfirmationEmail = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.pendingConfirmationEmail = null;

          if (action.payload.accessToken) {
            AsyncStorage.setItem("accessToken", action.payload.accessToken);
          }
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        const errorPayload = action.payload as any;

        if (errorPayload?.type === "CONFIRMATION_REQUIRED") {
          state.pendingConfirmationEmail = errorPayload.email;
          state.error = errorPayload.message;
        } else {
          state.error = errorPayload?.message || "Login failed";
        }

        AsyncStorage.removeItem("accessToken");
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingConfirmationEmail = action.payload.email;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        const errorPayload = action.payload as any;
        state.error = errorPayload?.message || "Registration failed";
        state.pendingConfirmationEmail = null;
      })
      // Check Token
      .addCase(checkAuthToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(checkAuthToken.rejected, (state) => {
        state.accessToken = null;
      })
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  logout,
  clearError,
  setCredentials,
  updateUser,
  setPendingConfirmationEmail,
  clearPendingConfirmation,
} = authSlice.actions;
export default authSlice.reducer;
