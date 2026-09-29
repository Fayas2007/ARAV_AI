// app/societies/[id].tsx – Detailed society profile & services screen
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, Share, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { societiesApi } from '../../services/api';
import { Society } from '../../types';
import { Colors } from '../../constants/Colors';

export default function SocietyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: society, isLoading, error } = useQuery<Society>({
    queryKey: ['society', id],
    queryFn: () => societiesApi.getById(id),
    enabled: Boolean(id),
  });

  const handleShare = async () => {
    if (!society) return;
    try {
      await Share.share({
        title: society.name,
        message: `${society.name}\nRegistration: ${society.registration_number || 'N/A'}\nDistrict: ${society.district}, ${society.state}\nPhone: ${society.phone || 'N/A'}\nFind more cooperative services on ARAV AI app.`,
      });
    } catch (e) {
      // share dismissed
    }
  };

  const handleCall = () => {
    if (society?.phone) {
      Linking.openURL(`tel:${society.phone.replace(/\s+/g, '')}`);
    } else {
      Alert.alert('Phone Unavailable', 'No phone number is registered for this society.');
    }
  };

  const handleEmail = () => {
    if (society?.email) {
      Linking.openURL(`mailto:${society.email}?subject=Inquiry regarding ${society.name}`);
    } else {
      Alert.alert('Email Unavailable', 'No email address is registered for this society.');
    }
  };

  const handleAskAI = () => {
    if (!society) return;
    router.push({
      pathname: '/chat/new',
      params: { q: `Tell me about ${society.name} in ${society.district}, its services and membership rules.` },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading society information...</Text>
      </View>
    );
  }

  if (error || !society) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={54} color={Colors.error} />
        <Text style={styles.errorTitle}>Society Not Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.navBtn}>
              <Ionicons name="share-social-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleBlock}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{society.society_type || 'Cooperative Society'}</Text>
            </View>
            <Text style={styles.societyName}>{society.name}</Text>
            <View style={styles.locRow}>
              <Ionicons name="location" size={14} color="#D1FAE5" />
              <Text style={styles.locText}>
                {society.district ? `${society.district}, ` : ''}{society.state || 'India'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Verification banner */}
        {society.is_verified && (
          <View style={styles.verifiedBanner}>
            <Ionicons name="shield-checkmark" size={24} color="#059669" />
            <View style={styles.verifiedInfo}>
              <Text style={styles.verifiedTitle}>Official Verified Society</Text>
              <Text style={styles.verifiedSubtitle}>
                {society.verification_source || 'Verified by Ministry of Cooperation & State Registrar'}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Contact & Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handleCall} activeOpacity={0.8}>
            <View style={[styles.actionIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="call" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionCardLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleEmail} activeOpacity={0.8}>
            <View style={[styles.actionIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="mail" size={22} color="#2563EB" />
            </View>
            <Text style={styles.actionCardLabel}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleAskAI} activeOpacity={0.8}>
            <View style={[styles.actionIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="sparkles" size={22} color="#D97706" />
            </View>
            <Text style={styles.actionCardLabel}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        {/* Registration & Identification */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Registration Details</Text>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Registration No.</Text>
              <Text style={styles.metaVal}>{society.registration_number || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Society Type</Text>
              <Text style={styles.metaVal}>{society.society_type || 'PACS'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>District</Text>
              <Text style={styles.metaVal}>{society.district || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>State</Text>
              <Text style={styles.metaVal}>{society.state || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Office Address</Text>
          <View style={styles.addressBox}>
            <Ionicons name="business-outline" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
            <Text style={styles.addressText}>{society.address || 'Address not listed'}</Text>
          </View>
        </View>

        {/* Services offered */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Available Member Services</Text>
          {society.services && society.services.length > 0 ? (
            <View style={styles.serviceList}>
              {society.services.map((svc, i) => (
                <View key={i} style={styles.serviceItem}>
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={14} color={Colors.primary} />
                  </View>
                  <Text style={styles.serviceItemText}>{svc}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedText}>General agricultural credit and consumer services.</Text>
          )}
        </View>

        {/* Membership Guidelines */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Membership Eligibility</Text>
          <View style={styles.eligibilityBlock}>
            <Text style={styles.eligibilityText}>
              • Must be 18 years or older and a resident within the operational jurisdiction.
            </Text>
            <Text style={styles.eligibilityText}>
              • Land ownership document (7/12 extract or Khatauni) for agricultural credit.
            </Text>
            <Text style={styles.eligibilityText}>
              • Aadhaar Card, PAN card, and 2 passport size photographs.
            </Text>
            <Text style={styles.eligibilityText}>
              • One-time nominal share capital and entrance fee as per Society bylaws.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.bottomCta}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => router.push('/membership')}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>Apply for Membership</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    padding: 6,
  },
  headerTitleBlock: {
    gap: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  societyName: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    lineHeight: 28,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locText: {
    fontSize: 13,
    color: '#D1FAE5',
    fontFamily: 'Inter_500Medium',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  verifiedInfo: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#065F46',
  },
  verifiedSubtitle: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaVal: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  addressBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  serviceList: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  mutedText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  eligibilityBlock: {
    gap: 8,
  },
  eligibilityText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  bottomCta: {
    marginTop: 8,
    marginBottom: 36,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  applyBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  backButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
});
