// services/api.ts – Centralized Axios API client for ARAV AI
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://arav-ai-backend.onrender.com';
const TOKEN_KEY = 'arav_auth_token';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore unavailable on some platforms during init
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | Array<{ msg: string }> }>) => {
    if (error.response) {
      const detail = error.response.data?.detail;
      let message = 'An error occurred';
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail.map((d) => d.msg).join(', ');
      }
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
);

// Token management
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
export const authApi = {
  register: async (data: {
    full_name: string;
    mobile_number: string;
    email?: string;
    password: string;
    state?: string;
    district?: string;
    preferred_language: string;
    cooperative_society?: string;
  }) => (await apiClient.post('/auth/register', data)).data,

  login: async (data: { mobile_number: string; password: string }) =>
    (await apiClient.post('/auth/login', data)).data,

  getMe: async () => (await apiClient.get('/users/me')).data,

  updateMe: async (data: Partial<{
    full_name: string;
    email: string;
    state: string;
    district: string;
    preferred_language: string;
    cooperative_society: string;
  }>) => (await apiClient.patch('/users/me', data)).data,
};

// ──────────────────────────────────────────────
// CHAT
// ──────────────────────────────────────────────
export const chatApi = {
  sendMessage: async (data: {
    message: string;
    language: string;
    conversation_id?: string;
  }) => (await apiClient.post('/chat', data)).data,

  getHistory: async (skip = 0, limit = 20) =>
    (await apiClient.get('/chat/history', { params: { skip, limit } })).data,

  getConversation: async (id: string) =>
    (await apiClient.get(`/chat/conversations/${id}`)).data,

  deleteConversation: async (id: string) =>
    (await apiClient.delete(`/chat/conversations/${id}`)).data,
};

// ──────────────────────────────────────────────
// VOICE
// ──────────────────────────────────────────────
export const voiceApi = {
  transcribe: async (audioUri: string, language: string): Promise<{ transcript: string; language: string; confidence?: number }> => {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/mp4',
    } as any);
    formData.append('language', language);
    const response = await apiClient.post('/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ──────────────────────────────────────────────
// SCHEMES
// ──────────────────────────────────────────────
export const schemesApi = {
  list: async (params?: { category?: string; state?: string; search?: string; skip?: number; limit?: number }) =>
    (await apiClient.get('/schemes', { params })).data,

  getById: async (id: string) =>
    (await apiClient.get(`/schemes/${id}`)).data,
};

// ──────────────────────────────────────────────
// SOCIETIES
// ──────────────────────────────────────────────
export const societiesApi = {
  list: async (params?: { district?: string; state?: string; search?: string; skip?: number; limit?: number }) =>
    (await apiClient.get('/societies', { params })).data,

  getById: async (id: string) =>
    (await apiClient.get(`/societies/${id}`)).data,
};

// ──────────────────────────────────────────────
// APPLICATIONS
// ──────────────────────────────────────────────
export const applicationsApi = {
  create: async (data: { application_type: string; title: string; form_data?: Record<string, any> }) =>
    (await apiClient.post('/applications', data)).data,

  list: async (status?: string) =>
    (await apiClient.get('/applications', { params: status ? { status } : {} })).data,

  getById: async (id: string) =>
    (await apiClient.get(`/applications/${id}`)).data,
};

// ──────────────────────────────────────────────
// DOCUMENTS
// ──────────────────────────────────────────────
export const documentsApi = {
  list: async () => (await apiClient.get('/documents')).data,

  requestDocument: async (data: { document_type: string; description?: string }) =>
    (await apiClient.post('/documents/requests', data)).data,
};

// ──────────────────────────────────────────────
// GRIEVANCES
// ──────────────────────────────────────────────
export const grievancesApi = {
  submit: async (data: {
    category: string;
    subject: string;
    description: string;
    related_society?: string;
  }) => (await apiClient.post('/grievances', data)).data,

  list: async () => (await apiClient.get('/grievances')).data,

  getById: async (id: string) => (await apiClient.get(`/grievances/${id}`)).data,
};

// ──────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────
export const notificationsApi = {
  list: async () => (await apiClient.get('/notifications')).data,

  markRead: async (id: string) =>
    (await apiClient.patch(`/notifications/${id}/read`)).data,
};
