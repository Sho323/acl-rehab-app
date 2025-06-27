import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { progressAPI } from '../../services/api';

// 非同期アクション: 進捗データ取得
export const fetchProgressData = createAsyncThunk(
  'progress/fetchProgressData',
  async ({ patientId, timeRange, token }, { rejectWithValue }) => {
    try {
      const response = await progressAPI.getProgressData(patientId, timeRange, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || '進捗データの取得に失敗しました');
    }
  }
);

// 非同期アクション: セッション履歴取得
export const fetchSessionHistory = createAsyncThunk(
  'progress/fetchSessionHistory',
  async ({ patientId, limit, token }, { rejectWithValue }) => {
    try {
      const response = await progressAPI.getSessionHistory(patientId, limit, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'セッション履歴の取得に失敗しました');
    }
  }
);

// 非同期アクション: 進捗統計取得
export const fetchProgressStats = createAsyncThunk(
  'progress/fetchProgressStats',
  async ({ patientId, period, token }, { rejectWithValue }) => {
    try {
      const response = await progressAPI.getProgressStats(patientId, period, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || '統計データの取得に失敗しました');
    }
  }
);

const initialState = {
  // 週間・月間目標
  weeklyGoal: {
    completed: 0,
    total: 6,
    targetSessions: 6,
  },
  monthlyGoal: {
    completed: 0,
    total: 24,
    targetSessions: 24,
  },
  
  // 統計データ
  monthlyStats: {
    sessionsCompleted: 0,
    totalExercises: 0,
    totalDuration: 0,
    averagePainLevel: 0,
    averageBorgScale: 0,
    improvementRate: 0,
  },
  
  // セッション履歴
  recentSessions: [],
  sessionHistory: [],
  
  // チャートデータ
  painLevelTrend: [],
  borgScaleTrend: [],
  exerciseCountTrend: [],
  phaseProgressData: [],
  
  // フィルター・設定
  selectedTimeRange: 'week', // week, month, 3months, 6months
  selectedMetric: 'painLevel', // painLevel, borgScale, exerciseCount
  
  // UI状態
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    // ローカルセッションデータの追加
    addSessionToHistory: (state, action) => {
      const sessionData = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        ...action.payload,
      };
      
      state.recentSessions.unshift(sessionData);
      state.sessionHistory.unshift(sessionData);
      
      // 最新20件に制限
      if (state.recentSessions.length > 20) {
        state.recentSessions = state.recentSessions.slice(0, 20);
      }
      
      // 統計を更新
      updateStatsFromSessions(state);
    },
    
    // 目標設定
    setWeeklyGoal: (state, action) => {
      state.weeklyGoal.targetSessions = action.payload;
      state.weeklyGoal.total = action.payload;
    },
    
    setMonthlyGoal: (state, action) => {
      state.monthlyGoal.targetSessions = action.payload;
      state.monthlyGoal.total = action.payload;
    },
    
    // フィルター設定
    setTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload;
    },
    
    setSelectedMetric: (state, action) => {
      state.selectedMetric = action.payload;
    },
    
    // エラークリア
    clearError: (state) => {
      state.error = null;
    },
    
    // リセット
    resetProgress: (state) => {
      return {
        ...initialState,
        selectedTimeRange: state.selectedTimeRange,
        selectedMetric: state.selectedMetric,
      };
    },
    
    // ダミーデータ設定（デモ用）
    setDummyData: (state) => {
      state.weeklyGoal = { completed: 4, total: 6, targetSessions: 6 };
      state.monthlyStats = {
        sessionsCompleted: 18,
        totalExercises: 156,
        totalDuration: 450, // 分
        averagePainLevel: 2.3,
        averageBorgScale: 12.5,
        improvementRate: 15.2,
      };
      state.recentSessions = [
        {
          id: 1,
          date: '2024-12-25',
          exercises: 8,
          duration: 25,
          painLevel: 2,
          borgScale: 11,
          phase: 'phase_3_2',
        },
        {
          id: 2,
          date: '2024-12-23',
          exercises: 6,
          duration: 20,
          painLevel: 3,
          borgScale: 13,
          phase: 'phase_3_2',
        },
        {
          id: 3,
          date: '2024-12-21',
          exercises: 7,
          duration: 22,
          painLevel: 2,
          borgScale: 12,
          phase: 'phase_3_1',
        },
        {
          id: 4,
          date: '2024-12-19',
          exercises: 9,
          duration: 28,
          painLevel: 4,
          borgScale: 14,
          phase: 'phase_3_1',
        },
        {
          id: 5,
          date: '2024-12-17',
          exercises: 5,
          duration: 18,
          painLevel: 3,
          borgScale: 12,
          phase: 'phase_3_1',
        },
      ];
      
      // チャートデータ
      state.painLevelTrend = [
        { date: '12/17', value: 3 },
        { date: '12/19', value: 4 },
        { date: '12/21', value: 2 },
        { date: '12/23', value: 3 },
        { date: '12/25', value: 2 },
      ];
      
      state.borgScaleTrend = [
        { date: '12/17', value: 12 },
        { date: '12/19', value: 14 },
        { date: '12/21', value: 12 },
        { date: '12/23', value: 13 },
        { date: '12/25', value: 11 },
      ];
      
      state.exerciseCountTrend = [
        { date: '12/17', value: 5 },
        { date: '12/19', value: 9 },
        { date: '12/21', value: 7 },
        { date: '12/23', value: 6 },
        { date: '12/25', value: 8 },
      ];
      
      state.lastUpdated = new Date().toISOString();
    },
  },
  
  extraReducers: (builder) => {
    builder
      // 進捗データ取得
      .addCase(fetchProgressData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgressData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyStats = action.payload.stats;
        state.weeklyGoal = action.payload.weeklyGoal;
        state.monthlyGoal = action.payload.monthlyGoal;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProgressData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // セッション履歴取得
      .addCase(fetchSessionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentSessions = action.payload.sessions;
        state.sessionHistory = action.payload.sessions;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSessionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // 統計データ取得
      .addCase(fetchProgressStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgressStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.painLevelTrend = action.payload.painLevelTrend;
        state.borgScaleTrend = action.payload.borgScaleTrend;
        state.exerciseCountTrend = action.payload.exerciseCountTrend;
        state.phaseProgressData = action.payload.phaseProgressData;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProgressStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ヘルパー関数：セッションデータから統計を更新
function updateStatsFromSessions(state) {
  const sessions = state.recentSessions;
  if (sessions.length === 0) return;
  
  // 今週のセッション数を計算
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= weekStart;
  });
  
  state.weeklyGoal.completed = weekSessions.length;
  
  // 今月のセッション数を計算
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= monthStart;
  });
  
  state.monthlyStats.sessionsCompleted = monthSessions.length;
  
  // 平均値計算
  if (monthSessions.length > 0) {
    state.monthlyStats.averagePainLevel = 
      monthSessions.reduce((sum, s) => sum + (s.painLevel || 0), 0) / monthSessions.length;
    state.monthlyStats.averageBorgScale = 
      monthSessions.reduce((sum, s) => sum + (s.borgScale || 0), 0) / monthSessions.length;
    state.monthlyStats.totalExercises = 
      monthSessions.reduce((sum, s) => sum + (s.exercises || 0), 0);
    state.monthlyStats.totalDuration = 
      monthSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  }
}

export const {
  addSessionToHistory,
  setWeeklyGoal,
  setMonthlyGoal,
  setTimeRange,
  setSelectedMetric,
  clearError,
  resetProgress,
  setDummyData,
} = progressSlice.actions;

export default progressSlice.reducer;