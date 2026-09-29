// app/(auth)/register.tsx – Registration screen
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuthStore } from '../../store/authStore';
import { LANGUAGES, Language } from '../../types';

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile_number: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  state: z.string().optional(),
  district: z.string().optional(),
  preferred_language: z.enum(['en', 'hi', 'ta', 'te']),
  cooperative_society: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_language: 'en' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await register({
        ...data,
        email: data.email || undefined,
        state: data.state || undefined,
        district: data.district || undefined,
        cooperative_society: data.cooperative_society || undefined,
      });
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join ARAV AI today</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Controller
            control={control}
            name="full_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name *"
                placeholder="Your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="person-outline"
                error={errors.full_name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="mobile_number"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mobile Number *"
                placeholder="10-digit mobile number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                maxLength={10}
                leftIcon="call-outline"
                error={errors.mobile_number?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email (Optional)"
                placeholder="your@email.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password *"
                placeholder="At least 8 characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="lock-closed-outline"
                isPassword
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="State"
                placeholder="e.g. Tamil Nadu"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="location-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="district"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="District"
                placeholder="e.g. Coimbatore"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="map-outline"
              />
            )}
          />

          {/* Language Selection */}
          <Text style={styles.sectionLabel}>Preferred Language *</Text>
          <Controller
            control={control}
            name="preferred_language"
            render={({ field: { onChange, value } }) => (
              <View style={styles.langGrid}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langCard, value === lang.code && styles.langCardSelected]}
                    onPress={() => onChange(lang.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.langName, value === lang.code && styles.langNameSelected]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={[styles.langEn, value === lang.code && styles.langEnSelected]}>
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <Controller
            control={control}
            name="cooperative_society"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Cooperative Society (Optional)"
                placeholder="Society name if known"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="business-outline"
              />
            )}
          />

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitBtn}
          />

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={styles.linkBold}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 32 },
  backBtn: { padding: 16 },
  headerContent: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  body: { flex: 1, marginTop: -16, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: Colors.background },
  form: { padding: 24, paddingTop: 32 },

  sectionLabel: { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: 12 },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  langCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  langCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  langName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  langNameSelected: { color: Colors.primary },
  langEn: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  langEnSelected: { color: Colors.primary },

  submitBtn: { marginTop: 8, marginBottom: 20 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 32 },
  linkText: { fontSize: 14, color: Colors.textSecondary },
  linkBold: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
