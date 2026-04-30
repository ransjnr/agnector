import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Connection, Integration, Agent } from '../types';
import { colors, spacing, radius, typography } from '../constants/theme';

interface Props {
  connection: Connection;
  integration?: Integration;
  agent?: Agent | null;
  onToggle: () => void;
  onAssignAgent: () => void;
  onDelete: () => void;
}

export default function ConnectionCard({ connection, integration, agent, onToggle, onAssignAgent, onDelete }: Props) {
  const isActive = connection.isActive;
  const iconBg = integration ? `${integration.accentColor}20` : `${colors.primary}20`;

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={styles.top}>
        <View style={styles.left}>
          <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
            <Text style={styles.icon}>{integration?.icon ?? '🔗'}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{integration?.name ?? connection.integrationId}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: isActive ? colors.success : colors.text.muted }]} />
              <Text style={styles.statusText}>{isActive ? 'Active' : 'Inactive'}</Text>
              {integration?.category && (
                <>
                  <Text style={styles.dot2}> · </Text>
                  <Text style={styles.category}>{integration.category}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <Switch
          value={isActive}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: `${colors.primary}70` }}
          thumbColor={isActive ? colors.primary : colors.text.muted}
          ios_backgroundColor={colors.border}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.agentBtn} onPress={onAssignAgent} activeOpacity={0.7}>
          {agent ? (
            <>
              <View style={[styles.agentDot, { backgroundColor: agent.color }]} />
              <Text style={styles.agentText} numberOfLines={1}>
                {agent.icon} {agent.name}
              </Text>
              <Ionicons name="pencil" size={12} color={colors.primary} />
            </>
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={14} color={colors.text.muted} />
              <Text style={styles.noAgentText}>Assign AI Agent</Text>
              <Ionicons name="add" size={14} color={colors.primary} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={15} color={colors.text.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardInactive: { opacity: 0.6 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  dot2: { color: colors.text.muted, fontSize: 12 },
  statusText: { fontSize: 12, color: colors.text.secondary },
  category: { fontSize: 12, color: colors.text.muted, textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: colors.border },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
  },
  agentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.elevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  agentDot: { width: 6, height: 6, borderRadius: 3 },
  agentText: { flex: 1, fontSize: 12, color: colors.text.primary, fontWeight: '500' },
  noAgentText: { flex: 1, fontSize: 12, color: colors.text.muted },
  deleteBtn: { padding: 6 },
});
