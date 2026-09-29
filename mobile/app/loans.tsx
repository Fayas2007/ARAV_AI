// app/loans.tsx – Loans & Financial Support screen
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface LoanInfo {
  title: string;
  icon: string;
  color: string;
  points: string[];
}

const LOAN_CARDS: LoanInfo[] = [
  {
    title: 'Kisan Credit Card (KCC)',
    icon: 'card',
    color: '#16834A',
    points: [
      'Revolving credit facility for farming needs',
      'Interest rate: 7% p.a. (effective 4% with Govt subvention)',
      'Available at PACS, commercial banks and RRBs',
      'Covers crop cultivation, farm assets and allied activities',
      'No collateral required up to ₹1.6 lakh',
    ],
  },
  {
    title: 'Short-Term Crop Loans (PACS)',
    icon: 'leaf',
    color: '#16834A',
    points: [
      'Loans for seasonal agricultural operations',
      'Disbursed through Primary Agricultural Credit Societies',
      'Rates fixed by cooperative banks/NABARD',
      'Interest subvention available for prompt repayers',
      'Linked with Crop Insurance (PMFBY)',
    ],
  },
  {
    title: 'NABARD Schemes',
    icon: 'business',
    color: '#2563EB',
    points: [
      'Rural Infrastructure Development Fund (RIDF)',
      'Warehouse Infrastructure Fund',
      'Dairy Processing & Infrastructure Fund',
      'Fisheries and Aquaculture Development Fund',
      'Channeled through State Govts and cooperative banks',
    ],
  },
];

function LoanCard({ info }: { info: LoanInfo }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={styles.loanCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
    >
      <View style={styles.loanCardHeader}>
        <View style={[styles.loanIcon, { backgroundColor: info.color + '18' }]}>
          <Ionicons name={info.icon as any} size={22} color={info.color} />
        </View>
        <Text style={styles.loanTitle}>{info.title}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textMuted} />
      </View>
      {expanded && (
        <View style={styles.loanPoints}>
          {info.points.map((p, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{p}</Text>
            </View>
          ))}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.disclaimerText}>
              Interest rates are indicative. Confirm current rates with your bank or PACS.
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function LoansScreen() {
  // EMI Calculator state
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [emi, setEmi] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);

  const calculateEMI = () => {
    const P = parseFloat(principal);
    const R = parseFloat(rate) / 12 / 100;
    const N = parseFloat(tenure);

    if (isNaN(P) || isNaN(R) || isNaN(N) || P <= 0 || N <= 0 || R <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for all fields.');
      return;
    }

    const calculatedEMI = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    setEmi(calculatedEMI);
    setTotalPayment(calculatedEMI * N);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Loans & Financial</Text>
              <Text style={styles.headerSubtitle}>Agricultural credit guidance</Text>
            </View>
            <TouchableOpacity
              style={styles.voiceHeaderBtn}
              onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1', q: 'Tell me about Kisan Credit Card (KCC) interest rates and eligibility.' } })}
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Loan Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Loan Products</Text>
          {LOAN_CARDS.map((info, i) => (
            <LoanCard key={i} info={info} />
          ))}
        </View>

        {/* EMI Calculator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMI Calculator</Text>
          <View style={styles.calculatorCard}>
            <Text style={styles.calcNote}>
              * This is an illustrative calculator using a standard amortization formula. Actual EMI may differ based on bank/PACS terms.
            </Text>
            <View style={styles.calcInput}>
              <Ionicons name="cash-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.calcTextInput}
                value={principal}
                onChangeText={setPrincipal}
                placeholder="Loan Amount (₹)"
                keyboardType="numeric"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.calcInput}>
              <Ionicons name="trending-up-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.calcTextInput}
                value={rate}
                onChangeText={setRate}
                placeholder="Annual Interest Rate (%)"
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.calcInput}>
              <Ionicons name="calendar-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.calcTextInput}
                value={tenure}
                onChangeText={setTenure}
                placeholder="Loan Tenure (months)"
                keyboardType="numeric"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <TouchableOpacity style={styles.calcBtn} onPress={calculateEMI}>
              <Text style={styles.calcBtnText}>Calculate EMI</Text>
            </TouchableOpacity>

            {emi !== null && (
              <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Monthly EMI</Text>
                  <Text style={styles.resultValue}>
                    ₹{emi.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Total Payment</Text>
                  <Text style={styles.resultValue}>
                    ₹{totalPayment!.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Total Interest</Text>
                  <Text style={[styles.resultValue, { color: Colors.warning }]}>
                    ₹{(totalPayment! - parseFloat(principal)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Ask AI */}
        {/* Ask AI / Voice Assistant */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <TouchableOpacity
            style={styles.askAiCard}
            onPress={() => router.push({ pathname: '/chat/new', params: { voice: '1', q: 'How do I apply for a Kisan Credit Card (KCC) or cooperative agricultural loan?' } })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <Ionicons name="mic" size={26} color={Colors.white} />
              <View style={{ flex: 1 }}>
                <Text style={styles.askAiTitle}>Ask ARAV AI (Voice & Chat)</Text>
                <Text style={styles.askAiSubtitle}>Speak or ask about KCC loans & 4% subvention</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  voiceHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { flex: 1 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 14 },

  loanCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  loanCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  loanIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loanTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text },
  loanPoints: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bullet: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  bulletText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  disclaimer: { flexDirection: 'row', gap: 6, marginTop: 8, padding: 10, backgroundColor: '#FFFBEB', borderRadius: 8 },
  disclaimerText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  calculatorCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  calcNote: { fontSize: 12, color: Colors.textMuted, marginBottom: 16, lineHeight: 18 },
  calcInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  calcTextInput: { flex: 1, fontSize: 15, color: Colors.text },
  calcBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  calcBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  resultCard: {
    marginTop: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  resultDivider: { height: 1, backgroundColor: Colors.border },
  resultLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  resultValue: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  warning: { color: Colors.warning },

  askAiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 20,
    gap: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  askAiTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  askAiSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
});
