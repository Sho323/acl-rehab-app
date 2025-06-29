import axios from 'axios';
import Constants from 'expo-constants';

// API基底URL（環境変数対応）
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://acl-rehab-2oz8e3lyq-shotas-projects-1f553362.vercel.app' 
    : 'http://localhost:3000');

// APIクライアントの設定
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンの自動付与）
apiClient.interceptors.request.use(
  (config) => {
    // トークンが必要な場合は各APIメソッドで個別に設定
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合はログアウト処理
      // Note: 本番環境では適切なログ管理システムを実装
      if (__DEV__) {
        console.log('Authentication error - redirecting to login');
      }
    }
    return Promise.reject(error);
  }
);

// 認証API
export const authAPI = {
  login: async (patientNumber, password) => {
    return await apiClient.post('/auth/login', {
      patientNumber,
      password,
    });
  },

  getProfile: async (token) => {
    return await apiClient.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  logout: async (token) => {
    return await apiClient.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// 運動API
export const exerciseAPI = {
  // 運動カテゴリー一覧取得
  getCategories: async (phase, token) => {
    const params = phase ? `?phase=${phase}` : '';
    return await apiClient.get(`/api/exercises/categories${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // フェーズ別運動一覧取得
  getExercisesByPhase: async (phase, token) => {
    return await apiClient.get(`/api/exercises/phase/${phase}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // カテゴリー別運動一覧取得
  getExercisesByCategory: async (categoryId, token) => {
    return await apiClient.get(`/api/exercises/category/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 患者の運動プラン取得
  getPatientExercisePlan: async (patientId, phase, token) => {
    return await apiClient.get(`/api/exercises/patient/${patientId}/plan?phase=${phase}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 運動詳細取得
  getExerciseDetails: async (exerciseId, token) => {
    return await apiClient.get(`/api/exercises/${exerciseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 運動セッション記録
  recordSession: async (sessionData, token) => {
    return await apiClient.post('/api/exercises/session', sessionData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  uploadVideo: async (formData, token) => {
    return await apiClient.post('/api/patient/videos/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// 進捗API
export const progressAPI = {
  getProgress: async (token) => {
    return await apiClient.get('/api/patient/progress', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  submitACLRSI: async (rsiData, token) => {
    return await apiClient.post('/api/patient/tests/acl-rsi', rsiData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// 医療連携API
export const medicalCollaborationAPI = {
  getMedicalStaff: async (patientId, token) => {
    return await apiClient.get(`/api/medical-collaboration/staff?patientId=${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  sendReport: async (reportData, token) => {
    return await apiClient.post('/api/medical-collaboration/reports', reportData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getMessages: async (patientId, limit, token) => {
    return await apiClient.get(`/api/medical-collaboration/messages?patientId=${patientId}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  sendMessage: async (messageData, token) => {
    return await apiClient.post('/api/medical-collaboration/messages', messageData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getAppointments: async (patientId, token) => {
    return await apiClient.get(`/api/medical-collaboration/appointments?patientId=${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};