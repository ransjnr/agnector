export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  category: string;
  icon: string;
  color: string;
  isPublic: boolean;
  model: string;
  createdBy: string;
  usageCount: number;
  rating: number;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  accentColor: string;
  category: string;
  authType: 'oauth' | 'apikey' | 'webhook';
  scopes: string[];
  popularAgents: string[];
  website: string;
}

export interface Connection {
  id: string;
  userId: string;
  integrationId: string;
  agentId: string | null;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionStats {
  total: number;
  active: number;
  withAgents: number;
  inactive: number;
}

export type AgentCategory =
  | 'all'
  | 'productivity'
  | 'development'
  | 'communication'
  | 'marketing'
  | 'analytics'
  | 'support'
  | 'custom';

export type IntegrationCategory =
  | 'all'
  | 'development'
  | 'communication'
  | 'productivity'
  | 'social'
  | 'analytics'
  | 'ecommerce'
  | 'entertainment';
