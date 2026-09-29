// app/grievances-screen.tsx – Grievance submission and tracking
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator, ScrollView, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grievancesApi } from '../services/api';
import { Grievance } from '../types';
import { Colors } from '../constants/Colors';
import { StatusBadge } from '../components/StatusBadge';
import { useVoiceDictation } from '../hooks/useVoiceDictation';

const CATEGORIES = [
  'Membership Dispute',
  'Loan Complaint',
  'Document Request Issue',
  'Staff Misconduct',
  'Financial Irregularity',
  'Election Dispute',
  'Service Denial',
  'Other',
];

const OFFICIAL_PORTALS = [
  { name: 'CPGRAMS - National Grievance Portal', url: 'https://pgportal.gov.in/', icon: 'globe' },
  { name: 'NABARD Grievance Portal', url: 'https://www.nabard.org/', icon: 'business' },
  { name: 'Ministry of Cooperation', url: 'https://cooperation.gov.in/', icon: 'government' },
];

export default function GrievancesScreen() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [relatedSociety, setRelatedSociety] = useState('');

  const voice = useVoiceDictation({
    onTranscript: (text) => {
      setDescription((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  const { data: grievances = [], isLoading, refetch } = useQuery<Grievance[]>({
    queryKey: ['grievances'],
    queryFn: grievancesApi.list,
  });

  const submitMutation = useMutation({
    mutationFn: grievancesApi.submit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      setShowModal(false);
      setCategory('');
      setSubject('');
      setDescription('');
      setRelatedSociety('');
      Alert.alert(
        'Grievance Submitted',
        `Your grievance has been registered within ARAV AI.\nReference: ${data.reference_number}\n\nNote: This is an internal submission. For official government grievances, use CPGRAMS (pgportal.gov.in).`,
      );
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const handleSubmit = () => {
    if (!category || !subject || !description) {
      Alert.alert('Required Fields', 'Please fill in category, subject and description.');
      return;
    }
    submitMutation.mutate({ category, subject, description, related_society: relatedSociety || undefined });
  };

  const renderGrievance = ({ item }: { item: Grievance }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/grievances/[id]', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBg}>
          <Ionicons name="alert-circle" size={22} color={Colors.error} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.subject}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardRef}>Ref: {item.reference_number}</Text>
        <View style={styles.cardTrackRow}>
          <Text style={styles.cardDate}>{new Date(item.submitted_at).toLocaleDateString('en-IN')}</Text>
          <Ionicons name="chevron-forward" size={15} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Grievance Support</Text>
              <Text style={styles.headerSubtitle}>Submit & track complaints</Text>
            </View>
            <View style={styles.headerRightButtons}>
              <TouchableOpacity
                style={styles.voiceAssistBtn}
                onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1', q: 'How do I resolve a cooperative dispute or file a grievance?' } })}
                activeOpacity={0.8}
              >
                <Ionicons name="mic" size={20} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                <Ionicons name="add" size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Disclaimer */}
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={styles.noticeText}>
            Grievances submitted here are tracked within ARAV AI. For official complaints, use government portals below.
          </Text>
        </View>

        {/* Official Portals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Official Grievance Portals</Text>
          {OFFICIAL_PORTALS.map((portal, i) => (
            <TouchableOpacity
              key={i}
              style={styles.portalCard}
              onPress={() => Linking.openURL(portal.url)}
            >
              <Ionicons name="open-outline" size={18} color={Colors.primary} />
              <Text style={styles.portalName}>{portal.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* My Grievances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Grievances</Text>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : grievances.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.primary} />
              <Text style={styles.emptyText}>No grievances submitted</Text>
              <TouchableOpacity style={styles.submitFirstBtn} onPress={() => setShowModal(true)}>
                <Text style={styles.submitFirstText}>Submit a Grievance</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={grievances}
              keyExtractor={(item) => item.id}
              renderItem={renderGrievance}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Submit Grievance Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Grievance</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Category *</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, category === cat && styles.catChipSelected]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catText, category === cat && styles.catTextSelected]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Subject *</Text>
              <TextInput
                style={styles.textField}
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief subject of your complaint"
                placeholderTextColor={Colors.textMuted}
              />

              <View style={styles.descHeaderRow}>
                <Text style={styles.fieldLabel}>Description *</Text>
                <TouchableOpacity
                  style={[styles.voiceDictateBtn, voice.isRecording && styles.voiceDictateBtnActive]}
                  onPress={voice.isRecording ? () => voice.stopRecording() : voice.startRecording}
                  activeOpacity={0.8}
                >
                  {voice.isTranscribing ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <Ionicons
                      name={voice.isRecording ? 'stop-circle' : 'mic'}
                      size={14}
                      color={voice.isRecording ? '#DC2626' : '#059669'}
                    />
                  )}
                  <Text style={[styles.voiceDictateText, voice.isRecording && { color: '#DC2626' }]}>
                    {voice.isRecording ? 'Listening...' : voice.isTranscribing ? 'Transcribing...' : 'Dictate with Voice'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.textField, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={voice.isRecording ? 'Listening to your speech...' : 'Describe your complaint in detail...'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Related Society (Optional)</Text>
              <TextInput
                style={styles.textField}
                value={relatedSociety}
                onChangeText={setRelatedSociety}
                placeholder="Name of cooperative society"
                placeholderTextColor={Colors.textMuted}
              />

              <View style={styles.disclaimer}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.disclaimerText}>
                  This submits your grievance within ARAV AI for tracking. This does NOT constitute a formal official complaint to government authorities.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, (!category || !subject || !description) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!category || !subject || !description || submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Grievance</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notice: {
    flexDirection: 'row',
    gap: 10,
    margin: 16,
    padding: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  noticeText: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 20 },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },

  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  portalName: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  cardCategory: { fontSize: 12, color: Colors.textMuted },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardRef: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  cardTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDate: { fontSize: 12, color: Colors.textMuted },

  emptyState: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  submitFirstBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 4,
  },
  submitFirstText: { color: Colors.white, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  catChipSelected: { borderColor: Colors.error, backgroundColor: '#FEF2F2' },
  catText: { fontSize: 13, color: Colors.textSecondary },
  catTextSelected: { color: Colors.error },
  textField: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 14,
    backgroundColor: Colors.background,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    marginBottom: 16,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitBtnDisabled: { backgroundColor: Colors.textMuted },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceAssistBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  voiceDictateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  voiceDictateBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  voiceDictateText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#059669',
  },
});
