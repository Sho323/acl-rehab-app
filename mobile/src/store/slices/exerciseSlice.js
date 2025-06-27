import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exerciseAPI } from '../../services/api';

// 非同期アクション: 運動カテゴリー取得
export const fetchCategories = createAsyncThunk(
  'exercise/fetchCategories',
  async ({ phase, token }, { rejectWithValue }) => {
    try {
      const response = await exerciseAPI.getCategories(phase, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'カテゴリー取得に失敗しました');
    }
  }
);

// 非同期アクション: フェーズ別運動取得
export const fetchExercisesByPhase = createAsyncThunk(
  'exercise/fetchExercisesByPhase',
  async ({ phase, token }, { rejectWithValue }) => {
    try {
      const response = await exerciseAPI.getExercisesByPhase(phase, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || '運動メニューの取得に失敗しました');
    }
  }
);

// 非同期アクション: 患者の運動プラン取得
export const fetchPatientExercisePlan = createAsyncThunk(
  'exercise/fetchPatientExercisePlan',
  async ({ patientId, phase, token }, { rejectWithValue }) => {
    try {
      const response = await exerciseAPI.getPatientExercisePlan(patientId, phase, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || '運動プランの取得に失敗しました');
    }
  }
);

// 非同期アクション: 運動セッション記録
export const recordExerciseSession = createAsyncThunk(
  'exercise/recordSession',
  async ({ sessionData, token }, { rejectWithValue }) => {
    try {
      const response = await exerciseAPI.recordSession(sessionData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'セッション記録に失敗しました');
    }
  }
);

const initialState = {
  categories: [],
  exercises: [],
  patientPlan: [],
  currentSession: null,
  sessionHistory: [],
  isLoading: false,
  error: null,
  currentExerciseIndex: 0,
  exerciseProgress: {},
  currentPhase: 'pre_surgery',
};

const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentExerciseIndex: (state, action) => {
      state.currentExerciseIndex = action.payload;
    },
    updateExerciseProgress: (state, action) => {
      const { exerciseId, progress } = action.payload;
      state.exerciseProgress[exerciseId] = {
        ...state.exerciseProgress[exerciseId],
        ...progress,
      };
    },
    resetExerciseProgress: (state) => {
      state.exerciseProgress = {};
      state.currentExerciseIndex = 0;
    },
    setCurrentPhase: (state, action) => {
      state.currentPhase = action.payload;
    },
    startLocalSession: (state, action) => {
      state.currentSession = {
        id: Date.now(),
        patientId: action.payload.patientId,
        phase: action.payload.phase,
        startTime: new Date().toISOString(),
        exercises: [],
        painLevel: null,
        borgScale: null,
        location: null,
        notes: '',
      };
    },
    endLocalSession: (state) => {
      if (state.currentSession) {
        state.currentSession.endTime = new Date().toISOString();
        state.currentSession.completed = true;
      }
    },
    addExerciseToSession: (state, action) => {
      if (state.currentSession) {
        state.currentSession.exercises.push(action.payload);
      }
    },
    // セッション実行関連のアクション
    setCurrentExercise: (state, action) => {
      state.currentExercise = action.payload;
    },
    updateExerciseProgress: (state, action) => {
      const { exerciseId, progress } = action.payload;
      if (!state.exerciseProgress[exerciseId]) {
        state.exerciseProgress[exerciseId] = {};
      }
      state.exerciseProgress[exerciseId] = {
        ...state.exerciseProgress[exerciseId],
        ...progress,
      };
    },
    completeExercise: (state, action) => {
      const { exerciseId, sessionData } = action.payload;
      if (state.currentSession) {
        state.currentSession.exercises.push({
          exerciseId,
          ...sessionData,
          completedAt: new Date().toISOString(),
        });
      }
      // 運動を完了としてマーク
      if (state.exerciseProgress[exerciseId]) {
        state.exerciseProgress[exerciseId].completed = true;
      }
    },
    updateSessionInfo: (state, action) => {
      if (state.currentSession) {
        state.currentSession = {
          ...state.currentSession,
          ...action.payload,
        };
      }
    },
    pauseSession: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = true;
        state.currentSession.pausedAt = new Date().toISOString();
      }
    },
    resumeSession: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = false;
        if (state.currentSession.pausedAt) {
          const pauseDuration = new Date() - new Date(state.currentSession.pausedAt);
          state.currentSession.totalPauseDuration = 
            (state.currentSession.totalPauseDuration || 0) + pauseDuration;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // カテゴリー取得
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // 運動メニュー取得
      .addCase(fetchExercisesByPhase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExercisesByPhase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exercises = action.payload;
        state.error = null;
      })
      .addCase(fetchExercisesByPhase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // 患者運動プラン取得
      .addCase(fetchPatientExercisePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientExercisePlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patientPlan = action.payload;
        state.error = null;
      })
      .addCase(fetchPatientExercisePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // セッション記録
      .addCase(recordExerciseSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recordExerciseSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionHistory.push(state.currentSession);
        state.currentSession = null;
        state.exerciseProgress = {};
        state.currentExerciseIndex = 0;
        state.error = null;
      })
      .addCase(recordExerciseSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentExerciseIndex,
  updateExerciseProgress,
  resetExerciseProgress,
  setCurrentPhase,
  startLocalSession,
  endLocalSession,
  addExerciseToSession,
  setCurrentExercise,
  completeExercise,
  updateSessionInfo,
  pauseSession,
  resumeSession,
} = exerciseSlice.actions;

export default exerciseSlice.reducer;