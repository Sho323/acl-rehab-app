import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32', // 医療用グリーン
    primaryContainer: '#C8E6C9',
    secondary: '#1976D2', // 信頼感のあるブルー
    secondaryContainer: '#BBDEFB',
    tertiary: '#F57C00', // アクセントオレンジ
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#D32F2F',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#212121',
    onBackground: '#212121',
  },
  fonts: {
    ...DefaultTheme.fonts,
    labelLarge: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600',
    },
  },
};