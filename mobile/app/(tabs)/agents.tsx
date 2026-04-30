import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useRemoteStore } from '../../store/remoteStore';

interface ActionButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  danger?: boolean;
}

function ActionButton({ title, icon, onPress, danger }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, danger && styles.actionButtonDanger]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      <Text style={[styles.actionButtonText, danger && { color: colors.danger }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function ControlsScreen() {
  const { devices, selectedDeviceId, isSendingCommand, sendCommand } = useRemoteStore();

  const selected = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );

  const run = async (fn: () => Promise<void>, successMessage: string) => {
    try {
      await fn();
      Alert.alert('Sent', successMessage);
    } catch (err: any) {
      Alert.alert('Command failed', err.message || 'Unable to send command to device.');
    }
  };

  if (!selected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Ionicons name="desktop-outline" size={44} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>No device selected</Text>
          <Text style={styles.emptyHint}>Open Devices tab, connect a laptop/PC, then return here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>PC Controls</Text>
          <Text style={styles.subtitle}>{selected.name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Power</Text>
          <View style={styles.gridTwo}>
            <ActionButton
              title="Power Off"
              icon="power"
              danger
              onPress={() => run(() => sendCommand('power_off'), 'Shutdown command sent.')}
            />
            <ActionButton
              title="Restart"
              icon="refresh"
              onPress={() => run(() => sendCommand('restart'), 'Restart command sent.')}
            />
            <ActionButton
              title="Sleep"
              icon="moon"
              onPress={() => run(() => sendCommand('sleep'), 'Sleep command sent.')}
            />
            <ActionButton
              title="Lock"
              icon="lock-closed"
              onPress={() => run(() => sendCommand('lock'), 'Lock command sent.')}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Volume</Text>
          <Text style={styles.reading}>Current: {selected.volume ?? 0}%</Text>
          <View style={styles.gridThree}>
            <ActionButton
              title="Down"
              icon="remove"
              onPress={() => run(() => sendCommand('volume_down'), 'Volume down command sent.')}
            />
            <ActionButton
              title="Mute"
              icon="volume-mute"
              onPress={() => run(() => sendCommand('mute_toggle'), 'Mute toggle command sent.')}
            />
            <ActionButton
              title="Up"
              icon="add"
              onPress={() => run(() => sendCommand('volume_up'), 'Volume up command sent.')}
            />
          </View>

          <View style={styles.quickRow}>
            {[15, 35, 55, 75].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={styles.quickPill}
                onPress={() => run(() => sendCommand('volume_set', { value: preset }), `Volume set to ${preset}%.`)}
              >
                <Text style={styles.quickPillText}>{preset}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Brightness</Text>
          <Text style={styles.reading}>Current: {selected.brightness ?? 0}%</Text>
          <View style={styles.gridThree}>
            <ActionButton
              title="Dim"
              icon="sunny"
              onPress={() => run(() => sendCommand('brightness_down'), 'Brightness down command sent.')}
            />
            <ActionButton
              title="Auto"
              icon="sparkles"
              onPress={() => run(() => sendCommand('brightness_set', { value: 55 }), 'Brightness set to 55%.')}
            />
            <ActionButton
              title="Bright"
              icon="sunny-outline"
              onPress={() => run(() => sendCommand('brightness_up'), 'Brightness up command sent.')}
            />
          </View>

          <View style={styles.quickRow}>
            {[20, 40, 60, 80].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={styles.quickPill}
                onPress={() => run(() => sendCommand('brightness_set', { value: preset }), `Brightness set to ${preset}%.`)}
              >
                <Text style={styles.quickPillText}>{preset}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isSendingCommand ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  header: { marginBottom: spacing.sm },
  title: { ...typography.h2 },
  subtitle: { ...typography.caption, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: { ...typography.h3 },
  reading: { ...typography.caption, marginBottom: spacing.xs },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridThree: { flexDirection: 'row', gap: spacing.sm },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.elevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  actionButtonDanger: {
    borderColor: `${colors.danger}60`,
    backgroundColor: `${colors.danger}18`,
  },
  actionButtonText: { color: colors.text.primary, fontWeight: '600', fontSize: 13 },
  quickRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  quickPill: {
    flex: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.elevated,
  },
  quickPillText: { ...typography.caption, color: colors.text.primary, fontWeight: '600' },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.h3, color: colors.text.secondary },
  emptyHint: { ...typography.caption, textAlign: 'center' },
});
