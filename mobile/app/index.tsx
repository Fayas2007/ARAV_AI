// app/index.tsx – Landing Page with Logo, Typewriter Name, and Get Started
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const FULL_NAME = 'ARAV AI';

export default function LandingScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [charIndex, setCharIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const cursorBlink = useRef(new Animated.Value(1)).current;

  // Handle Get Started action
  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/onboarding');
    }
  };

  useEffect(() => {
    // 1. Logo Entrance Animation (Fade & Spring scale)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Start Typewriter Effect after logo settles (at 600ms)
    let current = 0;
    const startTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        current += 1;
        setCharIndex(current);
        if (current >= FULL_NAME.length) {
          clearInterval(typeInterval);
          // 3. Show Get Started button right after typing completes
          setTimeout(() => {
            setShowButton(true);
            Animated.spring(buttonAnim, {
              toValue: 1,
              friction: 7,
              tension: 40,
              useNativeDriver: true,
            }).start();
          }, 300);
        }
      }, 140);
    }, 600);

    // Blinking cursor loop
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorBlink, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorBlink, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    blinkAnimation.start();

    return () => {
      clearTimeout(startTimeout);
      blinkAnimation.stop();
    };
  }, []);

  const currentText = FULL_NAME.slice(0, charIndex);
  const aravText = currentText.slice(0, 4); // "ARAV"
  const aiText = currentText.length > 5 ? currentText.slice(5) : ''; // "AI"

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Full Screen Landing Image */}
      <Image
        source={require('../assets/arav_landing.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Section: Logo + Animated Typewriter Name */}
        <View style={styles.topSection}>
          {/* App Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require('../assets/arav_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Typewriter App Name (ARAV in black, AI in green) */}
          <View style={styles.nameRow}>
            {/* ARAV: Black */}
            <Text style={styles.aravText}>{aravText}</Text>

            {/* Space */}
            {charIndex >= 5 && <Text style={styles.spaceText}> </Text>}

            {/* AI: Green */}
            <Text style={styles.aiText}>{aiText}</Text>

            {/* Blinking Cursor while typing */}
            {charIndex < FULL_NAME.length && (
              <Animated.Text style={[styles.cursor, { opacity: cursorBlink }]}>
                |
              </Animated.Text>
            )}
          </View>
        </View>

        {/* Bottom Section: Get Started Button (Appears only after typing) */}
        {showButton && (
          <Animated.View
            style={[
              styles.bottomContainer,
              {
                opacity: buttonAnim,
                transform: [{ translateY: buttonTranslateY }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.getStartedBtn}
              onPress={handleGetStarted}
              activeOpacity={0.88}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <View style={styles.iconCircle}>
                <Ionicons name="arrow-forward" size={20} color="#065F46" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFDF9',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: height * 0.07, // Positioned nicely in the sky region
  },
  logoWrapper: {
    width: 175,
    height: 135,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#059669',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  logoImage: {
    width: 170,
    height: 130,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
  },
  aravText: {
    fontSize: 50,
    fontWeight: '900',
    color: '#000000', // Pure bold black
    letterSpacing: 2.5,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  spaceText: {
    fontSize: 50,
  },
  aiText: {
    fontSize: 50,
    fontWeight: '900',
    color: '#059669', // Vibrant leaf green
    letterSpacing: 2.5,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  cursor: {
    fontSize: 46,
    fontWeight: '400',
    color: '#059669',
    marginLeft: 3,
    marginTop: -4,
  },
  bottomContainer: {
    width: '100%',
    paddingBottom: 58, // Lifted upward from bottom edge
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#065F46',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
