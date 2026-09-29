// app/documents-screen.tsx – Documents & Certificates screen
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../services/api';
import { DocumentRequest } from '../types';
import { Colors } from '../constants/Colors';
import { StatusBadge } from '../components/StatusBadge';

const DOCUMENT_TYPES = [
  'Membership Certificate',
  'NOC Certificate',
  'Share Receipt',
  'Loan Statement',
  'Interest Certificate',
  'Society Membership Card',
  'Other',
];

export default function DocumentsScreen() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState('');
  const [description, setDescription] = useState('');

  const { data: documents = [], isLoading } = useQuery<DocumentRequest[]>({
    queryKey: ['documents'],
    queryFn: documentsApi.list,
  });

  const requestMutation = useMutation({
    mutationFn: documentsApi.requestDocument,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowModal(false);
      setDocType('');
      setDescription('');
      Alert.alert(
        'Request Submitted',
        `Your document request has been submitted.\nReference: ${data.reference_number}`,
      );
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const handleSubmit = () => {
    if (!docType) {
      Alert.alert('Select Document Type', 'Please select a document type to request.');
      return;
    }
    requestMutation.mutate({ document_type: docType, description });
  };

  const renderDocument = ({ item }: { item: DocumentRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.docIcon}>
          <Ionicons name="document-text" size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.document_type}</Text>
          <Text style={styles.cardRef}>Ref: {item.reference_number}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          Requested: {new Date(item.requested_at).toLocaleDateString('en-IN')}
        </Text>
        {item.ready_at && (
          <Text style={[styles.cardDate, { color: Colors.success }]}>
            Ready: {new Date(item.ready_at).toLocaleDateString('en-IN')}
          </Text>
        )}
      </View>
      {item.notes && <Text style={styles.cardNotes}>{item.notes}</Text>}
    </View>
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
              <Text style={styles.headerTitle}>Documents</Text>
              <Text style={styles.headerSubtitle}>Your certificates & requests</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Ionicons name="add" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="document-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No document requests</Text>
          <Text style={styles.emptySubtitle}>Tap + to request a document</Text>
          <TouchableOpacity style={styles.requestBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.requestBtnText}>Request Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={renderDocument}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Document Request Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request a Document</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Document Type *</Text>
            <View style={styles.typeGrid}>
              {DOCUMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, docType === type && styles.typeChipSelected]}
                  onPress={() => setDocType(type)}
                >
                  <Text style={[styles.typeText, docType === type && styles.typeTextSelected]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Additional Details (Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Any specific details about your request..."
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.disclaimer}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>
                Document requests are processed by your cooperative society. Only documents associated with your account will be provided.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, !docType && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!docType || requestMutation.isPending}
            >
              {requestMutation.isPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Request</Text>
              )}
            </TouchableOpacity>
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

  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardRef: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardFooter: { flexDirection: 'row', gap: 16 },
  cardDate: { fontSize: 12, color: Colors.textSecondary },
  cardNotes: { marginTop: 8, fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  emptySubtitle: { fontSize: 15, color: Colors.textSecondary },
  requestBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    marginTop: 4,
  },
  requestBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  typeChipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  typeTextSelected: { color: Colors.primary },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    marginBottom: 16,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: Colors.textMuted },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
