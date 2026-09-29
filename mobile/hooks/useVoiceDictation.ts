// hooks/useVoiceDictation.ts
import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { voiceApi } from '../services/api';

let AudioModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AudioModule = require('expo-av')?.Audio || null;
} catch {
  AudioModule = null;
}

export interface UseVoiceDictationOptions {
  onTranscript?: (transcript: string) => void;
  language?: string;
}

export function useVoiceDictation(options?: UseVoiceDictationOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recordingRef = useRef<any>(null);

  const startRecording = async () => {
    if (!AudioModule) {
      Alert.alert(
        'Voice Recording',
        'Voice recording module is unavailable on this device.'
      );
      return;
    }

    try {
      const { status } = await AudioModule.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone permission is needed for voice input.');
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
    } catch {
      Alert.alert('Recording Error', 'Could not access the microphone. Please try again.');
    }
  };

  const stopRecording = async (overrideCallback?: (text: string) => void): Promise<string | null> => {
    if (!recordingRef.current) return null;
    setIsRecording(false);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) return null;

      setIsTranscribing(true);
      try {
        const lang = options?.language || 'en';
        const res = await voiceApi.transcribe(uri, lang);
        setIsTranscribing(false);

        const text = res?.transcript?.trim() || '';
        if (text) {
          if (overrideCallback) {
            overrideCallback(text);
          } else if (options?.onTranscript) {
            options.onTranscript(text);
          }
          return text;
        } else {
          Alert.alert('Voice Assistant', 'No clear speech detected. Please speak clearly into the microphone.');
          return null;
        }
      } catch (e: any) {
        setIsTranscribing(false);
        Alert.alert('Voice Assistant', e?.message || 'Could not process audio.');
        return null;
      }
    } catch {
      setIsRecording(false);
      setIsTranscribing(false);
      Alert.alert('Voice Error', 'Could not finalize recording.');
      return null;
    }
  };

  const speak = (text: string, onDone?: () => void) => {
    if (!text) return;
    try {
      Speech.stop();
      const clean = text
        .replace(/[*#_`]/g, '')
        .replace(/\n+/g, '. ')
        .substring(0, 700)
        .trim();

      Speech.speak(clean, {
        language: 'en-IN',
        rate: 0.95,
        onStart: () => setIsSpeaking(true),
        onDone: () => {
          setIsSpeaking(false);
          onDone?.();
        },
        onStopped: () => {
          setIsSpeaking(false);
          onDone?.();
        },
        onError: () => {
          setIsSpeaking(false);
          onDone?.();
        },
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

  return {
    isRecording,
    isTranscribing,
    isSpeaking,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}
