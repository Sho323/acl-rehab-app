import axios from 'axios';

// API基底URL（開発環境用）
const API_BASE_URL = 'http://localhost:3000';

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
      console.log('Authentication error - redirecting to login');
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
  getExercisesByPhase: async (phase, token) => {
    return await apiClient.get(`/api/patient/exercises/${phase}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  startSession: async (sessionData, token) => {
    return await apiClient.post('/api/patient/sessions', sessionData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  endSession: async (sessionId, sessionData, token) => {
    return await apiClient.put(`/api/patient/sessions/${sessionId}`, sessionData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  recordExercise: async (exerciseData, token) => {
    return await apiClient.post('/api/patient/exercises', exerciseData, {
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