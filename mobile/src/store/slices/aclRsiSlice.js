import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aclRsiAPI } from '../../services/api';

// 非同期アクション: ACL-RSI評価結果の保存
export const saveACLRSIAssessment = createAsyncThunk(
  'aclRsi/saveAssessment',
  async ({ patientId, assessmentData, token }, { rejectWithValue }) => {
    try {
      const response = await aclRsiAPI.saveAssessment(patientId, assessmentData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'ACL-RSI評価の保存に失敗しました');
    }
  }
);

// 非同期アクション: ACL-RSI履歴の取得
export const fetchACLRSIHistory = createAsyncThunk(
  'aclRsi/fetchHistory',
  async ({ patientId, limit, token }, { rejectWithValue }) => {
    try {
      const response = await aclRsiAPI.getHistory(patientId, limit, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'ACL-RSI履歴の取得に失敗しました');
    }
  }
);

// 非同期アクション: ACL-RSI統計の取得
export const fetchACLRSIStats = createAsyncThunk(
  'aclRsi/fetchStats',
  async ({ patientId, period, token }, { rejectWithValue }) => {
    try {
      const response = await aclRsiAPI.getStats(patientId, period, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'ACL-RSI統計の取得に失敗しました');
    }
  }
);

const initialState = {
  // 現在の評価セッション
  currentAssessment: {
    id: null,
    startedAt: null,
    answers: {},
    currentQuestionIndex: 0,
    isCompleted: false,
    totalScore: 0,
    categoryScores: {},
    interpretation: null,
    actionPlan: null,
  },
  
  // 評価履歴
  assessmentHistory: [],
  
  // 統計データ
  stats: {
    totalAssessments: 0,
    averageScore: 0,
    latestScore: 0,
    scoreImprovement: 0,
    monthlyTrend: [],
  },
  
  // チャートデータ
  scoreHistory: [],
  categoryTrends: {
    emotion: [],
    confidence: []
  },
  
  // UI状態
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  // 設定
  reminderEnabled: true,
  reminderFrequency: 'monthly', // weekly, monthly, quarterly
  notificationSettings: {
    assessmentReminder: true,
    progressUpdate: true,
    achievementAlert: true,
  },
};

const aclRsiSlice = createSlice({
  name: 'aclRsi',
  initialState,
  reducers: {
    // 新しい評価セッション開始
    startNewAssessment: (state) => {
      state.currentAssessment = {
        id: Date.now().toString(),
        startedAt: new Date().toISOString(),
        answers: {},
        currentQuestionIndex: 0,
        isCompleted: false,
        totalScore: 0,
        categoryScores: {},
        interpretation: null,
        actionPlan: null,
      };
    },
    
    // 質問への回答
    answerQuestion: (state, action) => {
      const { questionId, answer } = action.payload;
      state.currentAssessment.answers[questionId] = answer;
    },
    
    // 次の質問に進む
    nextQuestion: (state) => {
      state.currentAssessment.currentQuestionIndex += 1;
    },
    
    // 前の質問に戻る
    previousQuestion: (state) => {
      if (state.currentAssessment.currentQuestionIndex > 0) {
        state.currentAssessment.currentQuestionIndex -= 1;
      }
    },
    
    // 特定の質問にジャンプ
    goToQuestion: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < 12) { // ACL-RSIは12問
        state.currentAssessment.currentQuestionIndex = index;
      }
    },
    
    // 評価完了
    completeAssessment: (state, action) => {
      const { totalScore, categoryScores, interpretation, actionPlan } = action.payload;
      
      state.currentAssessment.isCompleted = true;
      state.currentAssessment.totalScore = totalScore;
      state.currentAssessment.categoryScores = categoryScores;
      state.currentAssessment.interpretation = interpretation;
      state.currentAssessment.actionPlan = actionPlan;
      state.currentAssessment.completedAt = new Date().toISOString();
      
      // 履歴に追加
      state.assessmentHistory.unshift({
        ...state.currentAssessment,
      });
      
      // 最新20件に制限
      if (state.assessmentHistory.length > 20) {
        state.assessmentHistory = state.assessmentHistory.slice(0, 20);
      }
      
      // 統計を更新
      updateStats(state);
    },
    
    // 評価をリセット
    resetAssessment: (state) => {
      state.currentAssessment = {
        id: null,
        startedAt: null,
        answers: {},
        currentQuestionIndex: 0,
        isCompleted: false,
        totalScore: 0,
        categoryScores: {},
        interpretation: null,
        actionPlan: null,
      };
    },
    
    // 設定更新
    updateSettings: (state, action) => {
      const { reminderEnabled, reminderFrequency, notificationSettings } = action.payload;
      
      if (reminderEnabled !== undefined) {
        state.reminderEnabled = reminderEnabled;
      }
      if (reminderFrequency !== undefined) {
        state.reminderFrequency = reminderFrequency;
      }
      if (notificationSettings !== undefined) {
        state.notificationSettings = {
          ...state.notificationSettings,
          ...notificationSettings,
        };
      }
    },
    
    // エラークリア
    clearError: (state) => {
      state.error = null;
    },
    
    // ダミーデータ設定（デモ用）
    setDummyData: (state) => {
      const now = new Date();
      
      // ダミー履歴データ
      state.assessmentHistory = [
        {
          id: '1',
          startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 900000).toISOString(),
          totalScore: 72,
          categoryScores: { emotion: 68, confidence: 75 },
          interpretation: {
            level: 'moderate',
            title: '準備度が中程度',
            description: '基本的な心理的準備はできています',
            color: '#2196F3'
          },
          isCompleted: true,
        },
        {
          id: '2',
          startedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 1200000).toISOString(),
          totalScore: 58,
          categoryScores: { emotion: 52, confidence: 62 },
          interpretation: {
            level: 'moderate',
            title: '準備度が中程度',
            description: '基本的な心理的準備はできています',
            color: '#2196F3'
          },
          isCompleted: true,
        },
        {
          id: '3',
          startedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + 1500000).toISOString(),
          totalScore: 45,
          categoryScores: { emotion: 38, confidence: 50 },
          interpretation: {
            level: 'moderate_low',
            title: '準備度がやや低い',
            description: '心理的準備にまだ改善の余地があります',
            color: '#FF9800'
          },
          isCompleted: true,
        },
      ];
      
      // 統計データ
      state.stats = {
        totalAssessments: 3,
        averageScore: 58,
        latestScore: 72,
        scoreImprovement: 14,
        monthlyTrend: [
          { month: '11月', score: 45 },
          { month: '12月', score: 58 },
          { month: '1月', score: 72 }
        ],
      };
      
      // チャートデータ
      state.scoreHistory = [
        { date: '2024-11-27', score: 45, emotion: 38, confidence: 50 },
        { date: '2024-12-13', score: 58, emotion: 52, confidence: 62 },
        { date: '2024-12-20', score: 72, emotion: 68, confidence: 75 },
      ];
      
      state.categoryTrends = {
        emotion: [
          { date: '11/27', value: 38 },
          { date: '12/13', value: 52 },
          { date: '12/20', value: 68 }
        ],
        confidence: [
          { date: '11/27', value: 50 },
          { date: '12/13', value: 62 },
          { date: '12/20', value: 75 }
        ]
      };
      
      state.lastUpdated = new Date().toISOString();
    },
  },
  
  extraReducers: (builder) => {
    builder
      // ACL-RSI評価保存
      .addCase(saveACLRSIAssessment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveACLRSIAssessment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
        // 保存成功時の処理
      })
      .addCase(saveACLRSIAssessment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // ACL-RSI履歴取得
      .addCase(fetchACLRSIHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchACLRSIHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assessmentHistory = action.payload.assessments;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchACLRSIHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // ACL-RSI統計取得
      .addCase(fetchACLRSIStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchACLRSIStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.scoreHistory = action.payload.scoreHistory;
        state.categoryTrends = action.payload.categoryTrends;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchACLRSIStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ヘルパー関数：統計を更新
function updateStats(state) {
  const assessments = state.assessmentHistory;
  if (assessments.length === 0) return;
  
  // 総評価数
  state.stats.totalAssessments = assessments.length;
  
  // 平均スコア
  const totalScore = assessments.reduce((sum, assessment) => sum + assessment.totalScore, 0);
  state.stats.averageScore = Math.round(totalScore / assessments.length);
  
  // 最新スコア
  state.stats.latestScore = assessments[0].totalScore;
  
  // スコア改善度（最新と前回の差）
  if (assessments.length >= 2) {
    state.stats.scoreImprovement = assessments[0].totalScore - assessments[1].totalScore;
  }
  
  // 月間トレンドの更新
  updateMonthlyTrend(state);
  updateScoreHistory(state);
}

function updateMonthlyTrend(state) {
  const assessments = state.assessmentHistory;
  const monthlyData = {};
  
  assessments.forEach(assessment => {
    const date = new Date(assessment.completedAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthLabel = `${date.getMonth() + 1}月`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthLabel,
        scores: [],
        date: date
      };
    }
    monthlyData[monthKey].scores.push(assessment.totalScore);
  });
  
  // 月ごとの平均スコアを計算
  const trend = Object.values(monthlyData)
    .map(monthData => ({
      month: monthData.month,
      score: Math.round(monthData.scores.reduce((sum, score) => sum + score, 0) / monthData.scores.length),
      date: monthData.date
    }))
    .sort((a, b) => a.date - b.date)
    .slice(-6); // 最新6ヶ月
  
  state.stats.monthlyTrend = trend;
}

function updateScoreHistory(state) {
  const assessments = state.assessmentHistory;
  
  state.scoreHistory = assessments
    .map(assessment => {
      const date = new Date(assessment.completedAt);
      return {
        date: date.toISOString().split('T')[0],
        score: assessment.totalScore,
        emotion: assessment.categoryScores.emotion,
        confidence: assessment.categoryScores.confidence
      };
    })
    .reverse() // 古い順に並び替え
    .slice(-10); // 最新10件
  
  // カテゴリー別トレンド
  state.categoryTrends.emotion = state.scoreHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
    value: item.emotion
  }));
  
  state.categoryTrends.confidence = state.scoreHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
    value: item.confidence
  }));
}

export const {
  startNewAssessment,
  answerQuestion,
  nextQuestion,
  previousQuestion,
  goToQuestion,
  completeAssessment,
  resetAssessment,
  updateSettings,
  clearError,
  setDummyData,
} = aclRsiSlice.actions;

export default aclRsiSlice.reducer;