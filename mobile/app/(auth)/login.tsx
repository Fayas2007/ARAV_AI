// app/(auth)/login.tsx – Login screen
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

const schema = z.object({
  mobile_number: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.mobile_number, data.password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Please check your credentials');
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
            <View style={styles.logoIcon}>
              <Ionicons name="leaf" size={32} color={Colors.white} />
            </View>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>Login to your ARAV AI account</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Controller
            control={control}
            name="mobile_number"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mobile Number"
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
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="lock-closed-outline"
                isPassword
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Login"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitBtn}
          />

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>Don't have an account? </Text>
            <Text style={styles.linkBold}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>
            ARAV AI provides informational guidance only and does not replace authorized government officials or legal professionals.
          </Text>
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
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },

  body: { flex: 1, marginTop: -16, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: Colors.background },
  form: { padding: 24, paddingTop: 32 },

  submitBtn: { marginTop: 8, marginBottom: 20 },
  linkRow: { flexDirection: 'row', justifyContent: 'center' },
  linkText: { fontSize: 14, color: Colors.textSecondary },
  linkBold: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 24,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    gap: 8,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
