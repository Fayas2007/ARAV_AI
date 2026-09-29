// app/(tabs)/cases.tsx – Unified Cases & Applications Management Hub
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { applicationsApi, grievancesApi } from '../../services/api';
import { Application, Grievance } from '../../types';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';

const { width } = Dimensions.get('window');

type CaseFilter = 'all' | 'in_progress' | 'approved' | 'action';

export default function CasesScreen() {
  const [activeFilter, setActiveFilter] = useState<CaseFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'applications' | 'grievances'>('all');

  const {
    data: applications = [],
    isLoading: loadingApps,
    refetch: refetchApps,
    isRefetching: refetchingApps,
  } = useQuery<Application[]>({
    queryKey: ['cases-applications'],
    queryFn: () => applicationsApi.list(),
  });

  const {
    data: grievances = [],
    isLoading: loadingGrievances,
    refetch: refetchGrievances,
    isRefetching: refetchingGrievances,
  } = useQuery<Grievance[]>({
    queryKey: ['cases-grievances'],
    queryFn: () => grievancesApi.list(),
  });

  const onRefresh = () => {
    refetchApps();
    refetchGrievances();
  };

  // Normalize items
  const normalizedApps = applications.map((app) => ({
    id: app.id,
    kind: 'application' as const,
    title: app.title,
    refNo: app.reference_number,
    status: app.status,
    type: app.application_type,
    date: app.submitted_at,
    raw: app,
  }));

  const normalizedGrievances = grievances.map((g) => ({
    id: g.id,
    kind: 'grievance' as const,
    title: g.subject || `Grievance: ${g.category}`,
    refNo: g.reference_number,
    status: g.status,
    type: 'grievance',
    date: g.submitted_at,
    raw: g,
  }));

  const allCases = [...normalizedApps, ...normalizedGrievances].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredCases = allCases.filter((item) => {
    // Filter by kind
    if (selectedCategory === 'applications' && item.kind !== 'application') return false;
    if (selectedCategory === 'grievances' && item.kind !== 'grievance') return false;

    // Filter by status tab
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in_progress') {
      return ['submitted', 'under_review', 'open', 'in_progress'].includes(item.status.toLowerCase());
    }
    if (activeFilter === 'approved') {
      return ['approved', 'resolved', 'closed'].includes(item.status.toLowerCase());
    }
    if (activeFilter === 'action') {
      return ['action_required', 'pending_documents', 'rejected'].includes(item.status.toLowerCase());
    }
    return true;
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'membership':
        return { name: 'people' as const, color: '#059669', bg: '#ECFDF5' };
      case 'loan':
      case 'kcc':
        return { name: 'card' as const, color: '#2563EB', bg: '#EFF6FF' };
      case 'scheme':
      case 'crop_insurance':
        return { name: 'leaf' as const, color: '#16A34A', bg: '#DCFCE7' };
      case 'grievance':
        return { name: 'alert-circle' as const, color: '#DC2626', bg: '#FEF2F2' };
      case 'document':
        return { name: 'document-text' as const, color: '#7C3AED', bg: '#F5F3FF' };
      default:
        return { name: 'clipboard' as const, color: '#0F766E', bg: '#F0FDFA' };
    }
  };

  const handleCasePress = (item: (typeof allCases)[0]) => {
    if (item.kind === 'application') {
      router.push({ pathname: '/applications/[id]', params: { id: item.id } });
    } else {
      router.push({ pathname: '/grievances/[id]', params: { id: item.id } });
    }
  };

  return (
    <View style={styles.container}>
      {/* Executive Emerald Header */}
      <LinearGradient colors={['#064E3B', '#047857']} style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>My Cases</Text>
              <Text style={styles.headerSub}>Applications, Loans, Claims & Grievances</Text>
            </View>
            <TouchableOpacity
              style={styles.newCaseBtn}
              onPress={() => router.push('/(tabs)/services')}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text style={styles.newCaseBtnText}>New Case</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{allCases.length}</Text>
              <Text style={styles.metricLabel}>Total Cases</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {allCases.filter((c) => ['submitted', 'under_review', 'open', 'in_progress'].includes(c.status.toLowerCase())).length}
              </Text>
              <Text style={styles.metricLabel}>In Progress</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {allCases.filter((c) => ['approved', 'resolved'].includes(c.status.toLowerCase())).length}
              </Text>
              <Text style={styles.metricLabel}>Resolved / Active</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <View style={styles.statusTabs}>
          {[
            { key: 'all', label: 'All' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'approved', label: 'Approved' },
            { key: 'action', label: 'Action Needed' },
          ].map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.statusTab, isSelected && styles.statusTabActive]}
                onPress={() => setActiveFilter(tab.key as CaseFilter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.statusTabText, isSelected && styles.statusTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Pills */}
        <View style={styles.categoryRow}>
          {[
            { key: 'all', label: 'All Services' },
            { key: 'applications', label: 'Applications & Claims' },
            { key: 'grievances', label: 'Grievances' },
          ].map((cat) => {
            const isSel = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryPill, isSel && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.key as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryPillText, isSel && styles.categoryPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Cases List */}
      {loadingApps && loadingGrievances ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your active cases...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCases}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refetchingApps || refetchingGrievances}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="folder-open-outline" size={38} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Cases Found</Text>
              <Text style={styles.emptySub}>
                {activeFilter === 'all'
                  ? "You don't have any registered applications or grievance cases yet."
                  : `No cases matching the "${activeFilter.replace('_', ' ')}" filter.`}
              </Text>
              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => router.push('/membership')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="people-outline" size={16} color={Colors.primary} />
                  <Text style={styles.emptyActionText}>Apply Membership</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => router.push('/crop-insurance')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="leaf-outline" size={16} color={Colors.primary} />
                  <Text style={styles.emptyActionText}>Crop Claim</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const iconConfig = getItemIcon(item.type);
            return (
              <TouchableOpacity
                style={styles.caseCard}
                onPress={() => handleCasePress(item)}
                activeOpacity={0.88}
              >
                <View style={styles.caseCardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: iconConfig.bg }]}>
                    <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
                  </View>
                  <View style={styles.caseInfo}>
                    <Text style={styles.caseTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.caseRef}>Ref: {item.refNo}</Text>
                  </View>
                  <StatusBadge status={item.status} />
                </View>

                <View style={styles.caseFooter}>
                  <View style={styles.dateWrap}>
                    <Ionicons name="calendar-outline" size={13} color="#64748B" />
                    <Text style={styles.dateText}>
                      {new Date(item.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.viewLink}>
                    <Text style={styles.viewLinkText}>View Status</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#D1FAE5',
    marginTop: 2,
  },
  newCaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  newCaseBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#D1FAE5',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  statusTabActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statusTabText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  statusTabTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#064E3B',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  categoryPillText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  categoryPillTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: '#059669',
  },
  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  caseCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  caseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseInfo: {
    flex: 1,
  },
  caseTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
  },
  caseRef: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 3,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewLinkText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  emptyActionText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
});
