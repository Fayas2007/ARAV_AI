// app/my-applications.tsx – Application tracking screen with tabs
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '../services/api';
import { Application } from '../types';
import { Colors } from '../constants/Colors';
import { StatusBadge } from '../components/StatusBadge';

const TABS = [
  { key: '', label: 'All' },
  { key: 'submitted', label: 'In Progress' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_STEPS = ['submitted', 'under_review', 'approved'];

export default function MyApplicationsScreen() {
  const [activeTab, setActiveTab] = useState('');

  const { data: applications = [], isLoading, refetch } = useQuery<Application[]>({
    queryKey: ['applications', activeTab],
    queryFn: () => applicationsApi.list(activeTab || undefined),
  });

  const renderTimeline = (app: Application) => (
    <View style={styles.timeline}>
      {app.history.map((h, i) => (
        <View key={i} style={styles.timelineItem}>
          <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]} />
          {i < app.history.length - 1 && <View style={styles.timelineLine} />}
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStatus}>{h.status.replace(/_/g, ' ')}</Text>
            {h.notes && <Text style={styles.timelineNote}>{h.notes}</Text>}
            <Text style={styles.timelineDate}>
              {new Date(h.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const renderApplication = ({ item }: { item: Application }) => {
    const isExpanded = expandedId === item.id;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.85}
        >
          <View style={styles.iconBg}>
            <Ionicons
              name={
                item.application_type === 'membership' ? 'people' :
                item.application_type === 'document' ? 'document-text' : 'clipboard'
              }
              size={20}
              color={Colors.primary}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardRef}>Ref: {item.reference_number}</Text>
          </View>
          <View style={styles.cardRight}>
            <StatusBadge status={item.status} />
            <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
        <View style={styles.cardBottomRow}>
          <Text style={styles.cardDate}>
            Submitted: {new Date(item.submitted_at).toLocaleDateString('en-IN')}
          </Text>
          <TouchableOpacity
            style={styles.viewDetailBtn}
            onPress={() => router.push({ pathname: '/applications/[id]', params: { id: item.id } })}
          >
            <Text style={styles.viewDetailText}>Full Details</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {isExpanded && item.history && renderTimeline(item)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Applications</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : applications.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="clipboard-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No applications</Text>
          <Text style={styles.emptySubtitle}>Submit your first application from the services menu</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={renderApplication}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },

  tabs: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardRef: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardRight: { gap: 6, alignItems: 'flex-end' },
  cardDate: { fontSize: 12, color: Colors.textSecondary },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 6,
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  timeline: { paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  timelineItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 14,
    width: 2,
    height: 30,
    backgroundColor: Colors.primaryLight,
  },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 13, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  timelineNote: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  timelineDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
