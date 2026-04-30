import { create } from 'zustand';
import api from '../services/api';
import { Connection, ConnectionStats } from '../types';

interface ConnectionState {
  connections: Connection[];
  stats: ConnectionStats;
  isLoading: boolean;
  error: string | null;
  fetchConnections: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createConnection: (integrationId: string, agentId?: string) => Promise<Connection>;
  toggleConnection: (id: string) => Promise<void>;
  assignAgent: (id: string, agentId: string | null) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
}

const defaultStats: ConnectionStats = { total: 0, active: 0, withAgents: 0, inactive: 0 };

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  stats: defaultStats,
  isLoading: false,
  error: null,

  fetchConnections: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/connections');
      set({ connections: res.data.connections, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to fetch connections' });
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get('/connections/stats');
      set({ stats: res.data });
    } catch {}
  },

  createConnection: async (integrationId, agentId) => {
    const res = await api.post('/connections', { integrationId, agentId: agentId || null });
    const conn: Connection = res.data.connection;
    set((state) => ({ connections: [...state.connections, conn] }));
    get().fetchStats();
    return conn;
  },

  toggleConnection: async (id) => {
    const res = await api.patch(`/connections/${id}/toggle`);
    const updated: Connection = res.data.connection;
    set((state) => ({
      connections: state.connections.map((c) => (c.id === id ? updated : c)),
    }));
    get().fetchStats();
  },

  assignAgent: async (id, agentId) => {
    const res = await api.put(`/connections/${id}`, { agentId });
    const updated: Connection = res.data.connection;
    set((state) => ({
      connections: state.connections.map((c) => (c.id === id ? updated : c)),
    }));
  },

  deleteConnection: async (id) => {
    await api.delete(`/connections/${id}`);
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    }));
    get().fetchStats();
  },
}));
