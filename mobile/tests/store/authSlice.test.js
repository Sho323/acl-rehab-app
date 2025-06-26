import { configureStore } from '@reduxjs/toolkit';
import authSlice, { 
  loginUser, 
  logoutUser, 
  checkAuthToken, 
  clearError 
} from '../../src/store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';

// API モックの設定
jest.mock('../../src/services/api', () => ({
  authAPI: {
    login: jest.fn(),
    getProfile: jest.fn(),
  },
}));

const { authAPI } = require('../../src/services/api');

describe('authSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    });
  });

  describe('reducers', () => {
    it('should clear error', () => {
      // エラー状態を設定
      store.dispatch({
        type: 'auth/loginUser/rejected',
        payload: 'Test error',
      });

      expect(store.getState().auth.error).toBe('Test error');

      // エラーをクリア
      store.dispatch(clearError());

      expect(store.getState().auth.error).toBeNull();
    });

    it('should update user profile', () => {
      // ユーザーを設定
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: {
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
          token: 'test-token',
        },
      });

      // プロフィールを更新
      store.dispatch({
        type: 'auth/updateUserProfile',
        payload: { name: 'Updated Name', phone: '123-456-7890' },
      });

      const state = store.getState().auth;
      expect(state.user.name).toBe('Updated Name');
      expect(state.user.phone).toBe('123-456-7890');
      expect(state.user.email).toBe('test@example.com'); // 既存の値は保持
    });
  });

  describe('loginUser async thunk', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        token: 'test-jwt-token',
        user: {
          id: 'user-1',
          patientNumber: 'P001',
          name: 'Test Patient',
          currentPhase: 'pre_surgery',
        },
      };

      authAPI.login.mockResolvedValue(mockResponse);
      SecureStore.setItemAsync = jest.fn().mockResolvedValue();

      await store.dispatch(loginUser({
        patientNumber: 'P001',
        password: 'password123',
      }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe(mockResponse.token);
      expect(state.error).toBeNull();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'userToken',
        mockResponse.token
      );
    });

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials';
      authAPI.login.mockRejectedValue({
        response: { data: { error: errorMessage } },
      });

      await store.dispatch(loginUser({
        patientNumber: 'P001',
        password: 'wrongpassword',
      }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('should handle network error', async () => {
      authAPI.login.mockRejectedValue(new Error('Network Error'));

      await store.dispatch(loginUser({
        patientNumber: 'P001',
        password: 'password123',
      }));

      const state = store.getState().auth;
      expect(state.error).toBe('ログインに失敗しました');
    });
  });

  describe('logoutUser async thunk', () => {
    it('should handle successful logout', async () => {
      // 最初にログイン状態を設定
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: {
          user: { id: '1', name: 'Test User' },
          token: 'test-token',
        },
      });

      SecureStore.deleteItemAsync = jest.fn().mockResolvedValue();

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.error).toBeNull();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
    });
  });

  describe('checkAuthToken async thunk', () => {
    it('should handle valid stored token', async () => {
      const mockToken = 'stored-jwt-token';
      const mockUser = {
        id: 'user-1',
        name: 'Test Patient',
        patientNumber: 'P001',
      };

      SecureStore.getItemAsync = jest.fn().mockResolvedValue(mockToken);
      authAPI.getProfile.mockResolvedValue({ user: mockUser });

      await store.dispatch(checkAuthToken());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
    });

    it('should handle no stored token', async () => {
      SecureStore.getItemAsync = jest.fn().mockResolvedValue(null);
      SecureStore.deleteItemAsync = jest.fn().mockResolvedValue();

      await store.dispatch(checkAuthToken());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });

    it('should handle invalid stored token', async () => {
      const mockToken = 'invalid-token';

      SecureStore.getItemAsync = jest.fn().mockResolvedValue(mockToken);
      authAPI.getProfile.mockRejectedValue(new Error('Invalid token'));
      SecureStore.deleteItemAsync = jest.fn().mockResolvedValue();

      await store.dispatch(checkAuthToken());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
    });
  });
});