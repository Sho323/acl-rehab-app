import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store';
import { theme } from './src/theme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';
import ExerciseMenuScreen from './src/screens/ExerciseMenuScreen';
import ExerciseSessionScreen from './src/screens/ExerciseSessionScreen';
import AIAnalysisScreen from './src/screens/AIAnalysisScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ReturnToSportScreen from './src/screens/ReturnToSportScreen';
import RunningCriteriaScreen from './src/screens/RunningCriteriaScreen';
import EvaluationCheckpointsScreen from './src/screens/EvaluationCheckpointsScreen';

// Components
import ErrorBoundary from './src/components/ErrorBoundary';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator
            initialRouteName="Home"
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
              name="Progress" 
              component={ProgressScreen}
              options={{ title: '進捗確認' }}
            />
            <Stack.Screen 
              name="ReturnToSport" 
              component={ReturnToSportScreen}
              options={{ title: '競技復帰評価' }}
            />
            <Stack.Screen 
              name="RunningCriteria" 
              component={RunningCriteriaScreen}
              options={{ title: 'ランニング基準' }}
            />
            <Stack.Screen 
              name="EvaluationCheckpoints" 
              component={EvaluationCheckpointsScreen}
              options={{ title: '評価チェックポイント' }}
            />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}