// app/onboarding.tsx – Onboarding + language selection screen
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/Colors';
import { Button } from '../components/Button';
import { LANGUAGES, Language } from '../types';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [selectedLang, setSelectedLang] = useState<Language>('en');

  const handleGetStarted = async () => {
    await SecureStore.setItemAsync('onboarding_language', selectedLang);
    router.push('/(auth)/login');
  };

  const handleRegister = async () => {
    await SecureStore.setItemAsync('onboarding_language', selectedLang);
    router.push('/(auth)/register');
  };

  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Ionicons name="leaf" size={48} color={Colors.white} />
            </View>
            <Text style={styles.appName}>ARAV AI</Text>
            <Text style={styles.tagline}>Cooperative Governance Assistant</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresCard}>
            {[
              { icon: 'chatbubble-ellipses', text: 'AI-powered cooperative guidance' },
              { icon: 'globe', text: 'English, Hindi, Tamil & Telugu' },
              { icon: 'shield-checkmark', text: 'Verified government schemes & laws' },
              { icon: 'people', text: 'Membership, loans & grievances' },
            ].map((item, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.featureText}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* Language Selection */}
          <View style={styles.langSection}>
            <Text style={styles.langTitle}>Select your preferred language</Text>
            <Text style={styles.langSubtitle}>अपनी भाषा चुनें | மொழி தேர்வு | భాష ఎంచుకోండి</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langCard,
                    selectedLang === lang.code && styles.langCardSelected,
                  ]}
                  onPress={() => setSelectedLang(lang.code)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langName, selectedLang === lang.code && styles.langNameSelected]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={[styles.langEn, selectedLang === lang.code && styles.langEnSelected]}>
                    {lang.name}
                  </Text>
                  {selectedLang === lang.code && (
                    <View style={styles.langCheck}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              style={styles.primaryBtn}
            />
            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="outline"
              style={styles.outlineBtn}
              textStyle={{ color: Colors.white }}
            />
          </View>

          <Text style={styles.hackathon}>Smart India Hackathon 2024 · Problem 26088</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },

  logoSection: { alignItems: 'center', paddingVertical: 32 },
  logoIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: { fontSize: 40, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '400' },

  featuresCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: { fontSize: 15, color: Colors.white, fontWeight: '500', flex: 1 },

  langSection: { marginBottom: 28 },
  langTitle: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 4, textAlign: 'center' },
  langSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 16 },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  langCard: {
    width: (width - 48 - 12) / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  langCardSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  langName: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  langNameSelected: { color: Colors.primary },
  langEn: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  langEnSelected: { color: Colors.textSecondary },
  langCheck: { position: 'absolute', top: 8, right: 8 },

  ctaSection: { gap: 12, marginBottom: 24 },
  primaryBtn: { backgroundColor: Colors.white },
  outlineBtn: { borderColor: 'rgba(255,255,255,0.6)' },

  hackathon: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12 },
});
