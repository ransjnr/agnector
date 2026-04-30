import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { PcCommandPayload, PcCommandType, PcDevice } from '../types';

const SERVER_URL_KEY = 'remote_server_url';

const getDefaultBridgeUrl = () => {
  const explicit = process.env.EXPO_PUBLIC_REMOTE_BRIDGE_URL;
  if (explicit) return explicit;

  const runtimeHost = Linking.parse(Linking.createURL('/')).hostname;
  if (runtimeHost) return `http://${runtimeHost}:8787`;

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:8787`;
  }

  return 'http://localhost:8787';
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

interface RemoteState {
  serverUrl: string;
  devices: PcDevice[];
  selectedDeviceId: string | null;
  isLoadingDevices: boolean;
  isSendingCommand: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  setServerUrl: (value: string) => Promise<void>;
  discoverDevices: () => Promise<void>;
  connectDevice: (deviceId: string, pairingCode?: string) => Promise<void>;
  selectDevice: (deviceId: string) => void;
  sendCommand: (command: PcCommandType, payload?: PcCommandPayload) => Promise<void>;
  wakeSelectedDevice: () => Promise<void>;
  clearError: () => void;
  getSelectedDevice: () => PcDevice | null;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = body?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body as T;
};

export const useRemoteStore = create<RemoteState>((set, get) => ({
  serverUrl: getDefaultBridgeUrl(),
  devices: [],
  selectedDeviceId: null,
  isLoadingDevices: false,
  isSendingCommand: false,
  error: null,

  initialize: async () => {
    try {
      const saved = await SecureStore.getItemAsync(SERVER_URL_KEY);
      if (saved) {
        set({ serverUrl: saved });
      }
    } catch {
      // Ignore secure store read failures and continue with defaults.
    }
    await get().discoverDevices();
  },

  setServerUrl: async (value) => {
    const cleaned = value.trim().replace(/\/$/, '');
    if (!cleaned) {
      set({ error: 'Server URL cannot be empty.' });
      return;
    }

    set({ serverUrl: cleaned, error: null, devices: [], selectedDeviceId: null });

    try {
      await SecureStore.setItemAsync(SERVER_URL_KEY, cleaned);
    } catch {
      // Ignore secure store write failures.
    }

    await get().discoverDevices();
  },

  discoverDevices: async () => {
    set({ isLoadingDevices: true, error: null });
    const { serverUrl, selectedDeviceId } = get();

    try {
      const result = await request<{ devices: PcDevice[] }>(`${serverUrl}/api/pc/devices`);
      const devices = result.devices || [];
      const hasSelected = devices.some((d) => d.id === selectedDeviceId);
      set({
        devices,
        selectedDeviceId: hasSelected ? selectedDeviceId : devices[0]?.id ?? null,
        isLoadingDevices: false,
      });
    } catch (err: any) {
      set({
        isLoadingDevices: false,
        devices: [],
        selectedDeviceId: null,
        error: err.message || 'Failed to discover devices.',
      });
    }
  },

  connectDevice: async (deviceId, pairingCode) => {
    const { serverUrl } = get();
    set({ isSendingCommand: true, error: null });

    try {
      await request<{ connected: boolean }>(`${serverUrl}/api/pc/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, pairingCode }),
      });

      set((state) => ({
        selectedDeviceId: deviceId,
        isSendingCommand: false,
        devices: state.devices.map((d) =>
          d.id === deviceId ? { ...d, isConnected: true, state: d.state === 'unknown' ? 'online' : d.state } : d
        ),
      }));
    } catch (err: any) {
      set({ isSendingCommand: false, error: err.message || 'Could not connect to device.' });
      throw err;
    }
  },

  selectDevice: (deviceId) => {
    set({ selectedDeviceId: deviceId });
  },

  sendCommand: async (command, payload) => {
    const { serverUrl, selectedDeviceId, devices } = get();
    if (!selectedDeviceId) {
      set({ error: 'Select a device first.' });
      return;
    }

    set({ isSendingCommand: true, error: null });

    try {
      await request(`${serverUrl}/api/pc/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDeviceId, command, payload }),
      });

      set({ isSendingCommand: false });

      if (!payload) return;

      if (command === 'volume_set' && typeof payload.value === 'number') {
        set({
          devices: devices.map((d) =>
            d.id === selectedDeviceId ? { ...d, volume: clampPercent(payload.value) } : d
          ),
        });
      }

      if (command === 'brightness_set' && typeof payload.value === 'number') {
        set({
          devices: devices.map((d) =>
            d.id === selectedDeviceId ? { ...d, brightness: clampPercent(payload.value) } : d
          ),
        });
      }
    } catch (err: any) {
      set({ isSendingCommand: false, error: err.message || 'Command failed.' });
      throw err;
    }
  },

  wakeSelectedDevice: async () => {
    const selected = get().getSelectedDevice();
    if (!selected) {
      set({ error: 'Select a device first.' });
      return;
    }

    if (!selected.supportsWakeOnLan || !selected.macAddress) {
      set({ error: 'Wake-on-LAN is not available for this device.' });
      return;
    }

    const { serverUrl } = get();
    set({ isSendingCommand: true, error: null });

    try {
      await request(`${serverUrl}/api/pc/wake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ macAddress: selected.macAddress, deviceId: selected.id }),
      });

      set((state) => ({
        isSendingCommand: false,
        devices: state.devices.map((d) =>
          d.id === selected.id ? { ...d, state: 'online', isConnected: true } : d
        ),
      }));
    } catch (err: any) {
      set({ isSendingCommand: false, error: err.message || 'Failed to send wake signal.' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  getSelectedDevice: () => {
    const { devices, selectedDeviceId } = get();
    return devices.find((d) => d.id === selectedDeviceId) || null;
  },
}));
