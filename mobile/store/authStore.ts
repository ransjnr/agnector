import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { User } from '../types';

const createGuestUser = (name = 'Guest User', email = 'guest@agnector.local'): User => ({
  id: 'guest-user',
  name,
  email,
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=128`,
  plan: 'free',
  createdAt: new Date().toISOString(),
});

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
  user: createGuestUser(),
  token: 'guest-token',
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: createGuestUser(), token: 'guest-token', isInitialized: true, error: null });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const safeEmail = email?.trim() || 'guest@agnector.local';
    const localName = safeEmail.includes('@') ? safeEmail.split('@')[0] : 'Guest User';
    set({ user: createGuestUser(localName, safeEmail), token: 'guest-token', isLoading: false, error: null });
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    const displayName = name?.trim() || 'Guest User';
    const safeEmail = email?.trim() || 'guest@agnector.local';
    set({ user: createGuestUser(displayName, safeEmail), token: 'guest-token', isLoading: false, error: null });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: createGuestUser(), token: 'guest-token' });
  },

  clearError: () => set({ error: null }),
}));
