// app/chat/[id].tsx – AI Chat screen (handles both new conversations and existing ones)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../hooks/useLanguage';
import { chatApi, voiceApi } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { ChatMessage, SourceCitation, Language } from '../../types';
import { LANGUAGES } from '../../types';

// Safe lazy loading of expo-av to prevent crash when ExponentAV native module is unavailable in Expo Go
let AudioModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AudioModule = require('expo-av')?.Audio || null;
} catch {
  AudioModule = null;
}

type LocalMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  language: string;
  created_at: string;
  pending?: boolean;
  error?: boolean;
};

const SUGGESTED_QUESTIONS = [
  'How do I become a PACS member?',
  'What is PM-KISAN scheme?',
  'How to apply for Kisan Credit Card?',
  'What is PMFBY crop insurance?',
  'How to file a cooperative grievance?',
];

export default function ChatScreen() {
  const { id: conversationId, q: initialQuery, voice: startWithVoice } = useLocalSearchParams<{
    id?: string; q?: string; voice?: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const { lang, strings } = useLanguage();

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [currentConvId, setCurrentConvId] = useState<string | null>(
    conversationId && conversationId !== 'new' ? conversationId : null
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const recordingRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load existing conversation
  useEffect(() => {
    if (currentConvId && conversationId !== 'new') {
      setIsLoadingHistory(true);
      chatApi.getConversation(currentConvId).then((conv) => {
        setMessages(conv.messages.map((m: ChatMessage) => ({ ...m })));
        setSelectedLang(conv.language as Language);
        setIsLoadingHistory(false);
      }).catch(() => setIsLoadingHistory(false));
    }
  }, []);

  // Auto-send initial query from home search
  useEffect(() => {
    if (initialQuery && !conversationId) {
      setInput(initialQuery as string);
      setTimeout(() => sendMessage(initialQuery as string), 500);
    }
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;

    const tempId = Date.now().toString();
    const userMsg: LocalMessage = {
      id: tempId,
      role: 'user',
      content,
      language: selectedLang,
      created_at: new Date().toISOString(),
    };
    const pendingId = tempId + '_pending';
    const pendingMsg: LocalMessage = {
      id: pendingId,
      role: 'assistant',
      content: '...',
      language: selectedLang,
      created_at: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setInput('');
    setSendingId(pendingId);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await chatApi.sendMessage({
        message: content,
        language: selectedLang,
        conversation_id: currentConvId || undefined,
      });

      if (!currentConvId) setCurrentConvId(response.conversation_id);

      const assistantMsg: LocalMessage = {
        id: response.message_id,
        role: 'assistant',
        content: response.content,
        sources: response.sources,
        language: response.language,
        created_at: response.created_at,
      };

      setMessages((prev) => [...prev.filter((m) => m.id !== pendingId), assistantMsg]);
      setSendingId(null);

      // Speak the response
      speakText(response.content);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) => m.id === pendingId ? { ...m, pending: false, error: true, content: `Error: ${e.message}` } : m)
      );
      setSendingId(null);
    }
  }, [input, selectedLang, currentConvId]);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Auto-start recording if opened in voice mode
  useEffect(() => {
    if (startWithVoice === '1') {
      setTimeout(() => {
        startRecording();
      }, 700);
    }
  }, [startWithVoice]);

  const speakText = (text: string) => {
    if (!text) return;
    try {
      Speech.stop();
      const clean = text
        .replace(/[*#_`]/g, '')
        .replace(/\n+/g, '. ')
        .substring(0, 600)
        .trim();
      Speech.speak(clean, {
        language: 'en-IN',
        rate: 0.95,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    try {
      Speech.stop();
    } catch {}
    setIsSpeaking(false);
  };

  const startRecording = async () => {
    if (!AudioModule) {
      Alert.alert(
        'Voice Recording',
        'Voice recording module is unavailable in this environment. Please type your query in the input box below.'
      );
      return;
    }
    try {
      const { status } = await AudioModule.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Microphone permission is needed for voice input.');
        return;
      }
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new AudioModule.Recording();
      await recording.prepareToRecordAsync(AudioModule.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (e) {
      Alert.alert('Recording Error', 'Could not start recording. Please try typing your question.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    setIsRecording(false);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        setIsTranscribing(true);
        try {
          const result = await voiceApi.transcribe(uri, 'en');
          setIsTranscribing(false);
          const transcript = result?.transcript?.trim();
          if (transcript) {
            setInput('');
            // Automatically send the voice question directly to ARAV AI
            sendMessage(transcript);
          } else {
            Alert.alert('Voice Assistant', 'No clear speech detected. Please speak clearly into the microphone.');
          }
        } catch (e: any) {
          setIsTranscribing(false);
          Alert.alert('Voice Assistant', e.message || 'Could not process audio.');
        }
      }
    } catch (e) {
      setIsRecording(false);
      setIsTranscribing(false);
      Alert.alert('Voice Error', 'Could not process recording. Please try speaking again.');
    }
  };

  const copyMessage = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const renderMessage = ({ item }: { item: LocalMessage }) => {
    const isUser = item.role === 'user';
    const isError = item.error;

    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="leaf" size={16} color={Colors.white} />
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleBot,
          isError && styles.bubbleError,
        ]}>
          {item.pending ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.typingText}>ARAV AI is thinking...</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{item.content}</Text>
              {item.sources && item.sources.length > 0 && (
                <View style={styles.sources}>
                  <Text style={styles.sourcesLabel}>📚 Sources</Text>
                  {item.sources.map((s, i) => (
                    <Text key={i} style={styles.sourceItem}>• {s.title}</Text>
                  ))}
                </View>
              )}
              <View style={styles.msgFooter}>
                <Text style={[styles.msgTime, isUser && styles.msgTimeUser]}>
                  {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {!isUser && (
                  <View style={styles.msgActions}>
                    <TouchableOpacity onPress={() => speakText(item.content)} style={styles.actionBtn}>
                      <Ionicons name="volume-high-outline" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => copyMessage(item.content)} style={styles.actionBtn}>
                      <Ionicons name="copy-outline" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>ARAV AI</Text>
              <Text style={styles.headerSubtitle}>Cooperative Assistant</Text>
            </View>
            <View style={styles.headerRight}>
              {isSpeaking && (
                <TouchableOpacity onPress={stopSpeaking} style={styles.speakBtn}>
                  <Ionicons name="stop-circle" size={24} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages */}
        {isLoadingHistory ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[styles.messageList, messages.length === 0 && styles.messageListEmpty]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <View style={styles.emptyChatIcon}>
                  <Ionicons name="leaf" size={40} color={Colors.primary} />
                </View>
                <Text style={styles.emptyChatTitle}>Hi, I'm ARAV AI</Text>
                <Text style={styles.emptyChatSubtitle}>
                  I can help you with cooperative laws, government schemes, PACS services, agricultural loans and more.
                </Text>
                <Text style={styles.emptyChatHint}>Try one of these questions:</Text>
                <View style={styles.suggestionsGrid}>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.suggestionChip}
                      onPress={() => sendMessage(q)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.suggestionText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
          />
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>Informational guidance only. Not a substitute for legal advice.</Text>
        </View>

        {/* Voice Recording / Transcribing Live Banner */}
        {isRecording && (
          <View style={styles.voiceStatusBanner}>
            <View style={styles.recordingPulseDot} />
            <Text style={styles.voiceStatusText}>Listening... Speak your question now (tap to send)</Text>
          </View>
        )}
        {isTranscribing && (
          <View style={styles.voiceStatusBanner}>
            <ActivityIndicator size="small" color="#059669" />
            <Text style={styles.voiceStatusText}>Transcribing your speech with ARAV AI...</Text>
          </View>
        )}

        {/* Input Row */}
        <SafeAreaView edges={['bottom']} style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.85}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color={isRecording ? Colors.white : Colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={isRecording ? 'Listening to your voice...' : 'Ask ARAV AI in English...'}
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || !!sendingId) && styles.sendBtnDisabled]}
              onPress={() => sendMessage()}
              disabled={!input.trim() || !!sendingId}
              activeOpacity={0.85}
            >
              {sendingId ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="send" size={18} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {},
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  speakBtn: { padding: 4 },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  langBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  langPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  langOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  langOptionSelected: { backgroundColor: Colors.white },
  langOptionText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  langOptionTextSelected: { color: Colors.primary },

  body: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 8 },
  messageListEmpty: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyChat: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 32 },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyChatTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  emptyChatSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyChatHint: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12 },
  suggestionsGrid: { width: '100%', gap: 8 },
  suggestionChip: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestionText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },

  msgWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    padding: 12,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleError: { backgroundColor: '#FEF2F2' },
  msgText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  msgTextUser: { color: Colors.white },
  sources: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  sourcesLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  sourceItem: { fontSize: 12, color: Colors.primary, marginBottom: 2 },
  msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  msgTime: { fontSize: 11, color: Colors.textMuted },
  msgTimeUser: { color: 'rgba(255,255,255,0.7)' },
  msgActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 2 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4 },
  typingText: { fontSize: 13, color: Colors.textSecondary },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  disclaimerText: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },

  inputArea: { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnActive: { backgroundColor: Colors.error },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.textMuted },
  voiceStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  recordingPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  voiceStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
});
