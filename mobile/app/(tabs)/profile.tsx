import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useRemoteStore } from '../../store/remoteStore';
import { PcCommandType } from '../../types';

interface ToggleRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ icon, label, description, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIconWrap}>
        <Ionicons name={icon} size={20} color={colors.info} />
      </View>
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: `${colors.info}80` }}
        thumbColor={value ? colors.info : '#f4f4f5'}
      />
    </View>
  );
}

export default function AccessScreen() {
  const { devices, selectedDeviceId, sendCommand } = useRemoteStore();
  const [nightLight, setNightLight] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [magnifier, setMagnifier] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  const selected = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );

  const sendToggle = async (command: PcCommandType, nextValue: boolean, setter: (v: boolean) => void) => {
    try {
      await sendCommand(command, { enabled: nextValue });
      setter(nextValue);
    } catch (err: any) {
      Alert.alert('Command failed', err.message || 'Unable to update accessibility setting.');
    }
  };

  const quickAction = async (title: string, command: PcCommandType) => {
    try {
      await sendCommand(command);
      Alert.alert('Sent', `${title} command sent.`);
    } catch (err: any) {
      Alert.alert('Command failed', err.message || 'Unable to send command.');
    }
  };

  if (!selected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Ionicons name="accessibility-outline" size={44} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>No active device</Text>
          <Text style={styles.emptyHint}>Choose a PC in the Devices tab before changing accessibility controls.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Accessibility Remote</Text>
          <Text style={styles.subtitle}>{selected.name}</Text>
        </View>

        <View style={styles.card}>
          <ToggleRow
            icon="moon-outline"
            label="Night Light"
            description="Reduce blue light for late sessions."
            value={nightLight}
            onChange={(next) => sendToggle('night_light_toggle', next, setNightLight)}
          />

          <ToggleRow
            icon="contrast-outline"
            label="High Contrast"
            description="Improve readability with stronger contrast."
            value={highContrast}
            onChange={(next) => sendToggle('high_contrast_toggle', next, setHighContrast)}
          />

          <ToggleRow
            icon="search-outline"
            label="Magnifier"
            description="Enable zoomed screen inspection."
            value={magnifier}
            onChange={(next) => sendToggle('magnifier_toggle', next, setMagnifier)}
          />

          <ToggleRow
            icon="ear-outline"
            label="Screen Reader"
            description="Toggle spoken UI output mode."
            value={screenReader}
            onChange={(next) => sendToggle('screen_reader_toggle', next, setScreenReader)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.quickTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity style={styles.quickButton} onPress={() => quickAction('Lock', 'lock')}>
              <Ionicons name="lock-closed" size={20} color={colors.primary} />
              <Text style={styles.quickText}>Lock Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickButton} onPress={() => quickAction('Mute', 'mute_toggle')}>
              <Ionicons name="volume-mute" size={20} color={colors.primary} />
              <Text style={styles.quickText}>Mute Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={async () => {
                try {
                  await sendCommand('brightness_set', { value: 25 });
                  Alert.alert('Sent', 'Dim command sent.');
                } catch (err: any) {
                  Alert.alert('Command failed', err.message || 'Unable to send command.');
                }
              }}
            >
              <Ionicons name="sunny" size={20} color={colors.primary} />
              <Text style={styles.quickText}>Dim Display</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.note}>These toggles require the PC companion service to map commands to OS-specific accessibility APIs.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.xs },
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}80`,
  },
  toggleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.info}20`,
  },
  toggleTextWrap: { flex: 1 },
  toggleLabel: { ...typography.body, fontWeight: '600' },
  toggleDescription: { ...typography.caption },
  quickTitle: { ...typography.h3 },
  quickGrid: { flexDirection: 'row', gap: spacing.sm },
  quickButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    gap: 6,
  },
  quickText: { ...typography.caption, color: colors.text.primary, fontWeight: '600' },
  note: { ...typography.caption, marginTop: spacing.xs },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { ...typography.h3, color: colors.text.secondary },
  emptyHint: { ...typography.caption, textAlign: 'center' },
});
