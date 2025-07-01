import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// 初期状態
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// 非同期アクション: ログイン
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ patientNumber, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(patientNumber, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'ログインに失敗しました');
    }
  }
);

// 非同期アクション: プロフィール取得
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'プロフィール取得に失敗しました');
    }
  }
);

// 非同期アクション: ログアウト
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (token, { rejectWithValue }) => {
    try {
      if (token) {
        await authAPI.logout(token);
      }
      return null;
    } catch (error) {
      // ログアウトエラーは無視して正常終了扱い
      return null;
    }
  }
);

// authSlice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ログイン
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // プロフィール取得
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ログアウト
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState);
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;