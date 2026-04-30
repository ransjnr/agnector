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

export type PcConnectionState = 'online' | 'offline' | 'sleeping' | 'unknown';

export interface PcDevice {
  id: string;
  name: string;
  host: string;
  os: 'windows' | 'macos' | 'linux' | 'unknown';
  state: PcConnectionState;
  supportsWakeOnLan: boolean;
  macAddress?: string;
  volume?: number;
  brightness?: number;
  isMuted?: boolean;
  isConnected?: boolean;
  lastSeenAt?: string;
}

export type PcCommandType =
  | 'power_on'
  | 'power_off'
  | 'restart'
  | 'sleep'
  | 'lock'
  | 'volume_up'
  | 'volume_down'
  | 'volume_set'
  | 'mute_toggle'
  | 'brightness_up'
  | 'brightness_down'
  | 'brightness_set'
  | 'night_light_toggle'
  | 'high_contrast_toggle'
  | 'magnifier_toggle'
  | 'screen_reader_toggle';

export interface PcCommandPayload {
  value?: number;
  enabled?: boolean;
}
