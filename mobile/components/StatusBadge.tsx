// components/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface StatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: 'Submitted', color: Colors.statusSubmitted, bg: '#EFF6FF' },
  pending: { label: 'Pending', color: Colors.statusPending, bg: '#FFFBEB' },
  processing: { label: 'Processing', color: Colors.statusProcessing, bg: '#F5F3FF' },
  under_review: { label: 'Under Review', color: Colors.statusProcessing, bg: '#F5F3FF' },
  approved: { label: 'Approved', color: Colors.statusApproved, bg: '#F0FDF4' },
  active: { label: 'Active', color: Colors.statusApproved, bg: '#F0FDF4' },
  ready: { label: 'Ready', color: Colors.statusApproved, bg: '#F0FDF4' },
  rejected: { label: 'Rejected', color: Colors.statusRejected, bg: '#FEF2F2' },
  suspended: { label: 'Suspended', color: Colors.statusRejected, bg: '#FEF2F2' },
  delivered: { label: 'Delivered', color: Colors.statusApproved, bg: '#F0FDF4' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status.toLowerCase()] || {
    label: status,
    color: Colors.textSecondary,
    bg: Colors.borderLight,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
