import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import authSlice from '../../src/store/slices/authSlice';

// Alert のモック
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Navigation のモック
const mockNavigation = {
  replace: jest.fn(),
};

describe('LoginScreen', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
    jest.clearAllMocks();
  });

  const renderLoginScreen = () => {
    return render(
      <Provider store={store}>
        <LoginScreen navigation={mockNavigation} />
      </Provider>
    );
  };

  it('should render login form correctly', () => {
    const { getByText, getByDisplayValue } = renderLoginScreen();

    expect(getByText('ACL リハビリアプリ')).toBeTruthy();
    expect(getByText('前十字靭帯損傷患者用')).toBeTruthy();
    expect(getByText('ログイン')).toBeTruthy();
    expect(getByText('ログインでお困りの場合は、担当の医療従事者にお尋ねください。')).toBeTruthy();
  });

  it('should handle patient number input', () => {
    const { getByDisplayValue, getByLabelText } = renderLoginScreen();
    
    const patientNumberInput = getByLabelText('患者番号');
    fireEvent.changeText(patientNumberInput, 'P001');

    expect(patientNumberInput.props.value).toBe('P001');
  });

  it('should handle password input', () => {
    const { getByLabelText } = renderLoginScreen();
    
    const passwordInput = getByLabelText('パスワード');
    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('should toggle password visibility', () => {
    const { getByLabelText, getByRole } = renderLoginScreen();
    
    const passwordInput = getByLabelText('パスワード');
    const toggleButton = passwordInput.findByType('TextInput.Icon');

    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it('should validate empty fields', async () => {
    const { getByText } = renderLoginScreen();
    
    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '入力エラー',
        '患者番号とパスワードを入力してください。'
      );
    });
  });

  it('should dispatch login action with valid inputs', async () => {
    const { getByLabelText, getByText } = renderLoginScreen();
    
    const patientNumberInput = getByLabelText('患者番号');
    const passwordInput = getByLabelText('パスワード');
    const loginButton = getByText('ログイン');

    fireEvent.changeText(patientNumberInput, 'P001');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Redux アクションの実行を確認
    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.isLoading).toBe(false);
    });
  });

  it('should show loading state during authentication', () => {
    // ローディング状態を設定
    store.dispatch({
      type: 'auth/loginUser/pending',
    });

    const { getByText } = renderLoginScreen();
    
    expect(getByText('認証中...')).toBeTruthy();
  });

  it('should navigate to home on successful authentication', async () => {
    // 認証成功状態を設定
    store.dispatch({
      type: 'auth/loginUser/fulfilled',
      payload: {
        user: { id: '1', name: 'Test User' },
        token: 'test-token',
      },
    });

    renderLoginScreen();

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });
  });

  it('should show error alert on authentication failure', async () => {
    // エラー状態を設定
    store.dispatch({
      type: 'auth/loginUser/rejected',
      payload: 'Invalid credentials',
    });

    renderLoginScreen();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'ログインエラー',
        'Invalid credentials',
        expect.any(Array)
      );
    });
  });

  it('should disable inputs during loading', () => {
    // ローディング状態を設定
    store.dispatch({
      type: 'auth/loginUser/pending',
    });

    const { getByLabelText, getByText } = renderLoginScreen();
    
    const patientNumberInput = getByLabelText('患者番号');
    const passwordInput = getByLabelText('パスワード');
    const loginButton = getByText('ログイン');

    expect(patientNumberInput.props.disabled).toBe(true);
    expect(passwordInput.props.disabled).toBe(true);
    expect(loginButton.props.disabled).toBe(true);
  });
});