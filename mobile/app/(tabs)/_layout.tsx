import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 10);
  const tabHeight = 58 + bottomPadding;

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          height: tabHeight,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', width: 44 }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
              {focused && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -18,
                    width: 32,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: '#15803D',
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: 'My Requests',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: '#EF4444',
                  borderWidth: 1,
                  borderColor: '#FFFFFF',
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          title: 'AI Chat',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          href: null,
          title: 'History',
        }}
      />
    </Tabs>
  );
}
