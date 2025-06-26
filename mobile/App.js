import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store';
import { theme } from './src/theme';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'ACL リハビリ' }}
            />
            <Stack.Screen 
              name="Exercise" 
              component={ExerciseScreen}
              options={{ title: '自主トレーニング' }}
            />
            <Stack.Screen 
              name="Progress" 
              component={ProgressScreen}
              options={{ title: '進捗確認' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'プロフィール' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}