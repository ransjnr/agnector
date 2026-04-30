import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Agent } from '../types';
import { colors, spacing, radius, typography } from '../constants/theme';

interface Props {
  agent: Agent;
  onPress?: () => void;
}

export default function AgentCard({ agent, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${agent.color}20`, borderColor: `${agent.color}30` }]}>
          <Text style={styles.icon}>{agent.icon}</Text>
        </View>
        <View style={styles.meta}>
          <View style={[styles.categoryBadge, { backgroundColor: `${agent.color}20` }]}>
            <Text style={[styles.categoryText, { color: agent.color }]}>{agent.category}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={colors.warning} />
            <Text style={styles.rating}>{agent.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.name}>{agent.name}</Text>
      <Text style={styles.description} numberOfLines={2}>{agent.description}</Text>

      <View style={styles.capabilities}>
        {agent.capabilities.slice(0, 3).map((cap) => (
          <View key={cap} style={styles.capBadge}>
            <Text style={styles.capText}>{cap.replace(/_/g, ' ')}</Text>
          </View>
        ))}
        {agent.capabilities.length > 3 && (
          <View style={styles.capBadge}>
            <Text style={styles.capText}>+{agent.capabilities.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="people-outline" size={13} color={colors.text.muted} />
          <Text style={styles.usageText}>{agent.usageCount.toLocaleString()} uses</Text>
        </View>
        <View style={styles.modelBadge}>
          <Ionicons name="hardware-chip-outline" size={11} color={colors.primary} />
          <Text style={styles.modelText}>
            {agent.model.includes('opus') ? 'Opus' : agent.model.includes('sonnet') ? 'Sonnet' : 'Haiku'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  icon: { fontSize: 24 },
  meta: { alignItems: 'flex-end', gap: spacing.xs },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  categoryText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, color: colors.warning, fontWeight: '600' },
  name: { fontSize: 17, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  description: { ...typography.caption, marginBottom: spacing.sm, lineHeight: 18 },
  capabilities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  capBadge: {
    backgroundColor: colors.elevated,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  capText: { fontSize: 11, color: colors.text.secondary, textTransform: 'capitalize' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  usageText: { fontSize: 12, color: colors.text.muted },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  modelText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
});
