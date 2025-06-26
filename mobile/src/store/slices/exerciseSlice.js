import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { exerciseAPI } from '../../services/api';

// 非同期アクション
export const fetchExercisesByPhase = createAsyncThunk(
  'exercise/fetchExercisesByPhase',
  async (phase, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await exerciseAPI.getExercisesByPhase(phase, token);
      return response.exercises;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || '運動メニューの取得に失敗しました');
    }
  }
);

export const startExerciseSession = createAsyncThunk(
  'exercise/startExerciseSession',
  async (sessionData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await exerciseAPI.startSession(sessionData, token);
      return response.session;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'セッション開始に失敗しました');
    }
  }
);

export const endExerciseSession = createAsyncThunk(
  'exercise/endExerciseSession',
  async ({ sessionId, sessionData }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await exerciseAPI.endSession(sessionId, sessionData, token);
      return response.session;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'セッション終了に失敗しました');
    }
  }
);

const initialState = {
  exercises: [],
  currentSession: null,
  sessionHistory: [],
  isLoading: false,
  error: null,
  currentExerciseIndex: 0,
  exerciseProgress: {},
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
  },
  extraReducers: (builder) => {
    builder
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
      // セッション開始
      .addCase(startExerciseSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.exerciseProgress = {};
        state.currentExerciseIndex = 0;
      })
      // セッション終了
      .addCase(endExerciseSession.fulfilled, (state, action) => {
        state.sessionHistory.push(action.payload);
        state.currentSession = null;
        state.exerciseProgress = {};
        state.currentExerciseIndex = 0;
      });
  },
});

export const {
  clearError,
  setCurrentExerciseIndex,
  updateExerciseProgress,
  resetExerciseProgress,
} = exerciseSlice.actions;

export default exerciseSlice.reducer;