import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicalCollaborationAPI } from '../../services/api';

// 初期状態
const initialState = {
  staff: [],
  messages: [],
  appointments: [],
  reports: [],
  isLoading: false,
  error: null,
};

// 非同期アクション: 医療スタッフ取得
export const fetchMedicalStaff = createAsyncThunk(
  'medicalCollaboration/fetchMedicalStaff',
  async ({ patientId, token }, { rejectWithValue }) => {
    try {
      const response = await medicalCollaborationAPI.getMedicalStaff(patientId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '医療スタッフ情報の取得に失敗しました');
    }
  }
);

// 非同期アクション: メッセージ取得
export const fetchMessages = createAsyncThunk(
  'medicalCollaboration/fetchMessages',
  async ({ patientId, limit, token }, { rejectWithValue }) => {
    try {
      const response = await medicalCollaborationAPI.getMessages(patientId, limit, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'メッセージの取得に失敗しました');
    }
  }
);

// 非同期アクション: メッセージ送信
export const sendMessage = createAsyncThunk(
  'medicalCollaboration/sendMessage',
  async ({ messageData, token }, { rejectWithValue }) => {
    try {
      const response = await medicalCollaborationAPI.sendMessage(messageData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'メッセージの送信に失敗しました');
    }
  }
);

// 非同期アクション: レポート送信
export const sendReport = createAsyncThunk(
  'medicalCollaboration/sendReport',
  async ({ reportData, token }, { rejectWithValue }) => {
    try {
      const response = await medicalCollaborationAPI.sendReport(reportData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'レポートの送信に失敗しました');
    }
  }
);

// 非同期アクション: 予約取得
export const fetchAppointments = createAsyncThunk(
  'medicalCollaboration/fetchAppointments',
  async ({ patientId, token }, { rejectWithValue }) => {
    try {
      const response = await medicalCollaborationAPI.getAppointments(patientId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '予約情報の取得に失敗しました');
    }
  }
);

// medicalCollaborationSlice
const medicalCollaborationSlice = createSlice({
  name: 'medicalCollaboration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetMedicalCollaboration: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // 医療スタッフ取得
      .addCase(fetchMedicalStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicalStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staff = action.payload;
      })
      .addCase(fetchMedicalStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // メッセージ取得
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // メッセージ送信
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // レポート送信
      .addCase(sendReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.push(action.payload);
      })
      .addCase(sendReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // 予約取得
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetMedicalCollaboration } = medicalCollaborationSlice.actions;
export default medicalCollaborationSlice.reducer;