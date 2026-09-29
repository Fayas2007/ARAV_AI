// app/(tabs)/services.tsx – Comprehensive Cooperative Services Directory
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const PRIMARY_SERVICES = [
  {
    id: 'membership',
    title: 'Membership',
    description: 'Cooperative membership registration, applications and tracking.',
    shortDesc: 'Apply, upload documents and track membership.',
    icon: 'people',
    color: '#059669',
    bg: '#ECFDF5',
    borderColor: '#A7F3D0',
    route: '/membership',
    tag: 'Primary PACS',
  },
  {
    id: 'societies',
    title: 'PACS & Society',
    description: 'Society discovery, profiles, membership requirements and available services.',
    shortDesc: 'Find societies and explore their services.',
    icon: 'business',
    color: '#0891B2',
    bg: '#F0F9FF',
    borderColor: '#BAE6FD',
    route: '/societies-list',
    tag: 'Directory',
  },
  {
    id: 'loans',
    title: 'KCC & Loans',
    description: 'Loan information, eligibility guidance, required documents and application assistance.',
    shortDesc: 'Eligibility, documents and loan guidance.',
    icon: 'card',
    color: '#2563EB',
    bg: '#EFF6FF',
    borderColor: '#BFDBFE',
    route: '/loans',
    tag: '4% Subvention',
  },
  {
    id: 'crop_insurance',
    title: 'Crop Insurance',
    description: 'PMFBY guidance, AI-guided crop-damage assessment, evidence submission and case tracking.',
    shortDesc: 'Guided crop assessment and case submission.',
    icon: 'shield-checkmark',
    color: '#D97706',
    bg: '#FFFBEB',
    borderColor: '#FDE68A',
    route: '/crop-insurance',
    tag: 'PMFBY 72h',
  },
];

const OTHER_SERVICES = [
  {
    id: 'documents',
    title: 'Documents',
    description: 'Digital certificates, land records & membership forms.',
    icon: 'document-text',
    color: '#7C3AED',
    bg: '#F5F3FF',
    route: '/documents-screen',
  },
  {
    id: 'cases',
    title: 'My Cases',
    description: 'Track all active applications, loans, and filed claims.',
    icon: 'briefcase',
    color: '#0D9488',
    bg: '#F0FDFA',
    route: '/(tabs)/cases',
  },
  {
    id: 'schemes',
    title: 'Schemes',
    description: 'Govt central & state agriculture subsidy programs.',
    icon: 'sparkles',
    color: '#EA580C',
    bg: '#FFF7ED',
    route: '/schemes-list',
  },
  {
    id: 'grievances',
    title: 'Grievances',
    description: 'CPGRAMS grievance redressal & society dispute filing.',
    icon: 'alert-circle',
    color: '#DC2626',
    bg: '#FEF2F2',
    route: '/grievances-screen',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Case status alerts, subsidy deadlines & updates.',
    icon: 'notifications',
    color: '#4B5563',
    bg: '#F3F4F6',
    route: '/(tabs)/notifications',
  },
  {
    id: 'history',
    title: 'Chat History',
    description: 'Review previous multilingual AI advisory conversations.',
    icon: 'time',
    color: '#059669',
    bg: '#ECFDF5',
    route: '/(tabs)/history',
  },
];

export default function ServicesScreen() {
  const [search, setSearch] = useState('');

  const filteredPrimary = PRIMARY_SERVICES.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOther = OTHER_SERVICES.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#064E3B', '#047857']} style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle}>Services</Text>
              <Text style={styles.headerSub}>Four core cooperative services & assistance</Text>
            </View>
            <TouchableOpacity
              style={styles.chatShortcutBtn}
              onPress={() => router.push('/chat/new')}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles" size={16} color="#6EE7B7" />
              <Text style={styles.chatShortcutText}>AI Help</Text>
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services (Membership, KCC, PMFBY)..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.micSearchBtn}
                onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1' } })}
                activeOpacity={0.8}
              >
                <Ionicons name="mic" size={18} color="#059669" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Four Main Features Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Main Cooperative Features</Text>
            <Text style={styles.sectionSubtitle}>Primary services for members and farmers</Text>
          </View>
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>Core 4</Text>
          </View>
        </View>

        <View style={styles.primaryList}>
          {filteredPrimary.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.primaryCard, { borderColor: item.borderColor }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.88}
            >
              <View style={styles.primaryCardTop}>
                <View style={[styles.primaryIconBg, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.primaryTitleWrap}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.primaryTitle}>{item.title}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: item.bg }]}>
                      <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.primaryDesc}>{item.description}</Text>
                </View>
              </View>

              <View style={styles.primaryFooter}>
                <Text style={styles.primaryActionText}>Open Service</Text>
                <Ionicons name="arrow-forward" size={16} color={item.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Services Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <View>
            <Text style={styles.sectionTitle}>Other Services & Support</Text>
            <Text style={styles.sectionSubtitle}>Schemes, documents, grievances & tracking</Text>
          </View>
        </View>

        <View style={styles.otherGrid}>
          {filteredOther.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.otherCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.88}
            >
              <View style={[styles.otherIconWrap, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.otherTitle}>{item.title}</Text>
              <Text style={styles.otherDesc} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ask ARAV AI Voice Assistant Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1' } })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#0F766E', '#064E3B']}
            style={styles.aiBannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.aiBannerLeft}>
              <View style={styles.aiBannerIcon}>
                <Ionicons name="mic" size={24} color="#6EE7B7" />
              </View>
              <View style={styles.aiBannerTextWrap}>
                <Text style={styles.aiBannerTitle}>Ask ARAV AI Voice Assistant</Text>
                <Text style={styles.aiBannerSub}>
                  Speak or ask any question about cooperative services, loans, or schemes.
                </Text>
              </View>
            </View>
            <View style={styles.aiBannerBtn}>
              <Ionicons name="mic" size={18} color="#064E3B" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 14,
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  chatShortcutText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#0F172A',
    padding: 0,
  },
  micSearchBtn: {
    padding: 4,
    borderRadius: 8,
  },
  scrollBody: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#16A34A',
  },
  primaryList: {
    gap: 12,
  },
  primaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryCardTop: {
    flexDirection: 'row',
    gap: 14,
  },
  primaryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTitleWrap: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  primaryDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#475569',
    marginTop: 5,
    lineHeight: 18,
  },
  primaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryActionText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#064E3B',
  },
  otherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  otherCard: {
    width: (width - 32 - 12) / 2,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  otherIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  otherTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
    marginBottom: 4,
  },
  otherDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 15,
  },
  aiBanner: {
    marginTop: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  aiBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  aiBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTextWrap: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
  aiBannerSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#D1FAE5',
    marginTop: 2,
    lineHeight: 15,
  },
  aiBannerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
