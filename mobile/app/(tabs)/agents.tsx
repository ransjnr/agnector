import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAgentStore } from '../../store/agentStore';
import { colors, spacing, radius, typography } from '../../constants/theme';
import AgentCard from '../../components/AgentCard';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'development', label: 'Dev' },
  { id: 'communication', label: 'Comms' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'support', label: 'Support' },
];

export default function AgentsScreen() {
  const { agents, isLoadingAgents, selectedCategory, searchQuery, fetchAgents, setCategory, setSearch } =
    useAgentStore();
  const [localSearch, setLocalSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAgents();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setLocalSearch(text);
    const debounce = setTimeout(() => setSearch(text), 300);
    return () => clearTimeout(debounce);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Agents</Text>
          <Text style={styles.subtitle}>{agents.length} agents available</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="sparkles" size={16} color={colors.secondary} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search agents..."
          placeholderTextColor={colors.text.muted}
          value={localSearch}
          onChangeText={handleSearch}
        />
        {localSearch.length > 0 && (
          <TouchableOpacity onPress={() => { setLocalSearch(''); setSearch(''); }}>
            <Ionicons name="close-circle" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
            onPress={() => setCategory(cat.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextActive]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={agents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={1}
        ListEmptyComponent={
          !isLoadingAgents ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.text.muted} />
              <Text style={styles.emptyText}>No agents found</Text>
              <Text style={styles.emptyHint}>Try a different search or category</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <AgentCard agent={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h2 },
  subtitle: { ...typography.caption, marginTop: 2 },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: `${colors.secondary}20`,
    borderWidth: 1,
    borderColor: `${colors.secondary}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 15 },
  categories: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  catChipActive: {
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary,
  },
  catChipText: { fontSize: 13, fontWeight: '500', color: colors.text.secondary },
  catChipTextActive: { color: colors.primary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyText: { ...typography.h3, color: colors.text.secondary },
  emptyHint: { ...typography.caption },
});
