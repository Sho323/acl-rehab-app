import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../../services/api';

// 非同期アクション
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ patientNumber, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(patientNumber, password);
      
      // トークンを安全に保存
      await SecureStore.setItemAsync('userToken', response.token);
      
      return {
        user: response.user,
        token: response.token,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'ログインに失敗しました');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      return null;
    } catch (error) {
      return rejectWithValue('ログアウトに失敗しました');
    }
  }
);

export const checkAuthToken = createAsyncThunk(
  'auth/checkAuthToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await authAPI.getProfile(token);
      return {
        user: response.user,
        token: token,
      };
    } catch (error) {
      await SecureStore.deleteItemAsync('userToken');
      return rejectWithValue('認証に失敗しました');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
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
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      // ログアウト
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      // トークン確認
      .addCase(checkAuthToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuthToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;