// app/(tabs)/history.tsx – Chat history screen
import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../../services/api';
import { ChatConversation } from '../../types';
import { Colors } from '../../constants/Colors';

const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  hi: '🇮🇳',
  ta: '🇮🇳',
  te: '🇮🇳',
};

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'हिंदी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
};

export default function HistoryScreen() {
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading, error, refetch } = useQuery<ChatConversation[]>({
    queryKey: ['chat-history'],
    queryFn: () => chatApi.getHistory(),
  });

  const deleteMutation = useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-history'] }),
  });

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Conversation',
      `Delete "${title || 'this conversation'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || 'Untitled conversation'}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>
            {LANG_FLAGS[item.language]} {LANG_NAMES[item.language]}
          </Text>
          <Text style={styles.metaDot}> · </Text>
          <Text style={styles.metaText}>{item.message_count} messages</Text>
          <Text style={styles.metaDot}> · </Text>
          <Text style={styles.metaText}>
            {new Date(item.updated_at).toLocaleDateString('en-IN')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.title || '')}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chat History</Text>
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => router.push('/chat/new')}
            >
              <Ionicons name="add" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Failed to load conversations</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Start chatting with ARAV AI</Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push('/chat/new')}
          >
            <Text style={styles.startBtnText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: Colors.textMuted },
  metaDot: { fontSize: 12, color: Colors.textMuted },
  deleteBtn: { padding: 8 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 16, color: Colors.error, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  retryText: { color: Colors.white, fontWeight: '600' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  emptySubtitle: { fontSize: 15, color: Colors.textSecondary },
  startBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    marginTop: 4,
  },
  startBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
