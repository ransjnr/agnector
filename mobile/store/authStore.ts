import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const res = await api.get('/auth/me');
        set({ user: res.data.user, token, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
      set({ user: null, token: null, isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      await SecureStore.setItemAsync('auth_token', token);
      set({ user, token, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user, token } = res.data;
      await SecureStore.setItemAsync('auth_token', token);
      set({ user, token, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
