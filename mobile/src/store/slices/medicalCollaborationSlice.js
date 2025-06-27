import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicalCollaborationAPI } from '../../services/api';

// 非同期アクション: 医療従事者リストの取得
export const fetchMedicalStaff = createAsyncThunk(
  'medicalCollaboration/fetchMedicalStaff',
  async ({ patientId, token }, { rejectWithValue }) => {
    try {
      const response = await medicalCollaborationAPI.getMedicalStaff(patientId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || '医療従事者情報の取得に失敗しました');
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
      return rejectWithValue(error.response?.data?.error || 'レポート送信に失敗しました');
    }
  }
);

// 非同期アクション: メッセージ履歴の取得
export const fetchMessages = createAsyncThunk(
  'medicalCollaboration/fetchMessages',
  async ({ patientId, limit, token }, { rejectWithValue }) => {
    try {
      const response = await medicalCollaborationAPI.getMessages(patientId, limit, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'メッセージ履歴の取得に失敗しました');
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
      return rejectWithValue(error.response?.data?.error || 'メッセージ送信に失敗しました');
    }
  }
);

// 非同期アクション: 予約の取得
export const fetchAppointments = createAsyncThunk(
  'medicalCollaboration/fetchAppointments',
  async ({ patientId, token }, { rejectWithValue }) => {
    try {
      const response = await medicalCollaborationAPI.getAppointments(patientId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || '予約情報の取得に失敗しました');
    }
  }
);

const initialState = {
  // 医療従事者情報
  medicalStaff: {
    primaryDoctor: null,
    physiotherapist: null,
    nurses: [],
    specialists: [],
  },
  
  // メッセージ・コミュニケーション
  messages: [],
  unreadCount: 0,
  activeConversation: null,
  
  // レポート・共有データ
  sharedReports: [],
  pendingReports: [],
  reportTemplates: [],
  
  // 予約・スケジュール
  appointments: [],
  nextAppointment: null,
  
  // 通知・アラート
  notifications: [],
  alerts: [],
  
  // 設定
  sharingPreferences: {
    autoShareProgress: true,
    autoShareACLRSI: true,
    autoShareAIAnalysis: false,
    weeklyReportEnabled: true,
    emergencyContactEnabled: true,
  },
  
  notificationSettings: {
    newMessage: true,
    appointmentReminder: true,
    reportRequested: true,
    urgentAlert: true,
    weeklyDigest: false,
  },
  
  // UI状態
  isLoading: false,
  error: null,
  lastUpdated: null,
  activeTab: 'team', // team, reports, settings
};

const medicalCollaborationSlice = createSlice({
  name: 'medicalCollaboration',
  initialState,
  reducers: {
    // メッセージ関連
    addMessage: (state, action) => {
      const message = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: true,
        isSent: true,
        ...action.payload,
      };
      
      state.messages.unshift(message);
      
      // 最新100件に制限
      if (state.messages.length > 100) {
        state.messages = state.messages.slice(0, 100);
      }
    },
    
    markMessageAsRead: (state, action) => {
      const messageId = action.payload;
      const message = state.messages.find(m => m.id === messageId);
      if (message && !message.isRead) {
        message.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllMessagesAsRead: (state) => {
      state.messages.forEach(message => {
        message.isRead = true;
      });
      state.unreadCount = 0;
    },
    
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    
    // レポート関連
    addPendingReport: (state, action) => {
      const report = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        ...action.payload,
      };
      
      state.pendingReports.unshift(report);
    },
    
    updateReportStatus: (state, action) => {
      const { reportId, status } = action.payload;
      
      // pending reportsから検索
      const pendingIndex = state.pendingReports.findIndex(r => r.id === reportId);
      if (pendingIndex !== -1) {
        if (status === 'sent') {
          // pending から shared に移動
          const report = state.pendingReports[pendingIndex];
          report.status = 'sent';
          report.sentAt = new Date().toISOString();
          state.sharedReports.unshift(report);
          state.pendingReports.splice(pendingIndex, 1);
        } else {
          state.pendingReports[pendingIndex].status = status;
        }
      }
    },
    
    // 通知関連
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
        ...action.payload,
      };
      
      state.notifications.unshift(notification);
      
      // 通知タイプに応じてunreadCountを更新
      if (notification.type === 'message') {
        state.unreadCount += 1;
      }
      
      // 最新50件に制限
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
      }
    },
    
    // アラート関連
    addAlert: (state, action) => {
      const alert = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isActive: true,
        ...action.payload,
      };
      
      state.alerts.unshift(alert);
      
      // 最新10件に制限
      if (state.alerts.length > 10) {
        state.alerts = state.alerts.slice(0, 10);
      }
    },
    
    dismissAlert: (state, action) => {
      const alertId = action.payload;
      const alert = state.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.isActive = false;
        alert.dismissedAt = new Date().toISOString();
      }
    },
    
    // 設定関連
    updateSharingPreferences: (state, action) => {
      state.sharingPreferences = {
        ...state.sharingPreferences,
        ...action.payload,
      };
    },
    
    updateNotificationSettings: (state, action) => {
      state.notificationSettings = {
        ...state.notificationSettings,
        ...action.payload,
      };
    },
    
    // UI状態
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // ダミーデータ設定（デモ用）
    setDummyData: (state) => {
      const now = new Date();
      
      // 医療従事者情報
      state.medicalStaff = {
        primaryDoctor: {
          id: 'doc_001',
          name: '田中 一郎',
          title: '整形外科医',
          specialization: 'スポーツ整形外科',
          hospital: '東京スポーツ医療センター',
          email: 'tanaka@sports-med.jp',
          phone: '03-1234-5678',
          avatar: null,
          isOnline: true,
          lastSeen: new Date().toISOString(),
        },
        physiotherapist: {
          id: 'pt_001',
          name: '佐藤 花子',
          title: '理学療法士',
          specialization: 'スポーツリハビリテーション',
          hospital: '東京スポーツ医療センター',
          email: 'sato@sports-med.jp',
          phone: '03-1234-5679',
          avatar: null,
          isOnline: false,
          lastSeen: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        },
        nurses: [
          {
            id: 'nurse_001',
            name: '山田 次郎',
            title: '看護師',
            specialization: 'リハビリテーション看護',
            hospital: '東京スポーツ医療センター',
            email: 'yamada@sports-med.jp',
            avatar: null,
            isOnline: true,
          }
        ],
        specialists: [
          {
            id: 'spec_001',
            name: '鈴木 三郎',
            title: 'スポーツ心理学者',
            specialization: '復帰支援カウンセリング',
            hospital: '東京スポーツ医療センター',
            email: 'suzuki@sports-med.jp',
            avatar: null,
            isOnline: false,
          }
        ],
      };
      
      // メッセージ履歴
      state.messages = [
        {
          id: '1',
          senderId: 'pt_001',
          senderName: '佐藤 花子',
          senderTitle: '理学療法士',
          content: 'お疲れ様です。今日のトレーニングはいかがでしたか？痛みの状況について教えてください。',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'text',
          isRead: false,
          isSent: false,
        },
        {
          id: '2',
          senderId: 'patient',
          senderName: '患者',
          content: 'お疲れ様です。今日は調子が良く、痛みも2/10程度でした。ミニスクワットも10回×3セット完了できました。',
          timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
          type: 'text',
          isRead: true,
          isSent: true,
        },
        {
          id: '3',
          senderId: 'doc_001',
          senderName: '田中 一郎',
          senderTitle: '整形外科医',
          content: '経過良好ですね。来週の診察で次のフェーズについて相談しましょう。ACL-RSIの結果も拝見しました。',
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'text',
          isRead: true,
          isSent: false,
        },
      ];
      
      state.unreadCount = 1;
      
      // 共有レポート
      state.sharedReports = [
        {
          id: 'report_001',
          title: '週間進捗レポート',
          type: 'weekly_progress',
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          sentAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
          status: 'sent',
          recipients: ['doc_001', 'pt_001'],
          data: {
            sessionsCompleted: 5,
            totalExercises: 42,
            averagePainLevel: 2.1,
            averageBorgScale: 11.8,
            noteableProgress: 'ROM改善、筋力向上確認'
          }
        },
        {
          id: 'report_002',
          title: 'ACL-RSI評価結果',
          type: 'acl_rsi',
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          sentAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 120000).toISOString(),
          status: 'sent',
          recipients: ['doc_001', 'spec_001'],
          data: {
            totalScore: 72,
            emotionScore: 68,
            confidenceScore: 75,
            interpretation: '準備度が中程度',
            recommendations: ['競技特異的トレーニング', '復帰計画の策定']
          }
        }
      ];
      
      // 予約情報
      state.appointments = [
        {
          id: 'apt_001',
          title: '経過観察・診察',
          doctor: state.medicalStaff.primaryDoctor,
          datetime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 30,
          location: '東京スポーツ医療センター 3F 診察室A',
          type: 'consultation',
          status: 'confirmed',
          notes: '次フェーズへの移行について相談',
        },
        {
          id: 'apt_002',
          title: 'リハビリテーション',
          doctor: state.medicalStaff.physiotherapist,
          datetime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          location: '東京スポーツ医療センター 2F リハビリ室',
          type: 'physiotherapy',
          status: 'confirmed',
          notes: '機能評価とプログラム調整',
        }
      ];
      
      state.nextAppointment = state.appointments[0];
      
      // 通知
      state.notifications = [
        {
          id: 'notif_001',
          type: 'message',
          title: '理学療法士からメッセージ',
          content: '今日のトレーニングについて質問があります',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          sender: state.medicalStaff.physiotherapist,
        },
        {
          id: 'notif_002',
          type: 'appointment_reminder',
          title: '診察予約のリマインダー',
          content: '3日後の診察予約があります',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          appointment: state.appointments[0],
        },
        {
          id: 'notif_003',
          type: 'report_shared',
          title: 'レポートが共有されました',
          content: 'ACL-RSI評価結果が医療従事者と共有されました',
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          report: state.sharedReports[1],
        }
      ];
      
      state.lastUpdated = new Date().toISOString();
    },
  },
  
  extraReducers: (builder) => {
    builder
      // 医療従事者取得
      .addCase(fetchMedicalStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicalStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicalStaff = action.payload.medicalStaff;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMedicalStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // レポート送信
      .addCase(sendReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendReport.fulfilled, (state, action) => {
        state.isLoading = false;
        // pending reportのステータスを更新
        const reportId = action.payload.reportId;
        const pendingIndex = state.pendingReports.findIndex(r => r.id === reportId);
        if (pendingIndex !== -1) {
          const report = state.pendingReports[pendingIndex];
          report.status = 'sent';
          report.sentAt = new Date().toISOString();
          state.sharedReports.unshift(report);
          state.pendingReports.splice(pendingIndex, 1);
        }
      })
      .addCase(sendReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // メッセージ履歴取得
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.unreadCount = action.payload.unreadCount;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // メッセージ送信
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        // 送信したメッセージを履歴に追加
        const message = {
          ...action.payload.message,
          isSent: true,
          isRead: true,
        };
        state.messages.unshift(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // 予約取得
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload.appointments;
        state.nextAppointment = action.payload.nextAppointment;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addMessage,
  markMessageAsRead,
  markAllMessagesAsRead,
  setActiveConversation,
  addPendingReport,
  updateReportStatus,
  addNotification,
  markNotificationAsRead,
  addAlert,
  dismissAlert,
  updateSharingPreferences,
  updateNotificationSettings,
  setActiveTab,
  clearError,
  setDummyData,
} = medicalCollaborationSlice.actions;

export default medicalCollaborationSlice.reducer;