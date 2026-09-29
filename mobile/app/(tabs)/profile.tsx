// app/(tabs)/profile.tsx – User profile screen
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';
import { LANGUAGES, Language } from '../../types';
import { authApi } from '../../services/api';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'My Applications', route: '/my-applications' },
  { icon: 'document-text-outline', label: 'Saved Documents', route: '/documents-screen' },
  { icon: 'notifications-outline', label: 'Notification Preferences', route: null },
  { icon: 'help-circle-outline', label: 'Help & Support', route: null },
  { icon: 'information-circle-outline', label: 'About ARAV AI', route: null },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>((user?.preferred_language || 'en') as Language);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const handleLanguageChange = async (lang: Language) => {
    setSelectedLang(lang);
    try {
      const updated = await authApi.updateMe({ preferred_language: lang });
      updateUser(updated);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to update language preference');
    }
  };

  const firstName = user?.full_name?.split(' ')[0] || '';
  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name}>{user?.full_name}</Text>
            <Text style={styles.mobile}>{user?.mobile_number}</Text>
            {user?.email && <Text style={styles.email}>{user.email}</Text>}
            {user?.state && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.location}>{user.district ? `${user.district}, ` : ''}{user.state}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>


        {/* Cooperative Society */}
        {user?.cooperative_society && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cooperative Society</Text>
            <View style={styles.societyCard}>
              <Ionicons name="business-outline" size={24} color={Colors.primary} />
              <Text style={styles.societyName}>{user.cooperative_society}</Text>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
                onPress={() => {
                  if (item.route) router.push(item.route as any);
                  else Alert.alert('Coming Soon', 'This feature will be available soon.');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>ARAV AI v1.0.0 · Smart India Hackathon 26088</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 32 },
  headerContent: { alignItems: 'center', paddingTop: 8, paddingHorizontal: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: Colors.white },
  name: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  mobile: { fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  location: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  body: { flex: 1, marginTop: -16, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: Colors.background },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },

  langGrid: { flexDirection: 'row', gap: 10 },
  langCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  langCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  langName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  langNameSelected: { color: Colors.primary },

  societyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  societyName: { fontSize: 15, fontWeight: '600', color: Colors.text },

  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: Colors.error },

  version: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, paddingBottom: 24, paddingTop: 8 },
});
