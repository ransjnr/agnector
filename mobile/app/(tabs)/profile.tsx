import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useConnectionStore } from '../../store/connectionStore';
import { colors, spacing, radius, typography } from '../../constants/theme';

interface SettingRowProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingRow({ icon, iconColor, iconBg, label, value, onPress, destructive }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, destructive && { color: colors.danger }]}>{label}</Text>
      {value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { stats } = useConnectionStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
              </View>
            )}
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
            <View style={styles.planBadge}>
              <Ionicons name="star" size={11} color={colors.warning} />
              <Text style={styles.planText}>{user?.plan?.toUpperCase() ?? 'FREE'}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.withAgents}</Text>
            <Text style={styles.statLabel}>With Agents</Text>
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.settingsCard}>
          <SettingRow
            icon="person-outline"
            iconColor={colors.primary}
            iconBg={`${colors.primary}20`}
            label="Edit Profile"
          />
          <View style={styles.separator} />
          <SettingRow
            icon="calendar-outline"
            iconColor={colors.info}
            iconBg={`${colors.info}20`}
            label="Member Since"
            value={memberSince}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="shield-checkmark-outline"
            iconColor={colors.success}
            iconBg={`${colors.success}20`}
            label="Security"
          />
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.settingsCard}>
          <SettingRow
            icon="notifications-outline"
            iconColor={colors.warning}
            iconBg={`${colors.warning}20`}
            label="Notifications"
          />
          <View style={styles.separator} />
          <SettingRow
            icon="key-outline"
            iconColor={colors.secondary}
            iconBg={`${colors.secondary}20`}
            label="API Keys"
          />
          <View style={styles.separator} />
          <SettingRow
            icon="color-palette-outline"
            iconColor="#EC4899"
            iconBg="#EC489920"
            label="Appearance"
          />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.settingsCard}>
          <SettingRow
            icon="help-circle-outline"
            iconColor={colors.info}
            iconBg={`${colors.info}20`}
            label="Help & Documentation"
          />
          <View style={styles.separator} />
          <SettingRow
            icon="chatbubble-outline"
            iconColor={colors.success}
            iconBg={`${colors.success}20`}
            label="Send Feedback"
          />
        </View>

        {/* Sign Out */}
        <View style={styles.settingsCard}>
          <SettingRow
            icon="log-out-outline"
            iconColor={colors.danger}
            iconBg={`${colors.danger}20`}
            label="Sign Out"
            onPress={handleLogout}
            destructive
          />
        </View>

        <Text style={styles.version}>Agnector v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { ...typography.h2 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: radius.full },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 26, fontWeight: '700', color: colors.primary },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  userInfo: { flex: 1 },
  userName: { ...typography.h3, marginBottom: 2 },
  userEmail: { ...typography.caption, marginBottom: spacing.xs },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${colors.warning}20`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  planText: { fontSize: 10, fontWeight: '700', color: colors.warning, letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border },
  sectionLabel: {
    ...typography.label,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { flex: 1, ...typography.body },
  settingValue: { ...typography.caption, color: colors.text.secondary },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 34 + spacing.md },
  version: { textAlign: 'center', ...typography.caption, marginTop: spacing.xs },
});
