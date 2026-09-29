// app/applications/[id].tsx – Application details and status timeline tracking screen
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Share, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '../../services/api';
import { Application } from '../../types';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';

const STAGES = [
  { key: 'submitted', label: 'Application Submitted' },
  { key: 'under_review', label: 'Document Verification' },
  { key: 'committee_review', label: 'Committee Review' },
  { key: 'approved', label: 'Approved & Completed' },
];

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: app, isLoading, error } = useQuery<Application>({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getById(id),
    enabled: Boolean(id),
  });

  const handleShare = async () => {
    if (!app) return;
    try {
      await Share.share({
        title: `ARAV AI Application: ${app.reference_number}`,
        message: `ARAV AI Application Reference: ${app.reference_number}\nTitle: ${app.title}\nStatus: ${app.status.toUpperCase()}\nSubmitted on: ${new Date(app.submitted_at).toLocaleDateString('en-IN')}`,
      });
    } catch {
      // dismissed
    }
  };

  const getStageIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'rejected') return -1;
    if (s === 'approved' || s === 'completed') return 3;
    if (s === 'under_review' || s === 'processing') return 1;
    if (s === 'committee_review') return 2;
    return 0; // submitted
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching application status...</Text>
      </View>
    );
  }

  if (error || !app) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={54} color={Colors.error} />
        <Text style={styles.errorTitle}>Application Not Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStageIdx = getStageIndex(app.status);
  const isRejected = app.status.toLowerCase() === 'rejected';

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
            <Text style={styles.refNumber}>{app.reference_number}</Text>
            <Text style={styles.appTitle} numberOfLines={2}>{app.title}</Text>
            <View style={styles.statusRow}>
              <StatusBadge status={app.status} />
              <Text style={styles.submittedDate}>
                Submitted: {new Date(app.submitted_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application Journey</Text>
          {isRejected ? (
            <View style={styles.rejectedBanner}>
              <Ionicons name="close-circle" size={24} color={Colors.error} />
              <View style={styles.rejectedInfo}>
                <Text style={styles.rejectedTitle}>Application Rejected</Text>
                <Text style={styles.rejectedText}>
                  Please review the remarks below or file a grievance for clarification.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.stepperContainer}>
              {STAGES.map((stage, idx) => {
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <View key={stage.key} style={styles.stageRow}>
                    <View style={styles.stepperLeft}>
                      <View style={[
                        styles.stepperDot,
                        isPassed && styles.stepperDotPassed,
                        isCurrent && styles.stepperDotCurrent,
                      ]}>
                        {isPassed ? (
                          <Ionicons name="checkmark" size={14} color={Colors.white} />
                        ) : (
                          <View style={styles.dotInner} />
                        )}
                      </View>
                      {idx < STAGES.length - 1 && (
                        <View style={[
                          styles.stepperLine,
                          idx < currentStageIdx && styles.stepperLinePassed,
                        ]} />
                      )}
                    </View>
                    <View style={styles.stageContent}>
                      <Text style={[styles.stageLabel, isPassed && styles.stageLabelPassed]}>
                        {stage.label}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.stageActiveNote}>Currently at this stage</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Submitted Data / Form fields */}
        {app.form_data && Object.keys(app.form_data).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Submission Details</Text>
            <View style={styles.formFieldsGrid}>
              {Object.entries(app.form_data).map(([key, val]) => (
                <View key={key} style={styles.fieldItem}>
                  <Text style={styles.fieldLabel}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                  <Text style={styles.fieldValue}>{String(val)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Status History Logs */}
        {app.history && app.history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Audit & Status History</Text>
            <View style={styles.historyList}>
              {app.history.map((h, i) => (
                <View key={i} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>{h.status.replace(/_/g, ' ').toUpperCase()}</Text>
                    {h.notes && <Text style={styles.historyNotes}>{h.notes}</Text>}
                    <Text style={styles.historyTime}>
                      {new Date(h.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Help & Chat Assistance */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.chatHelpBtn}
            onPress={() => router.push({
              pathname: '/chat/new',
              params: { q: `What is the typical processing time and next steps for application ${app.reference_number}?` },
            })}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={18} color={Colors.white} />
            <Text style={styles.chatHelpBtnText}>Ask ARAV AI About Next Steps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.grievanceHelpBtn}
            onPress={() => router.push('/grievances-screen')}
            activeOpacity={0.85}
          >
            <Ionicons name="headset-outline" size={18} color={Colors.primary} />
            <Text style={styles.grievanceHelpBtnText}>File a Support Query / Grievance</Text>
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
  appTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    lineHeight: 26,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  submittedDate: {
    fontSize: 12,
    color: '#D1FAE5',
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
    gap: 14,
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
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
  },
  rejectedInfo: {
    flex: 1,
  },
  rejectedTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.error,
  },
  rejectedText: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 2,
  },
  stepperContainer: {
    paddingVertical: 4,
    gap: 2,
  },
  stageRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepperLeft: {
    alignItems: 'center',
    width: 32,
  },
  stepperDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepperDotPassed: {
    backgroundColor: Colors.primary,
  },
  stepperDotCurrent: {
    backgroundColor: Colors.primaryDark,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  stepperLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  stepperLinePassed: {
    backgroundColor: Colors.primary,
  },
  stageContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  stageLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  stageLabelPassed: {
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  stageActiveNote: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  formFieldsGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  fieldItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_500Medium',
  },
  fieldValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
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
  actionSection: {
    gap: 10,
    marginTop: 8,
    marginBottom: 36,
  },
  chatHelpBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  chatHelpBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  grievanceHelpBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  grievanceHelpBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
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
