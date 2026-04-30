import { create } from 'zustand';
import api from '../services/api';
import { Agent, Integration } from '../types';

interface AgentState {
  agents: Agent[];
  integrations: Integration[];
  isLoadingAgents: boolean;
  isLoadingIntegrations: boolean;
  selectedCategory: string;
  searchQuery: string;
  fetchAgents: (category?: string, search?: string) => Promise<void>;
  fetchIntegrations: () => Promise<void>;
  setCategory: (cat: string) => void;
  setSearch: (q: string) => void;
  getAgentById: (id: string) => Agent | undefined;
  getIntegrationById: (id: string) => Integration | undefined;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  integrations: [],
  isLoadingAgents: false,
  isLoadingIntegrations: false,
  selectedCategory: 'all',
  searchQuery: '',

  fetchAgents: async (category, search) => {
    set({ isLoadingAgents: true });
    try {
      const params: Record<string, string> = {};
      const cat = category ?? get().selectedCategory;
      const q = search ?? get().searchQuery;
      if (cat && cat !== 'all') params.category = cat;
      if (q) params.search = q;
      const res = await api.get('/agents', { params });
      set({ agents: res.data.agents, isLoadingAgents: false });
    } catch {
      set({ isLoadingAgents: false });
    }
  },

  fetchIntegrations: async () => {
    set({ isLoadingIntegrations: true });
    try {
      const res = await api.get('/integrations');
      set({ integrations: res.data.integrations, isLoadingIntegrations: false });
    } catch {
      set({ isLoadingIntegrations: false });
    }
  },

  setCategory: (cat) => {
    set({ selectedCategory: cat });
    get().fetchAgents(cat, get().searchQuery);
  },

  setSearch: (q) => {
    set({ searchQuery: q });
    get().fetchAgents(get().selectedCategory, q);
  },

  getAgentById: (id) => get().agents.find((a) => a.id === id),
  getIntegrationById: (id) => get().integrations.find((i) => i.id === id),
}));
