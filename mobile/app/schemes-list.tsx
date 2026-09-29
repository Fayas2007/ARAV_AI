// app/schemes-list.tsx – Government schemes browser
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { schemesApi } from '../services/api';
import { Scheme } from '../types';
import { Colors } from '../constants/Colors';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'government_scheme', label: 'Govt Schemes' },
  { key: 'crop_insurance', label: 'Crop Insurance' },
  { key: 'agricultural_loan', label: 'Loans' },
  { key: 'cooperative_development', label: 'Cooperative' },
  { key: 'cooperative_services', label: 'PACS Services' },
];

const CATEGORY_ICONS: Record<string, string> = {
  government_scheme: 'star',
  crop_insurance: 'umbrella',
  agricultural_loan: 'cash',
  cooperative_development: 'people',
  cooperative_services: 'business',
};

export default function SchemesListScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: schemes = [], isLoading } = useQuery<Scheme[]>({
    queryKey: ['schemes', selectedCategory, search],
    queryFn: () => schemesApi.list({
      category: selectedCategory || undefined,
      search: search || undefined,
      limit: 50,
    }),
  });

  const renderScheme = ({ item }: { item: Scheme }) => {
    const icon = CATEGORY_ICONS[item.category || ''] || 'star';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/schemes/[id]', params: { id: item.id } })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBg}>
            <Ionicons name={icon as any} size={20} color={Colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
            {item.ministry && <Text style={styles.cardMinistry}>{item.ministry}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </View>
        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.cardFooter}>
          {item.applicable_state && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.applicable_state}</Text>
            </View>
          )}
          {item.category && (
            <View style={[styles.tag, { backgroundColor: Colors.primaryLight }]}>
              <Text style={[styles.tagText, { color: Colors.primary }]}>
                {CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
              </Text>
            </View>
          )}
          {item.verified_at && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
            <View>
              <Text style={styles.headerTitle}>Schemes & Benefits</Text>
              <Text style={styles.headerSubtitle}>Government schemes for farmers</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search schemes..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.filterChip, selectedCategory === cat.key && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[styles.filterText, selectedCategory === cat.key && styles.filterTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : schemes.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="star-outline" size={60} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No schemes found</Text>
          <Text style={styles.emptySubtext}>Try a different search or category</Text>
        </View>
      ) : (
        <FlatList
          data={schemes}
          keyExtractor={(item) => item.id}
          renderItem={renderScheme}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.white },
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  cardMinistry: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.borderLight,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySubtext: { fontSize: 14, color: Colors.textSecondary },
});
