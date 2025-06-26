// React Nativeテスト環境のセットアップ
import 'react-native-gesture-handler/jestSetup';

// React Navigation のモック
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// React Native Paper のモック
jest.mock('react-native-paper', () => {
  const RN = require('react-native');
  return {
    ...jest.requireActual('react-native-paper'),
    Portal: ({ children }) => children,
    Dialog: ({ children, visible }) => visible ? children : null,
    Modal: ({ children, visible }) => visible ? children : null,
  };
});

// Expo SecureStore のモック
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Expo Camera のモック
jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front',
      },
    },
    requestCameraPermissionsAsync: jest.fn(() => 
      Promise.resolve({ status: 'granted' })
    ),
  },
}));

// AsyncStorage のモック（必要に応じて）
jest.mock('@react-native-async-storage/async-storage', () => 
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// ネットワークリクエストのモック
global.fetch = jest.fn();

// タイムアウト設定
jest.setTimeout(10000);

// コンソール警告の抑制
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};