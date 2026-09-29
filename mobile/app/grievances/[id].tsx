// app/grievances/[id].tsx – Grievance details and status tracking screen
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { grievancesApi } from '../../services/api';
import { Grievance } from '../../types';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';

export default function GrievanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: grievance, isLoading, error } = useQuery<Grievance>({
    queryKey: ['grievance', id],
    queryFn: () => grievancesApi.getById(id),
    enabled: Boolean(id),
  });

  const handleShare = async () => {
    if (!grievance) return;
    try {
      await Share.share({
        title: `Grievance Ref: ${grievance.reference_number}`,
        message: `ARAV AI Grievance\nRef: ${grievance.reference_number}\nSubject: ${grievance.subject}\nCategory: ${grievance.category}\nStatus: ${grievance.status}`,
      });
    } catch {
      // dismissed
    }
  };

  const handleEscalateCPGRAMS = () => {
    Linking.openURL('https://pgportal.gov.in/');
  };

  const handleAskAI = () => {
    if (!grievance) return;
    router.push({
      pathname: '/chat/new',
      params: {
        q: `I submitted a grievance about "${grievance.subject}" under category "${grievance.category}". What legal remedies or escalation channels do I have under the Cooperative Societies Act?`,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching grievance details...</Text>
      </View>
    );
  }

  if (error || !grievance) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={54} color={Colors.error} />
        <Text style={styles.errorTitle}>Grievance Not Found</Text>
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
          <View style={styles.headerInfo}>
            <Text style={styles.refNumber}>{grievance.reference_number}</Text>
            <Text style={styles.headerTitle} numberOfLines={2}>{grievance.subject}</Text>
            <View style={styles.statusRow}>
              <StatusBadge status={grievance.status} />
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{grievance.category}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Grievance Description</Text>
          <Text style={styles.descriptionText}>{grievance.description}</Text>

          {grievance.related_society && (
            <View style={styles.societyRow}>
              <Ionicons name="business" size={16} color={Colors.primary} />
              <Text style={styles.societyName}>Related Society: {grievance.related_society}</Text>
            </View>
          )}

          <View style={styles.submittedMeta}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.metaDate}>
              Submitted on: {new Date(grievance.submitted_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Status / History Timeline */}
        {grievance.history && grievance.history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resolution Timeline</Text>
            <View style={styles.historyList}>
              {grievance.history.map((h, i) => (
                <View key={i} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>{h.status.replace(/_/g, ' ').toUpperCase()}</Text>
                    {h.notes && <Text style={styles.historyNotes}>{h.notes}</Text>}
                    <Text style={styles.historyTime}>
                      {new Date(h.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Official Escalation Section */}
        <View style={styles.escalationCard}>
          <View style={styles.escalationHeader}>
            <Ionicons name="alert-circle-outline" size={22} color="#B45309" />
            <Text style={styles.escalationTitle}>Need Official Government Redressal?</Text>
          </View>
          <Text style={styles.escalationText}>
            For non-resolved disputes or statutory grievances against cooperative society management,
            you can lodge a complaint directly on CPGRAMS or contact the District Registrar of Cooperatives.
          </Text>
          <TouchableOpacity
            style={styles.cpgramsBtn}
            onPress={handleEscalateCPGRAMS}
            activeOpacity={0.85}
          >
            <Ionicons name="globe-outline" size={18} color={Colors.white} />
            <Text style={styles.cpgramsBtnText}>Open CPGRAMS Portal (pgportal.gov.in)</Text>
          </TouchableOpacity>
        </View>

        {/* Ask AI button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={handleAskAI}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={18} color={Colors.white} />
            <Text style={styles.aiBtnText}>Ask ARAV AI For Legal Rights Advice</Text>
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
    paddingBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 6,
  },
  headerInfo: {
    gap: 6,
  },
  refNumber: {
    fontSize: 13,
    color: '#A7F3D0',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    lineHeight: 26,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: Colors.white,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  societyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
  },
  societyName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#166534',
  },
  submittedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  historyList: {
    gap: 14,
  },
  historyItem: {
    flexDirection: 'row',
    gap: 12,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
    gap: 2,
  },
  historyStatus: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  historyNotes: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  historyTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  escalationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
    gap: 10,
  },
  escalationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  escalationTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#92400E',
  },
  escalationText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  cpgramsBtn: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  cpgramsBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  bottomSection: {
    marginTop: 4,
    marginBottom: 36,
  },
  aiBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  aiBtnText: {
    fontSize: 15,
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
