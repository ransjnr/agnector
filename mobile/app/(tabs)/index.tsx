import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useAgentStore } from '../../store/agentStore';
import { Connection, Integration, Agent } from '../../types';
import { colors, spacing, radius, typography } from '../../constants/theme';
import ConnectionCard from '../../components/ConnectionCard';
import StatsCard from '../../components/StatsCard';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { connections, stats, fetchConnections, fetchStats, createConnection, toggleConnection, assignAgent, deleteConnection } = useConnectionStore();
  const { integrations, agents, fetchIntegrations, fetchAgents } = useAgentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  const load = useCallback(async () => {
    await Promise.all([fetchConnections(), fetchStats(), fetchIntegrations(), fetchAgents()]);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const connectedIntegrationIds = new Set(connections.map((c) => c.integrationId));
  const availableIntegrations = integrations.filter((i) => !connectedIntegrationIds.has(i.id));

  const handleAddIntegration = async (integration: Integration) => {
    setShowAddModal(false);
    try {
      await createConnection(integration.id);
      await fetchStats();
    } catch (err: any) {
      if (err.response?.status !== 409) {
        Alert.alert('Error', 'Failed to connect integration.');
      }
    }
  };

  const handleToggle = async (connection: Connection) => {
    try {
      await toggleConnection(connection.id);
    } catch {
      Alert.alert('Error', 'Failed to toggle connection.');
    }
  };

  const handleAssignAgent = (connection: Connection) => {
    setSelectedConnection(connection);
    setShowAgentModal(true);
  };

  const handleSelectAgent = async (agent: Agent | null) => {
    if (!selectedConnection) return;
    setShowAgentModal(false);
    try {
      await assignAgent(selectedConnection.id, agent ? agent.id : null);
    } catch {
      Alert.alert('Error', 'Failed to assign agent.');
    }
    setSelectedConnection(null);
  };

  const handleDeleteConnection = (connection: Connection) => {
    Alert.alert(
      'Remove Connection',
      `Remove ${getIntegrationName(connection.integrationId)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConnection(connection.id);
            } catch {
              Alert.alert('Error', 'Failed to remove connection.');
            }
          },
        },
      ]
    );
  };

  const getIntegration = (id: string) => integrations.find((i) => i.id === id);
  const getAgent = (id: string | null) => agents.find((a) => a.id === id);
  const getIntegrationName = (id: string) => getIntegration(id)?.name ?? id;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName}>{user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.statsRow}>
            <StatsCard
              icon="flash"
              iconColor={colors.primary}
              value={stats.active}
              label="Active"
            />
            <StatsCard
              icon="sparkles"
              iconColor={colors.secondary}
              value={stats.withAgents}
              label="With Agents"
            />
            <StatsCard
              icon="apps"
              iconColor={colors.success}
              value={stats.total}
              label="Total"
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="apps-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No connections yet</Text>
            <Text style={styles.emptyText}>Tap the + button to connect your first app</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyBtnText}>Add Connection</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ConnectionCard
            connection={item}
            integration={getIntegration(item.integrationId)}
            agent={getAgent(item.agentId)}
            onToggle={() => handleToggle(item)}
            onAssignAgent={() => handleAssignAgent(item)}
            onDelete={() => handleDeleteConnection(item)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Integration Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Connection</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            {availableIntegrations.length === 0 ? (
              <View style={styles.allConnected}>
                <Ionicons name="checkmark-circle" size={40} color={colors.success} />
                <Text style={styles.allConnectedText}>All integrations connected!</Text>
              </View>
            ) : (
              <FlatList
                data={availableIntegrations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: spacing.lg }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.integrationRow}
                    onPress={() => handleAddIntegration(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.integrationIconBox, { backgroundColor: `${item.accentColor}20` }]}>
                      <Text style={styles.integrationIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.integrationInfo}>
                      <Text style={styles.integrationName}>{item.name}</Text>
                      <Text style={styles.integrationDesc} numberOfLines={1}>{item.description}</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={colors.primary} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Assign Agent Modal */}
      <Modal visible={showAgentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign AI Agent</Text>
              <TouchableOpacity onPress={() => { setShowAgentModal(false); setSelectedConnection(null); }}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.agentRow} onPress={() => handleSelectAgent(null)}>
              <View style={[styles.agentIconBox, { backgroundColor: `${colors.danger}20` }]}>
                <Ionicons name="remove-circle-outline" size={22} color={colors.danger} />
              </View>
              <Text style={[styles.agentName, { color: colors.danger }]}>Remove Agent</Text>
            </TouchableOpacity>
            <FlatList
              data={agents}
              keyExtractor={(a) => a.id}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.agentRow,
                    selectedConnection?.agentId === item.id && styles.agentRowSelected,
                  ]}
                  onPress={() => handleSelectAgent(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.agentIconBox, { backgroundColor: `${item.color}20` }]}>
                    <Text style={styles.integrationIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.integrationInfo}>
                    <Text style={styles.agentName}>{item.name}</Text>
                    <Text style={styles.integrationDesc} numberOfLines={1}>{item.description}</Text>
                  </View>
                  {selectedConnection?.agentId === item.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: { fontSize: 14, color: colors.text.secondary },
  userName: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  list: { paddingBottom: spacing.xl },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { ...typography.h3, marginBottom: spacing.xs },
  emptyText: { ...typography.caption, textAlign: 'center', marginBottom: spacing.lg },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  modalTitle: { ...typography.h3 },
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  integrationIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  integrationIcon: { fontSize: 22 },
  integrationInfo: { flex: 1 },
  integrationName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  integrationDesc: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  allConnected: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  allConnectedText: { ...typography.body, color: colors.text.secondary },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  agentRowSelected: { backgroundColor: `${colors.primary}10` },
  agentIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
});
