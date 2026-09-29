// app/(tabs)/home.tsx – Pixel-accurate ARAV AI Main Dashboard
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { LANGUAGES } from '../../types';

const { width } = Dimensions.get('window');

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  const firstName = user?.full_name?.split(' ')[0] || 'Fayas';
  const initial = (user?.full_name ? user.full_name[0] : 'F').toUpperCase();
  const locationText = user?.district
    ? `${user.district}, ${user.state || 'Tamil nadu'}`
    : 'Madurai, Tamil nadu';

  return (
    <View style={styles.container}>
      {/* Top Emerald Profile Bar matching user screenshot */}
      <LinearGradient colors={['#064E3B', '#047857']} style={styles.topProfileBar}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.profileRow}>
            {/* Left: Avatar + Greeting + Verified + Location */}
            <TouchableOpacity
              style={styles.profileInfo}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.85}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
              <View style={styles.profileTextWrap}>
                <View style={styles.nameRow}>
                  <Text style={styles.greetingName}>
                    {getGreeting()}, {firstName}
                  </Text>
                  <Ionicons name="checkmark-circle" size={17} color="#6EE7B7" />
                </View>
                <Text style={styles.locationSub}>{locationText}</Text>
              </View>
            </TouchableOpacity>

            {/* Right: Notification Bell with Red Dot & Settings Gear */}
            <View style={styles.profileActions}>
              <TouchableOpacity
                style={styles.circleActionBtn}
                onPress={() => router.push('/(tabs)/notifications')}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                <View style={styles.actionBadgeDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleActionBtn}
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.8}
              >
                <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Brand Bar */}
      <View style={styles.header}>
        {/* Logo & Brand Name */}
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/arav logo copy.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>ARAV AI</Text>
            <Text style={styles.brandSubtitle}>Your Cooperative Assistant</Text>
          </View>
        </View>
      </View>

        {/* Scrollable Main Content */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner Card – Tap to Speak with ARAV AI */}
          <TouchableOpacity
            style={styles.heroBanner}
            onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1' } })}
            activeOpacity={0.92}
          >
            <Image
              source={require('../../assets/dashboard_banner.png')}
              style={styles.heroBannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* 2x2 Feature Cards Grid */}
          <View style={styles.gridContainer}>
            {/* Card 1: Crop Insurance */}
            <TouchableOpacity
              style={[styles.card, styles.cropCard]}
              onPress={() => router.push('/crop-insurance')}
              activeOpacity={0.88}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="leaf" size={20} color="#16A34A" />
                </View>
                <View style={[styles.arrowPill, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="chevron-forward" size={13} color="#16A34A" />
                </View>
              </View>

              <Text style={styles.cardTitle}>Crop Insurance</Text>
              <Text style={styles.cardSubtitle}>
                Check eligibility, apply and get claim support
              </Text>

              {/* Watermark leaf icon */}
              <Ionicons
                name="leaf"
                size={54}
                color="#16A34A"
                style={styles.watermarkIcon}
              />
            </TouchableOpacity>

            {/* Card 2: Government Schemes */}
            <TouchableOpacity
              style={[styles.card, styles.schemesCard]}
              onPress={() => router.push('/(tabs)/services')}
              activeOpacity={0.88}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="business" size={19} color="#2563EB" />
                </View>
                <View style={[styles.arrowPill, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="chevron-forward" size={13} color="#2563EB" />
                </View>
              </View>

              <Text style={styles.cardTitle}>Government Schemes</Text>
              <Text style={styles.cardSubtitle}>
                Explore schemes, benefits and how to apply
              </Text>

              {/* Watermark building icon */}
              <Ionicons
                name="business"
                size={54}
                color="#2563EB"
                style={styles.watermarkIcon}
              />
            </TouchableOpacity>

            {/* Card 3: Track My Request */}
            <TouchableOpacity
              style={[styles.card, styles.trackCard]}
              onPress={() => router.push('/(tabs)/cases')}
              activeOpacity={0.88}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFEDD5' }]}>
                  <Ionicons name="document-text" size={19} color="#EA580C" />
                </View>
                <View style={[styles.arrowPill, { backgroundColor: '#FFEDD5' }]}>
                  <Ionicons name="chevron-forward" size={13} color="#EA580C" />
                </View>
              </View>

              <Text style={styles.cardTitle}>Track My Request</Text>
              <Text style={styles.cardSubtitle}>
                Check application status and case updates
              </Text>

              {/* Watermark document icon */}
              <Ionicons
                name="document-text"
                size={54}
                color="#EA580C"
                style={styles.watermarkIcon}
              />
            </TouchableOpacity>

            {/* Card 4: Voice & Chat Assistant */}
            <TouchableOpacity
              style={[styles.card, styles.chatCard]}
              onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1' } })}
              activeOpacity={0.88}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="chatbubble-ellipses" size={19} color="#7C3AED" />
                </View>
                <View style={[styles.arrowPill, { backgroundColor: '#F3E8FF', flexDirection: 'row', gap: 2, paddingHorizontal: 6 }]}>
                  <Ionicons name="mic" size={13} color="#7C3AED" />
                  <Ionicons name="chevron-forward" size={13} color="#7C3AED" />
                </View>
              </View>

              <Text style={styles.cardTitle}>Voice & Chat</Text>
              <Text style={styles.cardSubtitle}>
                Speak or ask anything to ARAV AI
              </Text>

              {/* Watermark chat icon */}
              <Ionicons
                name="chatbubble-ellipses"
                size={54}
                color="#7C3AED"
                style={styles.watermarkIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Recent Activity Section */}
          <View style={styles.activitySection}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Recent Activity</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/cases')}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllLink}>View All &gt;</Text>
              </TouchableOpacity>
            </View>

            {/* Activity Item 1 */}
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => router.push('/crop-insurance')}
              activeOpacity={0.88}
            >
              <View style={[styles.activityIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="leaf" size={19} color="#16A34A" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityItemTitle} numberOfLines={1}>
                  Crop Insurance Application
                </Text>
                <Text style={styles.activityItemSub}>
                  PMFBY 2026 • Submitted on 12 Sep 2025
                </Text>
              </View>
              <View style={styles.activityRight}>
                <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#15803D' }]}>
                    In Progress
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </View>
            </TouchableOpacity>

            {/* Activity Item 2 */}
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => router.push('/documents-screen')}
              activeOpacity={0.88}
            >
              <View style={[styles.activityIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="document-text" size={19} color="#2563EB" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityItemTitle} numberOfLines={1}>
                  Land Ownership Document Guidance
                </Text>
                <Text style={styles.activityItemSub}>
                  Uploaded on 10 Sep 2025
                </Text>
              </View>
              <View style={styles.activityRight}>
                <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.statusBadgeText, { color: '#2563EB' }]}>
                    Response Ready
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Floating Voice Assistant Action Button */}
        <TouchableOpacity
          style={styles.floatingVoiceFab}
          onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1' } })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#059669', '#10B981']}
            style={styles.floatingVoiceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" />
            <Text style={styles.floatingVoiceText}>Speak</Text>
          </LinearGradient>
        </TouchableOpacity>
    </View>
  );
}

const CARD_WIDTH = (width - 32 - 12) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topProfileBar: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#064E3B',
    borderWidth: 2,
    borderColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  profileTextWrap: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingName: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  locationSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#D1FAE5',
    marginTop: 2,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actionBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#064E3B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 38,
    height: 38,
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 21,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  langPillText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#334155',
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  heroBanner: {
    width: '100%',
    height: Math.round(((width - 32) * 9) / 16),
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E8F5EC',
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 148,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  cropCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  schemesCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  trackCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  chatCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#F3E8FF',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 15,
    paddingRight: 6,
  },
  watermarkIcon: {
    position: 'absolute',
    bottom: -10,
    right: -8,
    opacity: 0.12,
  },
  activitySection: {
    marginTop: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  viewAllLink: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#15803D',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  activityIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  activityItemSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  modalLangItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalLangItemActive: {
    backgroundColor: '#F0FDF4',
  },
  modalLangText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#334155',
  },
  modalLangTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#15803D',
  },
  floatingVoiceFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  floatingVoiceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
  },
  floatingVoiceText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
