import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../lib/core/constants/Colors';
import { AppProvider, useApp } from '../lib/modules/app/context/AppContext';
import {
  CameraConnectionProvider,
  useCameraConnectionContext,
} from '../lib/modules/camera/context/CameraConnectionContext';

function ActiveMapSync() {
  const { currentMapId } = useCameraConnectionContext();
  const { syncActiveMapFromRobot } = useApp();

  useEffect(() => {
    if (!currentMapId) return;
    syncActiveMapFromRobot(currentMapId);
  }, [currentMapId, syncActiveMapFromRobot]);

  return null;
}

function AppShell() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActiveMapSync />
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="connecting"
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="map-detail/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="robot-config"
          options={{
            title: 'Configuración del Robot',
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <CameraConnectionProvider>
        <AppShell />
      </CameraConnectionProvider>
    </AppProvider>
  );
}