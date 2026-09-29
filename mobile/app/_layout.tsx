// app/_layout.tsx – Root layout for Expo Router
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useAuthStore } from '../store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);

  // Load custom fonts (fallback to system fonts if Inter isn't available)
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const isReady = fontsLoaded || Boolean(fontError);

  // Load auth state once on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Hide splash screen once fonts are ready
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="chat/new" options={{ presentation: 'card' }} />
            <Stack.Screen name="schemes-list" options={{ presentation: 'card' }} />
            <Stack.Screen name="schemes/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="societies-list" options={{ presentation: 'card' }} />
            <Stack.Screen name="societies/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="my-applications" options={{ presentation: 'card' }} />
            <Stack.Screen name="applications/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="membership" options={{ presentation: 'card' }} />
            <Stack.Screen name="loans" options={{ presentation: 'card' }} />
            <Stack.Screen name="crop-insurance" options={{ presentation: 'card' }} />
            <Stack.Screen name="documents-screen" options={{ presentation: 'card' }} />
            <Stack.Screen name="grievances-screen" options={{ presentation: 'card' }} />
            <Stack.Screen name="grievances/[id]" options={{ presentation: 'card' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
