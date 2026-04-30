import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../constants/theme';

interface Props {
  icon: string;
  iconColor: string;
  value: number;
  label: string;
}

export default function StatsCard({ icon, iconColor, value, label }: Props) {
  return (
    <View style={[styles.card, { borderColor: `${iconColor}30` }]}>
      <View style={[styles.iconBox, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as any} size={16} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: iconColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 11, color: colors.text.secondary, fontWeight: '500' },
});
