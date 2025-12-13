import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/src/hooks';
import { AuthProvider, useAuth } from '@/src/store/authStore';

export const unstable_settings = {
  initialRouteName: 'login',
};

function RootLayoutNav() {
  const { state } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after user interaction, not on mount
    if (segments.length === 0) return;

    const inAuthGroup = segments[0] === '(tabs)';

    // Simple check: if trying to access tabs without auth, redirect to login
    if (!state.isAuthenticated && inAuthGroup) {
      console.log('[RootLayout] Not authenticated, redirecting to login');
      setTimeout(() => router.replace('/login'), 0);
    }
  }, [state.isAuthenticated, segments]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="check-in" 
        options={{ 
          title: 'Check In',
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff" 
              onPress={() => router.back()} 
              style={{ marginLeft: 15 }}
            />
          ),
        }} 
      />
      <Stack.Screen 
        name="check-out" 
        options={{ 
          title: 'Check Out',
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff" 
              onPress={() => router.back()} 
              style={{ marginLeft: 15 }}
            />
          ),
        }} 
      />
      <Stack.Screen 
        name="daily-note" 
        options={{ 
          title: 'Daily Note',
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff" 
              onPress={() => router.back()} 
              style={{ marginLeft: 15 }}
            />
          ),
        }} 
      />
      <Stack.Screen 
        name="cancel-schedule" 
        options={{ 
          title: 'Cancel Schedule',
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff" 
              onPress={() => router.back()} 
              style={{ marginLeft: 15 }}
            />
          ),
        }} 
      />
      <Stack.Screen 
        name="unscheduled-visit" 
        options={{ 
          title: 'Unscheduled Visit',
          headerLeft: () => (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#fff" 
              onPress={() => router.back()} 
              style={{ marginLeft: 15 }}
            />
          ),
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
