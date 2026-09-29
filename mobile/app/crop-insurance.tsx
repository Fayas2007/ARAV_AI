// app/crop-insurance.tsx – PMFBY Crop Insurance & AI-guided Assessment
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../constants/Colors';
import { applicationsApi } from '../services/api';
import { useVoiceDictation } from '../hooks/useVoiceDictation';

const { width } = Dimensions.get('window');

const CROPS = ['Paddy / Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Groundnut', 'Millets'];
const LOSS_REASONS = [
  'Inundation / Flooding',
  'Unseasonal / Heavy Rains',
  'Severe Drought / Dry Spell',
  'Hailstorm Damage',
  'Pest / Disease Attack',
  'Post-Harvest Cyclone',
];

export default function CropInsuranceScreen() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'assess' | 'info' | 'guidelines'>('assess');
  const [selectedCrop, setSelectedCrop] = useState('Paddy / Rice');
  const [selectedReason, setSelectedReason] = useState('Unseasonal / Heavy Rains');
  const [lossPercentage, setLossPercentage] = useState('50');
  const [surveyNo, setSurveyNo] = useState('');
  const [areaHectares, setAreaHectares] = useState('1.5');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [claimRef, setClaimRef] = useState('');

  const voice = useVoiceDictation({
    onTranscript: (text) => {
      setNotes((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  const claimMutation = useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications-home'] });
      setClaimRef(data.reference_number);
      setIsSubmitted(true);
    },
    onError: (err: any) => {
      Alert.alert('Submission Failed', err.message || 'Unable to submit crop assessment case.');
    },
  });

  const handleSubmitClaim = () => {
    if (!surveyNo.trim()) {
      Alert.alert('Missing Detail', 'Please enter your Land Survey / Khasra Number.');
      return;
    }
    claimMutation.mutate({
      application_type: 'scheme',
      title: `PMFBY Crop Damage Claim: ${selectedCrop}`,
      form_data: {
        scheme_name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        crop: selectedCrop,
        damage_cause: selectedReason,
        estimated_loss_percent: `${lossPercentage}%`,
        survey_number: surveyNo,
        area_hectares: areaHectares,
        farmer_notes: notes,
        reported_at: new Date().toISOString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#064E3B', '#047857']} style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Crop Insurance</Text>
              <Text style={styles.headerSub}>PMFBY Assessment & Claims</Text>
            </View>
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.chatIconBtn}
                onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1', q: 'How do I claim PMFBY crop insurance for damaged crops?' } })}
                activeOpacity={0.8}
              >
                <Ionicons name="mic" size={18} color="#6EE7B7" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatIconBtn}
                onPress={() => router.push({ pathname: '/chat/new', params: { q: 'How do I report crop damage under PMFBY within 72 hours?' } })}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={18} color="#6EE7B7" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sub Navigation Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'assess' && styles.tabBtnActive]}
              onPress={() => setActiveTab('assess')}
            >
              <Text style={[styles.tabText, activeTab === 'assess' && styles.tabTextActive]}>
                Damage Assessment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'info' && styles.tabBtnActive]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
                PMFBY Rules
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'guidelines' && styles.tabBtnActive]}
              onPress={() => setActiveTab('guidelines')}
            >
              <Text style={[styles.tabText, activeTab === 'guidelines' && styles.tabTextActive]}>
                72h Claim Window
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'assess' && (
          <View>
            {isSubmitted ? (
              <View style={styles.successCard}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-done" size={36} color="#059669" />
                </View>
                <Text style={styles.successTitle}>Claim Case Registered</Text>
                <Text style={styles.successSub}>
                  Your crop damage assessment has been submitted to the PACS Insurance Officer.
                </Text>
                <View style={styles.refBox}>
                  <Text style={styles.refLabel}>Case Reference Number</Text>
                  <Text style={styles.refValue}>{claimRef}</Text>
                </View>
                <Text style={styles.noteText}>
                  • An agricultural field surveyor will verify the geo-tagged crop loss.
                  • Track progress anytime in the "My Cases" tab.
                </Text>
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => router.push('/(tabs)/cases')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.doneBtnText}>View in My Cases</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* 72-Hour Warning Banner */}
                <View style={styles.alertBanner}>
                  <Ionicons name="time" size={20} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertBannerTitle}>Mandatory 72-Hour Rule</Text>
                    <Text style={styles.alertBannerText}>
                      Localized crop loss must be reported within 72 hours of damage occurrence under PMFBY guidelines.
                    </Text>
                  </View>
                </View>

                {/* Crop Selection */}
                <Text style={styles.fieldLabel}>1. Select Affected Crop</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {CROPS.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      style={[styles.chip, selectedCrop === crop && styles.chipActive]}
                      onPress={() => setSelectedCrop(crop)}
                    >
                      <Text style={[styles.chipText, selectedCrop === crop && styles.chipTextActive]}>
                        {crop}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Cause of Damage */}
                <Text style={styles.fieldLabel}>2. Cause of Damage</Text>
                <View style={styles.reasonGrid}>
                  {LOSS_REASONS.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={[styles.reasonTile, selectedReason === reason && styles.reasonTileActive]}
                      onPress={() => setSelectedReason(reason)}
                    >
                      <Ionicons
                        name={selectedReason === reason ? 'checkmark-circle' : 'radio-button-off'}
                        size={16}
                        color={selectedReason === reason ? '#059669' : '#94A3B8'}
                      />
                      <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextActive]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Severity Slider / Selector */}
                <Text style={styles.fieldLabel}>3. Estimated Crop Loss Severity</Text>
                <View style={styles.percentRow}>
                  {['25', '50', '75', '100'].map((pct) => (
                    <TouchableOpacity
                      key={pct}
                      style={[styles.percentBtn, lossPercentage === pct && styles.percentBtnActive]}
                      onPress={() => setLossPercentage(pct)}
                    >
                      <Text style={[styles.percentText, lossPercentage === pct && styles.percentTextActive]}>
                        {pct}% Loss
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Land & Survey details */}
                <Text style={styles.fieldLabel}>4. Land Survey & Area</Text>
                <View style={styles.inputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSubLabel}>Survey / Khasra No. *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 142/3A"
                      value={surveyNo}
                      onChangeText={setSurveyNo}
                    />
                  </View>
                  <View style={{ width: 120 }}>
                    <Text style={styles.inputSubLabel}>Area (Hectares)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 2.0"
                      keyboardType="numeric"
                      value={areaHectares}
                      onChangeText={setAreaHectares}
                    />
                  </View>
                </View>

                {/* Evidence / Description with Voice Dictation */}
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.fieldLabel}>5. Field Observations / Damage Notes</Text>
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
                        size={15}
                        color={voice.isRecording ? '#DC2626' : '#059669'}
                      />
                    )}
                    <Text style={[styles.voiceDictateText, voice.isRecording && { color: '#DC2626' }]}>
                      {voice.isRecording ? 'Listening...' : voice.isTranscribing ? 'Transcribing...' : 'Dictate with Voice'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder={voice.isRecording ? 'Listening to your speech...' : 'Describe field waterlogging, stalk breakage, or pest manifestation...'}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                />

                {/* Evidence Photo Upload Mock */}
                <View style={styles.uploadBox}>
                  <Ionicons name="camera" size={24} color="#059669" />
                  <Text style={styles.uploadTitle}>Geo-Tagged Photo Evidence</Text>
                  <Text style={styles.uploadSub}>Photos captured via mobile include verified GPS coordinates</Text>
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmitClaim}
                  disabled={claimMutation.isPending}
                  activeOpacity={0.88}
                >
                  {claimMutation.isPending ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="shield-checkmark" size={18} color={Colors.white} />
                      <Text style={styles.submitBtnText}>Submit Crop Damage Assessment</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'info' && (
          <View style={styles.infoWrapper}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>PMFBY Premium Subsidies</Text>
              <Text style={styles.infoCardText}>
                Farmers pay a nominal premium under the Pradhan Mantri Fasal Bima Yojana:
              </Text>
              <View style={styles.rateRow}>
                <View style={styles.rateBadge}><Text style={styles.ratePct}>2.0%</Text><Text style={styles.rateSub}>Kharif Crops</Text></View>
                <View style={styles.rateBadge}><Text style={styles.ratePct}>1.5%</Text><Text style={styles.rateSub}>Rabi Crops</Text></View>
                <View style={styles.rateBadge}><Text style={styles.ratePct}>5.0%</Text><Text style={styles.rateSub}>Commercial/Horti</Text></View>
              </View>
              <Text style={styles.infoNote}>The balance premium is subsidized equally by the Central & State Governments.</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Covered Risks</Text>
              <Text style={styles.infoPoint}>• **Prevented Sowing/Planting:** Deficit rainfall or adverse season.</Text>
              <Text style={styles.infoPoint}>• **Standing Crop Loss:** Drought, flood, pests, unseasonal cloudburst.</Text>
              <Text style={styles.infoPoint}>• **Post-Harvest Losses:** Up to 14 days post-harvest crop drying.</Text>
              <Text style={styles.infoPoint}>• **Localized Calamities:** Hailstorm, landslide, and field inundation.</Text>
            </View>
          </View>
        )}

        {activeTab === 'guidelines' && (
          <View style={styles.infoWrapper}>
            {/* Audio Readout of Guidelines */}
            <TouchableOpacity
              style={[styles.listenGuidelinesBtn, voice.isSpeaking && styles.listenGuidelinesBtnActive]}
              onPress={() => {
                if (voice.isSpeaking) {
                  voice.stopSpeaking();
                } else {
                  voice.speak("Important PMFBY Crop Insurance Guidelines. Step 1: Notify within 72 hours. Report crop damage to your village PACS, Agricultural Officer, or through ARAV AI within 72 hours of damage. Step 2: Keep land documents ready, including KCC passbook, sowing certificate, and Aadhaar card. Step 3: Surveyor inspection. Loss assessment joint team will inspect the field within 10 days of claim registration.");
                }
              }}
              activeOpacity={0.85}
            >
              <Ionicons
                name={voice.isSpeaking ? 'stop-circle' : 'volume-high'}
                size={20}
                color={voice.isSpeaking ? '#DC2626' : '#065F46'}
              />
              <Text style={[styles.listenGuidelinesText, voice.isSpeaking && { color: '#DC2626' }]}>
                {voice.isSpeaking ? 'Stop Audio Readout' : 'Listen to Guidelines (Voice)'}
              </Text>
            </TouchableOpacity>

            <View style={styles.guidelineCard}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guidelineTitle}>Notify Within 72 Hours</Text>
                <Text style={styles.guidelineText}>Report to your village PACS, Agricultural Officer, or through ARAV AI within 72 hours of damage.</Text>
              </View>
            </View>

            <View style={styles.guidelineCard}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guidelineTitle}>Keep Land Documents Ready</Text>
                <Text style={styles.guidelineText}>Have your KCC passbook, sowing certificate, and Aadhaar card accessible.</Text>
              </View>
            </View>

            <View style={styles.guidelineCard}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guidelineTitle}>Surveyor Inspection</Text>
                <Text style={styles.guidelineText}>Loss assessment joint team inspects the field within 10 days of claim registration.</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.white },
  headerSub: { fontSize: 12, color: '#A7F3D0', fontFamily: 'Inter_500Medium' },
  chatIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },

  tabRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 3 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabBtnActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter_500Medium' },
  tabTextActive: { color: '#064E3B', fontFamily: 'Inter_700Bold' },

  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 30 },

  alertBanner: { flexDirection: 'row', gap: 10, backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 16 },
  alertBannerTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#B45309' },
  alertBannerText: { fontSize: 11, color: '#92400E', fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 16 },

  fieldLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#1E293B', marginBottom: 8, marginTop: 12 },
  chipRow: { flexDirection: 'row', marginBottom: 10 },
  chip: { backgroundColor: Colors.white, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: '#ECFDF5', borderColor: '#059669' },
  chipText: { fontSize: 12, color: '#475569', fontFamily: 'Inter_500Medium' },
  chipTextActive: { color: '#059669', fontFamily: 'Inter_700Bold' },

  reasonGrid: { gap: 8, marginBottom: 10 },
  reasonTile: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  reasonTileActive: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  reasonText: { fontSize: 13, color: '#334155', fontFamily: 'Inter_500Medium' },
  reasonTextActive: { color: '#064E3B', fontFamily: 'Inter_700Bold' },

  percentRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  percentBtn: { flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  percentBtnActive: { backgroundColor: '#059669', borderColor: '#059669' },
  percentText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#334155' },
  percentTextActive: { color: Colors.white },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  inputSubLabel: { fontSize: 11, color: '#64748B', fontFamily: 'Inter_500Medium', marginBottom: 4 },
  textInput: { backgroundColor: Colors.white, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  textArea: { height: 75, textAlignVertical: 'top' },

  uploadBox: { backgroundColor: '#F0FDF4', borderWidth: 1.5, borderColor: '#86EFAC', borderStyle: 'dashed', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12, marginBottom: 16 },
  uploadTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#065F46', marginTop: 4 },
  uploadSub: { fontSize: 11, color: '#047857', marginTop: 2, textAlign: 'center' },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#059669', paddingVertical: 15, borderRadius: 14, shadowColor: '#059669', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: Colors.white, fontSize: 15, fontFamily: 'Inter_700Bold' },

  successCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#A7F3D0', elevation: 3 },
  successIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#064E3B', marginBottom: 6 },
  successSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  refBox: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', marginBottom: 16, width: '100%' },
  refLabel: { fontSize: 11, color: '#64748B', fontFamily: 'Inter_500Medium' },
  refValue: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#059669', letterSpacing: 1, marginTop: 2 },
  noteText: { fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 18, alignSelf: 'flex-start' },
  doneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#064E3B', paddingVertical: 13, borderRadius: 12, width: '100%' },
  doneBtnText: { color: Colors.white, fontSize: 14, fontFamily: 'Inter_700Bold' },

  infoWrapper: { gap: 12 },
  infoCard: { backgroundColor: Colors.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  infoCardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0F172A', marginBottom: 6 },
  infoCardText: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 12 },
  rateRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  rateBadge: { flex: 1, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  ratePct: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#059669' },
  rateSub: { fontSize: 10.5, color: '#065F46', fontFamily: 'Inter_500Medium', marginTop: 2 },
  infoNote: { fontSize: 11, color: '#64748B', fontStyle: 'italic' },
  infoPoint: { fontSize: 13, color: '#334155', lineHeight: 20, marginBottom: 4 },

  guidelineCard: { flexDirection: 'row', gap: 12, backgroundColor: Colors.white, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: Colors.white, fontFamily: 'Inter_700Bold', fontSize: 14 },
  guidelineTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0F172A' },
  guidelineText: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
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
    fontFamily: 'Inter_600SemiBold',
    color: '#059669',
  },
  listenGuidelinesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  listenGuidelinesBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  listenGuidelinesText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#065F46',
  },
});
