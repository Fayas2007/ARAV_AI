// store/authStore.ts – Zustand auth state management
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authApi, clearToken, saveToken } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (mobile_number: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  full_name: string;
  mobile_number: string;
  email?: string;
  password: string;
  state?: string;
  district?: string;
  preferred_language: string;
  cooperative_society?: string;
}

const USER_KEY = 'arav_user';
const TOKEN_KEY = 'arav_auth_token';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  loadStoredAuth: async () => {
    try {
      const [token, userStr] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (mobile_number, password) => {
    const response = await authApi.login({ mobile_number, password });
    await saveToken(response.access_token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    set({ user: response.user, token: response.access_token, isAuthenticated: true });
  },

  register: async (data) => {
    const response = await authApi.register(data);
    await saveToken(response.access_token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    set({ user: response.user, token: response.access_token, isAuthenticated: true });
  },

  logout: async () => {
    await clearToken();
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));
