// app/societies-list.tsx – Societies directory and PACS locator
import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Linking, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { societiesApi } from '../services/api';
import { Society } from '../types';
import { Colors } from '../constants/Colors';

const TYPES = ['All', 'PACS', 'Marketing', 'Dairy'];

const STATES = [
  'All States',
  'Kerala',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Maharashtra',
  'Karnataka',
  'Uttar Pradesh',
];

export default function SocietiesListScreen() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');

  const { data: societies = [], isLoading, isRefetching, refetch } = useQuery<Society[]>({
    queryKey: ['societies', selectedState, search],
    queryFn: () => societiesApi.list({
      state: selectedState === 'All States' ? undefined : selectedState,
      search: search.trim() || undefined,
    }),
  });

  const filteredSocieties = useMemo(() => {
    return societies.filter((soc) => {
      if (selectedType === 'All') return true;
      const typeStr = (soc.society_type || '').toLowerCase();
      return typeStr.includes(selectedType.toLowerCase());
    });
  }, [societies, selectedType]);

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
    }
  };

  const renderSociety = ({ item }: { item: Society }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardTop}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={
              item.society_type?.includes('Dairy')
                ? 'water-outline'
                : item.society_type?.includes('Marketing')
                ? 'storefront-outline'
                : 'business-outline'
            }
            size={22}
            color={Colors.primary}
          />
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <View style={styles.metaRow}>
            {item.society_type && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.society_type}</Text>
              </View>
            )}
            {item.is_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#059669" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Reg & Location */}
      <View style={styles.infoSection}>
        {item.registration_number && (
          <View style={styles.infoRow}>
            <Ionicons name="newspaper-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.infoText}>Reg: {item.registration_number}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.district ? `${item.district}, ` : ''}{item.state || 'India'}
          </Text>
        </View>
      </View>

      {/* Services tags */}
      {item.services && item.services.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.services.slice(0, 3).map((service, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{service}</Text>
            </View>
          ))}
          {item.services.length > 3 && (
            <View style={[styles.tag, styles.tagMore]}>
              <Text style={styles.tagMoreText}>+{item.services.length - 3} more</Text>
            </View>
          )}
        </View>
      )}

      {/* Card Actions */}
      <View style={styles.actionRow}>
        {item.phone && (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handleCall(item.phone)}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={16} color={Colors.primary} />
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => router.push({ pathname: '/societies/[id]', params: { id: item.id } })}
          activeOpacity={0.85}
        >
          <Text style={styles.detailsBtnText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Societies & PACS</Text>
              <Text style={styles.headerSubtitle}>Official Cooperative Directory</Text>
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, district, or reg no..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Filters row */}
      <View style={styles.filterSection}>
        {/* Type chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TYPES}
          keyExtractor={(item) => item}
          style={styles.typeList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.typeChip, selectedType === item && styles.typeChipSelected]}
              onPress={() => setSelectedType(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeChipText, selectedType === item && styles.typeChipTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* State chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATES}
          keyExtractor={(item) => item}
          style={styles.stateList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.stateChip, selectedState === item && styles.stateChipSelected]}
              onPress={() => setSelectedState(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.stateChipText, selectedState === item && styles.stateChipTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Main list */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading societies directory...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSocieties}
          keyExtractor={(item) => item.id}
          renderItem={renderSociety}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={54} color={Colors.border} />
              <Text style={styles.emptyTitle}>No Societies Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or state filter.
              </Text>
              {(search || selectedType !== 'All' || selectedState !== 'All States') && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setSearch('');
                    setSelectedType('All');
                    setSelectedState('All States');
                  }}
                >
                  <Text style={styles.clearBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D1FAE5',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  filterSection: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
    gap: 8,
  },
  typeList: {
    paddingHorizontal: 16,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: Colors.primary,
  },
  typeChipText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_500Medium',
  },
  typeChipTextSelected: {
    color: Colors.white,
    fontFamily: 'Inter_600SemiBold',
  },
  stateList: {
    paddingHorizontal: 16,
  },
  stateChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    backgroundColor: Colors.white,
  },
  stateChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#ECFDF5',
  },
  stateChipText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  stateChipTextSelected: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#2563EB',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#059669',
  },
  infoSection: {
    gap: 4,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: '48%',
  },
  tagText: {
    fontSize: 11,
    color: Colors.text,
  },
  tagMore: {
    backgroundColor: '#FEF3C7',
  },
  tagMoreText: {
    fontSize: 11,
    color: '#D97706',
    fontFamily: 'Inter_500Medium',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#ECFDF5',
  },
  callBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  detailsBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
});
