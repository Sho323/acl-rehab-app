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
import ExerciseMenuScreen from './src/screens/ExerciseMenuScreen';
import ExerciseSessionScreen from './src/screens/ExerciseSessionScreen';
import AIAnalysisScreen from './src/screens/AIAnalysisScreen';
import ACLRSIScreen from './src/screens/ACLRSIScreen';
import MedicalCollaborationScreen from './src/screens/MedicalCollaborationScreen';
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
              name="ExerciseMenu" 
              component={ExerciseMenuScreen}
              options={{ title: '今日のトレーニング' }}
            />
            <Stack.Screen 
              name="ExerciseSession" 
              component={ExerciseSessionScreen}
              options={{ title: 'トレーニング実行' }}
            />
            <Stack.Screen 
              name="AIAnalysis" 
              component={AIAnalysisScreen}
              options={{ title: 'AI動作分析' }}
            />
            <Stack.Screen 
              name="ACLRSI" 
              component={ACLRSIScreen}
              options={{ title: 'ACL-RSI評価' }}
            />
            <Stack.Screen 
              name="MedicalCollaboration" 
              component={MedicalCollaborationScreen}
              options={{ title: '医療従事者連携' }}
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