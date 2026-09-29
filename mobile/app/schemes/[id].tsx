// app/schemes/[id].tsx – Scheme detail screen
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { schemesApi } from '../../services/api';
import { Scheme } from '../../types';
import { Colors } from '../../constants/Colors';

function InfoSection({ title, content }: { title: string; content?: string | string[] }) {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoTitle}>{title}</Text>
      {Array.isArray(content) ? (
        content.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.infoText}>{item}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.infoText}>{content}</Text>
      )}
    </View>
  );
}

export default function SchemeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: scheme, isLoading, error } = useQuery<Scheme>({
    queryKey: ['scheme', id],
    queryFn: () => schemesApi.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !scheme) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load scheme details</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={2}>{scheme.name}</Text>
          </View>
          {scheme.ministry && (
            <Text style={styles.ministry}>{scheme.ministry}</Text>
          )}
          {scheme.verified_at && (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.verifiedText}>
                Verified · {new Date(scheme.verified_at).toLocaleDateString('en-IN')}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <InfoSection title="Description" content={scheme.description} />
        <InfoSection title="Eligibility" content={scheme.eligibility} />
        <InfoSection title="Benefits" content={scheme.benefits} />
        <InfoSection title="Required Documents" content={scheme.required_documents} />
        <InfoSection title="Application Procedure" content={scheme.application_procedure} />
        {scheme.applicable_state && (
          <InfoSection title="Applicable State" content={scheme.applicable_state} />
        )}

        {scheme.official_url && (
          <TouchableOpacity
            style={styles.urlBtn}
            onPress={() => Linking.openURL(scheme.official_url!)}
          >
            <Ionicons name="open-outline" size={18} color={Colors.primary} />
            <Text style={styles.urlText}>Visit Official Website</Text>
          </TouchableOpacity>
        )}

        {scheme.source && (
          <View style={styles.sourceBox}>
            <Text style={styles.sourceLabel}>📋 Source</Text>
            <Text style={styles.sourceText}>{scheme.source}</Text>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>
            Information is sourced from official government portals. Always verify details with official sources before applying.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 16, color: Colors.error },
  backLink: { fontSize: 15, color: Colors.primary, fontWeight: '600' },

  header: { paddingBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4, marginTop: 2 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: Colors.white, lineHeight: 28 },
  ministry: { fontSize: 13, color: 'rgba(255,255,255,0.8)', paddingHorizontal: 20, marginBottom: 6 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 4 },
  verifiedText: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  body: { flex: 1, padding: 20 },
  infoSection: { marginBottom: 20 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  infoText: { fontSize: 15, color: Colors.text, lineHeight: 24, flex: 1 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { fontSize: 15, color: Colors.primary, fontWeight: '700', marginTop: 2 },

  urlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  urlText: { fontSize: 15, color: Colors.primary, fontWeight: '600' },

  sourceBox: {
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  sourceLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  sourceText: { fontSize: 13, color: Colors.textSecondary },

  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    marginBottom: 32,
  },
  disclaimerText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
