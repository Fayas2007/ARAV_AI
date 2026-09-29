// app/membership.tsx – Membership services screen
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../services/api';
import { Colors } from '../constants/Colors';

const ELIGIBILITY_POINTS = [
  'Must be 18 years of age or older',
  'Must reside or work in the area of operation of the society',
  'Submit the prescribed membership application form',
  "Pay the share capital as specified in the society's bylaws",
  'Provide valid identity proof (Aadhaar Card preferred)',
];

const REQUIRED_DOCS = [
  'Aadhaar Card (identity and address proof)',
  'Passport-size photograph (2 copies)',
  'Land records/Patta (for agricultural societies)',
  'Mobile number linked to Aadhaar',
  'Nominee details with relationship',
];

const APPLICATION_STEPS = [
  { step: 1, title: 'Obtain Application Form', desc: 'Collect the membership form from your local PACS or cooperative society office.' },
  { step: 2, title: 'Fill the Form', desc: 'Fill in all required details accurately. Keep self-attested copies of documents ready.' },
  { step: 3, title: 'Submit with Documents', desc: 'Submit the completed form along with required documents and share capital amount.' },
  { step: 4, title: 'Committee Review', desc: "The society's managing committee reviews the application (typically 30–60 days)." },
  { step: 5, title: 'Approval & Card', desc: 'Upon approval, receive your membership number and membership card.' },
];

export default function MembershipScreen() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [societyName, setSocietyName] = useState('');
  const [district, setDistrict] = useState('');
  const [landDetails, setLandDetails] = useState('');

  const submitMutation = useMutation({
    mutationFn: () => applicationsApi.create({
      application_type: 'membership',
      title: `Membership Application – ${societyName || 'Cooperative Society'}`,
      form_data: { society_name: societyName, district, land_details: landDetails },
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowModal(false);
      Alert.alert(
        'Application Submitted',
        `Your membership application has been submitted.\nReference: ${data.reference_number}\n\nYou can track the status in My Applications.`,
      );
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Membership Services</Text>
              <Text style={styles.headerSubtitle}>Join a cooperative society</Text>
            </View>
            <TouchableOpacity
              style={styles.voiceHeaderBtn}
              onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1', q: 'How do I become a member of a PACS cooperative society?' } })}
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Source note */}
        <View style={styles.sourceNote}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
          <Text style={styles.sourceText}>Information sourced from Ministry of Cooperation guidelines and Multi-State Co-operative Societies Act, 2002.</Text>
        </View>

        {/* Eligibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
          <View style={styles.card}>
            {ELIGIBILITY_POINTS.map((p, i) => (
              <View key={i} style={[styles.bulletRow, i < ELIGIBILITY_POINTS.length - 1 && styles.bulletBorder]}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                <Text style={styles.bulletText}>{p}</Text>
              </View>
            ))}
            <Text style={styles.note}>* Specific requirements may vary by state cooperative act and society bylaws.</Text>
          </View>
        </View>

        {/* Required Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <View style={styles.card}>
            {REQUIRED_DOCS.map((doc, i) => (
              <View key={i} style={[styles.bulletRow, i < REQUIRED_DOCS.length - 1 && styles.bulletBorder]}>
                <Ionicons name="document-text" size={18} color={Colors.primary} />
                <Text style={styles.bulletText}>{doc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Application Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Process</Text>
          {APPLICATION_STEPS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{s.step}</Text>
              </View>
              {i < APPLICATION_STEPS.length - 1 && <View style={styles.stepLine} />}
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <TouchableOpacity style={styles.applyBtn} onPress={() => setShowModal(true)}>
            <Ionicons name="person-add" size={22} color={Colors.white} />
            <Text style={styles.applyBtnText}>Submit Application Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1', q: 'How do I become a PACS member?' } })}
          >
            <Ionicons name="mic" size={18} color={Colors.primary} />
            <Text style={styles.chatBtnText}>Speak to ARAV AI about membership</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Application Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Membership Application</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Society Name *</Text>
            <TextInput
              style={styles.textField}
              value={societyName}
              onChangeText={setSocietyName}
              placeholder="Name of cooperative society"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.fieldLabel}>District</Text>
            <TextInput
              style={styles.textField}
              value={district}
              onChangeText={setDistrict}
              placeholder="Your district"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Land / Farm Details (Optional)</Text>
            <TextInput
              style={[styles.textField, { minHeight: 80 }]}
              value={landDetails}
              onChangeText={setLandDetails}
              placeholder="Survey number, area, crop details..."
              multiline
              textAlignVertical="top"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.disclaimer}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>
                This records your membership intent in ARAV AI. You must still submit the physical application form to your local cooperative society office with original documents.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, !societyName && styles.submitBtnDisabled]}
              onPress={() => submitMutation.mutate()}
              disabled={!societyName || submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Application</Text>
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  body: { flex: 1 },

  sourceNote: {
    flexDirection: 'row',
    gap: 8,
    margin: 16,
    padding: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  sourceText: { flex: 1, fontSize: 12, color: Colors.primary, lineHeight: 18 },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
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
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  bulletBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  bulletText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  note: { fontSize: 12, color: Colors.textMuted, marginTop: 10, fontStyle: 'italic' },

  stepRow: { flexDirection: 'row', gap: 14, marginBottom: 0 },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepLine: {
    position: 'absolute',
    left: 17,
    top: 36,
    width: 2,
    height: 40,
    backgroundColor: Colors.primaryLight,
  },
  stepNumText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 4,
  },
  stepTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  chatBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
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
  },
  submitBtnDisabled: { backgroundColor: Colors.textMuted },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  voiceHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
