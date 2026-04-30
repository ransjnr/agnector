import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useRemoteStore } from '../../store/remoteStore';

const osIcon = {
  windows: 'logo-windows',
  macos: 'logo-apple',
  linux: 'logo-tux',
  unknown: 'desktop-outline',
} as const;

export default function DevicesScreen() {
  const {
    devices,
    selectedDeviceId,
    serverUrl,
    isLoadingDevices,
    isSendingCommand,
    error,
    initialize,
    setServerUrl,
    discoverDevices,
    connectDevice,
    selectDevice,
    wakeSelectedDevice,
    clearError,
  } = useRemoteStore();

  const [urlDraft, setUrlDraft] = useState(serverUrl);
  const [pairingCode, setPairingCode] = useState('');

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    setUrlDraft(serverUrl);
  }, [serverUrl]);

  const selected = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );

  const onSaveUrl = async () => {
    try {
      await setServerUrl(urlDraft);
      Alert.alert('Bridge Updated', 'Device list refreshed using the new bridge URL.');
    } catch (err: any) {
      Alert.alert('Invalid URL', err.message || 'Could not update bridge URL.');
    }
  };

  const onConnect = async (deviceId: string) => {
    try {
      await connectDevice(deviceId, pairingCode.trim() || undefined);
      Alert.alert('Connected', 'The device is now paired with this controller.');
    } catch (err: any) {
      Alert.alert('Connection failed', err.message || 'Unable to pair with device.');
    }
  };

  const onWake = async () => {
    try {
      await wakeSelectedDevice();
      Alert.alert('Wake Signal Sent', 'If Wake-on-LAN is configured, your PC should power on shortly.');
    } catch (err: any) {
      Alert.alert('Wake failed', err.message || 'Could not send wake signal.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Remote Devices</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={discoverDevices}>
          <Ionicons name="refresh" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Bridge URL</Text>
        <TextInput
          style={styles.input}
          value={urlDraft}
          onChangeText={setUrlDraft}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://192.168.1.10:8787"
          placeholderTextColor={colors.text.muted}
        />
        <Text style={styles.hint}>Run a companion service on your laptop and expose port 8787.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onSaveUrl}>
          <Text style={styles.primaryBtnText}>Save & Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Pairing Code (optional)</Text>
        <TextInput
          style={styles.input}
          value={pairingCode}
          onChangeText={setPairingCode}
          placeholder="Enter code shown on your PC agent"
          placeholderTextColor={colors.text.muted}
          autoCapitalize="characters"
        />
      </View>

      {error ? (
        <TouchableOpacity style={styles.errorBox} onPress={clearError}>
          <Ionicons name="warning-outline" size={18} color={colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </TouchableOpacity>
      ) : null}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoadingDevices} onRefresh={discoverDevices} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoadingDevices ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="desktop-outline" size={42} color={colors.text.muted} />
              <Text style={styles.emptyTitle}>No devices discovered</Text>
              <Text style={styles.emptyHint}>Check your bridge URL and make sure your PC agent is running.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isSelected = selectedDeviceId === item.id;
          const iconName = osIcon[item.os] || 'desktop-outline';

          return (
            <TouchableOpacity
              style={[styles.deviceCard, isSelected && styles.deviceCardSelected]}
              onPress={() => selectDevice(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.deviceTop}>
                <View style={styles.deviceIdentity}>
                  <View style={styles.deviceIconWrap}>
                    <Ionicons name={iconName as any} size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.deviceName}>{item.name}</Text>
                    <Text style={styles.deviceHost}>{item.host}</Text>
                  </View>
                </View>
                <View style={[styles.stateBadge, item.state === 'online' && styles.onlineBadge]}>
                  <Text style={[styles.stateText, item.state === 'online' && styles.onlineText]}>{item.state}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Volume: {item.volume ?? 0}%</Text>
                <Text style={styles.metaText}>Brightness: {item.brightness ?? 0}%</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => onConnect(item.id)} disabled={isSendingCommand}>
                  <Text style={styles.secondaryBtnText}>{item.isConnected ? 'Reconnect' : 'Connect'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryBtn, !isSelected && styles.secondaryBtnDisabled]}
                  onPress={onWake}
                  disabled={!isSelected || isSendingCommand}
                >
                  <Text style={styles.secondaryBtnText}>Wake</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {selected ? (
        <View style={styles.footerNotice}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.footerText}>Selected device: {selected.name}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.h2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  panel: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: { ...typography.label, textTransform: 'uppercase', letterSpacing: 0.6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.text.primary,
    backgroundColor: colors.elevated,
  },
  hint: { ...typography.caption },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.warning}40`,
    backgroundColor: `${colors.warning}15`,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  errorText: { ...typography.caption, flex: 1, color: colors.warning },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyTitle: { ...typography.h3, color: colors.text.secondary },
  emptyHint: { ...typography.caption, textAlign: 'center', paddingHorizontal: spacing.lg },
  deviceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  deviceCardSelected: { borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 10 },
  deviceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deviceIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  deviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: { ...typography.h3 },
  deviceHost: { ...typography.caption },
  stateBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: `${colors.text.muted}20`,
  },
  onlineBadge: { backgroundColor: `${colors.success}20` },
  stateText: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' },
  onlineText: { color: colors.success },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { ...typography.caption },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.elevated,
  },
  secondaryBtnDisabled: { opacity: 0.4 },
  secondaryBtnText: { color: colors.text.primary, fontWeight: '600' },
  footerNotice: {
    margin: spacing.lg,
    marginTop: 0,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: `${colors.success}20`,
    borderWidth: 1,
    borderColor: `${colors.success}40`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: { ...typography.caption, color: colors.success },
});
